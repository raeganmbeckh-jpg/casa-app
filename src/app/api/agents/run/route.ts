import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ATTOM_KEY = process.env.ATTOM_API_KEY;
const RENTCAST_KEY = process.env.RENTCAST_API_KEY;

async function claude(system: string, user: string) {
  if (!ANTHROPIC_KEY) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, system, messages: [{ role: "user", content: user }] }),
    });
    const d = await r.json();
    if (d.error) return { _error: d.error.message };
    const text = d.content?.[0]?.text || "";
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return { _raw: text.slice(0, 500) }; }
    return { _raw: text.slice(0, 500) };
  } catch (e: any) { return { _error: e.message }; }
}

async function fetchAttom(address: string) {
  if (!ATTOM_KEY) return null;
  const ci = address.indexOf(",");
  const a1 = ci >= 0 ? address.slice(0, ci).trim() : address;
  const a2 = ci >= 0 ? address.slice(ci + 1).trim() : "";
  const p = new URLSearchParams({ address1: a1, address2: a2 });
  const h = { Accept: "application/json", apikey: ATTOM_KEY };
  try {
    const r = await fetch(`https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${p}`, { headers: h });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.property?.[0] || null;
  } catch { return null; }
}

async function fetchRentcast(address: string) {
  if (!RENTCAST_KEY) return null;
  try {
    const [est, comps, market] = await Promise.all([
      fetch(`https://api.rentcast.io/v1/avm/rent/long-term?address=${encodeURIComponent(address)}`, { headers: { "X-Api-Key": RENTCAST_KEY } }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`https://api.rentcast.io/v1/properties?address=${encodeURIComponent(address)}&radius=0.5&limit=5&propertyType=Single+Family`, { headers: { "X-Api-Key": RENTCAST_KEY } }).then(r => r.ok ? r.json() : null).catch(() => null),
      null, // market stats fetched by zip separately if needed
    ]);
    return { estimate: est, comps: Array.isArray(comps) ? comps : [] };
  } catch { return null; }
}

async function fetchSupabaseProperty(address: string) {
  const { data } = await supabase.from("properties").select("*, leases(*), property_details(*)").ilike("address", `%${address.split(",")[0].trim()}%`).limit(1);
  return data?.[0] || null;
}

async function fetchPriorRuns(agentKey: string, propertyAddress: string) {
  const { data } = await supabase.from("ai_agent_runs").select("output, completed_at").eq("agent_key", agentKey).order("completed_at", { ascending: false }).limit(3);
  return data || [];
}

// ── Agent definitions with real data prompts ────────────────────

