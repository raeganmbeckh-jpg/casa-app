import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function callClaude(system: string, user: string) {
  if (!ANTHROPIC_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 512, system, messages: [{ role: "user", content: user }] }),
    });
    const data = await res.json();
    if (data.error) { console.error("Claude error:", data.error.message); return null; }
    const text = data.content?.[0]?.text || "";
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    return null;
  } catch (e: any) { console.error("Claude fetch error:", e.message); return null; }
}

// ── Local fallback calculations using real property data ──────────

function localSuperposition(d: any) {
  const value = d?.assessment?.market?.mktTtlValue || d?.assessment?.assessed?.assdTtlValue || 0;
  if (!value) return null;
  const optimistic = Math.round(value * 1.12);
  const pessimistic = Math.round(value * 0.88);
  const yearBuilt = d?.summary?.yearbuilt || 0;
  const age = yearBuilt ? new Date().getFullYear() - yearBuilt : 20;
  const sqft = d?.building?.size?.livingSize || 0;
  const beds = d?.building?.rooms?.beds || 0;
  const confidence = Math.min(90, 50 + (value > 0 ? 15 : 0) + (sqft > 0 ? 10 : 0) + (beds > 0 ? 5 : 0) + (age < 30 ? 10 : 0));

  return {
    most_likely: value,
    optimistic,
    pessimistic,
    probability_weights: [0.6, 0.25, 0.15],
    confidence,
    scenarios: [
      { name: "Base Case", value, probability: 0.6, key_assumptions: `Current assessment at $${value.toLocaleString()}. ${age}yr old ${d?.summary?.proptype || "SFR"}.` },
      { name: "Bull Case", value: optimistic, probability: 0.25, key_assumptions: `Strong demand + improvements could push value to $${optimistic.toLocaleString()}` },
      { name: "Bear Case", value: pessimistic, probability: 0.15, key_assumptions: `Market correction or deferred maintenance drops value to $${pessimistic.toLocaleString()}` },
    ],
    _source: "local",
  };
}

function localEntanglement(d: any, superposition: any) {
  const value = superposition?.most_likely || 0;
  const taxes = d?.assessment?.tax?.taxAmt || 0;
  const sqft = d?.building?.size?.livingSize || 0;
  const yearBuilt = d?.summary?.yearbuilt || 0;
  const ppsf = sqft > 0 && value > 0 ? Math.round(value / sqft) : 0;
  const taxRate = value > 0 && taxes > 0 ? +((taxes / value) * 100).toFixed(2) : 0;

  const correlations = [];
  if (ppsf > 0) correlations.push({ signal_a: "Price per sqft", signal_b: "Market position", strength: 0.82, insight: `At $${ppsf}/sqft, ${ppsf < 350 ? "below average — potential undervaluation" : ppsf < 500 ? "at market level" : "premium positioning"}` });
  if (taxRate > 0) correlations.push({ signal_a: "Tax rate", signal_b: "Assessment accuracy", strength: 0.75, insight: `${taxRate}% effective tax rate ${taxRate > 1.5 ? "is high — appeal opportunity" : "is within normal range"}` });
  if (yearBuilt > 0) correlations.push({ signal_a: "Property age", signal_b: "Maintenance cost", strength: 0.88, insight: `${new Date().getFullYear() - yearBuilt}yr age correlates with ${yearBuilt < 2000 ? "elevated" : "low"} maintenance costs` });

  return {
    correlations,
    consensus_value: value,
    confidence: Math.min(85, 40 + correlations.length * 15),
    _source: "local",
  };
}

function localTunneling(d: any, solar: any) {
  const value = d?.assessment?.market?.mktTtlValue || 0;
  const assessed = d?.assessment?.assessed?.assdTtlValue || 0;
  const taxes = d?.assessment?.tax?.taxAmt || 0;
  const barriers = [];
  let totalHidden = 0;

  if (value > 0 && assessed > 0 && assessed < value * 0.85) {
    const gap = value - assessed;
    barriers.push({ barrier: "Assessment below market value", hidden_value: `$${gap.toLocaleString()}`, path: "Assessment is conservative — actual market value may be higher than recorded", confidence: 75 });
    totalHidden += Math.round(gap * 0.3);
  }
  if (taxes > 0 && value > 0 && (taxes / value) > 0.013) {
    const savings = Math.round(taxes * 0.15);
    barriers.push({ barrier: "High property tax assessment", hidden_value: `$${savings.toLocaleString()}/yr`, path: "File tax assessment appeal — comparable sales may support lower valuation", confidence: 65 });
    totalHidden += savings * 3;
  }
  if (solar?.maxPanels && solar.maxPanels > 10) {
    const solarValue = Math.round(solar.maxPanels * 400);
    barriers.push({ barrier: "Untapped solar energy potential", hidden_value: `$${solarValue.toLocaleString()}`, path: `${solar.maxPanels} panel capacity, ~${(solar.annualEnergy || 0).toLocaleString()} kWh/yr. 26% ITC available.`, confidence: 80 });
    totalHidden += solarValue;
  }
  if (barriers.length === 0) {
    barriers.push({ barrier: "Standard financing terms", hidden_value: "$2,000-5,000/yr", path: "Explore rate buydown or portfolio lending for better terms", confidence: 55 });
    totalHidden = 3500;
  }

  return {
    barriers_penetrated: barriers,
    total_hidden_value: totalHidden,
    tunneling_score: Math.min(85, 30 + barriers.length * 18),
    _source: "local",
  };
}

