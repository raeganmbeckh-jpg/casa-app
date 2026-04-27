import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  let propertyId = "unknown";

  try {
    const body = await req.json();
    const { propertyData, rentcastData, quantumResult } = body;
    propertyId = body.propertyId || propertyData?.basic?.identifier?.apn || propertyData?.detail?.identifier?.apn || "unknown";
    const prop = propertyData?.detail || propertyData?.basic;
    const addr = prop?.address;
    const propertyAddress = addr ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1].filter(Boolean).join(", ") : "";

    // ── Cache check ──────────────────────────────────────────
    const { data: cached } = await supabase
      .from("buyer_demand_runs")
      .select("result, created_at")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (cached && cached.length > 0) {
      const age = Date.now() - new Date(cached[0].created_at).getTime();
      if (age < CACHE_TTL_MS) {
        console.log(`[buyer-demand] cache hit for ${propertyId}, age ${Math.round(age / 60000)}min`);
        return NextResponse.json({ ...cached[0].result, _cached: true, _cache_age_min: Math.round(age / 60000) });
      }
    }

    // ── Build context ────────────────────────────────────────
    const value = prop?.assessment?.market?.mktTtlValue || prop?.assessment?.assessed?.assdTtlValue || 0;
    const yearBuilt = prop?.summary?.yearbuilt || 0;
    const sqft = prop?.building?.size?.livingSize || 0;
    const beds = prop?.building?.rooms?.beds || 0;
    const baths = prop?.building?.rooms?.bathsFull || 0;
    const propType = prop?.summary?.proptype || "SFR";
    const taxes = prop?.assessment?.tax?.taxAmt || 0;
    const lastSalePrice = prop?.sale?.saleTransAmount || 0;
    const rentEstimate = rentcastData?.estimate?.rent || 0;
    const qis = quantumResult?.interference?.quantum_score || 0;

    const propertyContext = `Address: ${propertyAddress}
Value: $${value.toLocaleString()} | Beds: ${beds} | Baths: ${baths} | Sqft: ${sqft.toLocaleString()}
Year Built: ${yearBuilt} | Type: ${propType} | Taxes: $${taxes.toLocaleString()}/yr
Last Sale: $${lastSalePrice.toLocaleString()} | Rent Estimate: $${rentEstimate.toLocaleString()}/mo`;

    const quantumContext = `QIS Score: ${qis}/100
Superposition: Most likely $${(quantumResult?.superposition?.most_likely || value).toLocaleString()}, range $${(quantumResult?.superposition?.pessimistic || 0).toLocaleString()}-$${(quantumResult?.superposition?.optimistic || 0).toLocaleString()}
Tunneling hidden value: $${(quantumResult?.tunneling?.total_hidden_value || 0).toLocaleString()}
Interference verdict: ${quantumResult?.interference?.final_verdict || "N/A"}`;

    const rentContext = `Rent estimate: $${rentEstimate}/mo (range $${rentcastData?.estimate?.rentLow || 0}-$${rentcastData?.estimate?.rentHigh || 0})
Market median: $${rentcastData?.market?.medianRent || "N/A"}/mo
Vacancy: ${rentcastData?.market?.vacancyRate || "N/A"}%
Rent growth: ${rentcastData?.market?.rentGrowth || "N/A"}%`;

    // ── Try Claude ───────────────────────────────────────────
    let result: any = null;

    if (ANTHROPIC_KEY) {
      console.log(`[buyer-demand] calling Claude for ${propertyId}`);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2048,
            system: `You are CASA's Buyer Demand Simulator. You evaluate properties through the lens of 6 distinct investor archetypes and return structured JSON.

CRITICAL FAIR HOUSING CONSTRAINT: You evaluate buyers by their investment strategy, budget tier, risk tolerance, capital structure, and property-use intent only. You do NOT reference age, race, ethnicity, national origin, religion, gender, family status, disability, source of income, or zip-code-based demographic inferences. Personas are defined by financial profile and investment thesis, never by protected class. If a property's location implies demographic patterns, you ignore them and focus on the investment math.

Return ONLY valid JSON matching the schema provided. No prose, no markdown code fences, no explanation outside the JSON.`,
            messages: [{ role: "user", content: `Evaluate this property against 6 buyer archetypes.

PROPERTY DATA:
${propertyContext}

RENT/MARKET DATA:
${rentContext}

QUANTUM INTELLIGENCE OUTPUT:
${quantumContext}

Return ONLY a JSON object with this exact shape:
{
  "overall_demand_score": <number 1-100>,
  "best_fit_buyer": "<archetype name>",
  "best_fit_reason": "<one sentence>",
  "pass_rate": <percentage 0-100>,
  "median_bid": <number>,
  "bid_range": { "low": <number>, "high": <number> },
  "top_deal_breakers": ["<string>", "<string>", "<string>"],
  "archetypes": [
    {"name": "Buy-and-Hold Investor", "icon": "home", "interest_score": <1-100>, "verdict": "Strong Interest" | "Moderate Interest" | "Low Interest" | "Pass", "estimated_bid": <number>, "key_reason": "<one sentence>", "deal_breakers": []},
    {"name": "House Flipper", "icon": "hammer", "interest_score": <1-100>, "verdict": "<verdict>", "estimated_bid": <number>, "key_reason": "<sentence>", "deal_breakers": []},
    {"name": "First-Time Homebuyer", "icon": "key", "interest_score": <1-100>, "verdict": "<verdict>", "estimated_bid": <number>, "key_reason": "<sentence>", "deal_breakers": []},
    {"name": "Real Estate Developer", "icon": "building", "interest_score": <1-100>, "verdict": "<verdict>", "estimated_bid": <number>, "key_reason": "<sentence>", "deal_breakers": []},
    {"name": "Short-Term Rental Investor", "icon": "palmtree", "interest_score": <1-100>, "verdict": "<verdict>", "estimated_bid": <number>, "key_reason": "<sentence>", "deal_breakers": []},
    {"name": "1031 Exchange Buyer", "icon": "clipboard", "interest_score": <1-100>, "verdict": "<verdict>", "estimated_bid": <number>, "key_reason": "<sentence>", "deal_breakers": []}
  ],
  "consensus": "<2 sentence summary>",
  "market_insight": "<one actionable insight>"
}` }],
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "<unreadable>");
          console.error(`[buyer-demand] Anthropic returned ${res.status}: ${errBody.slice(0, 300)}`);
        } else {
          const data = await res.json();
          if (data.error) {
            console.error(`[buyer-demand] Anthropic API error: ${data.error.message || JSON.stringify(data.error)}`);
          } else {
            const text = data.content?.[0]?.text || "";
            if (!text) {
              console.error("[buyer-demand] No text content in Anthropic response");
            } else {
              // Strip markdown code fences
              const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
              const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  result = JSON.parse(jsonMatch[0]);
                  console.log(`[buyer-demand] Claude returned demand_score=${result.overall_demand_score}`);
                } catch (parseErr: any) {
                  console.error(`[buyer-demand] JSON.parse failed: ${parseErr.message}. Raw: ${cleaned.slice(0, 200)}`);
                }
              } else {
                console.error(`[buyer-demand] No JSON object found in response. Raw: ${cleaned.slice(0, 200)}`);
              }
            }
          }
        }
      } catch (fetchErr: any) {
        console.error(`[buyer-demand] fetch threw: ${fetchErr.message}`);
      }
    } else {
      console.error("[buyer-demand] ANTHROPIC_API_KEY is not set");
    }

    // ── Local fallback ───────────────────────────────────────
    if (!result) {
      console.log(`[buyer-demand] using local fallback for ${propertyId}`);
      const age = yearBuilt ? new Date().getFullYear() - yearBuilt : 30;
      const capRate = rentEstimate > 0 && value > 0 ? ((rentEstimate * 12 - taxes - rentEstimate * 12 * 0.35) / value) * 100 : 4;
      const flipMargin = value > 0 ? Math.round(value * 0.15) : 50000;
      const demandScore = Math.max(20, Math.min(90, 40 + (qis > 60 ? 15 : 0) + (capRate > 5 ? 10 : 0) + (beds >= 3 ? 8 : 0) + (age < 20 ? 7 : 0) + (sqft > 1500 ? 5 : 0)));

      const archetypes = [
        { name: "Buy-and-Hold Investor", icon: "home", interest_score: Math.min(95, Math.round(40 + capRate * 8)), verdict: capRate > 5 ? "Strong Interest" : capRate > 3.5 ? "Moderate Interest" : "Low Interest", estimated_bid: Math.round(value * 0.95), key_reason: capRate > 5 ? `${capRate.toFixed(1)}% cap rate exceeds market average — strong cash flow play` : `${capRate.toFixed(1)}% cap rate is below target — would need rent upside`, deal_breakers: age > 40 ? ["Aging systems may require significant CapEx"] : [] },
        { name: "House Flipper", icon: "hammer", interest_score: age > 25 ? 70 : 35, verdict: age > 25 ? "Moderate Interest" : "Low Interest", estimated_bid: Math.round(value * 0.7), key_reason: age > 25 ? `${age}yr old property has renovation potential — ARV spread of ~$${flipMargin.toLocaleString()}` : "Newer build limits value-add opportunity", deal_breakers: age < 15 ? ["Not enough renovation upside"] : [] },
        { name: "First-Time Homebuyer", icon: "key", interest_score: beds >= 3 && value < 800000 ? 75 : 45, verdict: beds >= 3 && value < 800000 ? "Strong Interest" : "Moderate Interest", estimated_bid: Math.round(value * 1.02), key_reason: beds >= 3 ? `${beds}bd/${baths}ba is ideal for a growing household` : "May not meet space requirements", deal_breakers: value > 900000 ? ["Price exceeds typical first-time buyer budget"] : [] },
        { name: "Real Estate Developer", icon: "building", interest_score: sqft > 2000 || propType !== "SFR" ? 55 : 25, verdict: sqft > 2000 ? "Moderate Interest" : "Low Interest", estimated_bid: Math.round(value * 0.85), key_reason: sqft > 2000 ? "Lot size and configuration may support density increase" : "Standard SFR — limited development potential", deal_breakers: ["Zoning verification required", "Entitlement timeline uncertainty"] },
        { name: "Short-Term Rental Investor", icon: "palmtree", interest_score: beds >= 2 ? 60 : 30, verdict: beds >= 2 ? "Moderate Interest" : "Low Interest", estimated_bid: Math.round(value * 0.98), key_reason: beds >= 2 ? `${beds}bd could generate $${Math.round(rentEstimate * 1.6)}/mo as STR` : "Configuration limits STR appeal", deal_breakers: ["Local STR regulations must be verified"] },
        { name: "1031 Exchange Buyer", icon: "clipboard", interest_score: value > 400000 ? 65 : 40, verdict: value > 400000 ? "Moderate Interest" : "Low Interest", estimated_bid: Math.round(value * 1.05), key_reason: value > 400000 ? "Price point fits common 1031 exchange range — motivated buyers pay premium" : "Below typical exchange threshold", deal_breakers: ["45-day identification deadline creates urgency"] },
      ];

      const sorted = [...archetypes].sort((a, b) => b.interest_score - a.interest_score);
      const passCount = archetypes.filter(a => a.verdict === "Pass" || a.verdict === "Low Interest").length;
      const bids = archetypes.map(a => a.estimated_bid).sort((a, b) => a - b);

      result = {
        overall_demand_score: demandScore,
        best_fit_buyer: sorted[0].name,
        best_fit_reason: sorted[0].key_reason,
        pass_rate: Math.round((passCount / 6) * 100),
        median_bid: bids[Math.floor(bids.length / 2)],
        bid_range: { low: bids[0], high: bids[bids.length - 1] },
        top_deal_breakers: Array.from(new Set(archetypes.flatMap(a => a.deal_breakers))).slice(0, 3),
        archetypes,
        consensus: `${6 - passCount} of 6 buyer archetypes show interest. ${sorted[0].name} is the strongest fit at a projected bid of $${sorted[0].estimated_bid.toLocaleString()}.`,
        market_insight: capRate > 5 ? "Strong yield attracts cash flow investors — price aggressively to capture bidding competition." : "Position as a value-add opportunity to attract flippers and developers willing to pay for upside.",
        _fallback: true,
      };
    }

    // ── Save to cache ────────────────────────────────────────
    const durationMs = Date.now() - startMs;
    supabase.from("buyer_demand_runs").insert({
      property_id: propertyId,
      property_address: propertyAddress,
      result,
      cost_usd: result._fallback ? 0 : 0.015,
      duration_ms: durationMs,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error(`[buyer-demand] top-level error for ${propertyId}: ${err.message}`);
    return NextResponse.json({ error: "Buyer demand simulation failed", debug: err.message }, { status: 500 });
  }
}
