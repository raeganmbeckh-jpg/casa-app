// ============================================================
// CASA UNIFIED PROPERTY DATA LAYER
// File: src/app/api/property/unified/route.ts
//
// One endpoint. Every source. Source attribution + confidence
// on every field. This is the v1 seed of CASA's public API.
//
// Resolution order per field:
//   user_verified (property_corrections) > casa (tracked) >
//   attom > rentcast > google > null
//
// Requires env: ATTOM_API_KEY, RENTCAST_API_KEY,
//   GOOGLE_MAPS_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
//   SUPABASE_SERVICE_ROLE_KEY (falls back to anon key)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ---------- Types ----------

type Source = 'user_verified' | 'casa' | 'attom' | 'rentcast' | 'google' | null

interface UnifiedField {
  value: string | number | boolean | null
  source: Source
  confidence: number // 0-100
  conflicts?: { source: Source; value: string | number | boolean | null }[]
}

interface UnifiedResponse {
  address: string
  normalized_address: string | null
  lat: number | null
  lng: number | null
  fields: Record<string, UnifiedField>
  sources_responded: string[]
  sources_failed: string[]
  fetched_at: string
  cache_ttl: number
  cached: boolean
}

// ---------- Config ----------

const CACHE_TTL_SECONDS = 3600
const RATE_LIMIT_MS = 30_000
const lastCall = new Map<string, number>()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// ---------- Source fetchers (each isolated, each timed) ----------

async function timed<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<{ name: string; ms: number; data: T }> {
  const t0 = Date.now()
  const data = await fn()
  const ms = Date.now() - t0
  console.log(`[unified] ${name} responded in ${ms}ms`)
  return { name, ms, data }
}

async function fetchAttom(address1: string, address2: string) {
  const base = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0'
  const headers = {
    apikey: process.env.ATTOM_API_KEY!,
    Accept: 'application/json',
  }
  const qs = `address1=${encodeURIComponent(address1)}&address2=${encodeURIComponent(address2)}`

  const [profileRes, avmRes] = await Promise.allSettled([
    fetch(`${base}/property/expandedprofile?${qs}`, { headers }),
    fetch(`${base}/attomavm/detail?${qs}`, { headers }),
  ])

  const profile =
    profileRes.status === 'fulfilled' && profileRes.value.ok
      ? await profileRes.value.json()
      : null
  const avm =
    avmRes.status === 'fulfilled' && avmRes.value.ok
      ? await avmRes.value.json()
      : null

  const p = profile?.property?.[0]
  const a = avm?.property?.[0]
  if (!p && !a) return null

  return {
    apn: p?.identifier?.apn ?? null,
    owner: p?.owner?.owner1?.fullName ?? p?.assessment?.owner?.owner1?.fullName ?? null,
    year_built: p?.summary?.yearBuilt ?? null,
    beds: p?.building?.rooms?.beds ?? null,
    baths: p?.building?.rooms?.bathsTotal ?? null,
    sqft_living: p?.building?.size?.livingSize ?? null,
    lot_sqft: p?.lot?.lotSize2 ?? null,
    property_type: p?.summary?.propClass ?? p?.summary?.propType ?? null,
    stories: p?.building?.summary?.levels ?? null,
    garage_spaces: p?.building?.parking?.prkgSpaces ?? null,
    assessed_value: p?.assessment?.assessed?.assdTtlValue ?? null,
    market_value_avm: a?.avm?.amount?.value ?? null,
    avm_high: a?.avm?.amount?.high ?? null,
    avm_low: a?.avm?.amount?.low ?? null,
    last_sale_price: p?.sale?.amount?.saleAmt ?? null,
    last_sale_date: p?.sale?.saleTransDate ?? null,
    annual_taxes: p?.assessment?.tax?.taxAmt ?? null,
    flood_zone: p?.area?.floodZone ?? null,
    normalized_address: p?.address?.oneLine ?? null,
  }
}

