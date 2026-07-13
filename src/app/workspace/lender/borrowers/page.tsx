import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Users, ShieldAlert } from "lucide-react";

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

function paymentStatusStyle(status: string) {
  switch (status) {
    case "current":
      return { bg: "#DCFCE7", text: T.green, label: "Current" };
    case "late":
      return { bg: "#FEE2E2", text: T.red, label: "Late" };
    case "grace_period":
      return { bg: "#FEF3C7", text: "#D97706", label: "Grace Period" };
    default:
      return { bg: "#F3F4F6", text: "#6B7280", label: status };
  }
}

export default async function BorrowersPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("active_loans").select("*");
  const loans = data ?? [];

  const totalBalance = loans.reduce(
    (sum, l) => sum + Number(l.current_balance ?? 0),
    0
  );
  const lateCount = loans.filter((l) => l.payment_status === "late").length;
  const covenantIssues = loans.filter(
    (l) => l.covenant_flags && l.covenant_flags.length > 0
  ).length;

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="PORTFOLIO"
        title="Active Borrowers"
        subtitle="Every active loan relationship with real-time payment and covenant status."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard label="Active Borrowers" value={loans.length} note="Serviced loans" />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard label="Total Outstanding" value={fmtCompact(totalBalance)} />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="Late Payments"
            value={lateCount}
            note={lateCount > 0 ? "Requires follow-up" : "All current"}
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="Covenant Issues"
            value={covenantIssues}
            note={covenantIssues > 0 ? "Active flags" : "All compliant"}
          />
        </StaggerIn>
      </div>

      <SectionLabel>BORROWER DETAIL</SectionLabel>
      <div className="mt-4 space-y-5">
        {loans.map((loan, i) => {
          const dscr = Number(loan.dscr_current ?? 0);
          const ltv = Number(loan.ltv_current ?? 0);
          const isRedAlert = dscr < 1.0 || loan.payment_status === "late";
          const hasCovFlags = loan.covenant_flags && loan.covenant_flags.length > 0;
          const ps = paymentStatusStyle(loan.payment_status ?? "unknown");

          return (
            <StaggerIn key={loan.id} index={i}>
              <Card
                className={
                  isRedAlert ? "!border-2 !border-red-500 !shadow-lg !shadow-red-100" : ""
                }
              >
                {isRedAlert && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-bold text-red-700">
                      RED ALERT — Immediate attention required
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${isRedAlert ? "text-red-900" : "text-stone-900"}`}>
                      {loan.borrower_name}
                    </h3>
                    <p className="mt-0.5 text-sm text-stone-500">{loan.property_address}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: ps.bg, color: ps.text }}
                  >
                    {ps.label}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Current Balance</p>
                    <p className="mt-1 text-base font-semibold text-stone-900">
                      {fmtMoney(Number(loan.current_balance))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Rate</p>
                    <p className="mt-1 text-base font-semibold text-stone-900">
                      {Number(loan.rate).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">LTV</p>
                    <p
                      className="mt-1 text-base font-bold"
                      style={{ color: ltv > 80 ? T.red : ltv > 75 ? "#D97706" : T.green }}
                    >
                      {ltv.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">DSCR</p>
                    <p
                      className={`mt-1 font-bold ${dscr < 1.0 ? "text-3xl" : "text-base"}`}
                      style={{ color: dscr < 1.0 ? T.red : dscr < 1.25 ? "#D97706" : T.green }}
                    >
                      {dscr.toFixed(2)}
                    </p>
                    {dscr < 1.0 && (
                      <p className="text-[10px] font-bold text-red-600">COVENANT BREACH</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Origination</p>
                    <p className="mt-1 text-sm text-stone-700">{loan.origination_date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Maturity</p>
                    <p className="mt-1 text-sm text-stone-700">{loan.maturity_date}</p>
                  </div>
                </div>

                {hasCovFlags && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {loan.covenant_flags.map((flag: string, fi: number) => (
                      <span
                        key={fi}
                        className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-800"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </StaggerIn>
          );
        })}
      </div>
    </div>
  );
}
