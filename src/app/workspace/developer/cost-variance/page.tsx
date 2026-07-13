import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtVariance = (n: number) => {
  const prefix = n >= 0 ? "+" : "";
  return `${prefix}${fmtMoney(n)}`;
};

const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtMoney(n);
};

const fmtCompactSigned = (n: number) => {
  const prefix = n >= 0 ? "+" : "";
  if (Math.abs(n) >= 1_000_000) return `${prefix}$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${prefix}$${(n / 1_000).toFixed(0)}K`;
  return `${prefix}${fmtMoney(n)}`;
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  land:         { bg: "#E0E7FF", text: "#3730A3" },
  hard_costs:   { bg: "#DBEAFE", text: "#1E40AF" },
  soft_costs:   { bg: "#FEF3C7", text: "#92400E" },
  financing:    { bg: "#FCE7F3", text: "#9D174D" },
  contingency:  { bg: "#F3E8FF", text: "#6B21A8" },
  other:        { bg: "#F3F4F6", text: "#374151" },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  on_track: { bg: "#D1FAE5", text: "#065F46", dot: T.green },
  at_risk:  { bg: "#FEF3C7", text: "#92400E", dot: "#D97706" },
  over:     { bg: "#FEE2E2", text: "#991B1B", dot: T.red },
};

