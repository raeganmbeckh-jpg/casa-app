import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  StaggerIn,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import {
  AlertTriangle,
  TrendingUp,
  Building2,
  DollarSign,
  Hammer,
  FileQuestion,
  Target,
  CalendarClock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtPct = (n: number) => `${Math.round(n)}%`;

const phaseLabel = (phase: string) =>
  phase
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const budgetStatusColor = (status: string) => {
  switch (status) {
    case "on_track":
      return T.green;
    case "at_risk":
      return T.yellow;
    case "over_budget":
      return T.red;
    default:
      return T.dim;
  }
};

const phaseBadgeStyle = (phase: string) => {
  switch (phase) {
    case "entitlement":
      return { backgroundColor: "rgba(249,217,106,0.2)", color: "#92700C" };
    case "design":
      return { backgroundColor: "rgba(147,197,253,0.3)", color: "#1E40AF" };
    case "permitting":
      return { backgroundColor: "rgba(196,181,253,0.3)", color: "#6B21A8" };
    case "construction":
      return { backgroundColor: "rgba(134,239,172,0.3)", color: "#065F46" };
    case "closeout":
      return { backgroundColor: "rgba(253,186,116,0.3)", color: "#9A3412" };
    case "stabilized":
      return { backgroundColor: "rgba(17,17,17,0.08)", color: "#111111" };
    default:
      return { backgroundColor: "rgba(17,17,17,0.06)", color: T.dim };
  }
};

export default async function DeveloperDashboard() {
  const supabase = createServerClient();

  const [
    { data: projects },
    { data: budgetItems },
    { data: rfis },
  ] = await Promise.all([
    supabase
      .from("dev_projects")
      .select("*")
      .order("name"),
    supabase
      .from("budget_line_items")
      .select("*"),
    supabase
      .from("rfis")
      .select("*"),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "developer").order("created_at", { ascending: false }).limit(20);

  const projectList = projects ?? [];
  const budgetList = budgetItems ?? [];
  const rfiList = rfis ?? [];

  // ── KPIs ──────────────────────────────────────────────────────
  const totalPipeline = projectList.reduce(
    (s, p) => s + Number(p.total_budget || 0),
    0,
  );
  const activeCount = projectList.length;
  const totalUnits = projectList.reduce(
    (s, p) => s + Number(p.units || 0),
    0,
  );
  const totalSpent = projectList.reduce(
    (s, p) => s + Number(p.spent_to_date || 0),
    0,
  );
  const budgetUtilization =
    totalPipeline > 0 ? (totalSpent / totalPipeline) * 100 : 0;
  const openRfis = rfiList.filter((r) => r.status === "open").length;

  // ── Budget alerts ─────────────────────────────────────────────
  const budgetAlerts = budgetList.filter(
    (b) => b.status === "over" || b.status === "at_risk",
  );

  // ── Find project name for a given project_id ─────────────────
  const projectNameById = (id: string) =>
    projectList.find((p) => p.id === id)?.name ?? "Unknown Project";

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="THE PROJECT FORGE"
        title={
          <>
            Development <em className="italic text-stone-500">Operations</em>
          </>
        }
        subtitle="Your development command center. Every project, every dollar, every milestone."
      />

      {/* ── Hero: Pipeline + KPIs ──────────────────────────────── */}
      <section className="mb-10 grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <DarkStatCard
            label="TOTAL DEVELOPMENT PIPELINE"
            value={fmtMoney(totalPipeline)}
            subtitle={`${activeCount} active projects across ${totalUnits.toLocaleString()} units`}
            icon={<TrendingUp className="h-5 w-5 text-stone-400" />}
          />
        </div>
        <KpiCard
          label="ACTIVE PROJECTS"
          value={activeCount}
          note={`${totalUnits.toLocaleString()} total units`}
        />
        <KpiCard
          label="BUDGET UTILIZATION"
          value={fmtPct(budgetUtilization)}
          note={`${fmtMoney(totalSpent)} of ${fmtMoney(totalPipeline)}`}
        />
        <KpiCard
          label="OPEN RFIS"
          value={openRfis}
          note={`${rfiList.length} total RFIs`}
        />
      </section>

      {/* ── Project Status Cards ───────────────────────────────── */}
      <section className="mb-10">
        <SectionLabel>PROJECT STATUS</SectionLabel>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projectList.map((project, i) => {
            const pct = Number(project.pct_complete || 0);
            const badge = phaseBadgeStyle(project.phase);
            const statusColor = budgetStatusColor(project.budget_status);

            return (
              <StaggerIn key={project.id} index={i}>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-medium text-stone-900">
                        {project.name}
                      </h3>
                      <p className="mt-0.5 truncate text-xs text-stone-500">
                        {project.address}, {project.city}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={badge}
                    >
                      {phaseLabel(project.phase)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between">
                      <span
                        className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Completion
                      </span>
                      <span
                        className="text-sm font-medium tabular-nums text-stone-900"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-200/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            pct >= 75 ? T.green : pct >= 40 ? T.yellow : T.ink,
                        }}
                      />
                    </div>
                  </div>

                  {/* Budget + Status */}
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <div>
                      <div
                        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Budget
                      </div>
                      <div
                        className="mt-0.5 text-sm font-medium tabular-nums"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtMoney(Number(project.total_budget || 0))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusDot color={statusColor} />
                      <span className="text-xs capitalize text-stone-600">
                        {(project.budget_status || "unknown").replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  {/* Next milestone */}
                  {project.next_milestone && (
                    <div className="mt-3 rounded-2xl bg-[#FAFAF7] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-3.5 w-3.5 text-stone-400" />
                          <span className="text-xs text-stone-600">
                            {project.next_milestone}
                          </span>
                        </div>
                        {project.next_milestone_date && (
                          <span
                            className="text-[10px] font-medium tabular-nums text-stone-500"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {new Date(
                              project.next_milestone_date + "T00:00:00",
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
          {projectList.length === 0 && (
            <Card>
              <p className="py-8 text-center text-sm text-stone-400">
                No projects found. Add your first development project.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* ── Budget Alerts ──────────────────────────────────────── */}
      {budgetAlerts.length > 0 && (
        <section>
          <SectionLabel>BUDGET ALERTS</SectionLabel>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {budgetAlerts.map((item, i) => {
              const isOver = item.status === "over";
              return (
                <StaggerIn key={item.id} index={i}>
                  <div
                    className={`flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-sm ${
                      isOver
                        ? "border-red-200 bg-red-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <AlertTriangle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isOver ? "text-red-700" : "text-amber-700"
                      }`}
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          isOver ? "text-red-900" : "text-amber-900"
                        }`}
                      >
                        {item.line_item}
                      </p>
                      <p
                        className={`mt-0.5 text-xs ${
                          isOver ? "text-red-700" : "text-amber-700"
                        }`}
                      >
                        {projectNameById(item.project_id)} &middot; Variance:{" "}
                        {fmtMoney(Number(item.variance || 0))}
                      </p>
                    </div>
                    <YellowBadge>
                      {isOver ? "OVER" : "AT RISK"}
                    </YellowBadge>
                  </div>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SwarmPanel role="developer" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}
