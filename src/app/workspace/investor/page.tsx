import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import { Landmark, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtMoney(n);
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const statusColors: Record<string, string> = {
  screening: "#9CA3AF",
  underwriting: "#6366F1",
  due_diligence: "#D97706",
  offer: "#0EA5E9",
  under_contract: "#8B5CF6",
  closed: T.green,
  passed: T.red,
};

const recColors: Record<string, { bg: string; text: string }> = {
  strong_buy: { bg: "#DCFCE7", text: "#15803D" },
  buy: { bg: "#D1FAE5", text: "#047857" },
  watch: { bg: "#FEF9C3", text: "#92700C" },
  pass: { bg: "#FEE2E2", text: "#B91C1C" },
};

export default async function InvestorDashboardPage() {
  const supabase = createServerClient();

  const [{ data: deals }, { data: debt }, { data: exits }] = await Promise.all([
    supabase.from("investment_deals").select("*"),
    supabase.from("debt_stack").select("*"),
    supabase.from("exit_models").select("*"),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "investor").order("created_at", { ascending: false }).limit(20);

  const dealList = deals ?? [];
  const debtList = debt ?? [];

  // ── KPIs ──────────────────────────────────────────────────────
  const activeDeals = dealList.filter(
    (d) => d.status !== "passed" && d.status !== "closed",
  );
  const pipelineValue = activeDeals.reduce(
    (s, d) => s + Number(d.asking_price || 0),
    0,
  );
  const dealsWithCap = dealList.filter((d) => Number(d.cap_rate) > 0);
  const avgCapRate =
    dealsWithCap.length > 0
      ? dealsWithCap.reduce((s, d) => s + Number(d.cap_rate), 0) /
        dealsWithCap.length
      : 0;
  const totalDebt = debtList.reduce(
    (s, d) => s + Number(d.current_balance || 0),
    0,
  );
  const highestIrr = dealList.reduce(
    (max, d) => Math.max(max, Number(d.irr_5yr || 0)),
    0,
  );

  // ── Status breakdown ──────────────────────────────────────────
  const statusGroups: Record<string, typeof dealList> = {};
  for (const deal of dealList) {
    const s = deal.status || "unknown";
    if (!statusGroups[s]) statusGroups[s] = [];
    statusGroups[s].push(deal);
  }

  // ── Top recommendations ───────────────────────────────────────
  const topRecs = dealList.filter(
    (d) => d.recommendation === "strong_buy" || d.recommendation === "buy",
  );

  // ── Recent deals with AI summary ──────────────────────────────
  const recentWithSummary = dealList
    .filter((d) => d.ai_summary)
    .slice(0, 3);

  return (
    <div
      className="min-h-screen px-5 py-8 lg:px-8"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="THE DEAL ROOM"
        title={
          <>
            Investment{" "}
            <em className="italic text-stone-500">Intelligence</em>.
          </>
        }
        subtitle="Capital allocation command center. Live deal flow, debt exposure, and AI-driven recommendations."
      />

      {/* ── Hero: Pipeline Tracer ──────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <StaggerIn index={0}>
          <DarkStatCard
            label="Active Pipeline"
            value={fmtCompact(pipelineValue)}
            subtitle={`${activeDeals.length} deals in active pipeline across ${Object.keys(statusGroups).filter((s) => s !== "passed" && s !== "closed").length} stages`}
            icon={
              <Landmark className="h-5 w-5" style={{ color: T.yellow }} />
            }
          />
        </StaggerIn>

        <StaggerIn index={1}>
          <Card className="flex flex-col justify-between h-full">
            <SectionLabel>Quick Pulse</SectionLabel>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Avg Cap Rate</span>
                <span
                  className="text-lg font-medium tabular-nums"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {fmtPct(avgCapRate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Highest 5yr IRR</span>
                <span
                  className="text-lg font-medium tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    color: highestIrr >= 15 ? T.green : T.ink,
                  }}
                >
                  {fmtPct(highestIrr)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Total Debt</span>
                <span
                  className="text-lg font-medium tabular-nums"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {fmtCompact(totalDebt)}
                </span>
              </div>
            </div>
          </Card>
        </StaggerIn>
      </section>

      {/* ── KPI Row ────────────────────────────────────────────── */}
      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard
            label="Active Deals"
            value={activeDeals.length}
            note="Excluding passed & closed"
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="Avg Cap Rate"
            value={fmtPct(avgCapRate)}
            note={`Across ${dealsWithCap.length} deals`}
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="Total Debt"
            value={fmtCompact(totalDebt)}
            note={`${debtList.length} positions`}
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="Highest IRR"
            value={fmtPct(highestIrr)}
            note="5-year projected"
          />
        </StaggerIn>
      </section>

      {/* ── Status Breakdown ───────────────────────────────────── */}
      <section className="mt-8">
        <StaggerIn index={0}>
          <Card>
            <SectionLabel>Deal Status Breakdown</SectionLabel>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(statusGroups)
                .sort(([a], [b]) => {
                  const order = [
                    "screening",
                    "underwriting",
                    "due_diligence",
                    "offer",
                    "under_contract",
                    "closed",
                    "passed",
                  ];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([status, deals]) => {
                  const stageValue = deals.reduce(
                    (s, d) => s + Number(d.asking_price || 0),
                    0,
                  );
                  return (
                    <div
                      key={status}
                      className="rounded-2xl border border-stone-200 bg-[#FAFAF7] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <StatusDot
                          color={statusColors[status] || T.dim}
                        />
                        <span className="text-xs font-medium uppercase tracking-wider text-stone-600">
                          {status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div
                        className="mt-3 text-2xl font-medium tracking-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {deals.length}
                      </div>
                      <div className="mt-1 text-xs text-stone-500">
                        {fmtCompact(stageValue)} total
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </StaggerIn>
      </section>

      {/* ── Top Recommendations ────────────────────────────────── */}
      {topRecs.length > 0 && (
        <section className="mt-8">
          <StaggerIn index={0}>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-stone-400" />
              <SectionLabel>Top Recommendations</SectionLabel>
            </div>
          </StaggerIn>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topRecs.map((deal, idx) => {
              const rec = recColors[deal.recommendation] || recColors.watch;
              return (
                <StaggerIn key={deal.id} index={idx}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className="text-lg font-medium tracking-tight"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {deal.address}
                        </h3>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {deal.city} &middot;{" "}
                          {deal.property_type?.replace(/_/g, " ")}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                        style={{
                          backgroundColor: rec.bg,
                          color: rec.text,
                        }}
                      >
                        {deal.recommendation?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-4">
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wider text-stone-400"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Asking
                        </div>
                        <div
                          className="mt-1 text-sm font-medium tabular-nums"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {fmtCompact(Number(deal.asking_price || 0))}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wider text-stone-400"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Cap Rate
                        </div>
                        <div
                          className="mt-1 text-sm font-medium tabular-nums"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {fmtPct(Number(deal.cap_rate || 0))}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-wider text-stone-400"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          5yr IRR
                        </div>
                        <div
                          className="mt-1 text-sm font-medium tabular-nums"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            color:
                              Number(deal.irr_5yr) >= 15
                                ? T.green
                                : Number(deal.irr_5yr) >= 10
                                  ? T.ink
                                  : T.red,
                          }}
                        >
                          {fmtPct(Number(deal.irr_5yr || 0))}
                        </div>
                      </div>
                    </div>
                    {deal.risk_level && (
                      <div className="mt-4 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-stone-400" />
                        <span className="text-xs text-stone-500">
                          Risk: {deal.risk_level} ({deal.risk_score}/10)
                        </span>
                      </div>
                    )}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent AI Summaries ─────────────────────────────────── */}
      {recentWithSummary.length > 0 && (
        <section className="mt-8">
          <StaggerIn index={0}>
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-stone-400" />
              <SectionLabel>AI Deal Summaries</SectionLabel>
            </div>
          </StaggerIn>
          <div className="space-y-4">
            {recentWithSummary.map((deal, idx) => (
              <StaggerIn key={deal.id} index={idx}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-base font-medium tracking-tight"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {deal.address}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {deal.city} &middot;{" "}
                        {deal.property_type?.replace(/_/g, " ")} &middot;{" "}
                        {fmtMoney(Number(deal.asking_price || 0))}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-stone-600">
                        {deal.ai_summary}
                      </p>
                    </div>
                    {deal.recommendation && (
                      <span
                        className="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider"
                        style={{
                          backgroundColor:
                            (recColors[deal.recommendation] || recColors.watch)
                              .bg,
                          color:
                            (recColors[deal.recommendation] || recColors.watch)
                              .text,
                        }}
                      >
                        {deal.recommendation.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-stone-400">
        <span>Live data from Supabase</span>
        <span>CASA &middot; INVESTOR &middot; DEAL ROOM</span>
      </div>

      <section className="mt-6">
        <SwarmPanel role="investor" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}
