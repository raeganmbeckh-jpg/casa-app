import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Calculator,
  Target,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtMoney(n);
};

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const recConfig: Record<
  string,
  { bg: string; text: string; label: string; sort: number }
> = {
  strong_buy: {
    bg: "#DCFCE7",
    text: "#15803D",
    label: "Strong Buy",
    sort: 0,
  },
  buy: { bg: "#D1FAE5", text: "#047857", label: "Buy", sort: 1 },
  watch: { bg: "#FEF9C3", text: "#92700C", label: "Watch", sort: 2 },
  pass: { bg: "#FEE2E2", text: "#B91C1C", label: "Pass", sort: 3 },
};

const riskLevelColor = (level: string | null) => {
  if (level === "low") return T.green;
  if (level === "medium") return "#D97706";
  if (level === "high") return T.red;
  return "#9CA3AF";
};

export default async function UnderwritingPage() {
  const supabase = createServerClient();

  const { data: deals } = await supabase
    .from("investment_deals")
    .select(
      "id, address, city, property_type, asking_price, target_bid, arv, estimated_repairs, noi, cap_rate, cash_on_cash, irr_5yr, risk_score, risk_level, recommendation, ai_summary, status",
    );

  const dealList = deals ?? [];

  // Filter active deals and sort by recommendation priority
  const activeDeals = dealList
    .filter((d) => d.status !== "passed" && d.status !== "closed")
    .sort((a, b) => {
      const aSort = recConfig[a.recommendation]?.sort ?? 99;
      const bSort = recConfig[b.recommendation]?.sort ?? 99;
      return aSort - bSort;
    });

  // Summary stats
  const totalAsking = activeDeals.reduce(
    (s, d) => s + Number(d.asking_price || 0),
    0,
  );
  const totalTarget = activeDeals.reduce(
    (s, d) => s + Number(d.target_bid || 0),
    0,
  );
  const avgSpread =
    totalAsking > 0
      ? ((totalAsking - totalTarget) / totalAsking) * 100
      : 0;

  return (
    <div
      className="min-h-screen px-5 py-8 lg:px-8"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="UNDERWRITING"
        title={
          <>
            Deal <em className="italic text-stone-500">Analysis</em>.
          </>
        }
        subtitle="Every active deal dissected. Returns, risk, and AI conviction at a glance."
      />

      {/* ── Summary Bar ────────────────────────────────────────── */}
      <section className="mt-2 mb-8">
        <StaggerIn index={0}>
          <div className="rounded-[2.5rem] border border-stone-200 bg-[#111111] p-6 text-[#FAFAF7]">
            <div className="grid gap-6 sm:grid-cols-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  Deals Analyzed
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {activeDeals.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  Total Asking
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {fmtCompact(totalAsking)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  Total Target Bid
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight">
                  {fmtCompact(totalTarget)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  Avg Bid Spread
                </div>
                <div className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-tight">
                  {fmtPct(avgSpread)}
                  <TrendingDown className="h-5 w-5" style={{ color: T.yellow }} />
                </div>
              </div>
            </div>
          </div>
        </StaggerIn>
      </section>

      {/* ── Deal Analysis Cards ────────────────────────────────── */}
      {activeDeals.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Calculator className="mx-auto h-8 w-8 text-stone-300" />
            <p className="mt-4 text-lg text-stone-400" style={{ fontFamily: "var(--font-heading)" }}>
              No active deals to underwrite.
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Add deals to your pipeline to see analysis here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeDeals.map((deal, idx) => {
            const asking = Number(deal.asking_price || 0);
            const target = Number(deal.target_bid || 0);
            const bidSpread =
              asking > 0 ? ((asking - target) / asking) * 100 : 0;
            const rec = recConfig[deal.recommendation] || null;
            const riskColor = riskLevelColor(deal.risk_level);

            return (
              <StaggerIn key={deal.id} index={idx}>
                <Card>
                  {/* ── Header ─────────────────────────────────── */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-stone-400" />
                        <h3
                          className="text-xl font-medium tracking-tight"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {deal.address}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-stone-500">
                        {deal.city} &middot;{" "}
                        {deal.property_type?.replace(/_/g, " ")} &middot;{" "}
                        <span className="uppercase text-[10px] tracking-wider">
                          {deal.status?.replace(/_/g, " ")}
                        </span>
                      </p>
                    </div>
                    {rec && (
                      <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
                        style={{ backgroundColor: rec.bg, color: rec.text }}
                      >
                        {rec.label}
                      </span>
                    )}
                  </div>

                  {/* ── Pricing Grid ───────────────────────────── */}
                  <div className="mt-6">
                    <SectionLabel>Pricing</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <MetricCell
                        label="Asking Price"
                        value={fmtMoney(asking)}
                      />
                      <MetricCell
                        label="Target Bid"
                        value={fmtMoney(target)}
                      />
                      <MetricCell
                        label="ARV"
                        value={
                          deal.arv
                            ? fmtMoney(Number(deal.arv))
                            : "--"
                        }
                      />
                      <MetricCell
                        label="Est. Repairs"
                        value={
                          deal.estimated_repairs
                            ? fmtMoney(Number(deal.estimated_repairs))
                            : "--"
                        }
                      />
                    </div>
                  </div>

                  {/* ── Returns Grid ───────────────────────────── */}
                  <div className="mt-6">
                    <SectionLabel>Returns</SectionLabel>
                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <MetricCell
                        label="NOI"
                        value={
                          deal.noi
                            ? fmtMoney(Number(deal.noi))
                            : "--"
                        }
                      />
                      <MetricCell
                        label="Cap Rate"
                        value={
                          deal.cap_rate
                            ? fmtPct(Number(deal.cap_rate))
                            : "--"
                        }
                        highlight={Number(deal.cap_rate) >= 6}
                      />
                      <MetricCell
                        label="Cash-on-Cash"
                        value={
                          deal.cash_on_cash
                            ? fmtPct(Number(deal.cash_on_cash))
                            : "--"
                        }
                        highlight={Number(deal.cash_on_cash) >= 8}
                      />
                      <MetricCell
                        label="5yr IRR"
                        value={
                          deal.irr_5yr
                            ? fmtPct(Number(deal.irr_5yr))
                            : "--"
                        }
                        highlight={Number(deal.irr_5yr) >= 15}
                      />
                    </div>
                  </div>

                  {/* ── Risk + Spread Row ──────────────────────── */}
                  <div className="mt-6 flex flex-wrap items-center gap-6 rounded-2xl border border-stone-200 bg-[#FAFAF7] p-4">
                    {/* Risk */}
                    <div className="flex items-center gap-3">
                      <ShieldCheck
                        className="h-4 w-4"
                        style={{ color: riskColor }}
                      />
                      <div>
                        <div
                          className="text-[9px] uppercase tracking-wider text-stone-400"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Risk Score
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-lg font-medium tabular-nums"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {deal.risk_score ?? "--"}/10
                          </span>
                          {deal.risk_level && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                              style={{
                                backgroundColor:
                                  riskColor + "20",
                                color: riskColor,
                              }}
                            >
                              {deal.risk_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bid Spread */}
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-stone-400" />
                      <div>
                        <div
                          className="text-[9px] uppercase tracking-wider text-stone-400"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Bid Spread
                        </div>
                        <span
                          className="text-lg font-medium tabular-nums"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            color: bidSpread > 10 ? T.green : bidSpread > 5 ? "#D97706" : T.red,
                          }}
                        >
                          {fmtPct(bidSpread)}
                        </span>
                      </div>
                    </div>

                    {/* Risk visual bar */}
                    <div className="flex-1 min-w-[120px]">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400 mb-1"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Risk Gauge
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(Number(deal.risk_score || 0) / 10) * 100}%`,
                            backgroundColor: riskColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── AI Summary ─────────────────────────────── */}
                  {deal.ai_summary && (
                    <div className="mt-5 rounded-2xl border border-[#F9D96A]/30 bg-[#F9D96A]/5 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#F9D96A]" />
                        <span
                          className="text-[9px] uppercase tracking-wider text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          AI Analysis
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-stone-600">
                        {deal.ai_summary}
                      </p>
                    </div>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-stone-400">
        <span>{activeDeals.length} deals under analysis</span>
        <span>CASA &middot; INVESTOR &middot; UNDERWRITING</span>
      </div>
    </div>
  );
}

/* ── Metric Cell Component ─────────────────────────────────────── */
function MetricCell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      <div
        className="text-[9px] uppercase tracking-wider text-stone-400"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-sm font-medium tabular-nums"
        style={{
          fontFamily: "var(--font-geist-mono)",
          color: highlight ? T.green : T.ink,
        }}
      >
        {value}
      </div>
    </div>
  );
}
