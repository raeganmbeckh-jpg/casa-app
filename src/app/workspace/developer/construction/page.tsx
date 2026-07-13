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
import {
  HardHat,
  Target,
  CalendarClock,
  FileQuestion,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string | null) => {
  if (!iso) return "--";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysBetween = (a: string, b: string) =>
  Math.round(
    (new Date(a + "T00:00:00").getTime() -
      new Date(b + "T00:00:00").getTime()) /
      86400000,
  );

const priorityStyle = (priority: string) => {
  switch (priority) {
    case "urgent":
      return {
        bg: "rgba(185,28,28,0.1)",
        text: T.red,
        label: "URGENT",
      };
    case "high":
      return {
        bg: "rgba(234,88,12,0.1)",
        text: "#EA580C",
        label: "HIGH",
      };
    case "medium":
      return {
        bg: "rgba(249,217,106,0.2)",
        text: "#92700C",
        label: "MEDIUM",
      };
    case "low":
      return {
        bg: "rgba(168,162,158,0.15)",
        text: T.dim,
        label: "LOW",
      };
    default:
      return {
        bg: "rgba(17,17,17,0.06)",
        text: T.dim,
        label: priority?.toUpperCase() || "--",
      };
  }
};

const rfiStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return T.yellow;
    case "responded":
      return T.green;
    case "closed":
      return T.dim;
    default:
      return T.dim;
  }
};