async function fetchRentcast(address: string) {
  const headers = {
    'X-Api-Key': process.env.RENTCAST_API_KEY!,
    Accept: 'application/json',
  }
  const [rentRes, propRes] = await Promise.allSettled([
    fetch(
      `https://api.rentcast.io/v1/avm/rent/long-term?address=${encodeURIComponent(address)}`,
      { headers },
    ),
    fetch(
      `https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}`,
      { headers },
    ),
  ])

  const rent =
    rentRes.status === 'fulfilled' && rentRes.value.ok
      ? await rentRes.value.json()
      : null
  const props =
    propRes.status === 'fulfilled' && propRes.value.ok
      ? await propRes.value.json()
      : null
  const prop = Array.isArray(props) ? props[0] : props

  if (!rent && !prop) return null

  return {
    rent_estimate: rent?.rent ?? null,
    rent_low: rent?.rentRangeLow ?? null,
    rent_high: rent?.rentRangeHigh ?? null,
    year_built: prop?.yearBuilt ?? null,
    beds: prop?.bedrooms ?? null,
    baths: prop?.bathrooms ?? null,
    sqft_living: prop?.squareFootage ?? null,
    lot_sqft: prop?.lotSize ?? null,
    property_type: prop?.propertyType ?? null,
    last_sale_price: prop?.lastSalePrice ?? null,
    last_sale_date: prop?.lastSaleDate ?? null,
  }
}

async function fetchGoogle(address: string) {
  const key = process.env.GOOGLE_MAPS_API_KEY!
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`,
  )
  if (!res.ok) return null
  const json = await res.json()
  const r = json?.results?.[0]
  if (!r) return null
  return {
    normalized_address: r.formatted_address ?? null,
    lat: r.geometry?.location?.lat ?? null,
    lng: r.geometry?.location?.lng ?? null,
    place_id: r.place_id ?? null,
    street_view_url: `https://maps.googleapis.com/maps/api/streetview?size=1200x450&location=${encodeURIComponent(address)}&fov=90&key=${key}`,
  }
}

async function fetchCasa(address: string) {
  const like = `%${address.split(',')[0].trim()}%`
  const [corrections, amenities, tracked, quantum] = await Promise.allSettled([
    supabase.from('property_corrections').select('*').ilike('address', like),
    supabase.from('property_amenities').select('*').ilike('address', like).limit(1),
    supabase.from('properties').select('*').ilike('address', like).limit(1),
    supabase
      .from('ai_agent_runs')
      .select('output, created_at')
      .eq('agent_key', 'quantum_orchestrator')
      .order('created_at', { ascending: false })
      .limit(1),
  ])

  return {
    corrections:
      corrections.status === 'fulfilled' ? (corrections.value.data ?? []) : [],
    amenities:
      amenities.status === 'fulfilled'
        ? (amenities.value.data?.[0] ?? null)
        : null,
    tracked:
      tracked.status === 'fulfilled' ? (tracked.value.data?.[0] ?? null) : null,
    quantum:
      quantum.status === 'fulfilled' ? (quantum.value.data?.[0] ?? null) : null,
  }
}

// ---------- Merge engine ----------

const FIELD_KEYS = [
  'apn', 'owner', 'year_built', 'beds', 'baths', 'sqft_living', 'lot_sqft',
  'property_type', 'stories', 'garage_spaces', 'assessed_value',
  'market_value_avm', 'avm_high', 'avm_low', 'last_sale_price',
  'last_sale_date', 'annual_taxes', 'flood_zone', 'rent_estimate',
  'rent_low', 'rent_high',
] as const

function mergeField(
  key: string,
  corrections: any[],
  casaTracked: any,
  attom: any,
  rentcast: any,
): UnifiedField {
  const candidates: { source: Source; value: any }[] = []

  const correction = corrections.find((c) => c.field_name === key)
  if (correction?.correct_value != null)
    candidates.push({ source: 'user_verified', value: correction.correct_value })

  const casaMap: Record<string, any> = casaTracked
    ? {
        apn: casaTracked.apn,
        property_type: casaTracked.property_type,
        market_value_avm: casaTracked.estimated_value,
        rent_estimate: casaTracked.monthly_rent,
      }
    : {}
  if (casaMap[key] != null) candidates.push({ source: 'casa', value: casaMap[key] })

  if (attom?.[key] != null) candidates.push({ source: 'attom', value: attom[key] })
  if (rentcast?.[key] != null)
    candidates.push({ source: 'rentcast', value: rentcast[key] })

  if (candidates.length === 0)
    return { value: null, source: null, confidence: 0 }

  const winner = candidates[0]
  const others = candidates.slice(1)
  const agreeing = others.filter((c) => String(c.value) === String(winner.value))
  const conflicting = others.filter((c) => String(c.value) !== String(winner.value))

  let confidence: number
  if (winner.source === 'user_verified') confidence = 95
  else if (agreeing.length >= 1) confidence = 90
  else if (conflicting.length >= 1) confidence = 45
  else confidence = 72

  const field: UnifiedField = {
    value: winner.value,
    source: winner.source,
    confidence,
  }
  if (conflicting.length > 0)
    field.conflicts = conflicting.map((c) => ({ source: c.source, value: c.value }))
  return field
}

