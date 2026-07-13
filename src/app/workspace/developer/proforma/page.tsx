import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtPct = (n: number | null) =>
  n != null ? `${Number(n).toFixed(2)}%` : "--";

export default async function ProFormaPage() {
  const supabase = createServerClient();

  const [{ data: projects }, { data: budgetItems }] = await Promise.all([
    supabase.from("dev_projects").select("*").order("name"),
    supabase
      .from("budget_line_items")
      .select("*")
      .order("category"),
  ]);

  const projectList = projects ?? [];
  const budgetList = budgetItems ?? [];

  // ── Group budget items by project ─────────────────────────────
  const budgetByProject: Record<string, any[]> = {};
  for (const b of budgetList) {
    if (!budgetByProject[b.project_id]) {
      budgetByProject[b.project_id] = [];
    }
    budgetByProject[b.project_id].push(b);
  }

  // ── Portfolio totals ──────────────────────────────────────────
  const totalBudget = projectList.reduce(
    (s, p) => s + Number(p.total_budget || 0),
    0,
  );
  const totalSpent = projectList.reduce(
    (s, p) => s + Number(p.spent_to_date || 0),
    0,
  );
  const totalNoi = projectList.reduce(
    (s, p) => s + Number(p.projected_noi || 0),
    0,
  );
  const avgYield =
    projectList.length > 0
      ? projectList.reduce(
          (s, p) => s + Number(p.development_yield || 0),
          0,
        ) / projectList.filter((p) => p.development_yield).length || 0
      : 0;
  const avgIrr =
    projectList.length > 0
      ? projectList.reduce(
          (s, p) => s + Number(p.projected_irr || 0),
          0,
        ) / projectList.filter((p) => p.projected_irr).length || 0
      : 0;

  // ── Category labels ───────────────────────────────────────────
  const categoryLabel = (cat: string) =>
    cat
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const categoryOrder = [
    "land",
    "hard_costs",
    "soft_costs",
    "financing",
    "contingency",
    "other",
  ];

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="FINANCIAL MODELING"
        title={
          <>
            Pro <em className="italic text-stone-500">Forma</em>
          </>
        }
        subtitle="Financial analysis across every development. Costs, returns, and line-item detail."
      />

      {/* ── Portfolio Summary ──────────────────────────────────── */}
      <section className="mb-10 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DarkStatCard
            label="PORTFOLIO TOTAL BUDGET"
            value={fmtMoney(totalBudget)}
            subtitle={`${fmtMoney(totalSpent)} deployed across ${projectList.length} projects`}
            progress={
              totalBudget > 0
                ? Math.round((totalSpent / totalBudget) * 100)
                : 0
            }
            icon={<TrendingUp className="h-5 w-5 text-stone-400" />}
          />
        </div>
        <KpiCard
          label="TOTAL PROJECTED NOI"
          value={fmtMoney(totalNoi)}
          note="All projects combined"
        />
        <KpiCard
          label="AVG DEV YIELD"
          value={fmtPct(avgYield)}
          note="Weighted by project"
        />
        <KpiCard
          label="AVG PROJECTED IRR"
          value={fmtPct(avgIrr)}
          note="Across portfolio"
        />
      </section>

      {/* ── Per-Project Pro Forma ───────────────────────────────── */}
      <section className="space-y-8">
        {projectList.map((project, i) => {
          const items = budgetByProject[project.id] ?? [];
          const spent = Number(project.spent_to_date || 0);
          const budget = Number(project.total_budget || 0);
          const utilization = budget > 0 ? (spent / budget) * 100 : 0;

          // Group items by category
          const byCategory: Record<string, any[]> = {};
          for (const item of items) {
            const cat = item.category || "other";
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(item);
          }

          // Sort categories
          const sortedCategories = Object.keys(byCategory).sort(
            (a, b) =>
              categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
          );

          return (
            <StaggerIn key={project.id} index={i}>
              <Card>
                {/* Project header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                  <div>
                    <h2
                      className="text-2xl tracking-tight text-stone-900"
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 500,
                      }}
                    >
                      {project.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {project.address}, {project.city}, {project.state}
                    </p>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-xs font-medium tabular-nums"
                    style={{
                      backgroundColor:
                        utilization > 90
                          ? "rgba(185,28,28,0.1)"
                          : "rgba(21,128,61,0.1)",
                      color: utilization > 90 ? T.red : T.green,
                      fontFamily: "var(--font-geist-mono)",
                    }}
                  >
                    {Math.round(utilization)}% utilized
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Left: cost stack */}
                  <div>
                    <SectionLabel>COST BREAKDOWN</SectionLabel>
                    <div className="mt-3 space-y-2">
                      <CostRow
                        label="Land Cost"
                        value={Number(project.land_cost || 0)}
                      />
                      <CostRow
                        label="Hard Costs"
                        value={Number(project.hard_costs || 0)}
                      />
                      <CostRow
                        label="Soft Costs"
                        value={Number(project.soft_costs || 0)}
                      />
                      <CostRow
                        label="Financing Costs"
                        value={Number(project.financing_costs || 0)}
                      />
                      <div className="border-t border-stone-200 pt-2">
                        <CostRow
                          label="Total Budget"
                          value={budget}
                          bold
                        />
                      </div>
                      <CostRow
                        label="Spent to Date"
                        value={spent}
                        highlight
                      />
                    </div>
                  </div>

                  {/* Right: returns */}
                  <div>
                    <SectionLabel>RETURNS</SectionLabel>
                    <div className="mt-3 grid grid-cols-3 gap-4 rounded-2xl bg-[#FAFAF7] p-5">
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Projected NOI
                        </div>
                        <div
                          className="mt-2 text-xl font-medium tabular-nums text-stone-900"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {project.projected_noi
                            ? fmtMoney(Number(project.projected_noi))
                            : "--"}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Dev Yield
                        </div>
                        <div
                          className="mt-2 text-xl font-medium tabular-nums"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            color:
                              Number(project.development_yield || 0) >= 5.5
                                ? T.green
                                : T.ink,
                          }}
                        >
                          {fmtPct(project.development_yield)}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Projected IRR
                        </div>
                        <div
                          className="mt-2 text-xl font-medium tabular-nums"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            color:
                              Number(project.projected_irr || 0) >= 12
                                ? T.green
                                : T.ink,
                          }}
                        >
                          {fmtPct(project.projected_irr)}
                        </div>
                      </div>
                    </div>

                    {/* Utilization bar */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span
                          className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Budget Utilization
                        </span>
                        <span
                          className="text-sm font-medium tabular-nums text-stone-900"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {fmtMoney(spent)} / {fmtMoney(budget)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200/60">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(utilization, 100)}%`,
                            backgroundColor:
                              utilization > 90 ? T.red : T.green,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line items table by category */}
                {items.length > 0 && (
                  <div className="mt-6 border-t border-stone-200 pt-6">
                    <SectionLabel>BUDGET LINE ITEMS</SectionLabel>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                      <table className="w-full text-sm">
                        <thead>
                          <tr
                            className="border-b border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            <th className="px-4 py-3 font-medium">
                              Line Item
                            </th>
                            <th className="px-4 py-3 font-medium text-right">
                              Budgeted
                            </th>
                            <th className="px-4 py-3 font-medium text-right">
                              Actual
                            </th>
                            <th className="px-4 py-3 font-medium text-right">
                              Variance
                            </th>
                            <th className="px-4 py-3 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCategories.map((cat) => (
                            <>
                              {/* Category header */}
                              <tr
                                key={`cat-${cat}`}
                                className="border-b border-stone-100 bg-[#FAFAF7]"
                              >
                                <td
                                  colSpan={5}
                                  className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500"
                                >
                                  {categoryLabel(cat)}
                                </td>
                              </tr>
                              {byCategory[cat].map((item: any) => {
                                const variance = Number(
                                  item.variance || 0,
                                );
                                const isNeg = variance < 0;
                                return (
                                  <tr
                                    key={item.id}
                                    className="border-b border-stone-100 last:border-0"
                                  >
                                    <td className="px-4 py-2.5 text-stone-800">
                                      {item.line_item}
                                    </td>
                                    <td
                                      className="px-4 py-2.5 text-right tabular-nums text-stone-600"
                                      style={{
                                        fontFamily:
                                          "var(--font-geist-mono)",
                                      }}
                                    >
                                      {fmtMoney(
                                        Number(item.budgeted || 0),
                                      )}
                                    </td>
                                    <td
                                      className="px-4 py-2.5 text-right tabular-nums text-stone-600"
                                      style={{
                                        fontFamily:
                                          "var(--font-geist-mono)",
                                      }}
                                    >
                                      {fmtMoney(
                                        Number(item.actual || 0),
                                      )}
                                    </td>
                                    <td
                                      className="px-4 py-2.5 text-right tabular-nums font-medium"
                                      style={{
                                        fontFamily:
                                          "var(--font-geist-mono)",
                                        color: isNeg ? T.red : T.green,
                                      }}
                                    >
                                      <span className="inline-flex items-center gap-1">
                                        {isNeg ? (
                                          <ArrowDownRight className="h-3 w-3" />
                                        ) : (
                                          <ArrowUpRight className="h-3 w-3" />
                                        )}
                                        {fmtMoney(Math.abs(variance))}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <StatusBadge
                                        status={item.status}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>
            </StaggerIn>
          );
        })}
        {projectList.length === 0 && (
          <Card>
            <p className="py-12 text-center text-sm text-stone-400">
              No projects found for pro forma analysis.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function CostRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className={`text-sm ${bold ? "font-semibold text-stone-900" : "text-stone-700"}`}
      >
        {label}
      </span>
      <span
        className={`shrink-0 text-sm tabular-nums ${bold ? "font-semibold text-stone-900" : "font-medium"}`}
        style={{
          fontFamily: "var(--font-geist-mono)",
          color: highlight ? T.yellow : undefined,
        }}
      >
        {fmtMoney(value)}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = (() => {
    switch (status) {
      case "on_track":
        return {
          backgroundColor: "rgba(21,128,61,0.1)",
          color: T.green,
        };
      case "at_risk":
        return {
          backgroundColor: "rgba(249,217,106,0.2)",
          color: "#92700C",
        };
      case "over":
        return {
          backgroundColor: "rgba(185,28,28,0.1)",
          color: T.red,
        };
      default:
        return {
          backgroundColor: "rgba(17,17,17,0.06)",
          color: T.dim,
        };
    }
  })();

  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
      style={styles}
    >
      {(status || "unknown").replace(/_/g, " ")}
    </span>
  );
}
