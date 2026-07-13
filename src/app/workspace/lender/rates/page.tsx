import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  ListContainer,
  ListHeader,
  ListRow,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Percent, TrendingUp, BarChart3 } from "lucide-react";

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

export default async function RatesPage() {
  const supabase = createServerClient();

  const [{ data: activeLoans }, { data: loanApps }] = await Promise.all([
    supabase.from("active_loans").select("*"),
    supabase.from("loan_applications").select("*"),
  ]);

  const loans = activeLoans ?? [];
  const apps = loanApps ?? [];

  // Weighted average rate for active loans
  const totalBalance = loans.reduce(
    (sum, l) => sum + Number(l.current_balance ?? 0),
    0
  );
  const weightedRateSum = loans.reduce(
    (sum, l) => sum + Number(l.rate ?? 0) * Number(l.current_balance ?? 0),
    0
  );
  const weightedAvgRate = totalBalance > 0 ? weightedRateSum / totalBalance : 0;

  // Simple average rate
  const simpleAvgRate =
    loans.length > 0
      ? loans.reduce((sum, l) => sum + Number(l.rate ?? 0), 0) / loans.length
      : 0;

  // Pipeline rates
  const pipelineAvgRate =
    apps.length > 0
      ? apps.reduce((sum, a) => sum + Number(a.rate ?? 0), 0) / apps.length
      : 0;

  // Rate distribution buckets
  const allRates = [
    ...loans.map((l) => ({ rate: Number(l.rate ?? 0), source: "Active", name: l.borrower_name, address: l.property_address, balance: Number(l.current_balance ?? 0) })),
    ...apps.map((a) => ({ rate: Number(a.rate ?? 0), source: "Pipeline", name: a.borrower_name, address: a.property_address, balance: Number(a.loan_amount ?? 0) })),
  ];

  const rateBuckets = [
    { label: "< 5%", count: allRates.filter((r) => r.rate < 5).length },
    { label: "5-6%", count: allRates.filter((r) => r.rate >= 5 && r.rate < 6).length },
    { label: "6-7%", count: allRates.filter((r) => r.rate >= 6 && r.rate < 7).length },
    { label: "7-8%", count: allRates.filter((r) => r.rate >= 7 && r.rate < 8).length },
    { label: "8-9%", count: allRates.filter((r) => r.rate >= 8 && r.rate < 9).length },
    { label: "> 9%", count: allRates.filter((r) => r.rate >= 9).length },
  ];

  // Rate spread
  const minRate = allRates.length > 0 ? Math.min(...allRates.map((r) => r.rate)) : 0;
  const maxRate = allRates.length > 0 ? Math.max(...allRates.map((r) => r.rate)) : 0;
  const spread = maxRate - minRate;

  // Sort by rate descending for the list
  allRates.sort((a, b) => b.rate - a.rate);

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="RATE MODELING"
        title="Rate Analysis"
        subtitle="Rate distribution, weighted averages, and per-loan rate analysis across the portfolio."
      />

      {/* Hero: WAR */}
      <div className="mb-8">
        <StaggerIn index={0}>
          <DarkStatCard
            label="Weighted Average Rate"
            value={`${weightedAvgRate.toFixed(2)}%`}
            subtitle={`Across ${fmtCompact(totalBalance)} in active loans`}
            icon={<Percent className="h-5 w-5 text-stone-400" />}
          />
        </StaggerIn>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={1}>
          <KpiCard
            label="Simple Avg Rate"
            value={`${simpleAvgRate.toFixed(2)}%`}
            note="Active loans"
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="Pipeline Avg Rate"
            value={`${pipelineAvgRate.toFixed(2)}%`}
            note="New applications"
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="Rate Spread"
            value={`${spread.toFixed(2)}%`}
            note={`${minRate.toFixed(2)}% to ${maxRate.toFixed(2)}%`}
          />
        </StaggerIn>
        <StaggerIn index={4}>
          <KpiCard label="Total Positions" value={allRates.length} note="Active + Pipeline" />
        </StaggerIn>
      </div>

      {/* Rate Distribution */}
      <div className="mb-8">
        <StaggerIn index={5}>
          <Card>
            <SectionLabel>RATE DISTRIBUTION</SectionLabel>
            <div className="mt-6 space-y-3">
              {rateBuckets.map((bucket) => {
                const maxCount = Math.max(...rateBuckets.map((b) => b.count), 1);
                const pct = (bucket.count / maxCount) * 100;
                return (
                  <div key={bucket.label} className="flex items-center gap-3">
                    <span className="w-14 text-xs font-medium text-stone-600">{bucket.label}</span>
                    <div className="flex-1 h-8 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(pct, 3)}%`,
                          backgroundColor: T.yellow,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-stone-800">
                      {bucket.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </StaggerIn>
      </div>

      {/* Per-loan rate cards */}
      <SectionLabel>PER-LOAN RATE ANALYSIS</SectionLabel>
      <div className="mt-4">
        <ListContainer>
          <ListHeader label="ALL POSITIONS BY RATE" />
          {allRates.map((item, i) => (
            <div key={`${item.source}-${item.address}-${i}`} className="px-3 pb-2">
              <ListRow last={i === allRates.length - 1}>
                <div className="flex items-center gap-3">
                  <StatusDot
                    color={item.source === "Active" ? T.green : T.yellow}
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.name}</p>
                    <p className="text-xs text-stone-500">{item.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-stone-400">Balance</p>
                    <p className="text-sm font-medium text-stone-800">
                      {fmtCompact(item.balance)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-stone-400">Rate</p>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color:
                          item.rate > 8
                            ? T.red
                            : item.rate > 7
                            ? "#D97706"
                            : T.green,
                      }}
                    >
                      {item.rate.toFixed(2)}%
                    </p>
                  </div>
                  <YellowBadge>{item.source}</YellowBadge>
                </div>
              </ListRow>
            </div>
          ))}
        </ListContainer>
      </div>
    </div>
  );
}
