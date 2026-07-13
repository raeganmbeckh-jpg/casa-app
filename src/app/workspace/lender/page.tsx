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
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import { Landmark, AlertTriangle, Activity, ShieldAlert } from "lucide-react";

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

export default async function LenderDashboardPage() {
  const supabase = createServerClient();

  const [{ data: activeLoans }, { data: loanApps }] = await Promise.all([
    supabase.from("active_loans").select("*"),
    supabase.from("loan_applications").select("*"),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "lender").order("created_at", { ascending: false }).limit(20);

  const loans = activeLoans ?? [];
  const apps = loanApps ?? [];

  // Critical alerts: DSCR < 1.0 or payment late
  const criticalAlerts = loans.filter(
    (l) => l.dscr_current < 1.0 || l.payment_status === "late"
  );

  // Portfolio metrics
  const totalBalance = loans.reduce(
    (sum, l) => sum + Number(l.current_balance ?? 0),
    0
  );
  const avgDscr =
    loans.length > 0
      ? loans.reduce((sum, l) => sum + Number(l.dscr_current ?? 0), 0) /
        loans.length
      : 0;
  const covenantBreaches = loans.filter(
    (l) => l.covenant_flags && l.covenant_flags.length > 0
  ).length;

  // Pipeline by status
  const pipelineByStatus: Record<string, typeof apps> = {};
  for (const app of apps) {
    const status = app.status ?? "unknown";
    if (!pipelineByStatus[status]) pipelineByStatus[status] = [];
    pipelineByStatus[status].push(app);
  }

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="THE CREDIT ENGINE"
        title="Lending Operations"
        subtitle="Portfolio health, pipeline velocity, and covenant compliance at a glance."
      />

      {/* ── RED ALERT STRIP ── */}
      {criticalAlerts.length > 0 && (
        <div className="mb-8">
          <SectionLabel>CRITICAL ALERTS</SectionLabel>
          <div className="mt-3 space-y-3">
            {criticalAlerts.map((loan, i) => (
              <StaggerIn key={loan.id} index={i}>
                <div
                  className="rounded-[2rem] border-2 border-red-600 bg-red-50 p-6"
                  style={{ boxShadow: "0 0 20px rgba(185,28,28,0.15)" }}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 rounded-xl bg-red-600 p-2">
                      <ShieldAlert className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-red-900">
                          {loan.property_address}
                        </h3>
                        <span className="rounded-full bg-red-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                          RED ALERT
                        </span>
                        {loan.payment_status === "late" && (
                          <span className="rounded-full bg-red-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-700 border border-red-300">
                            PAYMENT LATE
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-red-800">
                        {loan.borrower_name}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-6">
                        <div>
                          <span className="text-xs uppercase tracking-wider text-red-600">
                            DSCR
                          </span>
                          <p className="text-3xl font-bold text-red-700">
                            {Number(loan.dscr_current).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider text-red-600">
                            LTV
                          </span>
                          <p className="text-3xl font-bold text-red-700">
                            {Number(loan.ltv_current).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-wider text-red-600">
                            Balance
                          </span>
                          <p className="text-xl font-semibold text-red-800">
                            {fmtMoney(Number(loan.current_balance))}
                          </p>
                        </div>
                      </div>
                      {loan.covenant_flags && loan.covenant_flags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {loan.covenant_flags.map((flag: string, fi: number) => (
                            <span
                              key={fi}
                              className="rounded-full bg-red-100 border border-red-300 px-3 py-1 text-xs font-medium text-red-800"
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </StaggerIn>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero Stat ── */}
      <div className="mb-8">
        <StaggerIn index={0}>
          <DarkStatCard
            label="Loan Portfolio"
            value={fmtCompact(totalBalance)}
            subtitle={`${loans.length} active loans across the portfolio`}
            icon={<Landmark className="h-5 w-5 text-stone-400" />}
          />
        </StaggerIn>
      </div>

      {/* ── KPI Row ── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={1}>
          <KpiCard label="Active Loans" value={loans.length} note="Currently serviced" />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="Avg DSCR"
            value={avgDscr.toFixed(2)}
            note={avgDscr < 1.25 ? "Below target 1.25x" : "Healthy coverage"}
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="Pipeline Apps" value={apps.length} note="Loan applications" />
        </StaggerIn>
        <StaggerIn index={4}>
          <KpiCard
            label="Covenant Breaches"
            value={covenantBreaches}
            note={covenantBreaches > 0 ? "Require attention" : "All clear"}
          />
        </StaggerIn>
      </div>

      {/* ── Pipeline Summary ── */}
      <div>
        <SectionLabel>PIPELINE BY STATUS</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(pipelineByStatus).map(([status, statusApps], i) => {
            const totalVolume = statusApps.reduce(
              (sum, a) => sum + Number(a.loan_amount ?? 0),
              0
            );
            return (
              <StaggerIn key={status} index={i + 5}>
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        color={
                          status === "approved"
                            ? T.green
                            : status === "denied"
                            ? T.red
                            : T.yellow
                        }
                      />
                      <span className="text-sm font-medium capitalize text-stone-800">
                        {status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <YellowBadge>{`${statusApps.length}`}</YellowBadge>
                  </div>
                  <p className="mt-3 text-2xl font-medium tracking-tight text-stone-900">
                    {fmtCompact(totalVolume)}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {statusApps.length} application{statusApps.length !== 1 ? "s" : ""}
                  </p>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </div>

      <section className="mt-6">
        <SwarmPanel role="lender" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}
