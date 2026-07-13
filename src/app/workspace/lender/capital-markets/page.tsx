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
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Globe,
  Scale,
  TrendingDown,
  FileText,
  Beaker,
  Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtCompact = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtMoney(n);
};

const impactColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "#FEE2E2", text: T.red },
  medium: { bg: "#FEF3C7", text: "#92700C" },
  low: { bg: "#DCFCE7", text: T.green },
};

export default async function CapitalMarketsPage() {
  const supabase = createServerClient();

  const [regResult, testResult, { data: activeLoans }] = await Promise.all([
    supabase
      .from("regulatory_changes")
      .select("*")
      .order("effective_date", { ascending: false }),
    supabase
      .from("stress_tests")
      .select("*")
      .order("run_at", { ascending: false }),
    supabase.from("active_loans").select("*"),
  ]);

  const regChanges = regResult.data;
  const stressTests = testResult.data;

  const regs = regChanges ?? [];
  const tests = stressTests ?? [];
  const loans = activeLoans ?? [];

  // Portfolio metrics
  const totalBalance = loans.reduce(
    (sum, l) => sum + Number(l.current_balance ?? 0),
    0
  );
  const avgRate =
    loans.length > 0
      ? loans.reduce((sum, l) => sum + Number(l.rate ?? 0), 0) / loans.length
      : 0;
  const avgDscr =
    loans.length > 0
      ? loans.reduce((sum, l) => sum + Number(l.dscr_current ?? 0), 0) /
        loans.length
      : 0;
  const avgLtv =
    loans.length > 0
      ? loans.reduce((sum, l) => sum + Number(l.ltv_current ?? 0), 0) /
        loans.length
      : 0;

  return (
    <div
      className="min-h-screen px-6 py-10 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="CAPITAL MARKETS"
        title="Market Intelligence"
        subtitle="Regulatory landscape, stress testing, and portfolio positioning."
      />

      {/* Portfolio overview */}
      <div className="mb-8">
        <StaggerIn index={0}>
          <DarkStatCard
            label="Portfolio AUM"
            value={fmtCompact(totalBalance)}
            subtitle={`${loans.length} active loans | ${avgRate.toFixed(2)}% avg rate | ${avgDscr.toFixed(2)}x avg DSCR`}
            icon={<Globe className="h-5 w-5 text-stone-400" />}
          />
        </StaggerIn>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={1}>
          <KpiCard label="Avg Rate" value={`${avgRate.toFixed(2)}%`} note="Portfolio-wide" />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="Avg DSCR" value={avgDscr.toFixed(2)} note="Coverage ratio" />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="Avg LTV" value={`${avgLtv.toFixed(1)}%`} note="Leverage" />
        </StaggerIn>
        <StaggerIn index={4}>
          <KpiCard
            label="Regulatory Changes"
            value={regs.length}
            note={regs.filter((r) => r.impact_level === "high").length > 0
              ? `${regs.filter((r) => r.impact_level === "high").length} high impact`
              : "Monitoring"
            }
          />
        </StaggerIn>
      </div>

      {/* Regulatory changes */}
      {regs.length > 0 && (
        <div className="mb-10">
          <SectionLabel>REGULATORY CHANGES</SectionLabel>
          <div className="mt-4 space-y-4">
            {regs.map((reg, i) => {
              const impact = impactColors[reg.impact_level] ?? impactColors.low;
              return (
                <StaggerIn key={reg.id} index={i + 5}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconChip>
                          <Scale className="h-4 w-4 text-stone-700" />
                        </IconChip>
                        <div>
                          <h3 className="text-base font-semibold text-stone-900">
                            {reg.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {reg.jurisdiction}
                            {reg.state ? ` — ${reg.state}` : ""} &middot;{" "}
                            {reg.change_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: impact.bg, color: impact.text }}
                        >
                          {reg.impact_level}
                        </span>
                        <YellowBadge>{reg.status}</YellowBadge>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-stone-600">
                      {reg.ai_summary || reg.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span>
                        Effective:{" "}
                        <strong className="text-stone-700">
                          {reg.effective_date}
                        </strong>
                      </span>
                      {reg.affected_property_types &&
                        reg.affected_property_types.length > 0 && (
                          <span>
                            Affects:{" "}
                            <strong className="text-stone-700">
                              {reg.affected_property_types.join(", ")}
                            </strong>
                          </span>
                        )}
                      {reg.action_required && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                          Action Required
                        </span>
                      )}
                    </div>

                    {reg.source_url && (
                      <p className="mt-2 text-xs text-stone-400 truncate">
                        Source: {reg.source_url}
                      </p>
                    )}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </div>
      )}

      {/* Stress tests */}
      {tests.length > 0 && (
        <div className="mb-10">
          <SectionLabel>STRESS TEST RESULTS</SectionLabel>
          <div className="mt-4 space-y-4">
            {tests.map((test, i) => {
              const noiImpact = Number(test.portfolio_noi_impact ?? 0);
              const valImpact = Number(test.portfolio_value_impact ?? 0);
              const results =
                typeof test.results === "object" ? test.results : null;
              const recommendations =
                typeof test.recommendations === "object"
                  ? test.recommendations
                  : null;

              return (
                <StaggerIn key={test.id} index={i + regs.length + 5}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconChip>
                          <Beaker className="h-4 w-4 text-stone-700" />
                        </IconChip>
                        <div>
                          <h3 className="text-base font-semibold text-stone-900">
                            {test.scenario_name}
                          </h3>
                          <p className="text-xs text-stone-500">
                            {test.scenario_type} &middot; Run{" "}
                            {test.run_at
                              ? new Date(test.run_at).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">
                          NOI Impact
                        </p>
                        <p
                          className="mt-1 text-xl font-bold"
                          style={{ color: noiImpact < 0 ? T.red : T.green }}
                        >
                          {noiImpact > 0 ? "+" : ""}
                          {noiImpact.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">
                          Value Impact
                        </p>
                        <p
                          className="mt-1 text-xl font-bold"
                          style={{ color: valImpact < 0 ? T.red : T.green }}
                        >
                          {valImpact > 0 ? "+" : ""}
                          {valImpact.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">
                          Properties at Risk
                        </p>
                        <p className="mt-1 text-xl font-bold text-stone-900">
                          {test.properties_at_risk ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">
                          DSCR Breaches
                        </p>
                        <p
                          className="mt-1 text-xl font-bold"
                          style={{
                            color: (test.dscr_breaches ?? 0) > 0 ? T.red : T.green,
                          }}
                        >
                          {test.dscr_breaches ?? 0}
                        </p>
                      </div>
                    </div>

                    {recommendations && Array.isArray(recommendations) && recommendations.length > 0 && (
                      <div className="mt-4 rounded-xl bg-stone-50 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">
                          RECOMMENDATIONS
                        </p>
                        <ul className="space-y-1">
                          {(recommendations as string[]).map((rec, ri) => (
                            <li key={ri} className="text-sm text-stone-700">
                              &bull; {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty states */}
      {regs.length === 0 && tests.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <Globe className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-lg font-medium text-stone-600">
              No regulatory changes or stress tests recorded yet.
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Data will appear here as regulatory updates and stress tests are added.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
