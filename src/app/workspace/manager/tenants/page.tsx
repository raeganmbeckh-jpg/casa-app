import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  ListContainer,
  ListHeader,
  StatusDot,
  StaggerIn,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { CreditCard, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function creditScoreColor(score: number | null): string {
  if (score === null || score === undefined) return T.dim;
  if (score >= 720) return T.green;
  if (score >= 650) return "#D97706";
  return T.red;
}

export default async function TenantsPage() {
  const supabase = createServerClient();

  const [
    { data: tenants },
    { data: leases },
    { data: properties },
    { data: rentPayments },
  ] = await Promise.all([
    supabase
      .from("tenants")
      .select("id, first_name, last_name, email, phone, monthly_income, credit_score, background_status"),
    supabase
      .from("leases")
      .select("id, property_id, tenant_id, tenant_name, monthly_rent, start_date, end_date, status, esign_status"),
    supabase.from("properties").select("id, address"),
    supabase
      .from("rent_payments")
      .select("tenant_id, amount_paid, status, paid_date, due_date")
      .order("due_date", { ascending: false }),
  ]);

  const tenantList = tenants ?? [];
  const leaseList = leases ?? [];
  const propList = properties ?? [];
  const paymentList = rentPayments ?? [];

  // Build lookup maps
  const propertyMap = new Map<string, string>();
  for (const p of propList) {
    propertyMap.set(p.id, p.address);
  }

  // Most recent payment per tenant
  const latestPaymentByTenant = new Map<string, any>();
  for (const payment of paymentList) {
    if (payment.tenant_id && !latestPaymentByTenant.has(payment.tenant_id)) {
      latestPaymentByTenant.set(payment.tenant_id, payment);
    }
  }

  // Build rent roll rows by joining tenants -> leases -> properties
  const rentRoll = tenantList.map((tenant) => {
    const tenantName = `${tenant.first_name} ${tenant.last_name}`;
    const lease = leaseList.find((l: any) => l.tenant_id === tenant.id);
    const propertyAddress = lease
      ? propertyMap.get(lease.property_id) ?? "\u2014"
      : "\u2014";
    const monthlyRent = Number(lease?.monthly_rent || 0);
    const leaseEnd = lease?.end_date ?? null;
    const leaseStatus = lease?.status ?? "unknown";
    const latestPayment = latestPaymentByTenant.get(tenant.id);

    let paymentStatus = "No data";
    let paymentDotColor: string = T.dim;
    if (latestPayment) {
      switch (latestPayment.status) {
        case "paid":
          paymentStatus = "Paid";
          paymentDotColor = T.green;
          break;
        case "pending":
          paymentStatus = "Pending";
          paymentDotColor = "#D97706";
          break;
        case "overdue":
        case "late":
          paymentStatus = "Overdue";
          paymentDotColor = T.red;
          break;
        default:
          paymentStatus = latestPayment.status ?? "Unknown";
          paymentDotColor = T.dim;
      }
    }

    return {
      tenantId: tenant.id,
      tenantName,
      email: tenant.email,
      creditScore: tenant.credit_score ?? null,
      propertyAddress,
      monthlyRent,
      leaseEnd,
      leaseStatus,
      paymentStatus,
      paymentDotColor,
    };
  });

  // ── KPIs ──────────────────────────────────────────────────────
  const activeTenants = rentRoll.filter(
    (r) => r.leaseStatus === "active",
  ).length;
  const totalMonthlyRent = rentRoll.reduce((s, r) => s + r.monthlyRent, 0);
  const scoresPresent = rentRoll.filter((r) => r.creditScore !== null);
  const avgCreditScore =
    scoresPresent.length > 0
      ? Math.round(
          scoresPresent.reduce((s, r) => s + (r.creditScore as number), 0) /
            scoresPresent.length,
        )
      : 0;
  const totalPayments = paymentList.length;
  const paidPayments = paymentList.filter((p) => p.status === "paid").length;
  const collectionRate =
    totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

  // ── Recent 5 payments with tenant names ───────────────────────
  const tenantNameMap = new Map<string, string>();
  for (const t of tenantList) {
    tenantNameMap.set(t.id, `${t.first_name} ${t.last_name}`);
  }
  const recentPayments = paymentList.slice(0, 5).map((p) => ({
    ...p,
    tenantName: tenantNameMap.get(p.tenant_id) ?? "Unknown",
  }));

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="RENT ROLL"
        title="Tenants"
        subtitle={`${tenantList.length} tenants across your portfolio.`}
      />

      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="ACTIVE TENANTS"
          value={activeTenants}
          note={`${tenantList.length} total`}
        />
        <KpiCard
          label="TOTAL MONTHLY RENT"
          value={fmtMoney(totalMonthlyRent)}
        />
        <KpiCard
          label="AVG CREDIT SCORE"
          value={avgCreditScore > 0 ? avgCreditScore : "\u2014"}
          note={
            avgCreditScore >= 720
              ? "Excellent average"
              : avgCreditScore >= 650
                ? "Good average"
                : avgCreditScore > 0
                  ? "Below target"
                  : "No data"
          }
        />
        <KpiCard
          label="COLLECTION RATE"
          value={`${collectionRate}%`}
          note={`${paidPayments} of ${totalPayments} payments`}
        />
      </section>

      {/* ── Rent Roll Table ───────────────────────────────────────── */}
      <section className="mb-10">
        <Card padded={false}>
          <div className="px-6 py-5">
            <SectionLabel>FULL RENT ROLL</SectionLabel>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-t border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500">
                  <th className="px-6 py-4 font-medium">Tenant Name</th>
                  <th className="px-6 py-4 font-medium">Property</th>
                  <th className="px-6 py-4 font-medium">Monthly Rent</th>
                  <th className="px-6 py-4 font-medium">Credit Score</th>
                  <th className="px-6 py-4 font-medium">Payment Status</th>
                  <th className="px-6 py-4 font-medium">Lease End</th>
                </tr>
              </thead>
              <tbody>
                {rentRoll.map((row) => (
                  <tr
                    key={row.tenantId}
                    className="border-b border-stone-100 transition-colors last:border-0 hover:bg-[#FDF8E8]"
                  >
                    <td className="px-6 py-3.5 font-medium text-stone-900">
                      {row.tenantName}
                    </td>
                    <td className="px-6 py-3.5 text-stone-600">
                      {row.propertyAddress}
                    </td>
                    <td
                      className="px-6 py-3.5 text-stone-800"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {fmtMoney(row.monthlyRent)}
                    </td>
                    <td className="px-6 py-3.5">
                      {row.creditScore !== null ? (
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: creditScoreColor(row.creditScore),
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          {row.creditScore}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">{"\u2014"}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-2 text-xs text-stone-600">
                        <StatusDot color={row.paymentDotColor} />
                        {row.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-stone-600">
                      {row.leaseEnd ? fmtDate(row.leaseEnd) : "\u2014"}
                    </td>
                  </tr>
                ))}
                {rentRoll.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-stone-400"
                    >
                      No tenant data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ── Recent Payments ───────────────────────────────────────── */}
      <section>
        <SectionLabel>RECENT PAYMENTS</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500">
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, i) => {
                const isPaid = payment.status === "paid";
                const dotColor = isPaid
                  ? T.green
                  : payment.status === "pending"
                    ? "#D97706"
                    : T.red;
                return (
                  <tr
                    key={`${payment.tenant_id}-${payment.due_date}-${i}`}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-6 py-3 font-medium text-stone-900">
                      {payment.tenantName}
                    </td>
                    <td
                      className="px-6 py-3 text-stone-800"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {fmtMoney(Number(payment.amount_paid || 0))}
                    </td>
                    <td className="px-6 py-3 text-stone-600">
                      {payment.paid_date
                        ? fmtDate(payment.paid_date)
                        : payment.due_date
                          ? `Due ${fmtDate(payment.due_date)}`
                          : "\u2014"}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-2 text-xs capitalize text-stone-600">
                        <StatusDot color={dotColor} />
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentPayments.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-stone-400"
                  >
                    No payment data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
