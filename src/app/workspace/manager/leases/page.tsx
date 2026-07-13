import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  YellowBadge,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  FileText,
  CalendarClock,
  RefreshCw,
  DollarSign,
  ShieldCheck,
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

function daysRemaining(endDate: string | null): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function esignColor(status: string | null): string {
  if (status === "signed" || status === "completed") return T.green;
  if (status === "pending" || status === "sent") return T.yellow;
  return "rgba(120,113,108,1)";
}

function esignLabel(status: string | null): string {
  if (!status) return "Not sent";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function LeasesPage() {
  const supabase = createServerClient();

  const [{ data: leases }, { data: properties }, { data: tenants }] =
    await Promise.all([
      supabase
        .from("leases")
        .select("*")
        .order("end_date", { ascending: true }),
      supabase.from("properties").select("id, address"),
      supabase.from("tenants").select("id, first_name, last_name"),
    ]);

  const leaseList = leases ?? [];
  const propMap = new Map(
    (properties ?? []).map((p: any) => [p.id, p.address])
  );
  const tenantMap = new Map(
    (tenants ?? []).map((t: any) => [
      t.id,
      `${t.first_name} ${t.last_name}`.trim(),
    ])
  );

  // KPIs
  const activeLeases = leaseList.filter((l) => l.status === "active");
  const activeCount = activeLeases.length;
  const monthlyRevenue = activeLeases.reduce(
    (s, l) => s + (Number(l.monthly_rent) || Number(l.rent_amount) || 0),
    0
  );
  const deposits = leaseList
    .filter((l) => Number(l.security_deposit) > 0)
    .map((l) => Number(l.security_deposit));
  const avgDeposit =
    deposits.length > 0
      ? Math.round(deposits.reduce((a, b) => a + b, 0) / deposits.length)
      : 0;
  const autoRenewCount = leaseList.filter((l) => l.auto_renew === true).length;

  // Sort: expiring soonest first (already sorted by end_date asc)
  const sortedLeases = [...leaseList].sort((a, b) => {
    const da = a.end_date ? new Date(a.end_date).getTime() : Infinity;
    const db = b.end_date ? new Date(b.end_date).getTime() : Infinity;
    return da - db;
  });

  return (
    <div style={{ backgroundColor: T.cream, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageTitle eyebrow="LEASE MANAGEMENT" title="Leases" />

        {/* KPI Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Active Leases"
            value={activeCount}
            note="Current active"
          />
          <KpiCard
            label="Monthly Revenue"
            value={fmtMoney(monthlyRevenue)}
            note="From active leases"
          />
          <KpiCard
            label="Avg Security Deposit"
            value={fmtMoney(avgDeposit)}
            note={`Across ${deposits.length} leases`}
          />
          <KpiCard
            label="Auto-Renewing"
            value={autoRenewCount}
            note="Set to renew"
          />
        </div>

        {/* Lease Cards */}
        <SectionLabel>ALL LEASES</SectionLabel>
        <div className="mt-4 space-y-4">
          {sortedLeases.length === 0 && (
            <Card>
              <p className="text-center text-sm text-stone-500">
                No leases found.
              </p>
            </Card>
          )}
          {sortedLeases.map((lease, i) => {
            const tenantName =
              lease.tenant_name ||
              (lease.tenant_id ? tenantMap.get(lease.tenant_id) : null) ||
              "Unknown Tenant";
            const address = lease.property_id
              ? propMap.get(lease.property_id) || "Unknown Property"
              : "Unknown Property";
            const rent =
              Number(lease.monthly_rent) || Number(lease.rent_amount) || 0;
            const deposit = Number(lease.security_deposit) || 0;
            const days = daysRemaining(lease.end_date);
            const expiringSoon = days !== null && days > 0 && days <= 60;
            const expired = days !== null && days <= 0;
            const signed =
              lease.esign_status === "signed" ||
              lease.esign_status === "completed";

            return (
              <StaggerIn key={lease.id} index={i}>
                <Card>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Left: Tenant + Property */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: "rgba(249,217,106,0.2)" }}
                        >
                          <FileText size={18} style={{ color: T.ink }} />
                        </div>
                        <div>
                          <p className="text-base font-medium text-stone-900">
                            {tenantName}
                          </p>
                          <p className="text-sm text-stone-500">{address}</p>
                        </div>
                      </div>

                      {/* Lease period */}
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-stone-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarClock size={14} className="text-stone-400" />
                          {fmtDate(lease.start_date)} &mdash;{" "}
                          {fmtDate(lease.end_date)}
                        </span>
                        {days !== null && !expired && (
                          <span
                            className="text-xs font-medium"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                              color:
                                days <= 30
                                  ? T.red
                                  : days <= 60
                                    ? "#D97706"
                                    : T.green,
                            }}
                          >
                            {days} days remaining
                          </span>
                        )}
                        {expired && (
                          <span
                            className="text-xs font-medium"
                            style={{ color: T.red }}
                          >
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Stats + Badges */}
                    <div className="flex flex-wrap items-start gap-3 md:flex-col md:items-end md:gap-2">
                      {expiringSoon && <YellowBadge>EXPIRING SOON</YellowBadge>}

                      <div className="flex items-center gap-4 text-sm">
                        <span
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                          className="font-medium text-stone-900"
                        >
                          {fmtMoney(rent)}
                          <span className="text-xs text-stone-400">/mo</span>
                        </span>
                        {deposit > 0 && (
                          <span className="text-stone-500">
                            Deposit: {fmtMoney(deposit)}
                          </span>
                        )}
                      </div>

                      {/* E-sign status */}
                      <div className="flex items-center gap-2">
                        <StatusDot color={esignColor(lease.esign_status)} />
                        <span className="text-xs text-stone-600">
                          {esignLabel(lease.esign_status)}
                        </span>
                      </div>

                      {/* Auto-renew */}
                      {lease.auto_renew && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-500">
                          <RefreshCw size={12} />
                          Auto-renew
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
