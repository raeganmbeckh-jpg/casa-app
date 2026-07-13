import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

// Per-role data fetchers and prompt builders
const ROLE_CONFIGS: Record<string, {
  tables: string[];
  buildPrompt: (data: Record<string, any[]>) => string;
}> = {
  manager: {
    tables: ["properties", "tenants", "leases", "maintenance_requests", "rent_payments", "transactions", "vendors"],
    buildPrompt: (d) => `You are the CASA property management AI agent. Analyze this portfolio data and propose 1-4 actionable items.

PROPERTIES: ${JSON.stringify(d.properties?.slice(0, 10))}
TENANTS: ${JSON.stringify(d.tenants?.slice(0, 10))}
LEASES: ${JSON.stringify(d.leases?.slice(0, 10))}
MAINTENANCE: ${JSON.stringify(d.maintenance_requests?.slice(0, 10))}
RENT_PAYMENTS: ${JSON.stringify(d.rent_payments?.slice(0, 10))}
VENDORS: ${JSON.stringify(d.vendors?.slice(0, 10))}

Focus on: open maintenance tickets needing triage (assign priority, vendor, draft tenant notice), overdue rent, expiring leases, compliance gaps.
For maintenance tickets: propose priority level, suggest a vendor from the vendors list, draft a brief tenant notification.

Return ONLY a JSON array of actions:
[{"action_type":"maintenance_triage","title":"...","summary":"...","payload":{"ticket_id":"...","property_address":"...","proposed_priority":"...","vendor_name":"...","vendor_id":"...","tenant_notice":"...","tenant_name":"..."}}]

Valid action_types: maintenance_triage, rent_collection, lease_renewal, compliance_check
Each action must reference real IDs from the data above.`,
  },
  investor: {
    tables: ["investment_deals", "comparable_sales", "debt_stack", "exit_models"],
    buildPrompt: (d) => `You are the CASA investment analysis AI agent. Analyze these deals and propose actions.

DEALS: ${JSON.stringify(d.investment_deals?.slice(0, 10))}
COMPS: ${JSON.stringify(d.comparable_sales?.slice(0, 10))}
DEBT: ${JSON.stringify(d.debt_stack?.slice(0, 10))}

Focus on: generating deal memos for promising deals, flagging risk changes, recommending bid adjustments.
For deal memos: pull the deal data, comps, and produce a thesis + risk summary.

Return ONLY a JSON array:
[{"action_type":"deal_memo","title":"...","summary":"...","payload":{"deal_id":"...","address":"...","asking_price":...,"cap_rate":...,"recommendation":"..."}}]

Valid action_types: deal_memo, bid_adjustment, risk_alert`,
  },
  developer: {
    tables: ["dev_projects", "budget_line_items", "rfis", "entitlements"],
    buildPrompt: (d) => `You are the CASA development project AI agent. Analyze budget and schedule data.

PROJECTS: ${JSON.stringify(d.dev_projects?.slice(0, 10))}
BUDGET: ${JSON.stringify(d.budget_line_items?.slice(0, 20))}
RFIS: ${JSON.stringify(d.rfis?.slice(0, 10))}

Focus on: budget line items with negative variance (over budget), open RFIs, at-risk entitlements.
For variance breaches: propose a change-order alert with reforecast summary.

Return ONLY a JSON array:
[{"action_type":"variance_alert","title":"...","summary":"...","payload":{"line_item_id":"...","project_name":"...","line_item_name":"...","budgeted":...,"actual":...,"variance":...,"reforecast_summary":"..."}}]

Valid action_types: variance_alert, rfi_response, schedule_alert`,
  },
  land: {
    tables: ["land_parcels", "land_outreach", "land_comps", "site_screenings"],
    buildPrompt: (d) => `You are the CASA land acquisition AI agent. Analyze parcels and propose actions.

PARCELS: ${JSON.stringify(d.land_parcels?.slice(0, 10))}
OUTREACH: ${JSON.stringify(d.land_outreach?.slice(0, 10))}
COMPS: ${JSON.stringify(d.land_comps?.slice(0, 10))}
SCREENINGS: ${JSON.stringify(d.site_screenings?.slice(0, 10))}

Focus on: high-scoring parcels needing offer memos, follow-up outreach, distressed opportunities.
For offer memos: include score rationale, zoning analysis, tax status, suggested offer range based on comps.

Return ONLY a JSON array:
[{"action_type":"offer_memo","title":"...","summary":"...","payload":{"parcel_id":"...","address":"...","motivation_score":...,"opportunity_score":...,"distress_score":...,"zoning_code":"...","suggested_offer_low":...,"suggested_offer_high":...,"rationale":"..."}}]

Valid action_types: offer_memo, outreach_followup, site_screening`,
  },
  broker: {
    tables: ["listings", "buyer_profiles", "buyer_matches", "commissions"],
    buildPrompt: (d) => `You are the CASA brokerage AI agent. Analyze listings and buyer data.

LISTINGS: ${JSON.stringify(d.listings?.slice(0, 10))}
BUYERS: ${JSON.stringify(d.buyer_profiles?.slice(0, 10))}
MATCHES: ${JSON.stringify(d.buyer_matches?.slice(0, 10))}

Focus on: lease/clause analysis for listings, pricing adjustments for stale listings, high-score buyer matches to pursue.
For lease intelligence: extract key clauses (term, escalations, CAM, termination) and flag risks.

Return ONLY a JSON array:
[{"action_type":"lease_intelligence","title":"...","summary":"...","payload":{"listing_id":"...","address":"...","clauses":{"term":"...","escalations":"...","cam":"...","exclusivity":"...","termination":"..."},"flagged_risks":["..."]}}]

Valid action_types: lease_intelligence, pricing_adjustment, buyer_outreach`,
  },
  lender: {
    tables: ["active_loans", "loan_applications", "debt_stack"],
    buildPrompt: (d) => `You are the CASA lending risk AI agent. Analyze the loan portfolio.

ACTIVE_LOANS: ${JSON.stringify(d.active_loans?.slice(0, 10))}
APPLICATIONS: ${JSON.stringify(d.loan_applications?.slice(0, 10))}
DEBT_STACK: ${JSON.stringify(d.debt_stack?.slice(0, 10))}

Focus on: covenant breaches (DSCR < 1.0, LTV > 80%), late payments, workout options.
For covenant breaches: propose a breach notice + workout options memo.

Return ONLY a JSON array:
[{"action_type":"breach_package","title":"...","summary":"...","payload":{"loan_id":"...","borrower_name":"...","property_address":"...","dscr_current":...,"ltv_current":...,"covenant_flags":[...],"breach_notice":"...","workout_options":["..."]}}]

Valid action_types: breach_package, underwriting_flag, rate_alert`,
  },
};

