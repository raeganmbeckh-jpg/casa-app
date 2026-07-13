import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Building2,
  HardHat,
  Pencil,
  DollarSign,
  Users,
  Target,
  MapPin,
  Ruler,
  TrendingUp,
  Scale,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtNumber = (n: number) => n.toLocaleString("en-US");

const fmtPct = (n: number | null) =>
  n != null ? `${Number(n).toFixed(1)}%` : "--";

const fmtDate = (iso: string | null) => {
  if (!iso) return "--";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const phaseLabel = (phase: string) =>
  phase
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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

export default async function ProjectsPage() {
  const supabase = createServerClient();

  const [{ data: projects }, { data: entitlements }] = await Promise.all([
    supabase.from("dev_projects").select("*").order("name"),
    supabase.from("entitlements").select("*"),
  ]);

  const projectList = projects ?? [];
  const entitlementList = entitlements ?? [];

  // ── KPIs ──────────────────────────────────────────────────────
  const totalProjects = projectList.length;
  const inConstruction = projectList.filter(
    (p) => p.phase === "construction",
  ).length;
  const inDesign = projectList.filter((p) => p.phase === "design").length;
  const totalBudget = projectList.reduce(
    (s, p) => s + Number(p.total_budget || 0),
    0,
  );

  // ── Entitlements keyed by project_id ──────────────────────────
  const entitlementsByProject: Record<string, any[]> = {};
  for (const e of entitlementList) {
    if (!entitlementsByProject[e.project_id]) {
      entitlementsByProject[e.project_id] = [];
    }
    entitlementsByProject[e.project_id].push(e);
  }

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="PROJECTS"
        title={
          <>
            Active <em className="italic text-stone-500">Developments</em>
          </>
        }
        subtitle="Every project in the pipeline with full financials, team, and entitlement status."
      />

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <section className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard
            label="TOTAL PROJECTS"
            value={totalProjects}
            note="All phases"
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="IN CONSTRUCTION"
            value={inConstruction}
            note="Active builds"
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="IN DESIGN" value={inDesign} note="Design phase" />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="TOTAL BUDGET"
            value={fmtMoney(totalBudget)}
            note="All projects combined"
          />
        </StaggerIn>
      </section>

      {/* ── Project Cards ──────────────────────────────────────── */}
      <section className="space-y-6">
        {projectList.map((project, i) => {
          const pct = Number(project.pct_complete || 0);
          const badge = phaseBadgeStyle(project.phase);
          const statusColor = budgetStatusColor(project.budget_status);
          const entitlementEntries = entitlementsByProject[project.id] ?? [];

          return (
            <StaggerIn key={project.id} index={i}>
              <Card className="overflow-hidden">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3
                        className="text-2xl tracking-tight text-stone-900"
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 500,
                        }}
                      >
                        {project.name}
                      </h3>
                      <StatusDot color={statusColor} />
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {project.address}, {project.city}, {project.state}{" "}
                      {project.zip}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.product_type && (
                      <span className="rounded-full border border-stone-200 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
                        {project.product_type}
                      </span>
                    )}
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={badge}
                    >
                      {phaseLabel(project.phase)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                  <div className="flex items-baseline justify-between">
                    <span
                      className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Project Completion
                    </span>
                    <span
                      className="text-sm font-medium tabular-nums text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-200/60">
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

                {/* Metrics grid */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-stone-200 pt-6 sm:grid-cols-4">
                  <MetricCell
                    label="Total Budget"
                    value={fmtMoney(Number(project.total_budget || 0))}
                    icon={<DollarSign className="h-3.5 w-3.5 text-stone-400" />}
                  />
                  <MetricCell
                    label="Spent to Date"
                    value={fmtMoney(Number(project.spent_to_date || 0))}
                    icon={<DollarSign className="h-3.5 w-3.5 text-stone-400" />}
                  />
                  <MetricCell
                    label="Units"
                    value={fmtNumber(Number(project.units || 0))}
                    icon={<Building2 className="h-3.5 w-3.5 text-stone-400" />}
                  />
                  <MetricCell
                    label="Square Feet"
                    value={`${fmtNumber(Number(project.sqft || 0))} sf`}
                    icon={<Ruler className="h-3.5 w-3.5 text-stone-400" />}
                  />
                </div>

                {/* Financial metrics */}
                <div className="mt-4 grid grid-cols-3 gap-4 rounded-2xl bg-[#FAFAF7] p-4">
                  <div>
                    <div
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Projected NOI
                    </div>
                    <div
                      className="mt-1 text-lg font-medium tabular-nums text-stone-900"
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
                      className="mt-1 text-lg font-medium tabular-nums"
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
                      className="mt-1 text-lg font-medium tabular-nums"
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

                {/* Team + Milestone row */}
                <div className="mt-4 grid gap-4 border-t border-stone-200 pt-4 sm:grid-cols-2">
                  {/* Team */}
                  <div>
                    <div
                      className="mb-2 text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Project Team
                    </div>
                    <div className="space-y-1 text-xs text-stone-600">
                      {project.project_manager && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-stone-400" />
                          <span className="font-medium">PM:</span>{" "}
                          {project.project_manager}
                        </div>
                      )}
                      {project.general_contractor && (
                        <div className="flex items-center gap-1.5">
                          <HardHat className="h-3 w-3 text-stone-400" />
                          <span className="font-medium">GC:</span>{" "}
                          {project.general_contractor}
                        </div>
                      )}
                      {project.architect && (
                        <div className="flex items-center gap-1.5">
                          <Pencil className="h-3 w-3 text-stone-400" />
                          <span className="font-medium">Arch:</span>{" "}
                          {project.architect}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next milestone */}
                  <div>
                    <div
                      className="mb-2 text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Next Milestone
                    </div>
                    {project.next_milestone ? (
                      <div className="rounded-2xl bg-[#FAFAF7] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-3.5 w-3.5 text-stone-400" />
                            <span className="text-sm text-stone-700">
                              {project.next_milestone}
                            </span>
                          </div>
                          <span
                            className="text-[10px] font-medium tabular-nums text-stone-500"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {fmtDate(project.next_milestone_date)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400">
                        No milestone set
                      </p>
                    )}
                  </div>
                </div>

                {/* Entitlement status */}
                {entitlementEntries.length > 0 && (
                  <div className="mt-4 border-t border-stone-200 pt-4">
                    <div
                      className="mb-2 text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Entitlements
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entitlementEntries.map((e: any) => {
                        const entStatusColor =
                          e.status === "approved"
                            ? T.green
                            : e.status === "denied"
                              ? T.red
                              : T.yellow;
                        return (
                          <div
                            key={e.id}
                            className="flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1"
                          >
                            <StatusDot color={entStatusColor} />
                            <span className="text-xs text-stone-700">
                              {e.application_type}
                            </span>
                            <span className="text-[10px] capitalize text-stone-500">
                              {(e.status || "").replace(/_/g, " ")}
                            </span>
                            {e.approval_likelihood != null && (
                              <span
                                className="text-[10px] font-medium tabular-nums"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                  color:
                                    e.approval_likelihood >= 70
                                      ? T.green
                                      : e.approval_likelihood >= 40
                                        ? T.yellow
                                        : T.red,
                                }}
                              >
                                {e.approval_likelihood}%
                              </span>
                            )}
                          </div>
                        );
                      })}
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
              No development projects found.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function MetricCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {icon}
        <span
          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="mt-1 text-sm font-medium tabular-nums text-stone-900"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </div>
    </div>
  );
}
