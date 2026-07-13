import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";

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

function dscrIndicator(dscr: number) {
  if (dscr < 1.0)
    return { label: "CRITICAL", color: T.red, bg: "#FEE2E2", icon: XCircle };
  if (dscr < 1.25)
    return { label: "CAUTION", color: "#D97706", bg: "#FEF3C7", icon: AlertTriangle };
  return { label: "HEALTHY", color: T.green, bg: "#DCFCE7", icon: ShieldCheck };
}

function ltvIndicator(ltv: number) {
  if (ltv > 80) return { label: "HIGH", color: T.red };
  if (ltv > 75) return { label: "ELEVATED", color: "#D97706" };
  return { label: "SAFE", color: T.green };
}

export default async function UnderwritingPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("loan_applications")
    .select("*")
    .order("risk_score", { ascending: false });

  const apps = data ?? [];

  const highRisk = apps.filter((a) => (a.risk_score ?? 0) >= 70).length;
  const dscrBelowOne = apps.filter((a) => Number(a.dscr ?? 0) < 1.0).length;
  const avgRiskScore =
    apps.length > 0
      ? apps.reduce((sum, a) => sum + (a.risk_score ?? 0), 0) / apps.length
      : 0;

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="RISK ANALYSIS"
        title="Underwriting"
        subtitle="Deep-dive risk assessment for every application. Sorted by risk score, highest first."
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard label="Applications" value={apps.length} note="Under review" />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="Avg Risk Score"
            value={avgRiskScore.toFixed(0)}
            note={avgRiskScore >= 60 ? "Elevated portfolio risk" : "Moderate risk"}
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="High Risk" value={highRisk} note="Risk score >= 70" />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="DSCR < 1.0" value={dscrBelowOne} note="Negative coverage" />
        </StaggerIn>
      </div>

      <SectionLabel>APPLICATION ANALYSIS</SectionLabel>
      <div className="mt-4 space-y-6">
        {apps.map((app, i) => {
          const dscr = Number(app.dscr ?? 0);
          const ltv = Number(app.ltv ?? 0);
          const dscrInfo = dscrIndicator(dscr);
          const ltvInfo = ltvIndicator(ltv);
          const rentToPiti =
            app.monthly_rent && app.monthly_piti
              ? Number(app.monthly_rent) / Number(app.monthly_piti)
              : null;
          const DscrIcon = dscrInfo.icon;

          return (
            <StaggerIn key={app.id} index={i}>
              <Card className={dscr < 1.0 ? "!border-red-400 !shadow-red-100" : ""}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      {app.borrower_name}
                    </h3>
                    <p className="text-sm text-stone-500">{app.property_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: dscrInfo.bg, color: dscrInfo.color }}
                    >
                      <DscrIcon className="mr-1 inline h-3 w-3" style={{ verticalAlign: "-1px" }} />
                      {dscrInfo.label}
                    </span>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-medium text-stone-700">
                      Risk: {app.risk_score ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Loan Amount</p>
                    <p className="mt-1 text-lg font-semibold text-stone-900">{fmtCompact(Number(app.loan_amount))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Property Value</p>
                    <p className="mt-1 text-lg font-semibold text-stone-900">{fmtCompact(Number(app.property_value))}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">LTV</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: ltvInfo.color }}>
                      {ltv.toFixed(1)}%
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: ltvInfo.color }}>{ltvInfo.label}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">DSCR</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: dscrInfo.color }}>
                      {dscr.toFixed(2)}
                    </p>
                    {dscr < 1.0 && <p className="text-[10px] font-bold text-red-600">BELOW BREAKEVEN</p>}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Credit Score</p>
                    <p className="mt-1 text-lg font-semibold text-stone-900">{app.credit_score}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Rate</p>
                    <p className="mt-1 text-lg font-semibold text-stone-900">{Number(app.rate).toFixed(2)}%</p>
                  </div>
                </div>

                {rentToPiti !== null && (
                  <div className="mt-4 rounded-xl bg-stone-50 p-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Monthly Rent</p>
                        <p className="text-sm font-medium text-stone-800">{fmtMoney(Number(app.monthly_rent))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Monthly PITI</p>
                        <p className="text-sm font-medium text-stone-800">{fmtMoney(Number(app.monthly_piti))}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Rent-to-PITI</p>
                        <p
                          className="text-sm font-bold"
                          style={{ color: rentToPiti >= 1.25 ? T.green : rentToPiti >= 1.0 ? "#D97706" : T.red }}
                        >
                          {rentToPiti.toFixed(2)}x
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <YellowBadge>{app.status ?? "unknown"}</YellowBadge>
                  <span className="text-xs text-stone-500">{app.term_years} year term</span>
                </div>
              </Card>
            </StaggerIn>
          );
        })}
      </div>
    </div>
  );
}
