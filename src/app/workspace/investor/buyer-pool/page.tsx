import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Users, Activity, TrendingUp, Building2, Search } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtMoney = (n: number | null) => {
  if (!n) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

export default async function BuyerPoolPage() {
  const supabase = createServerClient();

  let demandRuns: any[] = [];
  let demandError = false;
  let deals: any[] = [];

  try {
    const demandRes = await supabase
      .from("buyer_demand_runs")
      .select("*")
      .order("created_at", { ascending: false });
    demandRuns = (demandRes.data ?? []) as any[];
  } catch {
    demandError = true;
  }

  try {
    const dealsRes = await supabase
      .from("investment_deals")
      .select("*")
      .order("created_at", { ascending: false });
    deals = (dealsRes.data ?? []) as any[];
  } catch {
    // investment_deals may not exist
  }

  // Parse scores from result JSONB if available
  const parsedRuns = demandRuns.map((run) => {
    let parsedResult: any = null;
    try {
      parsedResult =
        typeof run.result === "string" ? JSON.parse(run.result) : run.result;
    } catch {
      parsedResult = null;
    }
    return { ...run, parsedResult };
  });

  // Compute KPI: average score from result JSON if it contains a score field
  const scoresFromRuns = parsedRuns
    .map((r) => {
      if (!r.parsedResult) return null;
      // Try common patterns: score, demand_score, buyer_score
      return (
        Number(r.parsedResult.score) ||
        Number(r.parsedResult.demand_score) ||
        Number(r.parsedResult.buyer_score) ||
        null
      );
    })
    .filter((s): s is number => s != null && !isNaN(s));

  const avgScore =
    scoresFromRuns.length > 0
      ? Math.round(
          (scoresFromRuns.reduce((a, b) => a + b, 0) / scoresFromRuns.length) *
            10
        ) / 10
      : null;

  // Deals that have a recommendation
  const dealsWithRec = deals.filter(
    (d) => d.recommendation || d.status
  );

  return (
    <div className="space-y-10">
      <PageTitle
        eyebrow="DEMAND ANALYSIS"
        title="Buyer Pool Intelligence"
        subtitle="Buyer demand analysis and investment deal interest signals."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Demand Runs"
          value={parsedRuns.length}
          note={parsedRuns.length > 0 ? `Latest: ${fmtDate(parsedRuns[0]?.created_at)}` : undefined}
        />
        <KpiCard
          label="Avg Score"
          value={avgScore ?? "—"}
          note={
            scoresFromRuns.length > 0
              ? `From ${scoresFromRuns.length} scored runs`
              : "No scores available"
          }
        />
        <KpiCard
          label="Active Deals"
          value={deals.length}
        />
        <KpiCard
          label="With Recommendation"
          value={dealsWithRec.length}
        />
      </div>

      {/* Buyer Demand Runs */}
      <div className="space-y-4">
        <SectionLabel>BUYER DEMAND RUNS</SectionLabel>

        {demandError && (
          <Card>
            <div className="flex items-center gap-3 py-4">
              <Search size={20} className="text-stone-400" />
              <div>
                <p className="text-sm font-medium text-stone-700">
                  Unable to load buyer demand data
                </p>
                <p className="text-xs text-stone-500">
                  The buyer_demand_runs table may not exist yet or is
                  inaccessible.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!demandError && parsedRuns.length === 0 && (
          <Card>
            <div className="py-12 text-center">
              <Users
                className="mx-auto mb-4 text-stone-300"
                size={40}
                strokeWidth={1.2}
              />
              <p className="text-lg font-medium text-stone-700">
                No buyer demand analysis runs yet
              </p>
              <p className="mt-2 max-w-md mx-auto text-sm text-stone-500">
                Buyer pool analysis runs are generated when demand scoring is
                triggered for a property. Results will include buyer type
                breakdowns, interest scores, and market demand signals.
              </p>
            </div>
          </Card>
        )}

        {parsedRuns.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {parsedRuns.map((run, i) => {
              const result = run.parsedResult;
              return (
                <StaggerIn key={run.id ?? i} index={i}>
                  <Card>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconChip>
                            <Activity size={16} />
                          </IconChip>
                          <div>
                            <p className="text-sm font-medium text-stone-900">
                              Property #{run.property_id || "—"}
                            </p>
                            <p className="text-xs text-stone-400">
                              {fmtDate(run.created_at)}
                            </p>
                          </div>
                        </div>
                        {result?.score != null && (
                          <span
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                            style={{
                              backgroundColor: "rgba(249,217,106,0.2)",
                              color: "#92700C",
                            }}
                          >
                            {result.score}
                          </span>
                        )}
                      </div>

                      {result && typeof result === "object" && (
                        <div className="rounded-xl bg-[#FAFAF7] p-3 text-sm text-stone-600">
                          {result.summary && (
                            <p className="mb-2">{result.summary}</p>
                          )}
                          {result.buyer_types && Array.isArray(result.buyer_types) && (
                            <div className="flex flex-wrap gap-1.5">
                              {result.buyer_types.map((bt: string, j: number) => (
                                <YellowBadge key={j}>{bt}</YellowBadge>
                              ))}
                            </div>
                          )}
                          {!result.summary && !result.buyer_types && (
                            <p className="text-xs text-stone-400">
                              {JSON.stringify(result).slice(0, 200)}
                              {JSON.stringify(result).length > 200 && "..."}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        )}
      </div>

      {/* Investment Deals Context */}
      <div className="space-y-4">
        <SectionLabel>DEAL INTEREST CONTEXT</SectionLabel>

        {deals.length === 0 ? (
          <Card>
            <div className="flex items-center gap-3 py-4">
              <Building2 size={20} className="text-stone-400" />
              <p className="text-sm text-stone-500">
                No investment deals found to display buyer interest context.
              </p>
            </div>
          </Card>
        ) : (
          <ListContainer>
            <ListHeader label="DEALS WITH BUYER INTEREST SIGNALS" />
            <div className="px-3 pb-3 space-y-2">
              {deals.slice(0, 15).map((deal, i) => (
                <ListRow key={deal.id ?? i} last={i === Math.min(deals.length, 15) - 1}>
                  <div className="flex items-center gap-3">
                    <StatusDot
                      color={
                        deal.recommendation?.toLowerCase().includes("buy") ||
                        deal.status?.toLowerCase().includes("active")
                          ? T.green
                          : deal.recommendation?.toLowerCase().includes("pass")
                            ? T.red
                            : T.yellow
                      }
                    />
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {deal.property_name || deal.address || `Deal #${deal.id}`}
                      </p>
                      <p className="text-xs text-stone-500">
                        {[deal.city, deal.state].filter(Boolean).join(", ")}
                        {deal.property_type ? ` \u00b7 ${deal.property_type}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {deal.purchase_price && (
                      <span className="hidden text-sm font-medium text-stone-700 sm:inline">
                        {fmtMoney(deal.purchase_price)}
                      </span>
                    )}
                    {deal.recommendation && (
                      <YellowBadge>{deal.recommendation}</YellowBadge>
                    )}
                    {!deal.recommendation && deal.status && (
                      <YellowBadge>{deal.status}</YellowBadge>
                    )}
                  </div>
                </ListRow>
              ))}
            </div>
          </ListContainer>
        )}
      </div>
    </div>
  );
}
