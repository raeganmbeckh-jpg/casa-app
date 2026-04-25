import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(system: string, userMsg: string): Promise<any> {
  if (!ANTHROPIC_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 1500, system, messages: [{ role: "user", content: userMsg }] }),
    });
    const data = await res.json();
    if (data.error) return null;
    const text = data.content?.[0]?.text || "";
    const m = text.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    return null;
  } catch { return null; }
}

function localIntelligence(propertyData: any, googleData: any) {
  const d = propertyData?.detail || propertyData?.basic;
  if (!d) return null;

  const value = d?.assessment?.market?.mktTtlValue || d?.assessment?.assessed?.assdTtlValue || 0;
  const yearBuilt = d?.summary?.yearbuilt || 0;
  const age = yearBuilt ? new Date().getFullYear() - yearBuilt : 0;
  const sqft = d?.building?.size?.livingSize || d?.building?.size?.bldgSize || 0;
  const beds = d?.building?.rooms?.beds || 0;
  const baths = d?.building?.rooms?.bathsFull || 0;
  const taxes = d?.assessment?.tax?.taxAmt || 0;
  const lastSale = d?.sale?.saleTransAmount || 0;
  const propType = d?.summary?.proptype || "SFR";
  const solar = googleData?.solar;

  // Score components
  let score = 50;
  const opportunities: any[] = [];
  const risks: any[] = [];

  // Value analysis
  if (value > 0 && lastSale > 0 && value > lastSale) {
    const appreciation = Math.round(((value - lastSale) / lastSale) * 100);
    score += Math.min(appreciation / 2, 15);
    opportunities.push({ title: `${appreciation}% appreciation since purchase`, financial_impact: `$${(value - lastSale).toLocaleString()} equity gain`, action: "Strong equity position enables cash-out refinance or HELOC" });
  }

  // Age analysis
  if (age > 20) {
    const hvacCost = Math.round(sqft * 6.5 / 100) * 100 || 13000;
    const roofCost = Math.round(sqft * 8 / 100) * 100 || 16000;
    risks.push({ title: `Property is ${age} years old — aging systems`, financial_impact: `$${(hvacCost + roofCost).toLocaleString()} potential replacement`, action: "Schedule HVAC and roof inspections. Budget for proactive replacement." });
    score -= Math.min(age - 20, 15);
  } else {
    score += 5;
    opportunities.push({ title: "Newer construction — low maintenance risk", financial_impact: "Reduced CapEx reserves needed", action: "Allocate savings toward rent optimization or additional acquisitions" });
  }

  // Size analysis
  if (sqft > 0 && value > 0) {
    const ppsf = Math.round(value / sqft);
    if (ppsf < 400) {
      score += 8;
      opportunities.push({ title: `Below-average price per sqft ($${ppsf}/sqft)`, financial_impact: "Potential undervaluation", action: "Compare to neighborhood comps — may be below market value" });
    }
  }

  // Solar opportunity
  if (solar?.maxPanels) {
    opportunities.push({ title: `Solar potential: ${solar.maxPanels} panels, ${(solar.annualEnergy || 0).toLocaleString()} kWh/yr`, financial_impact: "$1,200-2,400/yr energy savings + 26% federal tax credit", action: "Get solar quotes. Typical payback 6-8 years with immediate cash flow benefit." });
    score += 5;
  }

  // Tax burden
  if (taxes > 0 && value > 0) {
    const taxRate = (taxes / value) * 100;
    if (taxRate > 1.5) {
      risks.push({ title: `High effective tax rate (${taxRate.toFixed(1)}%)`, financial_impact: `$${taxes.toLocaleString()}/yr in property taxes`, action: "Review assessment for appeal opportunity" });
      score -= 3;
    }
  }

  // Bed/bath ratio
  if (beds > 0 && beds >= 3) {
    score += 3;
    opportunities.push({ title: `${beds}bd/${baths}ba — family-friendly configuration`, financial_impact: "Strong rental demand for 3+ bedroom homes", action: "Target family renters for longer lease terms and lower turnover" });
  }

  score = Math.max(15, Math.min(95, Math.round(score)));

  const oppRating = score >= 75 ? "high" : score >= 55 ? "medium" : "low";
  const riskRating = risks.length >= 3 ? "high" : risks.length >= 2 ? "medium" : "low";
  const addr = d?.address;
  const addressStr = addr ? [addr.line1, addr.locality, addr.countrySubd].filter(Boolean).join(", ") : "this property";

  return {
    overall_score: score,
    opportunity_rating: oppRating,
    risk_rating: riskRating,
    top_opportunities: opportunities.slice(0, 3),
    top_risks: risks.slice(0, 3),
    recommended_actions: [
      ...opportunities.slice(0, 2).map((o, i) => ({ action: o.action, financial_impact: o.financial_impact, priority: i + 1 })),
      ...risks.slice(0, 2).map((r, i) => ({ action: r.action, financial_impact: r.financial_impact, priority: i + 3 })),
    ],
    one_line_verdict: `${addressStr}: Score ${score}/100. ${oppRating === "high" ? "Strong opportunity" : oppRating === "medium" ? "Moderate opportunity" : "Limited upside"} with ${riskRating} risk. ${opportunities[0]?.title || "Review data for details."}`,
    _source: "local_analysis",
  };
}

