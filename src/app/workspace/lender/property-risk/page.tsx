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
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { MapPin, AlertTriangle, Shield, Building2 } from "lucide-react";

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

type RiskProperty = {
  address: string;
  borrower: string;
  ltv: number;
  dscr: number;
  balance: number;
  source: "active_loan" | "application";
  riskFlags: string[];
};

export default async function PropertyRiskPage() {
  const supabase = createServerClient();

  const [{ data: activeLoans }, { data: loanApps }, appraisalResult] =
    await Promise.all([
      supabase.from("active_loans").select("*"),
      supabase.from("loan_applications").select("*"),
      supabase.from("appraisals").select("*"),
    ]);

  const appraisals = appraisalResult.data;

  const loans = activeLoans ?? [];
  const apps = loanApps ?? [];
  const appraisalList = appraisals ?? [];

  // Build unified risk view
  const riskProperties: RiskProperty[] = [];

  for (const loan of loans) {
    const ltv = Number(loan.ltv_current ?? 0);
    const dscr = Number(loan.dscr_current ?? 0);
    const flags: string[] = [];
    if (ltv > 80) flags.push("LTV > 80%");
    if (dscr < 1.0) flags.push("DSCR < 1.0");
    if (dscr < 1.25 && dscr >= 1.0) flags.push("DSCR watch (< 1.25)");
    if (loan.payment_status === "late") flags.push("Payment late");
    if (loan.covenant_flags?.length > 0) flags.push(...loan.covenant_flags);

    riskProperties.push({
      address: loan.property_address,
      borrower: loan.borrower_name,
      ltv,
      dscr,
      balance: Number(loan.current_balance ?? 0),
      source: "active_loan",
      riskFlags: flags,
    });
  }

  for (const app of apps) {
    const ltv = Number(app.ltv ?? 0);
    const dscr = Number(app.dscr ?? 0);
    const flags: string[] = [];
    if (ltv > 80) flags.push("LTV > 80%");
    if (dscr < 1.0) flags.push("DSCR < 1.0");
    if ((app.risk_score ?? 0) >= 70) flags.push("High risk score");

    riskProperties.push({
      address: app.property_address,
      borrower: app.borrower_name,
      ltv,
      dscr,
      balance: Number(app.loan_amount ?? 0),
      source: "application",
      riskFlags: flags,
    });
  }

  // Sort: most risk flags first, then DSCR ascending
  riskProperties.sort((a, b) => {
    if (b.riskFlags.length !== a.riskFlags.length)
      return b.riskFlags.length - a.riskFlags.length;
    return a.dscr - b.dscr;
  });

  const highRiskCount = riskProperties.filter((p) => p.riskFlags.length > 0).length;
  const highLtv = riskProperties.filter((p) => p.ltv > 80).length;
  const lowDscr = riskProperties.filter((p) => p.dscr < 1.0).length;

  // LTV buckets
  const ltvBuckets = [
    { label: "< 60%", count: riskProperties.filter((p) => p.ltv < 60).length, color: T.green },
    { label: "60-70%", count: riskProperties.filter((p) => p.ltv >= 60 && p.ltv < 70).length, color: T.green },
    { label: "70-75%", count: riskProperties.filter((p) => p.ltv >= 70 && p.ltv < 75).length, color: T.yellow },
    { label: "75-80%", count: riskProperties.filter((p) => p.ltv >= 75 && p.ltv < 80).length, color: "#D97706" },
    { label: "> 80%", count: riskProperties.filter((p) => p.ltv >= 80).length, color: T.red },
  ];

  // DSCR distribution
  const dscrBuckets = [
    { label: "< 1.0", count: riskProperties.filter((p) => p.dscr < 1.0).length, color: T.red },
    { label: "1.0-1.15", count: riskProperties.filter((p) => p.dscr >= 1.0 && p.dscr < 1.15).length, color: "#D97706" },
    { label: "1.15-1.25", count: riskProperties.filter((p) => p.dscr >= 1.15 && p.dscr < 1.25).length, color: T.yellow },
    { label: "1.25-1.5", count: riskProperties.filter((p) => p.dscr >= 1.25 && p.dscr < 1.5).length, color: T.green },
    { label: "> 1.5", count: riskProperties.filter((p) => p.dscr >= 1.5).length, color: T.green },
  ];

  return (
    <div className="min-h-screen px-6 py-10 lg:px-10" style={{ backgroundColor: T.cream }}>
      <PageTitle
        eyebrow="RISK INTELLIGENCE"
        title="Property Risk"
        subtitle="Unified risk view across active loans and pipeline applications."
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard label="Properties Tracked" value={riskProperties.length} />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="Flagged Properties"
            value={highRiskCount}
            note="With risk flags"
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="LTV > 80%" value={highLtv} note="Over-leveraged" />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="DSCR < 1.0" value={lowDscr} note="Negative coverage" />
        </StaggerIn>
      </div>

      {/* Risk Matrix */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <StaggerIn index={4}>
          <Card>
            <SectionLabel>LTV DISTRIBUTION</SectionLabel>
            <div className="mt-4 space-y-3">
              {ltvBuckets.map((bucket) => {
                const maxCount = Math.max(...ltvBuckets.map((b) => b.count), 1);
                const pct = (bucket.count / maxCount) * 100;
                return (
                  <div key={bucket.label} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-medium text-stone-600">
                      {bucket.label}
                    </span>
                    <div className="flex-1 h-6 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: bucket.color,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-stone-800">
                      {bucket.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </StaggerIn>

        <StaggerIn index={5}>
          <Card>
            <SectionLabel>DSCR DISTRIBUTION</SectionLabel>
            <div className="mt-4 space-y-3">
              {dscrBuckets.map((bucket) => {
                const maxCount = Math.max(...dscrBuckets.map((b) => b.count), 1);
                const pct = (bucket.count / maxCount) * 100;
                return (
                  <div key={bucket.label} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-medium text-stone-600">
                      {bucket.label}
                    </span>
                    <div className="flex-1 h-6 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct, 4)}%`,
                          backgroundColor: bucket.color,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-stone-800">
                      {bucket.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </StaggerIn>
      </div>

      {/* Appraisals if available */}
      {appraisalList.length > 0 && (
        <div className="mb-8">
          <SectionLabel>APPRAISAL DATA</SectionLabel>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appraisalList.map((appraisal, i) => (
              <StaggerIn key={appraisal.id} index={i + 6}>
                <Card>
                  <p className="text-sm font-medium text-stone-900">{appraisal.address}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {appraisal.attom_avm && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">AVM</p>
                        <p className="font-semibold text-stone-800">{fmtCompact(Number(appraisal.attom_avm))}</p>
                      </div>
                    )}
                    {appraisal.ai_estimated_value && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">AI Estimate</p>
                        <p className="font-semibold text-stone-800">{fmtCompact(Number(appraisal.ai_estimated_value))}</p>
                      </div>
                    )}
                    {appraisal.consensus_value && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Consensus</p>
                        <p className="font-semibold text-stone-800">{fmtCompact(Number(appraisal.consensus_value))}</p>
                      </div>
                    )}
                    {appraisal.ai_confidence_score && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-400">AI Confidence</p>
                        <p className="font-semibold text-stone-800">{Number(appraisal.ai_confidence_score).toFixed(0)}%</p>
                      </div>
                    )}
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        </div>
      )}

      {/* Property list with risk highlights */}
      <SectionLabel>ALL PROPERTIES BY RISK</SectionLabel>
      <div className="mt-4 space-y-4">
        {riskProperties.map((prop, i) => {
          const isHighRisk = prop.riskFlags.length > 0;
          const isCritical = prop.dscr < 1.0 || prop.ltv > 80;
          return (
            <StaggerIn key={`${prop.source}-${prop.address}-${i}`} index={i + 6}>
              <Card
                className={
                  isCritical
                    ? "!border-red-400 !shadow-red-100"
                    : isHighRisk
                    ? "!border-amber-300"
                    : ""
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <IconChip>
                      {isCritical ? (
                        <AlertTriangle className="h-4 w-4 text-red-700" />
                      ) : (
                        <Building2 className="h-4 w-4 text-stone-700" />
                      )}
                    </IconChip>
                    <div>
                      <h3 className={`text-base font-semibold ${isCritical ? "text-red-900" : "text-stone-900"}`}>
                        {prop.address}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {prop.borrower} &middot;{" "}
                        <span className="capitalize">{prop.source.replace("_", " ")}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-stone-800">
                    {fmtCompact(prop.balance)}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">LTV</span>
                    <p
                      className="text-lg font-bold"
                      style={{ color: prop.ltv > 80 ? T.red : prop.ltv > 75 ? "#D97706" : T.green }}
                    >
                      {prop.ltv.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">DSCR</span>
                    <p
                      className="text-lg font-bold"
                      style={{ color: prop.dscr < 1.0 ? T.red : prop.dscr < 1.25 ? "#D97706" : T.green }}
                    >
                      {prop.dscr.toFixed(2)}
                    </p>
                  </div>
                </div>

                {prop.riskFlags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {prop.riskFlags.map((flag, fi) => (
                      <span
                        key={fi}
                        className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: flag.includes("DSCR below") || flag.includes("DSCR < 1") || flag.includes("Payment late")
                            ? "#FEE2E2"
                            : "#FEF3C7",
                          borderColor: flag.includes("DSCR below") || flag.includes("DSCR < 1") || flag.includes("Payment late")
                            ? "#FECACA"
                            : "#FDE68A",
                          color: flag.includes("DSCR below") || flag.includes("DSCR < 1") || flag.includes("Payment late")
                            ? T.red
                            : "#92700C",
                        }}
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
