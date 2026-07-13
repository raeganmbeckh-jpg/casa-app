import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { ArrowRight, Building2 } from "lucide-react";

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

const STAGE_ORDER = [
  "screening",
  "underwriting",
  "due_diligence",
  "offer",
  "under_contract",
  "closed",
  "passed",
] as const;

const STAGE_LABELS: Record<string, string> = {
  screening: "Screening",
  underwriting: "Underwriting",
  due_diligence: "Due Diligence",
  offer: "Offer",
  under_contract: "Under Contract",
  closed: "Closed",
  passed: "Passed",
};

const STAGE_COLORS: Record<string, string> = {
  screening: "#9CA3AF",
  underwriting: "#6366F1",
  due_diligence: "#D97706",
  offer: "#0EA5E9",
  under_contract: "#8B5CF6",
  closed: T.green,
  passed: T.red,
};

const riskDotColor = (level: string | null) => {
  if (level === "low") return T.green;
  if (level === "medium") return "#D97706";
  if (level === "high") return T.red;
  return "#9CA3AF";
};

const recBadge = (rec: string | null) => {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    strong_buy: { bg: "#DCFCE7", text: "#15803D", label: "Strong Buy" },
    buy: { bg: "#D1FAE5", text: "#047857", label: "Buy" },
    watch: { bg: "#FEF9C3", text: "#92700C", label: "Watch" },
    pass: { bg: "#FEE2E2", text: "#B91C1C", label: "Pass" },
  };
  return map[rec || ""] || null;
};

export default async function DealPipelinePage() {
  const supabase = createServerClient();

  const { data: deals } = await supabase
    .from("investment_deals")
    .select("*")
    .order("asking_price", { ascending: false });

  const dealList = deals ?? [];

  // ── KPIs ──────────────────────────────────────────────────────
  const activeDeals = dealList.filter(
    (d) => d.status !== "passed" && d.status !== "closed",
  );
  const pipelineValue = activeDeals.reduce(
    (s, d) => s + Number(d.asking_price || 0),
    0,
  );
  const inDD = dealList.filter((d) => d.status === "due_diligence").length;
  const offersOut = dealList.filter(
    (d) => d.status === "offer" || d.status === "under_contract",
  ).length;
  const closedCount = dealList.filter((d) => d.status === "closed").length;

  // ── Group by stage ────────────────────────────────────────────
  const stages: Record<string, typeof dealList> = {};
  for (const stage of STAGE_ORDER) {
    stages[stage] = [];
  }
  for (const deal of dealList) {
    const s = deal.status || "screening";
    if (!stages[s]) stages[s] = [];
    stages[s].push(deal);
  }

  return (
    <div
      className="min-h-screen px-5 py-8 lg:px-8"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="DEAL FLOW"
        title={
          <>
            <em className="italic text-stone-500">Pipeline</em>.
          </>
        }
        subtitle="Every deal from first look to close. Grouped by stage, ranked by conviction."
      />

      {/* ── KPI Row ────────────────────────────────────────────── */}
      <section className="mt-2 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard
            label="Pipeline Value"
            value={fmtCompact(pipelineValue)}
            note={`${activeDeals.length} active deals`}
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard label="In Due Diligence" value={inDD} note="Deep review" />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="Offers Out"
            value={offersOut}
            note="Offer + under contract"
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="Closed" value={closedCount} note="Acquisitions" />
        </StaggerIn>
      </section>

      {/* ── Pipeline flow indicator ────────────────────────────── */}
      <section className="mt-8 mb-2">
        <StaggerIn index={0}>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {STAGE_ORDER.filter((s) => s !== "passed").map((stage, i) => (
              <div key={stage} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: STAGE_COLORS[stage],
                    }}
                  />
                  <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-stone-600">
                    {STAGE_LABELS[stage]}
                  </span>
                  <span
                    className="ml-1 text-[10px] font-medium tabular-nums"
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      color: T.dim,
                    }}
                  >
                    {stages[stage]?.length || 0}
                  </span>
                </div>
                {i < STAGE_ORDER.length - 2 && (
                  <ArrowRight className="h-3 w-3 shrink-0 text-stone-300" />
                )}
              </div>
            ))}
          </div>
        </StaggerIn>
      </section>

      {/* ── Stage Sections ─────────────────────────────────────── */}
      {STAGE_ORDER.map((stage, stageIdx) => {
        const stageDeals = stages[stage] || [];
        if (stageDeals.length === 0) return null;

        const isPassed = stage === "passed";
        const stageValue = stageDeals.reduce(
          (s, d) => s + Number(d.asking_price || 0),
          0,
        );

        return (
          <section key={stage} className={`mt-6 ${isPassed ? "opacity-60" : ""}`}>
            <StaggerIn index={stageIdx}>
              {/* Stage Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot color={STAGE_COLORS[stage]} />
                  <h2
                    className="text-xl font-medium tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {STAGE_LABELS[stage] || stage}
                  </h2>
                  <span className="rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-medium tabular-nums text-stone-600">
                    {stageDeals.length}
                  </span>
                </div>
                <span
                  className="text-sm tabular-nums text-stone-500"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  {fmtCompact(stageValue)}
                </span>
              </div>

              {/* Deal Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stageDeals.map((deal, dealIdx) => {
                  const badge = recBadge(deal.recommendation);
                  return (
                    <StaggerIn key={deal.id} index={dealIdx}>
                      <Card
                        className={isPassed ? "border-stone-200/50" : ""}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                              <h3 className="truncate text-sm font-medium text-stone-900">
                                {deal.address}
                              </h3>
                            </div>
                            <p className="mt-0.5 text-xs text-stone-500">
                              {deal.city} &middot;{" "}
                              {deal.property_type?.replace(/_/g, " ")}
                            </p>
                          </div>
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full mt-1"
                            style={{
                              backgroundColor: riskDotColor(deal.risk_level),
                            }}
                            title={`Risk: ${deal.risk_level}`}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <div
                              className="text-[9px] uppercase tracking-wider text-stone-400"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              Asking
                            </div>
                            <div
                              className="mt-0.5 text-sm font-medium tabular-nums"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtCompact(Number(deal.asking_price || 0))}
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-[9px] uppercase tracking-wider text-stone-400"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              Cap Rate
                            </div>
                            <div
                              className="mt-0.5 text-sm font-medium tabular-nums"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtPct(Number(deal.cap_rate || 0))}
                            </div>
                          </div>
                        </div>

                        {badge && (
                          <div className="mt-3">
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.text,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                        )}
                      </Card>
                    </StaggerIn>
                  );
                })}
              </div>
            </StaggerIn>
          </section>
        );
      })}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-stone-400">
        <span>{dealList.length} total deals tracked</span>
        <span>CASA &middot; INVESTOR &middot; PIPELINE</span>
      </div>
    </div>
  );
}
