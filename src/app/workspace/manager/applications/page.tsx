import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
  ListContainer,
  ListHeader,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  UserCheck,
  Search,
  XCircle,
  Inbox,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string | null) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusConfig: Record<
  string,
  { color: string; icon: typeof Inbox; label: string }
> = {
  submitted: { color: "rgba(120,113,108,1)", icon: Inbox, label: "Submitted" },
  screening: { color: T.yellow, icon: Search, label: "Screening" },
  approved: { color: T.green, icon: UserCheck, label: "Approved" },
  denied: { color: T.red, icon: XCircle, label: "Denied" },
};

const pipelineOrder = ["submitted", "screening", "approved", "denied"];

export default async function ApplicationsPage() {
  const supabase = createServerClient();

  const [{ data: applications }, { data: properties }] = await Promise.all([
    supabase
      .from("rental_applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("id, address"),
  ]);

  const appList = applications ?? [];
  const propMap = new Map(
    (properties ?? []).map((p: any) => [p.id, p.address])
  );

  // KPIs
  const totalApps = appList.length;
  const screeningCount = appList.filter(
    (a) => a.status === "screening"
  ).length;
  const approvedCount = appList.filter((a) => a.status === "approved").length;
  const deniedCount = appList.filter((a) => a.status === "denied").length;

  // Group by status for pipeline view
  const grouped = pipelineOrder.map((status) => ({
    status,
    apps: appList.filter((a) => (a.status || "submitted") === status),
  }));

  return (
    <div style={{ backgroundColor: T.cream, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageTitle eyebrow="APPLICATIONS" title="Rental Applications" />

        {/* KPI Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total Applications"
            value={totalApps}
            note="All time"
          />
          <KpiCard
            label="Screening"
            value={screeningCount}
            note="In progress"
          />
          <KpiCard
            label="Approved"
            value={approvedCount}
            note="Ready to lease"
          />
          <KpiCard label="Denied" value={deniedCount} note="Not qualified" />
        </div>

        {/* Pipeline View */}
        <div className="grid gap-6 lg:grid-cols-4">
          {grouped.map((group) => {
            const conf = statusConfig[group.status] || statusConfig.submitted;
            const Icon = conf.icon;

            return (
              <div key={group.status}>
                {/* Column header */}
                <div className="mb-3 flex items-center gap-2">
                  <StatusDot color={conf.color} />
                  <SectionLabel>
                    {`${conf.label.toUpperCase()} (${group.apps.length})`}
                  </SectionLabel>
                </div>

                {/* Application cards */}
                <div className="space-y-3">
                  {group.apps.length === 0 && (
                    <div
                      className="rounded-[2rem] border border-dashed border-stone-200 p-6 text-center text-xs text-stone-400"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      No applications
                    </div>
                  )}
                  {group.apps.map((app, i) => {
                    const address = app.property_id
                      ? propMap.get(app.property_id) || "Unknown"
                      : "Unknown";
                    const income = Number(app.monthly_income) || 0;

                    return (
                      <StaggerIn key={app.id} index={i}>
                        <Card className="!p-5">
                          {/* Applicant name */}
                          <p className="text-sm font-medium text-stone-900">
                            {app.applicant_name || "Unknown Applicant"}
                          </p>

                          {/* Property + unit */}
                          <p className="mt-1 text-xs text-stone-500">
                            {address}
                            {app.unit ? ` - ${app.unit}` : ""}
                          </p>

                          {/* Details grid */}
                          <div className="mt-3 space-y-2">
                            {/* Income */}
                            <div className="flex items-center gap-2 text-xs text-stone-600">
                              <DollarSign
                                size={12}
                                className="text-stone-400"
                              />
                              <span
                                style={{ fontFamily: "var(--font-geist-mono)" }}
                              >
                                {fmtMoney(income)}
                              </span>
                              <span className="text-stone-400">/mo income</span>
                            </div>

                            {/* Employer */}
                            {app.employer && (
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <Briefcase
                                  size={12}
                                  className="text-stone-400"
                                />
                                {app.employer}
                              </div>
                            )}

                            {/* Move-in date */}
                            {app.desired_move_in && (
                              <div className="flex items-center gap-2 text-xs text-stone-600">
                                <Calendar
                                  size={12}
                                  className="text-stone-400"
                                />
                                Move-in: {fmtDate(app.desired_move_in)}
                              </div>
                            )}

                            {/* Fee paid */}
                            <div className="flex items-center gap-2 text-xs">
                              {app.app_fee_paid ? (
                                <>
                                  <CheckCircle2
                                    size={12}
                                    style={{ color: T.green }}
                                  />
                                  <span style={{ color: T.green }}>
                                    Fee paid
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={12} className="text-stone-300" />
                                  <span className="text-stone-400">
                                    Fee unpaid
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </StaggerIn>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
