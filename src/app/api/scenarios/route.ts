import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.ANTHROPIC_API_KEY;

async function claude(system: string, user: string) {
  if (!KEY) return null;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2048, temperature: 0, system, messages: [{ role: "user", content: user }] }),
    });
    const d = await r.json();
    if (d.error) return null;
    const text = d.content?.[0]?.text || "";
    const m = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch { return null; }
    return null;
  } catch { return null; }
}

function fallbackScenarios(rent: number, debt: number, expenses: number, value: number, vacancy: number) {
  const monthly = rent * (1 - vacancy / 100) - debt - expenses;
  const annual = monthly * 12;
  const equity = value * 0.25;
  const coc = equity > 0 ? (annual / equity) * 100 : 0;

  return [
    { rank: 1, name: "Refinance at -1%", strategy_type: "cash_flow", monthly_cash_flow_change: Math.round(debt * 0.12), annual_noi_change: Math.round(debt * 0.12 * 12), new_property_value: value, cash_on_cash_return: +(coc + 1.8).toFixed(1), risk_level: "low", time_to_implement: "45-60 days", upfront_cost: Math.round(value * 0.015), payback_period_months: Math.round((value * 0.015) / (debt * 0.12)), recommendation: "Strong play if rates drop. Lock in lower payment and improved cash flow immediately.", confidence: 85 },
    { rank: 2, name: "Rate Rise +1% Stress Test", strategy_type: "safety", monthly_cash_flow_change: -Math.round(debt * 0.10), annual_noi_change: -Math.round(debt * 0.10 * 12), new_property_value: Math.round(value * 0.97), cash_on_cash_return: +(coc - 1.5).toFixed(1), risk_level: "medium", time_to_implement: "Immediate", upfront_cost: 0, payback_period_months: 0, recommendation: "If variable rate, a 1% rise costs you " + Math.round(debt * 0.10) + "/mo. Consider fixing now.", confidence: 75 },
    { rank: 3, name: "Rents Fall 5%", strategy_type: "safety", monthly_cash_flow_change: -Math.round(rent * 0.05), annual_noi_change: -Math.round(rent * 0.05 * 12), new_property_value: Math.round(value * 0.96), cash_on_cash_return: +(coc - 0.8).toFixed(1), risk_level: "medium", time_to_implement: "N/A", upfront_cost: 0, payback_period_months: 0, recommendation: "5% rent decline reduces cash flow by $" + Math.round(rent * 0.05) + "/mo. Build 3-month reserve.", confidence: 70 },
    { rank: 4, name: "Vacancy to 10%", strategy_type: "safety", monthly_cash_flow_change: -Math.round(rent * (0.10 - vacancy / 100)), annual_noi_change: -Math.round(rent * (0.10 - vacancy / 100) * 12), new_property_value: value, cash_on_cash_return: +(coc - 1.2).toFixed(1), risk_level: "medium", time_to_implement: "N/A", upfront_cost: 0, payback_period_months: 0, recommendation: "At 10% vacancy you lose $" + Math.round(rent * 0.10) + "/mo. Screen tenants carefully and maintain property.", confidence: 72 },
    { rank: 5, name: "Refi Now vs Wait 2yr", strategy_type: "balanced", monthly_cash_flow_change: Math.round(debt * 0.08), annual_noi_change: Math.round(debt * 0.08 * 12), new_property_value: Math.round(value * 1.06), cash_on_cash_return: +(coc + 1.2).toFixed(1), risk_level: "low", time_to_implement: "60 days", upfront_cost: Math.round(value * 0.01), payback_period_months: Math.round((value * 0.01) / (debt * 0.08)), recommendation: "Waiting risks higher rates. Current savings justify closing costs within " + Math.round((value * 0.01) / (debt * 0.08)) + " months.", confidence: 68 },
    { rank: 6, name: "Raise Rent $150/mo", strategy_type: "cash_flow", monthly_cash_flow_change: 150, annual_noi_change: 1800, new_property_value: Math.round(value * 1.01), cash_on_cash_return: +((annual + 1800) / equity * 100).toFixed(1), risk_level: "low", time_to_implement: "30 days", upfront_cost: 0, payback_period_months: 0, recommendation: "Market comps support $150 increase. Low turnover risk at 5% bump. Immediate NOI impact.", confidence: 88 },
    { rank: 7, name: "Build ADU", strategy_type: "growth", monthly_cash_flow_change: 1600, annual_noi_change: 19200, new_property_value: Math.round(value * 1.15), cash_on_cash_return: +((annual + 19200) / (equity + 120000) * 100).toFixed(1), risk_level: "medium", time_to_implement: "6-9 months", upfront_cost: 120000, payback_period_months: Math.round(120000 / 1600), recommendation: "ADU adds $1,600/mo income and 15% property value. Best long-term ROI play.", confidence: 80 },
    { rank: 8, name: "Kitchen/Bath Renovation", strategy_type: "growth", monthly_cash_flow_change: 350, annual_noi_change: 4200, new_property_value: Math.round(value + 55000), cash_on_cash_return: +((annual + 4200) / (equity + 32000) * 100).toFixed(1), risk_level: "low", time_to_implement: "4-6 weeks", upfront_cost: 32000, payback_period_months: Math.round(32000 / 350), recommendation: "Kitchens and baths return 150-170% in San Diego. Justifies rent increase and boosts resale.", confidence: 85 },
    { rank: 9, name: "Add Solar Panels", strategy_type: "balanced", monthly_cash_flow_change: Math.round(100 + 50), annual_noi_change: 1800, new_property_value: Math.round(value + 15000), cash_on_cash_return: +((annual + 1800) / equity * 100).toFixed(1), risk_level: "low", time_to_implement: "2-4 weeks", upfront_cost: 18000, payback_period_months: Math.round(18000 / 150), recommendation: "26% federal tax credit brings net cost to $13.3K. Saves $100/mo on utilities + $15K value add.", confidence: 82 },
    { rank: 10, name: "Switch Property Manager", strategy_type: "cash_flow", monthly_cash_flow_change: Math.round(rent * 0.02), annual_noi_change: Math.round(rent * 0.02 * 12), new_property_value: value, cash_on_cash_return: +((annual + rent * 0.02 * 12) / equity * 100).toFixed(1), risk_level: "low", time_to_implement: "2 weeks", upfront_cost: 0, payback_period_months: 0, recommendation: "Competitive bidding between managers can save 1-2% of rent. Negotiate performance incentives.", confidence: 75 },
  ];
}