export async function POST(req: NextRequest) {
  try {
    const { propertyData, googleData } = await req.json();

    // Try Claude first with a single master analysis call
    const propData = JSON.stringify({
      basic: propertyData?.basic,
      detail: propertyData?.detail,
      comps: propertyData?.comps?.slice(0, 3),
      solar: googleData?.solar,
      walkScore: googleData?.walkScore,
    });

    let brief = await callClaude(
      `You are the CASA Intelligence Engine. Analyze this real estate property and return a comprehensive intelligence brief. Return ONLY valid JSON with this exact structure:
{
  "overall_score": 72,
  "opportunity_rating": "medium",
  "risk_rating": "low",
  "top_opportunities": [{"title":"string","financial_impact":"$X,XXX","action":"string"}],
  "top_risks": [{"title":"string","financial_impact":"$X,XXX","action":"string"}],
  "recommended_actions": [{"action":"string","financial_impact":"$X,XXX","priority":1}],
  "one_line_verdict": "Brief one-sentence summary."
}
Include 2-3 opportunities, 2-3 risks, and 3-5 actions. Be specific with dollar amounts. opportunity_rating: low|medium|high|exceptional. risk_rating: low|medium|high|critical.`,
      `Analyze this property:\n${propData}`
    );

    // Fallback to local analysis if Claude unavailable
    if (!brief) {
      brief = localIntelligence(propertyData, googleData);
    }

    if (!brief) {
      return NextResponse.json({
        agents: [],
        brief: {
          overall_score: 0,
          opportunity_rating: "medium",
          risk_rating: "medium",
          top_opportunities: [],
          top_risks: [],
          recommended_actions: [],
          one_line_verdict: "AI analysis requires property data — try searching a specific address",
        },
      });
    }

    // Build agent-like results from the brief
    const agents = [
      { agent: "market", score: brief.overall_score, findings: [brief.one_line_verdict], confidence: 75 },
      { agent: "financial", score: Math.max(30, brief.overall_score - 5), findings: brief.top_opportunities?.map((o: any) => o.title) || [], confidence: 70 },
      { agent: "risk", score: brief.risk_rating === "low" ? 85 : brief.risk_rating === "medium" ? 60 : 35, findings: brief.top_risks?.map((r: any) => r.title) || [], confidence: 70 },
    ];

    return NextResponse.json({ agents, brief });
  } catch {
    return NextResponse.json({
      agents: [],
      brief: {
        overall_score: 0,
        opportunity_rating: "medium",
        risk_rating: "medium",
        top_opportunities: [],
        top_risks: [],
        recommended_actions: [],
        one_line_verdict: "Intelligence analysis encountered an error. Please try again.",
      },
    });
  }
}