const AGENTS: Record<string, {
  system: (ctx: any) => string;
  prompt: (ctx: any) => string;
  insightType: string;
}> = {
  cap_rate_scout: {
    system: () => `You are a cap rate analysis agent. Calculate the ACTUAL cap rate from real data. Return ONLY valid JSON: {"cap_rate":5.2,"market_cap_rate":5.0,"spread":0.2,"verdict":"above_market|at_market|below_market","recommendation":"string","confidence":85}`,
    prompt: (ctx) => `REAL PROPERTY DATA:
Address: ${ctx.address}
ATTOM Data: Value=${ctx.attom?.assessment?.market?.mktTtlValue || "unknown"}, Taxes=${ctx.attom?.assessment?.tax?.taxAmt || "unknown"}
Current Rent: $${ctx.supaProperty?.monthly_rent || ctx.rentcast?.estimate?.rent || "unknown"}/mo
Rentcast Market Rent: $${ctx.rentcast?.estimate?.rent || "unknown"}/mo
City: ${ctx.attom?.address?.locality || "unknown"}
Property Type: ${ctx.attom?.summary?.proptype || "unknown"}
Calculate the actual cap rate and compare to market.`,
    insightType: "financial",
  },

  noi_optimizer: {
    system: () => `You are an NOI optimization agent. Calculate ACTUAL NOI from real data and find the gap to optimal. Return ONLY valid JSON: {"current_noi":0,"potential_noi":0,"noi_gap":0,"current_rent":0,"market_rent":0,"rent_gap":0,"recommendations":["string"],"annual_impact":0,"confidence":85}`,
    prompt: (ctx) => `REAL DATA:
Current Rent: $${ctx.supaProperty?.monthly_rent || "unknown"}/mo
Rentcast Estimate: $${ctx.rentcast?.estimate?.rent || "unknown"}/mo (range: $${ctx.rentcast?.estimate?.rentLow || "?"}-$${ctx.rentcast?.estimate?.rentHigh || "?"})
Property Value: $${ctx.attom?.assessment?.market?.mktTtlValue || "unknown"}
Annual Taxes: $${ctx.attom?.assessment?.tax?.taxAmt || "unknown"}
Rental Comps: ${JSON.stringify((ctx.rentcast?.comps || []).slice(0, 3).map((c: any) => ({ addr: c.formattedAddress, rent: c.price })))}
Calculate current NOI, potential NOI at market rent, and specific actions to close the gap.`,
    insightType: "financial",
  },

  eviction_risk_scorer: {
    system: () => `You are an eviction risk scorer. Assess REAL tenant risk from actual data. Return ONLY valid JSON: {"risk_score":25,"risk_level":"low|medium|high|critical","risk_factors":[{"factor":"string","weight":0.3,"assessment":"string"}],"recommendation":"string","confidence":80}`,
    prompt: (ctx) => {
      const tenant = ctx.supaProperty?.leases?.[0];
      return `REAL TENANT DATA:
Tenant: ${tenant ? "Active lease" : "No tenant data"}
Lease Status: ${tenant?.status || "unknown"}
Monthly Rent: $${tenant?.monthly_rent || ctx.supaProperty?.monthly_rent || "unknown"}
Property Status: ${ctx.supaProperty?.status || "unknown"}
Market Rent: $${ctx.rentcast?.estimate?.rent || "unknown"}
Vacancy Rate in Area: ${ctx.rentcast?.market?.vacancyRate || "unknown"}%
Assess the eviction risk based on available data.`;
    },
    insightType: "tenant",
  },

  renewal_probability_scorer: {
    system: () => `You are a lease renewal probability engine. Predict renewal likelihood from real data. Return ONLY valid JSON: {"renewal_probability":75,"factors":[{"factor":"string","impact":"positive|negative","weight":0.2}],"recommended_action":"string","rent_adjustment_recommendation":"string","confidence":80}`,
    prompt: (ctx) => {
      const lease = ctx.supaProperty?.leases?.[0];
      return `REAL DATA:
Current Rent: $${lease?.monthly_rent || ctx.supaProperty?.monthly_rent || "unknown"}/mo
Market Rent: $${ctx.rentcast?.estimate?.rent || "unknown"}/mo
Lease Status: ${lease?.status || "unknown"}
Property Condition: Year Built ${ctx.attom?.summary?.yearbuilt || "unknown"}
Area Vacancy Rate: ${ctx.rentcast?.market?.vacancyRate || "unknown"}%
Area Rent Growth: ${ctx.rentcast?.market?.rentGrowthRate || "unknown"}%
Predict renewal probability and recommend action.`;
    },
    insightType: "tenant",
  },

  rent_optimizer: {
    system: () => `You are a rent optimization agent using REAL Rentcast market data. Return ONLY valid JSON: {"current_rent":0,"recommended_rent":0,"rent_change":0,"monthly_impact":0,"annual_impact":0,"market_position":"below|at|above","comps_used":3,"reasoning":"string","confidence":90}`,
    prompt: (ctx) => `REAL RENTCAST DATA:
Current Rent: $${ctx.supaProperty?.monthly_rent || "unknown"}/mo
Rentcast AVM: $${ctx.rentcast?.estimate?.rent || "unknown"}/mo
Rent Range: $${ctx.rentcast?.estimate?.rentLow || "?"} - $${ctx.rentcast?.estimate?.rentHigh || "?"}/mo
Confidence: ${ctx.rentcast?.estimate?.confidence || "unknown"}%
Rental Comps: ${JSON.stringify((ctx.rentcast?.comps || []).slice(0, 5).map((c: any) => ({ addr: c.formattedAddress || c.addressLine1, rent: c.price || c.lastSeenPrice, beds: c.bedrooms, sqft: c.squareFootage })))}
Property: ${ctx.attom?.building?.rooms?.beds || "?"}bd/${ctx.attom?.building?.rooms?.bathsFull || "?"}ba, ${ctx.attom?.building?.size?.livingSize || "?"}sqft
Calculate the optimal rent using this real data.`,
    insightType: "financial",
  },

  predictive_maintenance: {
    system: () => `You are a predictive maintenance agent using real property age data. Return ONLY valid JSON: {"systems":[{"system":"HVAC|Roof|Plumbing|Electrical|Water Heater","estimated_age":15,"expected_life":20,"remaining_life":5,"replace_cost":12000,"urgency":"good|monitor|replace","proactive_savings":4200}],"total_deferred_maintenance":0,"annual_reserve_needed":0,"next_action":"string","confidence":85}`,
    prompt: (ctx) => `REAL PROPERTY DATA:
Year Built: ${ctx.attom?.summary?.yearbuilt || "unknown"}
Sqft: ${ctx.attom?.building?.size?.livingSize || "unknown"}
Property Type: ${ctx.attom?.summary?.proptype || "unknown"}
Stories: ${ctx.attom?.building?.summary?.stories || "unknown"}
Condition: ${ctx.attom?.building?.summary?.condition || "unknown"}
Age: ${ctx.attom?.summary?.yearbuilt ? new Date().getFullYear() - ctx.attom.summary.yearbuilt : "unknown"} years
Analyze each major system's remaining useful life using this real age data.`,
    insightType: "maintenance",
  },

  submarket_pulse: {
    system: () => `You are a submarket analysis agent using real Rentcast market data. Return ONLY valid JSON: {"market_health":"strong|stable|softening|weak","median_rent":0,"rent_growth_pct":0,"vacancy_rate_pct":0,"supply_pressure":"low|moderate|high","demand_signal":"strong|moderate|weak","investment_outlook":"buy|hold|sell","reasoning":"string","confidence":80}`,
    prompt: (ctx) => `REAL RENTCAST MARKET DATA:
Median Rent: $${ctx.rentcast?.market?.medianRent || "unknown"}
Rent Growth: ${ctx.rentcast?.market?.rentGrowthRate || ctx.rentcast?.market?.rentGrowth || "unknown"}%
Vacancy Rate: ${ctx.rentcast?.market?.vacancyRate || "unknown"}%
Active Listings: ${ctx.rentcast?.market?.activeListings || "unknown"}
ZIP: ${ctx.rentcast?.market?.zipCode || "unknown"}
Property Value: $${ctx.attom?.assessment?.market?.mktTtlValue || "unknown"}
City: ${ctx.attom?.address?.locality || "unknown"}
Analyze this submarket's health using the real data.`,
    insightType: "market",
  },

  vacancy_loss_calculator: {
    system: () => `You are a vacancy loss calculator using real market vacancy data. Return ONLY valid JSON: {"current_vacancy_rate":0,"market_vacancy_rate":0,"annual_vacancy_loss":0,"projected_loss_next_year":0,"days_to_fill_estimate":30,"cost_per_vacant_day":0,"mitigation_actions":["string"],"confidence":80}`,
    prompt: (ctx) => `REAL DATA:
Monthly Rent: $${ctx.supaProperty?.monthly_rent || ctx.rentcast?.estimate?.rent || "unknown"}
Market Vacancy Rate: ${ctx.rentcast?.market?.vacancyRate || "unknown"}%
Active Listings: ${ctx.rentcast?.market?.activeListings || "unknown"}
Property Status: ${ctx.supaProperty?.status || "unknown"}
Property Type: ${ctx.attom?.summary?.proptype || "unknown"}
Calculate actual vacancy loss exposure using this real market data.`,
    insightType: "financial",
  },
};

