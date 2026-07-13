import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Brain,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function computeQIS(deal: any) {
  const capRate = Number(deal.cap_rate || 0);
  const irr = Number(deal.irr_5yr || 0);
  const riskScore = Number(deal.risk_score || 5);

  const capRateScore =
    capRate > 6 ? 10 : capRate > 5 ? 7 : capRate > 4 ? 5 : 3;
  const irrScore = irr > 18 ? 10 : irr > 14 ? 7 : irr > 10 ? 5 : 3;
  const riskComponent = 10 - Math.min(riskScore, 10);

  const qis = (capRateScore + irrScore + riskComponent) / 3;
  return { qis: Math.round(qis * 10) / 10, capRateScore, irrScore, riskComponent };
}

function qisRecommendation(qis: number): {
  label: string;
  color: string;
} {
  if (qis >= 8) return { label: "Strong Buy", color: T.green };
  if (qis >= 6.5) return { label: "Buy", color: "#16a34a" };
  if (qis >= 5) return { label: "Hold / Evaluate", color: "#d97706" };
  return { label: "Pass", color: T.red };
}

const fmtMoney = (n: number | null) => {
  if (!n) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export default async function QISPage() {
  const supabase = createServerClient();

  const { data: deals } = await supabase
    .from("investment_deals")
    .select("*")
    .order("created_at", { ascending: false });

  let aiRuns: any[] | null = null;
  try {
    const aiRes = await supabase
      .from("ai_agent_runs")
      .select("agent_key, output, created_at")
      .or("agent_key.ilike.%quantum%,agent_key.ilike.%qis%")
      .order("created_at", { ascending: false })
      .limit(10);
    aiRuns = aiRes.data;
  } catch {
    aiRuns = null;
  }

  const dealList = (deals ?? []) as any[];

  // Compute QIS for each deal and sort descending
  const scoredDeals = dealList
    .map((deal) => {
      const scores = computeQIS(deal);
      const rec = qisRecommendation(scores.qis);
      return { ...deal, ...scores, recommendation: rec };
    })
    .sort((a, b) => b.qis - a.qis);

  // Portfolio QIS average
  const portfolioQIS =
    scoredDeals.length > 0
      ? Math.round(
          (scoredDeals.reduce((s, d) => s + d.qis, 0) / scoredDeals.length) *
            10
        ) / 10
      : 0;

  const aiRunList = (aiRuns ?? []) as any[];

  return (
    <div className="space-y-10">
      <PageTitle
        eyebrow="INTELLIGENCE"
        title="QIS Scoring"
        subtitle="Quantitative Investment Score derived from cap rate, IRR, and risk metrics across your deal pipeline."
      />

      {/* Portfolio-level dark stat */}
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <DarkStatCard
          label="Portfolio QIS Average"
          value={portfolioQIS ? `${portfolioQIS}` : "—"}
          subtitle={`Across ${scoredDeals.length} deal${scoredDeals.length !== 1 ? "s" : ""} analyzed`}
          progress={portfolioQIS ? (portfolioQIS / 10) * 100 : 0}
          icon={<Zap size={20} className="text-stone-400" />}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <KpiCard
            label="Deals Scored"
            value={scoredDeals.length}
          />
          <KpiCard
            label="Strong Buys"
            value={scoredDeals.filter((d) => d.qis >= 8).length}
            note="QIS 8+"
          />
          <KpiCard
            label="Buys"
            value={scoredDeals.filter((d) => d.qis >= 6.5 && d.qis < 8).length}
            note="QIS 6.5-8"
          />
          <KpiCard
            label="Hold / Evaluate"
            value={scoredDeals.filter((d) => d.qis >= 5 && d.qis < 6.5).length}
            note="QIS 5-6.5"
          />
          <KpiCard
            label="Pass"
            value={scoredDeals.filter((d) => d.qis < 5).length}
            note="QIS below 5"
          />
          <KpiCard
            label="Best QIS"
            value={scoredDeals.length > 0 ? `${scoredDeals[0].qis}/10` : "—"}
            note={scoredDeals.length > 0 ? scoredDeals[0].property_name || scoredDeals[0].address || "" : ""}
          />
        </div>
      </div>

      {/* Empty state */}
      {scoredDeals.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <BarChart3
              className="mx-auto mb-4 text-stone-300"
              size={40}
              strokeWidth={1.2}
            />
            <p className="text-lg font-medium text-stone-700">
              No deals to score
            </p>
            <p className="mt-2 text-sm text-stone-500">
              QIS scores will be computed once investment deals are added to
              the pipeline.
            </p>
          </div>
        </Card>
      )}

      {/* Deal QIS cards */}
      <div className="space-y-4">
        <SectionLabel>DEAL SCORES</SectionLabel>
        <div className="grid gap-5 md:grid-cols-2">
          {scoredDeals.map((deal, i) => (
            <StaggerIn key={deal.id ?? i} index={i}>
              <Card>
                <div className="flex gap-6">
                  {/* QIS gauge - large number */}
                  <div className="flex flex-col items-center justify-center">
                    <div
                      className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl text-3xl font-bold"
                      style={{
                        backgroundColor:
                          deal.qis >= 8
                            ? "rgba(21,128,61,0.1)"
                            : deal.qis >= 6.5
                              ? "rgba(249,217,106,0.25)"
                              : deal.qis >= 5
                                ? "rgba(217,119,6,0.1)"
                                : "rgba(185,28,28,0.1)",
                        color: deal.recommendation.color,
                      }}
                    >
                      {deal.qis}
                    </div>
                    <p className="mt-1.5 text-[10px] uppercase tracking-widest text-stone-400">
                      /10
                    </p>
                  </div>

                  {/* Deal info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-stone-900">
                          {deal.property_name || deal.address || `Deal #${deal.id}`}
                        </h3>
                        <span
                          className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor:
                              deal.qis >= 8
                                ? "#F0FDF4"
                                : deal.qis >= 6.5
                                  ? "rgba(249,217,106,0.2)"
                                  : deal.qis >= 5
                                    ? "#FFFBEB"
                                    : "#FEF2F2",
                            color: deal.recommendation.color,
                          }}
                        >
                          {deal.recommendation.label}
                        </span>
                      </div>
                      {(deal.city || deal.state) && (
                        <p className="text-sm text-stone-500">
                          {[deal.city, deal.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>

                    {/* Component scores */}
                    <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#FAFAF7] p-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400">
                          Cap Rate
                        </p>
                        <p className="text-sm font-semibold text-stone-800">
                          {deal.capRateScore}/10
                        </p>
                        {deal.cap_rate && (
                          <p className="text-[11px] text-stone-400">
                            {Number(deal.cap_rate).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400">
                          IRR
                        </p>
                        <p className="text-sm font-semibold text-stone-800">
                          {deal.irrScore}/10
                        </p>
                        {deal.irr_5yr && (
                          <p className="text-[11px] text-stone-400">
                            {Number(deal.irr_5yr).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-stone-400">
                          Risk
                        </p>
                        <p className="text-sm font-semibold text-stone-800">
                          {deal.riskComponent}/10
                        </p>
                        {deal.risk_score != null && (
                          <p className="text-[11px] text-stone-400">
                            Score: {deal.risk_score}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Extra deal details */}
                    <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                      {deal.purchase_price && (
                        <span>Price: {fmtMoney(deal.purchase_price)}</span>
                      )}
                      {deal.property_type && <span>{deal.property_type}</span>}
                      {deal.status && (
                        <YellowBadge>{deal.status}</YellowBadge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </StaggerIn>
          ))}
        </div>
      </div>

      {/* AI Agent Section */}
      <div className="space-y-4">
        <SectionLabel>AI SCORING INSIGHTS</SectionLabel>
        {aiRunList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {aiRunList.map((run, i) => (
              <StaggerIn key={i} index={i}>
                <Card>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <IconChip>
                        <Brain size={16} />
                      </IconChip>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {run.agent_key}
                        </p>
                        <p className="text-xs text-stone-400">
                          {new Date(run.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600">
                      {typeof run.output === "string"
                        ? run.output.slice(0, 300)
                        : JSON.stringify(run.output).slice(0, 300)}
                      {(typeof run.output === "string"
                        ? run.output.length
                        : JSON.stringify(run.output).length) > 300 && "..."}
                    </p>
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        ) : (
          <Card>
            <div className="flex items-center gap-3 py-4">
              <AlertCircle size={20} className="text-stone-400" />
              <div>
                <p className="text-sm font-medium text-stone-700">
                  AI scoring not yet available
                </p>
                <p className="text-xs text-stone-500">
                  Quantum scoring agent runs will appear here once they are
                  triggered for your deals.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
