import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(system: string, userMsg: string): Promise<any> {
  if (!ANTHROPIC_KEY) return { _error: "No API key" };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const data = await res.json();
    if (data.error) return { _error: data.error.message || data.error.type || "API error" };
    const text = data.content?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch { return { _error: "JSON parse failed", _raw: text.slice(0, 200) }; }
    }
    return { _error: "No JSON in response", _raw: text.slice(0, 200) };
  } catch (e: any) {
    return { _error: e.message || "Fetch failed" };
  }
}

// ── Agent Definitions ─────────────────────────────────────────

function marketAgent(propData: string) {
  return callClaude(
    `You are a real estate market analyst AI. Analyze the property data and comparable sales. Return ONLY valid JSON with this exact structure:
{"agent":"market","findings":["string finding 1","string finding 2","string finding 3"],"score":75,"opportunities":["string opp 1"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is best market position. Be specific with dollar amounts and percentages.`,
    `Analyze this property's market position:\n${propData}`
  );
}

function financialAgent(propData: string) {
  return callClaude(
    `You are a real estate financial analyst AI. Calculate NOI, cap rate, cash-on-cash return, and debt coverage ratio from the property data. Return ONLY valid JSON:
{"agent":"financial","findings":["string finding 1","string finding 2"],"score":75,"opportunities":["string opp 1"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is strongest financial profile. Include specific dollar amounts.`,
    `Analyze this property's financial profile:\n${propData}`
  );
}

function riskAgent(propData: string) {
  return callClaude(
    `You are a real estate risk assessment AI. Evaluate physical systems age (HVAC, roof, plumbing, electrical), environmental risks, tenant risk, litigation exposure, and lien status. Return ONLY valid JSON:
{"agent":"risk","findings":["string finding 1","string finding 2"],"score":75,"opportunities":["string opp 1"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is LOWEST risk (safest). Flag any critical issues.`,
    `Assess risks for this property:\n${propData}`
  );
}

function opportunityAgent(propData: string) {
  return callClaude(
    `You are a real estate opportunity finder AI. Identify rent upside, value-add potential (renovations, unit additions, ADU), assumable debt opportunities, operational improvements. Return ONLY valid JSON:
{"agent":"opportunity","findings":["string finding 1","string finding 2"],"score":75,"opportunities":["string opp with $ impact"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is highest upside. Be specific about dollar impact of each opportunity.`,
    `Find opportunities for this property:\n${propData}`
  );
}

function solarAgent(propData: string) {
  return callClaude(
    `You are a solar energy ROI analyst AI. Using the property and solar data provided, calculate solar panel ROI, payback period, energy savings, tax incentives (26% ITC), and impact on property value. Return ONLY valid JSON:
{"agent":"solar","findings":["string finding 1","string finding 2"],"score":75,"opportunities":["string opp with $ impact"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is best solar opportunity. Include specific dollar savings.`,
    `Analyze solar potential for this property:\n${propData}`
  );
}

function neighborhoodAgent(propData: string) {
  return callClaude(
    `You are a neighborhood quality analyst AI. Evaluate walkability, transit access, school quality, crime proximity, amenities, and demographic trends. Return ONLY valid JSON:
{"agent":"neighborhood","findings":["string finding 1","string finding 2"],"score":75,"opportunities":["string opp 1"],"risks":["string risk 1"],"confidence":80}
Score 0-100 where 100 is best neighborhood quality. Be specific.`,
    `Analyze the neighborhood for this property:\n${propData}`
  );
}

// ── Orchestrator ──────────────────────────────────────────────

async function synthesize(agentOutputs: any[]) {
  const summary = JSON.stringify(agentOutputs, null, 2);
  return callClaude(
    `You are the CASA Intelligence Engine master synthesizer. You receive outputs from 6 specialist AI agents analyzing a property. Synthesize them into a single intelligence brief. Return ONLY valid JSON:
{
  "overall_score": 78,
  "opportunity_rating": "high",
  "risk_rating": "medium",
  "top_opportunities": [
    {"title":"string","financial_impact":"$X,XXX/year","action":"string","urgency":"high"}
  ],
  "top_risks": [
    {"title":"string","financial_impact":"$X,XXX exposure","action":"string","urgency":"medium"}
  ],
  "recommended_actions": [
    {"action":"string","financial_impact":"$X,XXX","priority":1}
  ],
  "one_line_verdict": "One sentence summary of the property."
}
Include 3 opportunities, 3 risks, and 3-5 recommended actions. Be specific with dollar amounts. opportunity_rating and risk_rating must be one of: low, medium, high, exceptional (opportunity) or critical (risk).`,
    `Synthesize these 6 agent outputs into a unified intelligence brief:\n${summary}`
  );
}

// ── Main Route ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({
      error: "ANTHROPIC_API_KEY not configured. Add it to enable the CASA Intelligence Engine.",
    });
  }

  try {
    const { propertyData, googleData } = await req.json();

    // Combine all data into a single context string
    const propData = JSON.stringify({
      ...propertyData,
      solar: googleData?.solar || null,
      walkScore: googleData?.walkScore || null,
      weather: googleData?.weather || null,
    }, null, 2);

    // Run all 6 agents in parallel
    const agentResults = await Promise.all([
      marketAgent(propData).catch(() => ({ agent: "market", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
      financialAgent(propData).catch(() => ({ agent: "financial", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
      riskAgent(propData).catch(() => ({ agent: "risk", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
      opportunityAgent(propData).catch(() => ({ agent: "opportunity", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
      solarAgent(propData).catch(() => ({ agent: "solar", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
      neighborhoodAgent(propData).catch(() => ({ agent: "neighborhood", findings: ["Analysis unavailable"], score: 50, opportunities: [], risks: [], confidence: 0 })),
    ]);

    // Filter out nulls and apply defaults
    const names = ["market", "financial", "risk", "opportunity", "solar", "neighborhood"];
    const validResults = agentResults.map((r, i) => {
      if (!r || r._error) return { agent: names[i], findings: [r?._error ? `Error: ${r._error}` : "Agent returned no data"], score: 50, opportunities: [], risks: [], confidence: 0, _debug: r };
      if (!r.agent) return { ...r, agent: names[i] };
      return r;
    });

    // Synthesize with master agent
    const brief = await synthesize(validResults);

    return NextResponse.json({
      agents: validResults,
      brief: brief || {
        overall_score: Math.round(validResults.reduce((s, a) => s + (a.score || 50), 0) / 6),
        opportunity_rating: "medium",
        risk_rating: "medium",
        top_opportunities: [],
        top_risks: [],
        recommended_actions: [],
        one_line_verdict: "Intelligence analysis complete. Review individual agent findings for details.",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Intelligence engine failed" }, { status: 500 });
  }
}