const fmtCategory = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtStatus = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default async function CostVariancePage() {
  const supabase = createServerClient();

  const [{ data: lineItems }, { data: projects }] = await Promise.all([
    supabase.from("budget_line_items").select("*"),
    supabase.from("dev_projects").select("id, name, address"),
  ]);

  const rows = lineItems ?? [];
  const projectList = projects ?? [];

  // Project lookup
  const projectMap = new Map<string, { name: string; address: string }>();
  for (const p of projectList) {
    projectMap.set(p.id, { name: p.name, address: p.address });
  }

  // KPIs
  const totalBudgeted = rows.reduce((s, r) => s + Number(r.budgeted ?? 0), 0);
  const totalCommitted = rows.reduce((s, r) => s + Number(r.committed ?? 0), 0);
  const totalActual = rows.reduce((s, r) => s + Number(r.actual ?? 0), 0);
  const totalVariance = rows.reduce((s, r) => s + Number(r.variance ?? 0), 0);
  const onTrack = rows.filter((r) => r.status === "on_track").length;
  const atRisk = rows.filter((r) => r.status === "at_risk").length;
  const over = rows.filter((r) => r.status === "over").length;

  // Group by project
  const byProject = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.project_id ?? "unassigned";
    if (!byProject.has(key)) byProject.set(key, []);
    byProject.get(key)!.push(r);
  }

  // Category-level variance totals
  const byCategory = new Map<string, { budgeted: number; committed: number; actual: number; variance: number }>();
  for (const r of rows) {
    const cat = r.category ?? "other";
    const existing = byCategory.get(cat) ?? { budgeted: 0, committed: 0, actual: 0, variance: 0 };
    existing.budgeted += Number(r.budgeted ?? 0);
    existing.committed += Number(r.committed ?? 0);
    existing.actual += Number(r.actual ?? 0);
    existing.variance += Number(r.variance ?? 0);
    byCategory.set(cat, existing);
  }

  if (rows.length === 0) {
    return (
      <div
        className="min-h-screen px-6 py-8 lg:px-10"
        style={{ backgroundColor: T.cream, color: T.ink }}
      >
        <PageTitle
          eyebrow="COST CONTROL"
          title={
            <>
              Budget <em className="italic text-stone-500">Variance</em>.
            </>
          }
        />
        <Card>
          <div className="py-16 text-center">
            <BarChart3 className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">
              No budget line items found.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      <PageTitle
        eyebrow="COST CONTROL"
        title={
          <>
            Budget <em className="italic text-stone-500">Variance</em>.
          </>
        }
        subtitle={`${rows.length} line items across ${byProject.size} projects. Variance figures from live budget data.`}
      />

      {/* Hero stat */}
      <section className="mb-8">
        <DarkStatCard
          label="Total Variance"
          value={fmtCompactSigned(totalVariance)}
          subtitle={
            totalVariance >= 0
              ? "Portfolio is under budget overall."
              : "Portfolio is over budget. Review at-risk items."
          }
          icon={
            totalVariance >= 0 ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )
          }
        />
      </section>

      {/* KPI Row */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="ON TRACK"
          value={onTrack}
          note={`${rows.length > 0 ? Math.round((onTrack / rows.length) * 100) : 0}% of items`}
        />
        <KpiCard label="AT RISK" value={atRisk} />
        <KpiCard label="OVER BUDGET" value={over} />
        <KpiCard label="TOTAL BUDGETED" value={fmtCompact(totalBudgeted)} />
      </section>

      {/* Per-project breakdown */}
      {Array.from(byProject.entries()).map(([projectId, items], pi) => {
        const project = projectMap.get(projectId);
        const projVariance = items.reduce(
          (s, r) => s + Number(r.variance ?? 0),
          0,
        );
        const projBudgeted = items.reduce(
          (s, r) => s + Number(r.budgeted ?? 0),
          0,
        );

        return (
          <StaggerIn key={projectId} index={pi}>
            <section className="mb-8">
              {/* Project header */}
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <SectionLabel>
                    {project?.name?.toUpperCase() ?? "UNASSIGNED"}
                  </SectionLabel>
                  {project?.address && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {project.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className="text-lg font-semibold"
                    style={{
                      color: projVariance >= 0 ? T.green : T.red,
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    {fmtVariance(projVariance)}
                  </span>
                  <p className="text-xs text-stone-500">
                    of {fmtCompact(projBudgeted)} budgeted
                  </p>
                </div>
              </div>

              {/* Line items table */}
              <Card padded={false}>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="border-b text-left text-[11px] uppercase tracking-[0.14em]"
                        style={{
                          borderColor: T.border,
                          color: T.dim,
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        <th className="px-5 py-3 font-medium">Line Item</th>
                        <th className="px-5 py-3 font-medium">Category</th>
                        <th className="px-5 py-3 text-right font-medium">
                          Budgeted
                        </th>
                        <th className="px-5 py-3 text-right font-medium">
                          Committed
                        </th>
                        <th className="px-5 py-3 text-right font-medium">
                          Actual
                        </th>
                        <th className="px-5 py-3 text-right font-medium">
                          Variance
                        </th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const variance = Number(item.variance ?? 0);
                        const cat = item.category ?? "other";
                        const cs =
                          CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.other;
                        const st =
                          STATUS_STYLES[item.status] ?? STATUS_STYLES.on_track;

                        return (
                          <tr
                            key={item.id}
                            className="border-b last:border-0"
                            style={{ borderColor: T.borderLight }}
                          >
                            <td className="px-5 py-3 font-medium text-stone-900">
                              {item.line_item}
                              {item.notes && (
                                <p className="mt-0.5 text-[11px] text-stone-400">
                                  {item.notes}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                                style={{
                                  backgroundColor: cs.bg,
                                  color: cs.text,
                                }}
                              >
                                {fmtCategory(cat)}
                              </span>
                            </td>
                            <td
                              className="px-5 py-3 text-right tabular-nums text-stone-600"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.budgeted ?? 0))}
                            </td>
                            <td
                              className="px-5 py-3 text-right tabular-nums text-stone-600"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.committed ?? 0))}
                            </td>
                            <td
                              className="px-5 py-3 text-right tabular-nums text-stone-900"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.actual ?? 0))}
                            </td>
                            <td
                              className="px-5 py-3 text-right tabular-nums font-semibold"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                                color:
                                  variance >= 0 ? T.green : T.red,
                              }}
                            >
                              {fmtVariance(variance)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
                                style={{
                                  backgroundColor: st.bg,
                                  color: st.text,
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: st.dot }}
                                />
                                {fmtStatus(item.status ?? "on_track")}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 p-4 md:hidden">
                  {items.map((item) => {
                    const variance = Number(item.variance ?? 0);
                    const cat = item.category ?? "other";
                    const cs = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.other;
                    const st =
                      STATUS_STYLES[item.status] ?? STATUS_STYLES.on_track;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-stone-200 bg-[#FAFAF7] p-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-stone-900">
                              {item.line_item}
                            </p>
                            <span
                              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: cs.bg,
                                color: cs.text,
                              }}
                            >
                              {fmtCategory(cat)}
                            </span>
                          </div>
                          <span
                            className="text-sm font-semibold tabular-nums"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                              color: variance >= 0 ? T.green : T.red,
                            }}
                          >
                            {fmtVariance(variance)}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-stone-500">
                          <div>
                            <p className="text-[10px] uppercase">Budgeted</p>
                            <p
                              className="tabular-nums text-stone-800"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.budgeted ?? 0))}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase">Committed</p>
                            <p
                              className="tabular-nums text-stone-800"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.committed ?? 0))}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase">Actual</p>
                            <p
                              className="tabular-nums text-stone-800"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtMoney(Number(item.actual ?? 0))}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </section>
          </StaggerIn>
        );
      })}

      {/* Category-level summary */}
      <section className="mt-4">
        <SectionLabel>VARIANCE BY CATEGORY</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(byCategory.entries()).map(([cat, totals], ci) => {
            const cs = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES.other;
            const pctSpent =
              totals.budgeted > 0
                ? (totals.actual / totals.budgeted) * 100
                : 0;
            const barColor =
              pctSpent > 100 ? T.red : pctSpent > 80 ? "#D97706" : T.green;

            return (
              <StaggerIn key={cat} index={ci}>
                <Card>
                  <div className="flex items-baseline justify-between">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: cs.bg, color: cs.text }}
                    >
                      {fmtCategory(cat)}
                    </span>
                    <span
                      className="text-lg font-semibold tabular-nums"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: totals.variance >= 0 ? T.green : T.red,
                      }}
                    >
                      {fmtVariance(totals.variance)}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs text-stone-500">
                    <div className="flex justify-between">
                      <span>Budgeted</span>
                      <span
                        className="tabular-nums text-stone-800"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtMoney(totals.budgeted)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Committed</span>
                      <span
                        className="tabular-nums text-stone-800"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtMoney(totals.committed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual</span>
                      <span
                        className="tabular-nums text-stone-800"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtMoney(totals.actual)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-[10px] uppercase tracking-[0.16em] text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Spent
                      </span>
                      <span
                        className="text-[11px] font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {pctSpent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, pctSpent)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </section>
    </div>
  );
}