export async function POST(req: NextRequest) {
  try {
    const { agentKey, address, propertyId } = await req.json();

    if (!agentKey || !address) {
      return NextResponse.json({ error: "agentKey and address required" }, { status: 400 });
    }

    const agentDef = AGENTS[agentKey];
    if (!agentDef) {
      return NextResponse.json({ error: `Unknown agent: ${agentKey}` }, { status: 400 });
    }

    const startTime = Date.now();

    // ── Phase 1: Fetch all real data in parallel ─────────────
    const [attomData, rentcastData, supaProperty, priorRuns] = await Promise.all([
      fetchAttom(address),
      fetchRentcast(address),
      fetchSupabaseProperty(address),
      fetchPriorRuns(agentKey, address),
    ]);

    const ctx = {
      address,
      attom: attomData,
      rentcast: rentcastData,
      supaProperty,
      priorRuns,
    };

    const inputData = {
      address,
      attom_available: !!attomData,
      rentcast_available: !!rentcastData,
      supabase_available: !!supaProperty,
      prior_runs: priorRuns.length,
    };

    // ── Phase 2: Call Claude with real data ───────────────────
    const result = await claude(agentDef.system(ctx), agentDef.prompt(ctx));
    const runMs = Date.now() - startTime;

    // ── Phase 3: Save to ai_agent_runs ───────────────────────
    const { data: run } = await supabase.from("ai_agent_runs").insert({
      agent_key: agentKey,
      triggered_by: "user",
      status: result?._error ? "error" : "completed",
      input: inputData,
      output: result,
      insights: result?._error ? null : result,
      error: result?._error || null,
      run_ms: runMs,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
    }).select().single();

    // ── Phase 4: Save insight to ai_insights ─────────────────
    if (result && !result._error) {
      const title = agentKey.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      const impact = result.annual_impact || result.noi_gap || result.annual_vacancy_loss || result.total_deferred_maintenance || 0;

      await supabase.from("ai_insights").insert({
        agent_key: agentKey,
        run_id: run?.id,
        property_id: propertyId || null,
        insight_type: agentDef.insightType,
        priority: impact > 5000 ? "high" : impact > 1000 ? "medium" : "low",
        title,
        summary: result.recommendation || result.reasoning || result.next_action || JSON.stringify(result).slice(0, 200),
        data: result,
        estimated_impact_dollars: impact,
        action_label: result.recommended_action || result.next_action || "Review",
      });
    }

    // ── Phase 5: Trigger entangled agents ─────────────────────
    const { data: agent } = await supabase.from("ai_agents").select("entanglement_targets").eq("agent_key", agentKey).single();
    const entangled = agent?.entanglement_targets || [];

    if (entangled.length > 0 && result && !result._error) {
      await supabase.from("agent_entanglement_events").insert({
        source_agent_key: agentKey,
        target_agent_keys: entangled,
        trigger_type: "agent_result",
        property_id: propertyId || address,
        payload: { result, address },
      });
    }

    return NextResponse.json({
      agent: agentKey,
      status: result?._error ? "error" : "completed",
      result,
      run_ms: runMs,
      data_sources: {
        attom: !!attomData,
        rentcast: !!rentcastData,
        supabase: !!supaProperty,
        prior_runs: priorRuns.length,
      },
      entangled_triggered: entangled,
      run_id: run?.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Agent execution failed" }, { status: 500 });
  }
}

// ── Run multiple agents ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const agentKeys = Object.keys(AGENTS);

  // Run all agents in parallel
  const results = await Promise.all(
    agentKeys.map(async (key) => {
      try {
        const res = await fetch(new URL("/api/agents/run", req.url).toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentKey: key, address }),
        });
        return res.json();
      } catch {
        return { agent: key, status: "error", result: null };
      }
    })
  );

  return NextResponse.json({
    agents_run: agentKeys.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