function agentPerspectives(scenarios: any[]) {
  const safe = [...scenarios].sort((a, b) => {
    const ro = { low: 0, medium: 1, high: 2 };
    return (ro[a.risk_level as keyof typeof ro] || 0) - (ro[b.risk_level as keyof typeof ro] || 0) || b.confidence - a.confidence;
  })[0];
  const growth = [...scenarios].sort((a, b) => (b.new_property_value || 0) - (a.new_property_value || 0))[0];
  const cashflow = [...scenarios].sort((a, b) => b.monthly_cash_flow_change - a.monthly_cash_flow_change)[0];
  const risky = [...scenarios].sort((a, b) => {
    const ro = { low: 0, medium: 1, high: 2 };
    return (ro[b.risk_level as keyof typeof ro] || 0) - (ro[a.risk_level as keyof typeof ro] || 0);
  })[0];

  return {
    conservative: { pick: safe.name, verdict: `${safe.name} is the safest move with ${safe.risk_level} risk and ${safe.confidence}% confidence. Preserves capital while maintaining steady returns.` },
    growth: { pick: growth.name, verdict: `${growth.name} offers the highest value appreciation to $${(growth.new_property_value || 0).toLocaleString()}. Worth the upfront investment of $${(growth.upfront_cost || 0).toLocaleString()}.` },
    cashflow: { pick: cashflow.name, verdict: `${cashflow.name} delivers the best monthly improvement at +$${cashflow.monthly_cash_flow_change.toLocaleString()}/mo. Immediate impact on your bottom line.` },
    risk: { pick: risky.name, verdict: `Watch out for ${risky.name} — it carries ${risky.risk_level} risk. ${risky.risk_level === 'high' ? 'Consider hedging or starting smaller.' : 'Manageable with proper planning.'}` },
    consensus: scenarios.filter(s => s.risk_level === "low" && s.monthly_cash_flow_change > 0).sort((a, b) => b.confidence - a.confidence)[0]?.name || safe.name,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { rent, debt, expenses, value, vacancy, priority, portfolio } = await req.json();

    // Try Claude first
    let scenarios = await claude(
      `You are a real estate investment scenario engine. Generate exactly 10 scenarios as a JSON array. Each object must have: rank (1-10), name, strategy_type (one of: cash_flow, growth, safety, balanced), monthly_cash_flow_change (number), annual_noi_change (number), new_property_value (number), cash_on_cash_return (number with 1 decimal), risk_level (low/medium/high), time_to_implement (string), upfront_cost (number), payback_period_months (number), recommendation (2 sentences), confidence (0-100). Cover these 10 scenarios in order: 1) Rate drop 1% refinance, 2) Rate rise 1% stress test, 3) Rents fall 5%, 4) Vacancy to 10%, 5) Refi now vs wait 2yr, 6) Raise rent $100-200, 7) Build ADU, 8) Kitchen/bath renovation, 9) Add solar, 10) Switch property manager. Rank by ${priority || "balanced"} priority. Return ONLY the JSON array.`,
      `Property: value=$${value}, rent=$${rent}/mo, debt=$${debt}/mo, expenses=$${expenses}/mo, vacancy=${vacancy}%, priority=${priority}. ${portfolio ? "Apply across portfolio of " + portfolio.length + " properties." : ""}`
    );

    // Fallback to local calculations
    if (!scenarios || !Array.isArray(scenarios)) {
      scenarios = fallbackScenarios(rent, debt, expenses, value, vacancy);
    }

    // Sort by priority
    if (priority === "cashflow") scenarios.sort((a: any, b: any) => b.monthly_cash_flow_change - a.monthly_cash_flow_change);
    else if (priority === "growth") scenarios.sort((a: any, b: any) => (b.new_property_value || 0) - (a.new_property_value || 0));
    else if (priority === "safety") {
      const ro: Record<string, number> = { low: 0, medium: 1, high: 2 };
      scenarios.sort((a: any, b: any) => (ro[a.risk_level] || 0) - (ro[b.risk_level] || 0));
    }
    scenarios = scenarios.map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    const agents = agentPerspectives(scenarios);

    return NextResponse.json({ scenarios, agents });
  } catch {
    return NextResponse.json({ error: "Scenario engine failed" }, { status: 500 });
  }
}