// ---------- Route ----------

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'address is required' }, { status: 400 })
    }

    const key = address.toLowerCase().trim()

    // Rate limit per address
    const now = Date.now()
    if (now - (lastCall.get(key) ?? 0) < RATE_LIMIT_MS) {
      const { data: cachedHit } = await supabase
        .from('unified_property_cache')
        .select('payload')
        .eq('address_key', key)
        .gt('expires_at', new Date().toISOString())
        .limit(1)
      if (cachedHit?.[0]) {
        return NextResponse.json({ ...cachedHit[0].payload, cached: true })
      }
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    lastCall.set(key, now)

    // Serve fresh cache if present
    const { data: cached } = await supabase
      .from('unified_property_cache')
      .select('payload')
      .eq('address_key', key)
      .gt('expires_at', new Date().toISOString())
      .limit(1)
    if (cached?.[0]) {
      return NextResponse.json({ ...cached[0].payload, cached: true })
    }

    // Split address for ATTOM (street | city, state zip)
    const parts = address.split(',')
    const address1 = parts[0]?.trim() ?? address
    const address2 = parts.slice(1).join(',').trim() || 'CA'

    // Fire every source in parallel — one failure never kills the response
    const results = await Promise.allSettled([
      timed('attom', () => fetchAttom(address1, address2)),
      timed('rentcast', () => fetchRentcast(address)),
      timed('google', () => fetchGoogle(address)),
      timed('casa', () => fetchCasa(address)),
    ])

    const [attomR, rentcastR, googleR, casaR] = results
    const attom = attomR.status === 'fulfilled' ? attomR.value.data : null
    const rentcast = rentcastR.status === 'fulfilled' ? rentcastR.value.data : null
    const google = googleR.status === 'fulfilled' ? googleR.value.data : null
    const casa =
      casaR.status === 'fulfilled'
        ? casaR.value.data
        : { corrections: [], amenities: null, tracked: null, quantum: null }

    const sourceNames = ['attom', 'rentcast', 'google', 'casa']
    const sources_responded = results
      .map((r, i) => (r.status === 'fulfilled' && r.value.data ? sourceNames[i] : null))
      .filter(Boolean) as string[]
    const sources_failed = sourceNames.filter((s) => !sources_responded.includes(s))

    // Merge every field with attribution + confidence
    const fields: Record<string, UnifiedField> = {}
    for (const k of FIELD_KEYS) {
      fields[k] = mergeField(k, casa.corrections, casa.tracked, attom, rentcast)
    }

    // Google-only enrichments
    fields['street_view_url'] = google?.street_view_url
      ? { value: google.street_view_url, source: 'google', confidence: 90 }
      : { value: null, source: null, confidence: 0 }

    // CASA-only proprietary layer
    if (casa.amenities?.amenities) {
      fields['amenities'] = {
        value: JSON.stringify(casa.amenities.amenities),
        source: 'user_verified',
        confidence: 95,
      }
    }
    if (casa.quantum?.output?.overall_score != null) {
      fields['quantum_score'] = {
        value: casa.quantum.output.overall_score,
        source: 'casa',
        confidence: 85,
      }
    }

    const payload: UnifiedResponse = {
      address,
      normalized_address:
        (attom?.normalized_address as string) ??
        (google?.normalized_address as string) ??
        null,
      lat: google?.lat ?? null,
      lng: google?.lng ?? null,
      fields,
      sources_responded,
      sources_failed,
      fetched_at: new Date().toISOString(),
      cache_ttl: CACHE_TTL_SECONDS,
      cached: false,
    }

    // Write-through cache (fire and forget)
    supabase
      .from('unified_property_cache')
      .upsert(
        {
          address_key: key,
          payload,
          expires_at: new Date(now + CACHE_TTL_SECONDS * 1000).toISOString(),
        },
        { onConflict: 'address_key' },
      )
      .then(({ error }) => {
        if (error) console.error('[unified] cache write failed:', error.message)
      })

    return NextResponse.json(payload)
  } catch (err: any) {
    console.error('[unified] fatal:', err?.message)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