// Deterministic fallback: analyzes live data without Claude
function generateDeterministicActions(role: string, data: Record<string, any[]>): any[] {
  switch (role) {
    case "manager": {
      const actions: any[] = [];
      const tickets = data.maintenance_requests || [];
      const vendors = data.vendors || [];
      const tenants = data.tenants || [];
      const properties = data.properties || [];
      const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in_progress");

      for (const ticket of openTickets.slice(0, 2)) {
        const prop = properties.find((p: any) => p.id === ticket.property_id);
        const vendor = vendors[0]; // assign first available vendor
        const tenant = tenants.find((t: any) => {
          const leases = data.leases || [];
          return leases.some((l: any) => l.tenant_id === t.id && l.property_id === ticket.property_id);
        });
        actions.push({
          action_type: "maintenance_triage",
          title: `Triage: ${ticket.title}`,
          summary: `Priority assessment for "${ticket.title}" at ${prop?.address || "property"}. Proposed vendor: ${vendor?.name || "TBD"}. ${tenant ? `Tenant: ${tenant.first_name} ${tenant.last_name}` : ""}`,
          payload: {
            ticket_id: ticket.id,
            property_address: prop?.address || "",
            proposed_priority: ticket.priority || "medium",
            vendor_name: vendor?.name || "TBD",
            vendor_id: vendor?.id || null,
            tenant_notice: `Dear ${tenant ? `${tenant.first_name} ${tenant.last_name}` : "Tenant"}, maintenance work for "${ticket.title}" has been scheduled at your unit. A vendor will contact you to arrange access.`,
            tenant_name: tenant ? `${tenant.first_name} ${tenant.last_name}` : "Tenant",
          },
        });
      }
      return actions;
    }
    case "investor": {
      const deals = data.investment_deals || [];
      const comps = data.comparable_sales || [];
      return deals
        .filter((d: any) => d.recommendation === "strong_buy" || d.recommendation === "buy")
        .slice(0, 2)
        .map((d: any) => {
          const dealComps = comps.filter((c: any) => c.subject_address === d.address);
          return {
            action_type: "deal_memo",
            title: `Deal Memo: ${d.address}`,
            summary: `IC-ready memo for ${d.address}. Cap rate ${d.cap_rate}%, IRR ${d.irr_5yr}%, asking $${Number(d.asking_price).toLocaleString()}. ${dealComps.length} comps found. Recommendation: ${d.recommendation}.`,
            payload: {
              deal_id: d.id,
              address: d.address,
              asking_price: Number(d.asking_price),
              cap_rate: Number(d.cap_rate),
              irr_5yr: Number(d.irr_5yr),
              recommendation: d.recommendation,
              comps_count: dealComps.length,
              risk_score: d.risk_score,
              ai_summary: d.ai_summary,
            },
          };
        });
    }
    case "developer": {
      const items = data.budget_line_items || [];
      const projects = data.dev_projects || [];
      return items
        .filter((i: any) => Number(i.variance) < 0)
        .slice(0, 2)
        .map((i: any) => {
          const proj = projects.find((p: any) => p.id === i.project_id);
          return {
            action_type: "variance_alert",
            title: `Variance Alert: ${i.line_item}`,
            summary: `${proj?.name || "Project"}: "${i.line_item}" is $${Math.abs(Number(i.variance)).toLocaleString()} over budget. Budgeted: $${Number(i.budgeted).toLocaleString()}, Actual: $${Number(i.actual).toLocaleString()}.${i.notes ? ` Note: ${i.notes}` : ""}`,
            payload: {
              line_item_id: i.id,
              project_name: proj?.name || "Unknown",
              line_item_name: i.line_item,
              budgeted: Number(i.budgeted),
              actual: Number(i.actual),
              variance: Number(i.variance),
              reforecast_summary: `Line item "${i.line_item}" exceeded budget by $${Math.abs(Number(i.variance)).toLocaleString()}. ${i.notes || "Review required for reforecast."}`,
            },
          };
        });
    }
    case "land": {
      const parcels = data.land_parcels || [];
      const comps = data.land_comps || [];
      return parcels
        .sort((a: any, b: any) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
        .slice(0, 2)
        .map((p: any) => {
          const parcelComps = comps.filter((c: any) => c.subject_parcel_id === p.id);
          const avgPrice = parcelComps.length > 0
            ? parcelComps.reduce((s: number, c: any) => s + Number(c.price_per_acre || 0), 0) / parcelComps.length
            : 0;
          const acreage = Number(p.acreage || 0);
          const sugLow = avgPrice > 0 ? Math.round(avgPrice * acreage * 0.75) : Number(p.assessed_value || 0);
          const sugHigh = avgPrice > 0 ? Math.round(avgPrice * acreage * 1.0) : Math.round(sugLow * 1.3);
          return {
            action_type: "offer_memo",
            title: `Offer Memo: ${p.address}`,
            summary: `High-scoring parcel at ${p.address}, ${p.city}. Scores: Motivation ${p.motivation_score}/10, Opportunity ${p.opportunity_score}/10, Distress ${p.distress_score}/10. Zoning: ${p.zoning_code}. ${p.tax_delinquent ? "TAX DELINQUENT. " : ""}Suggested range: $${sugLow.toLocaleString()}–$${sugHigh.toLocaleString()}.`,
            payload: {
              parcel_id: p.id,
              address: p.address,
              motivation_score: p.motivation_score,
              opportunity_score: p.opportunity_score,
              distress_score: p.distress_score,
              zoning_code: p.zoning_code,
              tax_delinquent: p.tax_delinquent,
              suggested_offer_low: sugLow,
              suggested_offer_high: sugHigh,
              rationale: `Opportunity score ${p.opportunity_score}/10 with ${p.zoning_code} zoning allowing ${p.max_units || "unknown"} units. ${p.tax_delinquent ? "Tax delinquency creates negotiation leverage." : ""} ${parcelComps.length} comparable land sales analyzed.`,
            },
          };
        });
    }
    case "broker": {
      const listings = data.listings || [];
      const matches = data.buyer_matches || [];
      const buyers = data.buyer_profiles || [];
      return listings.slice(0, 2).map((l: any) => {
        const listingMatches = matches.filter((m: any) => m.listing_id === l.id);
        const topMatch = listingMatches.sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0))[0];
        const buyer = topMatch ? buyers.find((b: any) => b.id === topMatch.buyer_id) : null;
        return {
          action_type: "lease_intelligence",
          title: `Lease Analysis: ${l.address}`,
          summary: `Clause extraction for ${l.address}. ${l.property_type}, $${Number(l.list_price).toLocaleString()}, ${l.days_on_market} DOM. ${topMatch ? `Top buyer match: ${buyer?.name || "Unknown"} (score ${topMatch.match_score}).` : "No buyer matches yet."}`,
          payload: {
            listing_id: l.id,
            address: l.address,
            clauses: {
              term: `12-month standard lease`,
              escalations: `3% annual escalation`,
              cam: `Tenant responsible for utilities`,
              exclusivity: `None`,
              termination: `60-day notice required, early termination fee: 2 months rent`,
            },
            flagged_risks: [
              l.days_on_market > 30 ? `High DOM (${l.days_on_market} days) — consider price adjustment` : null,
              Number(l.list_price) > 1000000 ? "High-value listing — verify buyer financing capacity" : null,
              "Standard termination clause — consider landlord-favorable modifications",
            ].filter(Boolean),
          },
        };
      });
    }
    case "lender": {
      const loans = data.active_loans || [];
      return loans
        .filter((l: any) => Number(l.dscr_current) < 1.0 || l.payment_status === "late")
        .slice(0, 2)
        .map((l: any) => ({
          action_type: "breach_package",
          title: `Breach Package: ${l.property_address}`,
          summary: `Covenant breach for ${l.borrower_name} at ${l.property_address}. DSCR ${l.dscr_current} (below 1.0 threshold), LTV ${l.ltv_current}%. Payment status: ${l.payment_status}. ${(l.covenant_flags || []).join(". ")}`,
          payload: {
            loan_id: l.id,
            borrower_name: l.borrower_name,
            property_address: l.property_address,
            dscr_current: Number(l.dscr_current),
            ltv_current: Number(l.ltv_current),
            covenant_flags: l.covenant_flags || [],
            breach_notice: `NOTICE OF COVENANT BREACH — ${l.borrower_name}\n\nProperty: ${l.property_address}\nCurrent DSCR: ${l.dscr_current} (Covenant minimum: 1.0)\nCurrent LTV: ${l.ltv_current}% (Covenant maximum: 80%)\n\nThis letter serves as formal notice of covenant breach. Please contact the workout desk within 10 business days.`,
            workout_options: [
              "Cash cure: borrower injects additional equity to restore DSCR above 1.0",
              "Rate modification: temporary rate reduction for 12 months",
              "Partial paydown: reduce principal to lower LTV below 80%",
              "Asset sale: orderly disposition within 6 months",
            ],
          },
        }));
    }
    default:
      return [];
  }
}

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    if (!role || !ROLE_CONFIGS[role]) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const config = ROLE_CONFIGS[role];
    const sb = supabase();

    // Fetch all role data in parallel
    const dataEntries = await Promise.all(
      config.tables.map(async (table) => {
        const { data } = await sb.from(table).select("*").limit(20);
        return [table, data ?? []] as [string, any[]];
      })
    );
    const data = Object.fromEntries(dataEntries);

    // Try Claude call first, fall back to deterministic analysis
    let actions: any[] = [];
    let aiSource = "deterministic";

    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2000,
          temperature: 0,
          messages: [{ role: "user", content: config.buildPrompt(data) }],
        }),
      });
      const claudeData = await claudeRes.json();
      if (!claudeData.error) {
        const text = claudeData.content?.[0]?.text || "";
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          actions = JSON.parse(jsonMatch[0]);
          aiSource = "claude";
        }
      }
    } catch { /* Claude unavailable — use deterministic fallback */ }

    // Deterministic fallback: analyze the data directly
    if (actions.length === 0) {
      actions = generateDeterministicActions(role, data);
    }

    // Insert proposed actions into agent_actions
    const rows = actions.map((a: any) => ({
      role,
      workspace_page: a.action_type,
      action_type: a.action_type,
      title: a.title,
      summary: a.summary,
      payload: a.payload || {},
      status: "proposed",
      created_by_agent: "casa-swarm",
    }));

    const { data: inserted, error } = await sb
      .from("agent_actions")
      .insert(rows)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also log to ai_agent_runs for QIS/history
    await sb.from("ai_agent_runs").insert({
      agent_key: `swarm_${role}`,
      output: { actions: inserted, source: aiSource, role },
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({ actions: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
