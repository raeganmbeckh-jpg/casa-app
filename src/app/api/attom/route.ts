import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address parameter required" }, { status: 400 });
  }

  const attomKey = process.env.ATTOM_API_KEY;
  if (!attomKey) {
    return NextResponse.json({ error: "ATTOM API key not configured" }, { status: 500 });
  }

  const commaIdx = address.indexOf(",");
  let address1 = address;
  let address2 = "";
  if (commaIdx !== -1) {
    address1 = address.slice(0, commaIdx).trim();
    address2 = address.slice(commaIdx + 1).trim();
  }

  const params = new URLSearchParams({ address1, address2 });
  const attomHeaders = { Accept: "application/json", apikey: attomKey };
  const base = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";
  const sources: string[] = [];

  try {
    // ── Run ALL data sources in parallel ──────────────────────
    const [
      basicRes,
      detailRes,
      avmRes,
      salesRes,
      schoolRes,
      supabaseRes,
    ] = await Promise.all([
      // 1. ATTOM basic address lookup
      fetch(`${base}/property/address?${params}`, { headers: attomHeaders })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // 2. ATTOM property detail
      fetch(`${base}/property/detail?${params}`, { headers: attomHeaders })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // 3. ATTOM AVM (automated valuation)
      fetch(`${base}/avm/detail?${params}`, { headers: attomHeaders })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // 4. ATTOM sales history
      fetch(`${base}/sale/detail?${params}`, { headers: attomHeaders })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // 5. ATTOM school snapshot (use address coordinates if available)
      fetch(`${base}/school/snapshot?${params}`, { headers: attomHeaders })
        .then(r => r.ok ? r.json() : null).catch(() => null),
      // 6. Supabase property_details fallback
      Promise.resolve(
        supabase.from("property_details").select("*")
          .ilike("property_id", `%${address1.split(" ")[0]}%`)
          .limit(1)
      ).then(r => r.data?.[0] || null).catch(() => null),
    ]);

    const basicProp = basicRes?.property?.[0] || null;
    const detailProp = detailRes?.property?.[0] || null;
    const avmProp = avmRes?.property?.[0] || null;
    const salesProp = salesRes?.property?.[0] || null;
    const schoolData = schoolRes?.school || null;

    if (basicProp || detailProp) sources.push("ATTOM Property");
    if (avmProp) sources.push("ATTOM AVM");
    if (salesProp) sources.push("ATTOM Sales");
    if (schoolData) sources.push("ATTOM Schools");
    if (supabaseRes) sources.push("CASA Database");

    // ── Merge AVM data into detail ───────────────────────────
    if (avmProp && detailProp) {
      if (!detailProp.assessment) detailProp.assessment = {};
      if (!detailProp.assessment.market) detailProp.assessment.market = {};
      // Prefer AVM value over assessment market value
      if (avmProp.avm?.amount?.value) {
        detailProp.assessment.market.mktTtlValue = avmProp.avm.amount.value;
        detailProp._avmConfidence = avmProp.avm?.amount?.confidence || null;
        detailProp._avmDate = avmProp.avm?.eventDate || null;
      }
    }

    // ── Merge sales history ──────────────────────────────────
    if (salesProp && detailProp) {
      if (!detailProp.sale) detailProp.sale = {};
      if (salesProp.sale?.saleTransDate) detailProp.sale.saleTransDate = salesProp.sale.saleTransDate;
      if (salesProp.sale?.saleTransAmount) detailProp.sale.saleTransAmount = salesProp.sale.saleTransAmount;
      detailProp._salesHistory = salesProp.sale || null;
    }

    // ── Merge Supabase fallback for missing fields ───────────
    if (supabaseRes && detailProp) {
      const d = detailProp;
      if (!d.building?.rooms?.beds && supabaseRes.bedrooms) {
        if (!d.building) d.building = {};
        if (!d.building.rooms) d.building.rooms = {};
        d.building.rooms.beds = supabaseRes.bedrooms;
      }
      if (!d.building?.rooms?.bathsFull && supabaseRes.bathrooms) {
        if (!d.building) d.building = {};
        if (!d.building.rooms) d.building.rooms = {};
        d.building.rooms.bathsFull = supabaseRes.bathrooms;
      }
      if (!d.building?.size?.livingSize && supabaseRes.square_feet) {
        if (!d.building) d.building = {};
        if (!d.building.size) d.building.size = {};
        d.building.size.livingSize = supabaseRes.square_feet;
      }
      if (!d.summary?.yearbuilt && supabaseRes.year_built) {
        if (!d.summary) d.summary = {};
        d.summary.yearbuilt = supabaseRes.year_built;
      }
    }

    // ── Attach school data ───────────────────────────────────
    if (schoolData && detailProp) {
      detailProp._schools = Array.isArray(schoolData) ? schoolData.slice(0, 5) : [];
    }

    // ── Google Geocoding fallback if ATTOM has no data ─────────
    let finalBasic = basicProp;
    const finalDetail = detailProp;

    if (!finalBasic && !finalDetail) {
      const googleKey = process.env.GOOGLE_MAPS_API_KEY;
      if (googleKey) {
        try {
          const geoRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`
          );
          const geoData = await geoRes.json();
          const result = geoData.results?.[0];
          if (result) {
            sources.push("Google Geocoding");
            const comps = result.address_components || [];
            const getComp = (type: string) => comps.find((c: any) => c.types.includes(type))?.long_name || "";
            const loc = result.geometry?.location;

            // Build a minimal ATTOM-compatible property object from Google data
            finalBasic = {
              identifier: { apn: "" },
              address: {
                line1: `${getComp("street_number")} ${getComp("route")}`.trim() || address.split(",")[0].trim(),
                line2: `${getComp("locality")}, ${getComp("administrative_area_level_1")} ${getComp("postal_code")}`,
                locality: getComp("locality"),
                countrySubd: getComp("administrative_area_level_1"),
                postal1: getComp("postal_code"),
              },
              location: loc ? { latitude: loc.lat, longitude: loc.lng } : undefined,
              summary: { proptype: "SFR" },
              _source: "google_geocoding",
              _note: "Address verified by Google. ATTOM property records not available for this address.",
            };
          }
        } catch { /* Google fallback failed */ }
      }

      // Also check Supabase properties table directly
      if (!finalBasic) {
        const { data: sbProp } = await supabase.from("properties").select("*").ilike("address", `%${address1}%`).limit(1);
        if (sbProp?.[0]) {
          sources.push("CASA Database");
          const p = sbProp[0];
          finalBasic = {
            identifier: { apn: p.apn || "" },
            address: { line1: p.address, locality: p.city, countrySubd: p.state, postal1: p.zip },
            summary: { proptype: p.property_type || "SFR" },
            assessment: p.estimated_value ? { market: { mktTtlValue: Number(p.estimated_value) } } : undefined,
            _source: "supabase",
          };
        }
      }
    }

    // ── Fetch comps if we have geo ───────────────────────────
    const prop = finalDetail || finalBasic;
    let comps: any[] = [];
    const lat = prop?.location?.latitude;
    const lon = prop?.location?.longitude;
    if (lat && lon) {
      try {
        const compsParams = new URLSearchParams({
          latitude: String(lat), longitude: String(lon),
          searchRadius: "0.5", minSaleAmt: "100000", maxSaleAmt: "10000000",
          saleDateRange: "24", pageSize: "5",
        });
        const compsRes = await fetch(`${base}/sale/snapshot?${compsParams}`, { headers: attomHeaders });
        const compsData = await compsRes.json();
        comps = compsData?.property || [];
        if (comps.length > 0) sources.push("ATTOM Comps");
      } catch { /* optional */ }
    }

    return NextResponse.json({
      basic: finalBasic,
      detail: finalDetail,
      comps,
      schools: schoolData,
      sources,
      status: basicRes?.status || detailRes?.status,
    });
  } catch (e: any) {
    return NextResponse.json({
      error: "Failed to fetch property data",
      debug: e?.message || "Unknown error",
      basic: null,
      detail: null,
      comps: [],
      sources: [],
    }, { status: 500 });
  }
}
