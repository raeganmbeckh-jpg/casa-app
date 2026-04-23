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
    const text = data.content?.[0]?.text || "";
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    return null;
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  try {
    const { propertyData, googleData } = await req.json();
    const ctx = JSON.stringify({ ...propertyData, solar: googleData?.solar, walkScore: googleData?.walkScore });

    // Load quantum agents from Supabase
    const { data: agents } = await supabase
      .from("ai_agents")
      .select("agent_key, name, quantum_principle, entanglement_targets")
      .in("quantum_principle", ["superposition", "entanglement", "tunneling", "interference"]);

    const agentList = agents || [];

    // Phase 1: Superposition — run valuation agents to get probability ranges
    const superpositionResult = await callClaude(
      `You are a quantum-inspired real estate valuation engine. Generate 3 simultaneous value states. Return ONLY valid JSON:
{"most_likely":500000,"optimistic":575000,"pessimistic":440000,"probability_weights":[0.6,0.25,0.15],"confidence":78,"scenarios":[{"name":"Base Case","value":500000,"probability":0.6,"key_assumptions":"Current market conditions persist"},{"name":"Bull Case","value":575000,"probability":0.25,"key_assumptions":"Strong demand + low inventory"},{"name":"Bear Case","value":440000,"probability":0.15,"key_assumptions":"Rate increase + recession"}]}`,
      `Generate superposition valuation states for:\n${ctx}`
    );

    // Phase 2: Entanglement — correlate signals
    const entanglementResult = await callClaude(
      `You are a quantum entanglement correlation engine. Find non-obvious correlations between property signals. Return ONLY valid JSON:
{"correlations":[{"signal_a":"string","signal_b":"string","strength":0.85,"insight":"string"}],"consensus_value":500000,"confidence":80}`,
      `Find entangled correlations in:\n${ctx}\nSuperposition output: ${JSON.stringify(superpositionResult)}`
    );

    // Phase 3: Tunneling — find hidden opportunities
    const tunnelingResult = await callClaude(
      `You are a quantum tunneling opportunity finder. Penetrate apparent barriers to find hidden value. Return ONLY valid JSON:
{"barriers_penetrated":[{"barrier":"string","hidden_value":"$XX,XXX","path":"string","confidence":75}],"total_hidden_value":50000,"tunneling_score":72}`,
      `Find tunneling opportunities in:\n${ctx}`
    );

    // Phase 4: Interference — combine all signals
    const interferenceResult = await callClaude(
      `You are the quantum interference engine. Apply constructive (amplifying) and destructive (canceling) interference to all agent outputs. Return ONLY valid JSON:
{"quantum_score":78,"constructive":[{"signal":"string","amplified_confidence":90,"reason":"string"}],"destructive":[{"signal":"string","reduced_confidence":40,"reason":"string"}],"final_verdict":"string","wave_pattern":[0.3,0.5,0.7,0.85,0.78,0.82,0.75,0.9,0.88,0.85]}`,
      `Apply interference to:\nSuperposition: ${JSON.stringify(superpositionResult)}\nEntanglement: ${JSON.stringify(entanglementResult)}\nTunneling: ${JSON.stringify(tunnelingResult)}`
    );

    // Record entanglement event
    await supabase.from("agent_entanglement_events").insert({
      source_agent_key: "qi_verdict",
      target_agent_keys: agentList.map((a: any) => a.agent_key),
      trigger_type: "property_search",
      property_id: propertyData?.detail?.identifier?.apn || "unknown",
      payload: { superposition: superpositionResult, entanglement: entanglementResult, tunneling: tunnelingResult, interference: interferenceResult },
    });

    return NextResponse.json({
      superposition: superpositionResult || { most_likely: 0, optimistic: 0, pessimistic: 0, probability_weights: [0.6, 0.25, 0.15], confidence: 0, scenarios: [] },
      entanglement: entanglementResult || { correlations: [], consensus_value: 0, confidence: 0 },
      tunneling: tunnelingResult || { barriers_penetrated: [], total_hidden_value: 0, tunneling_score: 0 },
      interference: interferenceResult || { quantum_score: 0, constructive: [], destructive: [], final_verdict: "", wave_pattern: [] },
      agents_fired: agentList.length,
      phases: ["superposition", "entanglement", "tunneling", "interference"],
    });
  } catch {
    return NextResponse.json({ error: "Quantum intelligence engine failed" }, { status: 500 });
  }
}
