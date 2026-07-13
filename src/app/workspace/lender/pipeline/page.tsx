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
import { ArrowRight, Filter } from "lucide-react";

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

const statusOrder = [
  "submitted",
  "in_review",
  "underwriting",
  "approved",
  "funded",
  "denied",
];

const statusColors: Record<string, string> = {
  submitted: "#9CA3AF",
  in_review: "#6366F1",
  underwriting: "#D97706",
  approved: T.green,
  funded: "#0EA5E9",
  denied: T.red,
};

function dscrColor(dscr: number): string {
  if (dscr < 1.0) return T.red;
  if (dscr < 1.25) return "#D97706";
  return T.green;
}

function ltvColor(ltv: number): string {
  if (ltv > 80) return T.red;
  if (ltv > 75) return "#D97706";
  return T.green;
}

function riskBadge(score: number) {
  if (score >= 70)
    return { label: "High Risk", bg: "#FEE2E2", text: T.red };
  if (score >= 40)
    return { label: "Medium", bg: "#FEF3C7", text: "#92700C" };
  return { label: "Low Risk", bg: "#DCFCE7", text: T.green };
}

export default async function PipelinePage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("loan_applications").select("*");
  const apps = data ?? [];

  // Group by status
  const grouped: Record<string, typeof apps> = {};
  for (const app of apps) {
    const status = app.status ?? "unknown";
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push(app);
  }

  // Sort statuses
  const sortedStatuses = Object.keys(grouped).sort((a, b) => {
    const ai = statusOrder.indexOf(a);
    const bi = statusOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  // KPIs
  const totalVolume = apps.reduce(
    (sum, a) => sum + Number(a.loan_amount ?? 0),
    0
  );
  const avgLtv =
    apps.length > 0
      ? apps.reduce((sum, a) => sum + Number(a.ltv ?? 0), 0) / apps.length
      : 0;
  const avgDscr =
    apps.length > 0
      ? apps.reduce((sum, a) => sum + Number(a.dscr ?? 0), 0) / apps.length
      : 0;

  return (
    <div
      className="min-h-screen px-6 py-10 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="DEAL FLOW"
        title="Loan Pipeline"
        subtitle="Every application tracked from submission through funding."
      />

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard label="Total Applications" value={apps.length} />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard label="Pipeline Volume" value={fmtCompact(totalVolume)} />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="Avg LTV" value={`${avgLtv.toFixed(1)}%`} />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="Avg DSCR" value={avgDscr.toFixed(2)} />
        </StaggerIn>
      </div>

      {/* Grouped stages */}
      <div className="space-y-10">
        {sortedStatuses.map((status, si) => {
          const statusApps = grouped[status];
          const stageVolume = statusApps.reduce(
            (sum, a) => sum + Number(a.loan_amount ?? 0),
            0
          );
          return (
            <div key={status}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusDot color={statusColors[status] ?? T.yellow} />
                  <SectionLabel>
                    {status.replace(/_/g, " ").toUpperCase()}
                  </SectionLabel>
                  <YellowBadge>{`${statusApps.length}`}</YellowBadge>
                </div>
                <span className="text-sm font-medium text-stone-600">
                  {fmtCompact(stageVolume)}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {statusApps.map((app, ai) => {
                  const risk = riskBadge(app.risk_score ?? 0);
                  return (
                    <StaggerIn key={app.id} index={si * 3 + ai}>
                      <Card>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-medium text-stone-900">
                              {app.borrower_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-stone-500">
                              {app.property_address}
                            </p>
                          </div>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: risk.bg,
                              color: risk.text,
                            }}
                          >
                            {risk.label}
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              Loan
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-stone-900">
                              {fmtCompact(Number(app.loan_amount))}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              LTV
                            </p>
                            <p
                              className="mt-0.5 text-sm font-semibold"
                              style={{ color: ltvColor(Number(app.ltv)) }}
                            >
                              {Number(app.ltv).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              DSCR
                            </p>
                            <p
                              className="mt-0.5 text-sm font-semibold"
                              style={{ color: dscrColor(Number(app.dscr)) }}
                            >
                              {Number(app.dscr).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              Credit
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-stone-800">
                              {app.credit_score}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              Rate
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-stone-800">
                              {Number(app.rate).toFixed(2)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">
                              Risk Score
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-stone-800">
                              {app.risk_score}
                            </p>
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
  );
}
