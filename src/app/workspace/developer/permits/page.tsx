import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Scale,
  Calendar,
  User,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Gavel,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) => {
  if (!iso) return "---";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysBetween = (a: string, b: string) =>
  Math.round(
    (new Date(a).getTime() - new Date(b).getTime()) / 86400000,
  );

const STATUS_ORDER: Record<string, number> = {
  hearing_scheduled: 0,
  under_review: 1,
  submitted: 2,
  preparing: 3,
  appealed: 4,
  approved: 5,
  denied: 6,
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  preparing:         { bg: "#F3F4F6", text: "#374151" },
  submitted:         { bg: "#E0E7FF", text: "#3730A3" },
  under_review:      { bg: "#FEF3C7", text: "#92400E" },
  hearing_scheduled: { bg: "#DBEAFE", text: "#1E40AF" },
  approved:          { bg: "#D1FAE5", text: "#065F46" },
  denied:            { bg: "#FEE2E2", text: "#991B1B" },
  appealed:          { bg: "#FCE7F3", text: "#9D174D" },
};

const likelihoodColor = (pct: number) => {
  if (pct >= 80) return T.green;
  if (pct >= 50) return "#D97706";
  return T.red;
};

const fmtStatus = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default async function PermitsPage() {
  const supabase = createServerClient();
  const todayISO = new Date().toISOString().slice(0, 10);

  const [{ data: entitlements }, { data: projects }] = await Promise.all([
    supabase.from("entitlements").select("*"),
    supabase.from("dev_projects").select("id, name, address"),
  ]);

  const rows = entitlements ?? [];
  const projectList = projects ?? [];

  // Build project lookup
  const projectMap = new Map<string, { name: string; address: string }>();
  for (const p of projectList) {
    projectMap.set(p.id, { name: p.name, address: p.address });
  }

  // KPIs
  const total = rows.length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const pending = rows.filter(
    (r) => !["approved", "denied"].includes(r.status),
  ).length;
  const withLikelihood = rows.filter(
    (r) => r.approval_likelihood != null,
  );
  const avgLikelihood =
    withLikelihood.length > 0
      ? Math.round(
          withLikelihood.reduce(
            (s, r) => s + Number(r.approval_likelihood),
            0,
          ) / withLikelihood.length,
        )
      : 0;

  // Sort by status priority
  const sorted = [...rows].sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99),
  );

  if (rows.length === 0) {
    return (
      <div
        className="min-h-screen px-6 py-8 lg:px-10"
        style={{ backgroundColor: T.cream, color: T.ink }}
      >
        <PageTitle
          eyebrow="ENTITLEMENTS"
          title={
            <>
              Permits & <em className="italic text-stone-500">Approvals</em>.
            </>
          }
        />
        <Card>
          <div className="py-16 text-center">
            <Scale className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">
              No entitlement applications found.
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
        eyebrow="ENTITLEMENTS"
        title={
          <>
            Permits & <em className="italic text-stone-500">Approvals</em>.
          </>
        }
        subtitle={`Tracking ${total} entitlement applications across ${new Set(rows.map((r) => r.project_id)).size} projects.`}
      />

      {/* KPI Row */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="TOTAL APPLICATIONS" value={total} />
        <KpiCard
          label="APPROVED"
          value={approved}
          note={`${total > 0 ? Math.round((approved / total) * 100) : 0}% approval rate`}
        />
        <KpiCard label="PENDING" value={pending} />
        <KpiCard
          label="AVG LIKELIHOOD"
          value={`${avgLikelihood}%`}
          note={`${withLikelihood.length} assessed`}
        />
      </section>

      {/* Entitlement Cards */}
      <SectionLabel>ALL APPLICATIONS</SectionLabel>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((ent, i) => {
          const project = projectMap.get(ent.project_id);
          const ss = STATUS_STYLE[ent.status] ?? STATUS_STYLE.preparing;
          const likelihood = Number(ent.approval_likelihood ?? 0);
          const hearingDate = ent.next_hearing_date;
          const daysToHearing = hearingDate
            ? daysBetween(hearingDate, todayISO)
            : null;
          const hearingSoon =
            daysToHearing !== null && daysToHearing >= 0 && daysToHearing <= 30;
          const riskFactors: string[] = ent.risk_factors ?? [];

          return (
            <StaggerIn key={ent.id} index={i}>
              <Card className="relative flex flex-col" padded={false}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <IconChip>
                          <Gavel className="h-4 w-4 text-stone-700" />
                        </IconChip>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-stone-900">
                            {ent.application_type ?? "Application"}
                            {ent.application_number
                              ? ` #${ent.application_number}`
                              : ""}
                          </h3>
                          <p className="truncate text-xs text-stone-500">
                            {ent.jurisdiction ?? "---"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: ss.bg, color: ss.text }}
                    >
                      {fmtStatus(ent.status)}
                    </span>
                  </div>

                  {/* Project info */}
                  {project && (
                    <div className="mt-4 rounded-xl bg-stone-50 p-3">
                      <p className="text-sm font-medium text-stone-800">
                        {project.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        {ent.address ?? project.address}
                      </p>
                    </div>
                  )}

                  {/* Approval Likelihood Gauge */}
                  {ent.approval_likelihood != null && (
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span
                          className="text-[10px] uppercase tracking-[0.18em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Approval likelihood
                        </span>
                        <span
                          className="text-lg font-semibold"
                          style={{ color: likelihoodColor(likelihood) }}
                        >
                          {likelihood}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${likelihood}%`,
                            backgroundColor: likelihoodColor(likelihood),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Details row */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    {ent.assigned_planner && (
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <User className="h-3 w-3 text-stone-400" />
                        {ent.assigned_planner}
                      </div>
                    )}
                    {ent.submitted_date && (
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <FileText className="h-3 w-3 text-stone-400" />
                        {fmtDate(ent.submitted_date)}
                      </div>
                    )}
                  </div>

                  {/* Hearing date */}
                  {hearingDate && (
                    <div
                      className={`mt-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
                        hearingSoon
                          ? "bg-amber-50 text-amber-800"
                          : "bg-stone-50 text-stone-600"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Next hearing: {fmtDate(hearingDate)}
                      {daysToHearing !== null && daysToHearing >= 0 && (
                        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">
                          {daysToHearing === 0
                            ? "Today"
                            : `${daysToHearing}d away`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Risk factors */}
                  {riskFactors.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {riskFactors.map((rf, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {rf}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI Assessment */}
                  {ent.ai_assessment && (
                    <div className="mt-3 rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                      <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-stone-400">
                        <ShieldCheck className="h-3 w-3" />
                        AI assessment
                      </p>
                      <p className="text-xs leading-relaxed text-stone-600">
                        {ent.ai_assessment}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </StaggerIn>
          );
        })}
      </div>
    </div>
  );
}