function localInterference(superposition: any, entanglement: any, tunneling: any) {
  const scores = [superposition?.confidence || 50, entanglement?.confidence || 50, tunneling?.tunneling_score || 50];
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const quantumScore = Math.max(25, Math.min(92, avgScore + (tunneling?.barriers_penetrated?.length || 0) * 3));

  // Build wave pattern (10 points showing confidence oscillation)
  const wave = Array.from({ length: 10 }, (_, i) => {
    const base = quantumScore / 100;
    const osc = Math.sin(i * 0.8) * 0.1;
    return Math.max(0.1, Math.min(0.95, base + osc));
  });

  const constructive = (entanglement?.correlations || []).filter((c: any) => c.strength > 0.7).map((c: any) => ({
    signal: c.signal_a,
    amplified_confidence: Math.round(c.strength * 100),
    reason: c.insight,
  }));

  const destructive = [];
  if (tunneling?.barriers_penetrated?.some((b: any) => b.confidence < 60)) {
    destructive.push({ signal: "Low-confidence barrier penetration", reduced_confidence: 45, reason: "Some tunneling paths have uncertain outcomes — verify before acting" });
  }

  const value = superposition?.most_likely || 0;
  const hidden = tunneling?.total_hidden_value || 0;

  return {
    quantum_score: quantumScore,
    constructive,
    destructive,
    final_verdict: `Quantum analysis scores ${quantumScore}/100. ${constructive.length} constructive signals amplified. ${hidden > 0 ? `$${hidden.toLocaleString()} in hidden value identified through tunneling.` : ""} ${quantumScore >= 70 ? "Strong quantum signal — opportunity is real." : quantumScore >= 50 ? "Moderate signal — proceed with due diligence." : "Weak signal — exercise caution."}`,
    wave_pattern: wave,
    _source: "local",
  };
}

// Rate limit: track last request per address
const rateLimit = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const { propertyData, googleData } = await req.json();
    const d = propertyData?.detail || propertyData?.basic;
    const addrKey = d?.address?.line1 || "unknown";

    // Rate limit: reject if same address within 10 seconds
    const now = Date.now();
    const lastReq = rateLimit.get(addrKey) || 0;
    if (now - lastReq < 10000) {
      return NextResponse.json({ error: "Rate limited — please wait 10 seconds", rate_limited: true }, { status: 429 });
    }
    rateLimit.set(addrKey, now);

    // Try ONE combined Claude call instead of 4 separate calls
    const ctx = JSON.stringify({ ...propertyData, solar: googleData?.solar, walkScore: googleData?.walkScore });
    const allPhases = await callClaude(
      `You are the CASA Quantum Intelligence Engine. Analyze this property across 4 quantum phases and return ALL results in ONE JSON object. Return ONLY valid JSON:
{
  "superposition":{"most_likely":500000,"optimistic":575000,"pessimistic":440000,"probability_weights":[0.6,0.25,0.15],"confidence":78,"scenarios":[{"name":"Base Case","value":500000,"probability":0.6,"key_assumptions":"string"},{"name":"Bull Case","value":575000,"probability":0.25,"key_assumptions":"string"},{"name":"Bear Case","value":440000,"probability":0.15,"key_assumptions":"string"}]},
  "entanglement":{"correlations":[{"signal_a":"string","signal_b":"string","strength":0.85,"insight":"string"}],"consensus_value":500000,"confidence":80},
  "tunneling":{"barriers_penetrated":[{"barrier":"string","hidden_value":"$XX,XXX","path":"string","confidence":75}],"total_hidden_value":50000,"tunneling_score":72},
  "interference":{"quantum_score":78,"constructive":[{"signal":"string","amplified_confidence":90,"reason":"string"}],"destructive":[{"signal":"string","reduced_confidence":40,"reason":"string"}],"final_verdict":"string","wave_pattern":[0.3,0.5,0.7,0.85,0.78,0.82,0.75,0.9,0.88,0.85]}
}`,
      `Analyze this property:\n${ctx}`
    );

    // Use Claude results or fallback to local calculations
    const superpositionResult = allPhases?.superposition || localSuperposition(d);
    const entanglementResult = allPhases?.entanglement || localEntanglement(d, superpositionResult);
    const tunnelingResult = allPhases?.tunneling || localTunneling(d, googleData?.solar);
    const interferenceResult = allPhases?.interference || localInterference(superpositionResult, entanglementResult, tunnelingResult);

    // Get agent count (fire and forget, don't await)
    const agentCount = 50; // known from seed
    supabase.from("agent_entanglement_events").insert({
      source_agent_key: "qi_verdict",
      target_agent_keys: ["qs_avm", "qe_val", "qt_exit", "qi_collapse"],
      trigger_type: "property_search",
      property_id: d?.identifier?.apn || "unknown",
      payload: { superposition: superpositionResult, entanglement: entanglementResult, tunneling: tunnelingResult, interference: interferenceResult },
    });

    return NextResponse.json({
      superposition: superpositionResult,
      entanglement: entanglementResult,
      tunneling: tunnelingResult,
      interference: interferenceResult,
      agents_fired: agentCount,
      phases: ["superposition", "entanglement", "tunneling", "interference"],
    });
  } catch (e: any) {
    console.error("Quantum engine error:", e.message);
    return NextResponse.json({ error: "Quantum intelligence engine failed", debug: e.message }, { status: 500 });
  }
}
