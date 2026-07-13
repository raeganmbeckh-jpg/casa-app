import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Building,
  Wallet,
  Percent,
  ArrowUpRight,
  Briefcase,
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

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default async function PortfolioPage() {
  const supabase = createServerClient();

  const [{ data: deals }, { data: debt }, { data: exits }] =
    await Promise.all([
      supabase
        .from("investment_deals")
        .select("*")
        .eq("status", "closed"),
      supabase.from("debt_stack").select("*"),
      supabase.from("exit_models").select("*"),
    ]);

  const closedDeals = deals ?? [];
  const debtList = debt ?? [];
  const exitList = exits ?? [];

  // ── Portfolio value ───────────────────────────────────────────
  const portfolioValue = closedDeals.reduce(
    (s, d) => s + Number(d.arv || d.asking_price || 0),
    0,
  );
  const totalAcquisitionCost = closedDeals.reduce(
    (s, d) => s + Number(d.asking_price || 0),
    0,
  );
  const totalNoi = closedDeals.reduce(
    (s, d) => s + Number(d.noi || 0),
    0,
  );
  const avgCapRate =
    closedDeals.length > 0
      ? closedDeals.reduce((s, d) => s + Number(d.cap_rate || 0), 0) /
        closedDeals.length
      : 0;

  // ── Debt summary ──────────────────────────────────────────────
  const totalDebtBalance = debtList.reduce(
    (s, d) => s + Number(d.current_balance || 0),
    0,
  );
  const weightedAvgRate =
    totalDebtBalance > 0
      ? debtList.reduce(
          (s, d) =>
            s +
            Number(d.interest_rate || 0) * Number(d.current_balance || 0),
          0,
        ) / totalDebtBalance
      : 0;

  // ── Build lookup maps ─────────────────────────────────────────
  const debtByDeal = new Map<string, typeof debtList>();
  for (const d of debtList) {
    const key = d.deal_id || d.property_id || "";
    if (!debtByDeal.has(key)) debtByDeal.set(key, []);
    debtByDeal.get(key)!.push(d);
  }

  const exitByDeal = new Map<string, (typeof exitList)[number]>();
  for (const e of exitList) {
    const key = e.deal_id || e.property_id || "";
    exitByDeal.set(key, e);
  }

  // ── Empty state ───────────────────────────────────────────────
  if (closedDeals.length === 0) {
    return (
      <div
        className="min-h-screen px-5 py-8 lg:px-8"
        style={{ backgroundColor: T.cream, color: T.ink }}
      >
        <PageTitle
          eyebrow="PORTFOLIO"
          title={
            <>
              Owned <em className="italic text-stone-500">Assets</em>.
            </>
          }
        />
        <Card>
          <div className="py-16 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-stone-300" />
            <h2
              className="mt-4 text-2xl font-medium tracking-tight text-stone-400"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              No closed deals yet.
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Deals that reach &ldquo;closed&rdquo; status in your pipeline
              will appear here as portfolio assets.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-5 py-8 lg:px-8"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="PORTFOLIO"
        title={
          <>
            Owned <em className="italic text-stone-500">Assets</em>.
          </>
        }
        subtitle={`${closedDeals.length} ${closedDeals.length === 1 ? "property" : "properties"} acquired. Total portfolio value tracked live.`}
      />

      {/* ── Hero Stat ──────────────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <StaggerIn index={0}>
          <DarkStatCard
            label="Portfolio Value"
            value={fmtCompact(portfolioValue)}
            subtitle={`Based on ARV where available, otherwise acquisition price. ${closedDeals.length} assets held.`}
            icon={
              <Building className="h-5 w-5" style={{ color: T.yellow }} />
            }
          />
        </StaggerIn>

        <StaggerIn index={1}>
          <div className="grid grid-cols-2 gap-4">
            <KpiCard
              label="Total NOI"
              value={fmtCompact(totalNoi)}
              note="Annual net operating income"
            />
            <KpiCard
              label="Avg Cap Rate"
              value={fmtPct(avgCapRate)}
              note="Across portfolio"
            />
            <KpiCard
              label="Total Debt"
              value={fmtCompact(totalDebtBalance)}
              note={`${debtList.length} positions`}
            />
            <KpiCard
              label="Wtd Avg Rate"
              value={fmtPct(weightedAvgRate)}
              note="Debt-weighted interest"
            />
          </div>
        </StaggerIn>
      </section>

      {/* ── Owned Asset Cards ──────────────────────────────────── */}
      <section className="mt-8">
        <SectionLabel>Owned Assets</SectionLabel>
        <div className="mt-4 space-y-5">
          {closedDeals.map((deal, idx) => {
            const dealDebt = debtByDeal.get(deal.id) ?? [];
            const dealExit = exitByDeal.get(deal.id);

            return (
              <StaggerIn key={deal.id} index={idx}>
                <Card>
                  {/* ── Property Header ────────────────────────── */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-stone-400" />
                        <h3
                          className="text-xl font-medium tracking-tight"
                          style={{ fontFamily: "var(--font-heading)" }}
                        >
                          {deal.address}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-stone-500">
                        {deal.city} &middot;{" "}
                        {deal.property_type?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Acquisition
                      </div>
                      <div
                        className="mt-0.5 text-base font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtMoney(Number(deal.asking_price || 0))}
                      </div>
                    </div>
                  </div>

                  {/* ── Performance Metrics ────────────────────── */}
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        NOI
                      </div>
                      <div
                        className="mt-1 text-sm font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {deal.noi
                          ? fmtMoney(Number(deal.noi))
                          : "--"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Cap Rate
                      </div>
                      <div
                        className="mt-1 text-sm font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {deal.cap_rate
                          ? fmtPct(Number(deal.cap_rate))
                          : "--"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400"
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
                              : T.ink,
                        }}
                      >
                        {deal.irr_5yr
                          ? fmtPct(Number(deal.irr_5yr))
                          : "--"}
                      </div>
                    </div>
                    <div className="rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                      <div
                        className="text-[9px] uppercase tracking-wider text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        ARV
                      </div>
                      <div
                        className="mt-1 text-sm font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {deal.arv
                          ? fmtMoney(Number(deal.arv))
                          : "--"}
                      </div>
                    </div>
                  </div>

                  {/* ── Debt Section ───────────────────────────── */}
                  {dealDebt.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Wallet className="h-3.5 w-3.5 text-stone-400" />
                        <SectionLabel>Debt Stack</SectionLabel>
                      </div>
                      <div className="space-y-2">
                        {dealDebt.map((d, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-medium">
                                {d.lender || "Unknown Lender"}
                              </div>
                              <div className="mt-0.5 text-xs text-stone-500">
                                {d.loan_type?.replace(/_/g, " ") || "Loan"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className="text-sm font-medium tabular-nums"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                }}
                              >
                                {fmtMoney(Number(d.current_balance || 0))}
                              </div>
                              <div
                                className="mt-0.5 text-xs tabular-nums text-stone-500"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                }}
                              >
                                {fmtPct(Number(d.interest_rate || 0))} rate
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Exit Model ─────────────────────────────── */}
                  {dealExit && (
                    <div className="mt-5 rounded-2xl border border-[#F9D96A]/30 bg-[#F9D96A]/5 p-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <ArrowUpRight className="h-3.5 w-3.5 text-stone-500" />
                        <span
                          className="text-[9px] uppercase tracking-wider text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Exit Model
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-stone-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                            Strategy
                          </div>
                          <div className="mt-1 text-sm font-medium capitalize">
                            {dealExit.recommended_strategy?.replace(/_/g, " ") || "--"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-stone-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                            Hold IRR
                          </div>
                          <div
                            className="mt-1 text-sm font-medium tabular-nums"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {dealExit.hold_irr
                              ? fmtPct(Number(dealExit.hold_irr))
                              : "--"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-stone-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                            Sale IRR
                          </div>
                          <div
                            className="mt-1 text-sm font-medium tabular-nums"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {dealExit.sale_irr
                              ? fmtPct(Number(dealExit.sale_irr))
                              : "--"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-stone-400" style={{ fontFamily: "var(--font-geist-mono)" }}>
                            Equity Multiple
                          </div>
                          <div
                            className="mt-1 text-sm font-medium tabular-nums"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {dealExit.equity_multiple
                              ? `${Number(dealExit.equity_multiple).toFixed(2)}x`
                              : "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </section>

      {/* ── Debt Summary ───────────────────────────────────────── */}
      {debtList.length > 0 && (
        <section className="mt-8">
          <StaggerIn index={0}>
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Percent className="h-4 w-4 text-stone-400" />
                <SectionLabel>Debt Summary</SectionLabel>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider text-stone-400"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    Total Outstanding
                  </div>
                  <div
                    className="mt-2 text-2xl font-medium tracking-tight tabular-nums"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {fmtCompact(totalDebtBalance)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider text-stone-400"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    Weighted Avg Rate
                  </div>
                  <div
                    className="mt-2 text-2xl font-medium tracking-tight tabular-nums"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {fmtPct(weightedAvgRate)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-[10px] uppercase tracking-wider text-stone-400"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    Positions
                  </div>
                  <div
                    className="mt-2 text-2xl font-medium tracking-tight"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {debtList.length}
                  </div>
                </div>
              </div>

              {/* Lender breakdown */}
              <div className="mt-6 space-y-2">
                {debtList.map((d, i) => {
                  const pct =
                    totalDebtBalance > 0
                      ? (Number(d.current_balance || 0) / totalDebtBalance) *
                        100
                      : 0;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3"
                    >
                      <StatusDot
                        color={
                          i === 0
                            ? T.ink
                            : i === 1
                              ? "#6B7280"
                              : i === 2
                                ? "#9CA3AF"
                                : "#D1D5DB"
                        }
                      />
                      <span className="min-w-[140px] text-sm text-stone-600">
                        {d.lender || `Lender ${i + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full rounded-full bg-stone-900"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className="text-xs tabular-nums text-stone-500"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtCompact(Number(d.current_balance || 0))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </StaggerIn>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-stone-400">
        <span>
          {closedDeals.length} owned{" "}
          {closedDeals.length === 1 ? "asset" : "assets"}
        </span>
        <span>CASA &middot; INVESTOR &middot; PORTFOLIO</span>
      </div>
    </div>
  );
}