export default async function ConstructionPage() {
  const supabase = createServerClient();

  const todayISO = new Date().toISOString().split("T")[0];

  const [{ data: allProjects }, { data: rfis }, { data: budgetItems }] =
    await Promise.all([
      supabase.from("dev_projects").select("*").order("name"),
      supabase
        .from("rfis")
        .select("*")
        .order("submitted_date", { ascending: false }),
      supabase.from("budget_line_items").select("*"),
    ]);

  const projectList = allProjects ?? [];
  const rfiList = rfis ?? [];
  const budgetList = budgetItems ?? [];

  // ── Filter construction projects ──────────────────────────────
  const constructionProjects = projectList.filter(
    (p) => p.phase === "construction",
  );

  // ── Project name lookup ───────────────────────────────────────
  const projectNameById = (id: string) =>
    projectList.find((p) => p.id === id)?.name ?? "Unknown";

  // ── RFIs for construction projects ────────────────────────────
  const constructionProjectIds = new Set(
    constructionProjects.map((p) => p.id),
  );
  const constructionRfis = rfiList.filter((r) =>
    constructionProjectIds.has(r.project_id),
  );

  // ── Budget items for construction projects ────────────────────
  const constructionBudgetItems = budgetList.filter((b) =>
    constructionProjectIds.has(b.project_id),
  );

  // ── KPIs ──────────────────────────────────────────────────────
  const activeBuilds = constructionProjects.length;
  const avgCompletion =
    activeBuilds > 0
      ? Math.round(
          constructionProjects.reduce(
            (s, p) => s + Number(p.pct_complete || 0),
            0,
          ) / activeBuilds,
        )
      : 0;
  const openRfis = constructionRfis.filter(
    (r) => r.status === "open",
  ).length;
  const urgentRfis = constructionRfis.filter(
    (r) => r.priority === "urgent" || r.priority === "high",
  ).length;
  const totalConstructionBudget = constructionProjects.reduce(
    (s, p) => s + Number(p.total_budget || 0),
    0,
  );

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      {/* ── Title ──────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="CONSTRUCTION"
        title={
          <>
            Build <em className="italic text-stone-500">Progress</em>
          </>
        }
        subtitle="Track active construction projects, milestones, and RFIs in real time."
      />

      {constructionProjects.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <HardHat className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-lg font-medium text-stone-600">
              No projects currently in construction
            </p>
            <p className="mt-1 text-sm text-stone-400">
              Projects will appear here when they reach the construction
              phase.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* ── KPIs ─────────────────────────────────────────────── */}
          <section className="mb-10 grid gap-4 lg:grid-cols-4">
            <DarkStatCard
              label="ACTIVE BUILDS"
              value={activeBuilds}
              subtitle={`${fmtMoney(totalConstructionBudget)} total construction budget`}
              progress={avgCompletion}
              icon={<HardHat className="h-5 w-5 text-stone-400" />}
            />
            <KpiCard
              label="AVG COMPLETION"
              value={`${avgCompletion}%`}
              note="Across active builds"
            />
            <KpiCard
              label="OPEN RFIS"
              value={openRfis}
              note={`${urgentRfis} urgent/high priority`}
            />
            <KpiCard
              label="TOTAL RFIS"
              value={constructionRfis.length}
              note="All construction RFIs"
            />
          </section>

          {/* ── Project Progress Cards ───────────────────────────── */}
          <section className="mb-10">
            <SectionLabel>PROJECT PROGRESS</SectionLabel>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              {constructionProjects.map((project, i) => {
                const pct = Number(project.pct_complete || 0);
                const startDate = project.start_date;
                const endDate = project.estimated_completion;

                // Timeline calculation
                let timelineProgress = 0;
                let daysRemaining = 0;
                let totalDuration = 0;
                if (startDate && endDate) {
                  totalDuration = daysBetween(endDate, startDate);
                  const elapsed = daysBetween(todayISO, startDate);
                  timelineProgress =
                    totalDuration > 0
                      ? Math.min(
                          100,
                          Math.max(0, (elapsed / totalDuration) * 100),
                        )
                      : 0;
                  daysRemaining = Math.max(
                    0,
                    daysBetween(endDate, todayISO),
                  );
                }

                return (
                  <StaggerIn key={project.id} index={i}>
                    <Card>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3
                            className="text-xl tracking-tight text-stone-900"
                            style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 500,
                            }}
                          >
                            {project.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {project.address}, {project.city}
                          </p>
                        </div>
                        <div
                          className="text-3xl font-semibold tabular-nums text-stone-900"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          {pct}%
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-5">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200/60">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                pct >= 75
                                  ? T.green
                                  : pct >= 40
                                    ? T.yellow
                                    : T.ink,
                            }}
                          />
                        </div>
                      </div>

                      {/* Timeline visual */}
                      {startDate && endDate && (
                        <div className="mt-5 rounded-2xl bg-[#FAFAF7] p-4">
                          <div className="flex items-center justify-between text-xs text-stone-500">
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {fmtDate(startDate)}
                            </div>
                            <div className="flex items-center gap-1 text-stone-400">
                              <ArrowRight className="h-3 w-3" />
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" />
                              {fmtDate(endDate)}
                            </div>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200/60">
                            <div
                              className="h-full rounded-full bg-stone-800"
                              style={{
                                width: `${timelineProgress}%`,
                              }}
                            />
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span
                              className="text-[10px] uppercase tracking-[0.14em] text-stone-400"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              Timeline
                            </span>
                            <span
                              className="text-xs font-medium tabular-nums"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                                color:
                                  daysRemaining <= 60 ? T.red : T.ink,
                              }}
                            >
                              {daysRemaining} days remaining
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Next milestone */}
                      {project.next_milestone && (
                        <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-stone-400" />
                            <span className="text-sm font-medium text-stone-700">
                              {project.next_milestone}
                            </span>
                          </div>
                          {project.next_milestone_date && (
                            <span
                              className="text-xs font-medium tabular-nums text-stone-500"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              {fmtDate(project.next_milestone_date)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Budget snapshot */}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#FAFAF7] px-3 py-2">
                          <div
                            className="text-[9px] uppercase tracking-[0.14em] text-stone-400"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            Budget
                          </div>
                          <div
                            className="mt-0.5 text-sm font-medium tabular-nums text-stone-800"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            {fmtMoney(Number(project.total_budget || 0))}
                          </div>
                        </div>
                        <div className="rounded-xl bg-[#FAFAF7] px-3 py-2">
                          <div
                            className="text-[9px] uppercase tracking-[0.14em] text-stone-400"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            Spent
                          </div>
                          <div
                            className="mt-0.5 text-sm font-medium tabular-nums text-stone-800"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                            }}
                          >
                            {fmtMoney(
                              Number(project.spent_to_date || 0),
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </StaggerIn>
                );
              })}
            </div>
          </section>

          {/* ── RFIs Section ─────────────────────────────────────── */}
          <section>
            <ListContainer>
              <ListHeader
                label="REQUESTS FOR INFORMATION"
                action={
                  <YellowBadge>{`${openRfis} open`}</YellowBadge>
                }
              />
              <div className="px-4 pb-4">
                {constructionRfis.length > 0 ? (
                  constructionRfis.map((rfi: any, i) => {
                    const ps = priorityStyle(rfi.priority);
                    const statusColor = rfiStatusColor(rfi.status);

                    return (
                      <ListRow
                        key={rfi.id}
                        last={i === constructionRfis.length - 1}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <IconChip>
                            <FileQuestion className="h-4 w-4 text-stone-800" />
                          </IconChip>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs font-medium tabular-nums text-stone-500"
                                style={{
                                  fontFamily:
                                    "var(--font-geist-mono)",
                                }}
                              >
                                RFI-{rfi.rfi_number}
                              </span>
                              <span className="truncate text-sm font-medium text-stone-900">
                                {rfi.title}
                              </span>
                              <span
                                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                                style={{
                                  backgroundColor: ps.bg,
                                  color: ps.text,
                                }}
                              >
                                {ps.label}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-stone-500">
                              <span>
                                {projectNameById(rfi.project_id)}
                              </span>
                              {rfi.submitted_by && (
                                <>
                                  <span>&middot;</span>
                                  <span>From: {rfi.submitted_by}</span>
                                </>
                              )}
                              {rfi.assigned_to && (
                                <>
                                  <span>&middot;</span>
                                  <span>To: {rfi.assigned_to}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusDot color={statusColor} />
                          <span className="text-xs capitalize text-stone-600">
                            {(rfi.status || "").replace(/_/g, " ")}
                          </span>
                          {rfi.due_date && (
                            <span
                              className="ml-2 text-[10px] tabular-nums text-stone-400"
                              style={{
                                fontFamily:
                                  "var(--font-geist-mono)",
                              }}
                            >
                              Due {fmtDate(rfi.due_date)}
                            </span>
                          )}
                        </div>
                      </ListRow>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-stone-400">
                    No RFIs for construction projects.
                  </p>
                )}
              </div>
            </ListContainer>
          </section>
        </>
      )}
    </div>
  );
}
