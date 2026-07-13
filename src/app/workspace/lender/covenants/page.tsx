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
import { ShieldAlert, ShieldCheck, AlertTriangle, Siren } from "lucide-react";

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

export default async function CovenantsPage() {
  const supabase = createServerClient();

  const [{ data: activeLoans }, debtResult] = await Promise.all([
    supabase.from("active_loans").select("*"),
    supabase.from("debt_stack").select("*"),
  ]);

  const debtStack = debtResult.data;

  const loans = activeLoans ?? [];
  const debt = debtStack ?? [];

  // Loans with covenant issues
  const breachLoans = loans.filter(
    (l) => l.covenant_flags && l.covenant_flags.length > 0
  );
  const compliantLoans = loans.filter(
    (l) => !l.covenant_flags || l.covenant_flags.length === 0
  );

  const totalBreaches = breachLoans.reduce(
    (sum, l) => sum + (l.covenant_flags?.length ?? 0),
    0
  );
  const breachExposure = breachLoans.reduce(
    (sum, l) => sum + Number(l.current_balance ?? 0),
    0
  );

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="COVENANT MONITORING"
        title="Covenant Compliance"
        subtitle="Real-time covenant tracking across the entire loan portfolio. Breaches demand immediate action."
      />

      {/* ══════════════════════════════════════════════════════════════
          RED ALERT SECTION — 88 Citrus Blvd tracer + all breaches
          ══════════════════════════════════════════════════════════════ */}
      {breachLoans.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <Siren className="h-5 w-5 text-red-600" />
            <SectionLabel>RED ALERT — COVENANT BREACHES</SectionLabel>
          </div>

          <div className="space-y-5">
            {breachLoans.map((loan, i) => {
              const dscr = Number(loan.dscr_current ?? 0);
              const ltv = Number(loan.ltv_current ?? 0);
              const isLate = loan.payment_status === "late";

              return (
                <StaggerIn key={loan.id} index={i}>
                  <div
                    className="rounded-[2.5rem] border-2 border-red-600 bg-red-50 p-8"
                    style={{ boxShadow: "0 0 30px rgba(185,28,28,0.2)" }}
                  >
                    {/* Alert header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 rounded-2xl bg-red-600 p-3">
                          <ShieldAlert className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-red-900">
                              {loan.property_address}
                            </h3>
                            <span className="rounded-full bg-red-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white animate-pulse">
                              RED ALERT
                            </span>
                            {isLate && (
                              <span className="rounded-full border-2 border-red-400 bg-red-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-red-700">
                                PAYMENT LATE
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-red-800">
                            {loan.borrower_name} &middot;{" "}
                            {fmtMoney(Number(loan.current_balance))} outstanding
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Big DSCR number */}
                    <div className="mt-6 flex flex-wrap gap-10">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-red-600 font-semibold">
                          DSCR — Debt Service Coverage
                        </p>
                        <p className="text-6xl font-black text-red-700 tracking-tight">
                          {dscr.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm font-bold text-red-600">
                          {dscr < 1.0
                            ? "BELOW 1.0 THRESHOLD — COVENANT BREACH"
                            : dscr < 1.25
                            ? "Below 1.25 watch level"
                            : "Within covenant"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-red-600 font-semibold">
                          LTV — Loan-to-Value
                        </p>
                        <p className="text-6xl font-black text-red-700 tracking-tight">
                          {ltv.toFixed(1)}%
                        </p>
                        <p className="mt-1 text-sm font-bold text-red-600">
                          {ltv > 80
                            ? "ABOVE 80% TRIGGER"
                            : ltv > 75
                            ? "Elevated"
                            : "Within covenant"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-red-600 font-semibold">
                          Payment Status
                        </p>
                        <p className="text-4xl font-black text-red-700 uppercase tracking-tight">
                          {loan.payment_status}
                        </p>
                      </div>
                    </div>

                    {/* Covenant flags */}
                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-wider text-red-600 font-semibold mb-2">
                        ACTIVE COVENANT FLAGS
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {loan.covenant_flags.map((flag: string, fi: number) => (
                          <span
                            key={fi}
                            className="rounded-full border-2 border-red-400 bg-white px-4 py-1.5 text-sm font-semibold text-red-800"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </StaggerIn>
              );
            })}
          </div>
        </div>
      )}

      {/* Breach summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={breachLoans.length}>
          <DarkStatCard
            label="Covenant Breaches"
            value={breachLoans.length}
            subtitle={`${totalBreaches} total flags across ${breachLoans.length} loan${breachLoans.length !== 1 ? "s" : ""}`}
            icon={<ShieldAlert className="h-5 w-5 text-red-400" />}
          />
        </StaggerIn>
        <StaggerIn index={breachLoans.length + 1}>
          <KpiCard
            label="Breach Exposure"
            value={fmtCompact(breachExposure)}
            note="Outstanding on flagged loans"
          />
        </StaggerIn>
        <StaggerIn index={breachLoans.length + 2}>
          <KpiCard
            label="Compliant Loans"
            value={compliantLoans.length}
            note="No active flags"
          />
        </StaggerIn>
        <StaggerIn index={breachLoans.length + 3}>
          <KpiCard
            label="Total Monitored"
            value={loans.length}
            note="Active loan portfolio"
          />
        </StaggerIn>
      </div>

      {/* Debt stack covenant thresholds */}
      {debt.length > 0 && (
        <div className="mb-8">
          <SectionLabel>DEBT STACK COVENANT THRESHOLDS</SectionLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {debt.map((d, i) => (
              <StaggerIn key={`${d.property_id}-${d.lender}-${i}`} index={i}>
                <Card>
                  <p className="text-sm font-medium text-stone-900">
                    {d.lender}
                  </p>
                  <p className="text-xs text-stone-500">{d.loan_type}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Balance</p>
                      <p className="text-sm font-semibold text-stone-800">
                        {fmtCompact(Number(d.current_balance ?? 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Rate</p>
                      <p className="text-sm font-semibold text-stone-800">
                        {Number(d.interest_rate ?? 0).toFixed(2)}%
                      </p>
                    </div>
                    {d.dscr_covenant && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">DSCR Covenant</p>
                        <p className="text-sm font-semibold text-stone-800">
                          {Number(d.dscr_covenant).toFixed(2)}x
                        </p>
                      </div>
                    )}
                    {d.ltv_covenant && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">LTV Covenant</p>
                        <p className="text-sm font-semibold text-stone-800">
                          {Number(d.ltv_covenant).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        </div>
      )}

      {/* Compliant loans */}
      {compliantLoans.length > 0 && (
        <div>
          <SectionLabel>COMPLIANT LOANS</SectionLabel>
          <div className="mt-4 space-y-3">
            {compliantLoans.map((loan, i) => {
              const dscr = Number(loan.dscr_current ?? 0);
              const ltv = Number(loan.ltv_current ?? 0);
              return (
                <StaggerIn key={loan.id} index={i + breachLoans.length + 4}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="text-base font-medium text-stone-900">
                            {loan.property_address}
                          </h3>
                          <p className="text-xs text-stone-500">{loan.borrower_name}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-green-50 border border-green-200 px-3 py-0.5 text-[11px] font-medium text-green-800">
                        COMPLIANT
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-8">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">DSCR</span>
                        <p
                          className="text-lg font-bold"
                          style={{ color: dscr < 1.25 ? "#D97706" : T.green }}
                        >
                          {dscr.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">LTV</span>
                        <p
                          className="text-lg font-bold"
                          style={{ color: ltv > 75 ? "#D97706" : T.green }}
                        >
                          {ltv.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">Balance</span>
                        <p className="text-lg font-semibold text-stone-900">
                          {fmtCompact(Number(loan.current_balance))}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400">Payment</span>
                        <p className="text-sm font-medium text-green-700 capitalize">
                          {loan.payment_status}
                        </p>
                      </div>
                    </div>
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
