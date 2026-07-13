import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";

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

function statusColor(status: string) {
  switch (status) {
    case "paid":
      return { bg: "rgba(21,128,61,0.08)", text: T.green, label: "Paid" };
    case "pending":
      return { bg: "rgba(249,217,106,0.2)", text: "#92700C", label: "Pending" };
    case "overdue":
      return { bg: "rgba(185,28,28,0.08)", text: T.red, label: "Overdue" };
    case "partial":
      return { bg: "rgba(234,88,12,0.08)", text: "#EA580C", label: "Partial" };
    default:
      return { bg: "rgba(168,162,158,0.15)", text: T.dim, label: status };
  }
}

export default async function PaymentsPage() {
  const supabase = createServerClient();

  const [{ data: payments }, { data: leases }, { data: properties }] =
    await Promise.all([
      supabase
        .from("rent_payments")
        .select("*")
        .order("due_date", { ascending: false }),
      supabase.from("leases").select("id, tenant_name, property_id, monthly_rent"),
      supabase.from("properties").select("id, address"),
    ]);

  const paymentList = payments ?? [];
  const leaseList = leases ?? [];
  const propList = properties ?? [];

  // Build lookup maps
  const leaseMap = new Map(leaseList.map((l: any) => [l.id, l]));
  const propMap = new Map(propList.map((p: any) => [p.id, p]));

  // Enrich payments with tenant name and property address
  const enriched = paymentList.map((p: any) => {
    const lease = leaseMap.get(p.lease_id);
    const propId = p.property_id || lease?.property_id;
    const prop = propMap.get(propId);
    return {
      ...p,
      tenantName: lease?.tenant_name ?? "Unknown Tenant",
      propertyAddress: prop?.address ?? "Unknown Property",
    };
  });

  // KPIs
  const totalCollected = paymentList
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + Number(p.amount_paid || 0), 0);

  const outstanding = paymentList
    .filter((p: any) => p.status === "pending" || p.status === "overdue")
    .reduce((s: number, p: any) => s + Number(p.amount_due || 0), 0);

  const totalLateFees = paymentList.reduce(
    (s: number, p: any) => s + Number(p.late_fee || 0),
    0
  );

  const totalDue = paymentList.reduce(
    (s: number, p: any) => s + Number(p.amount_due || 0),
    0
  );
  const totalPaid = paymentList
    .filter((p: any) => p.status === "paid")
    .reduce((s: number, p: any) => s + Number(p.amount_paid || 0), 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="COLLECTIONS"
        title={
          <>
            Pay<em className="italic">ments</em>
          </>
        }
        subtitle="Full payment ledger across your portfolio. All data live from Supabase."
      />

      {/* KPI Cards */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard
            label="TOTAL COLLECTED"
            value={fmtMoney(totalCollected)}
            note="Sum of all paid amounts"
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="OUTSTANDING"
            value={fmtMoney(outstanding)}
            note="Pending + overdue balances"
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="LATE FEES ASSESSED"
            value={fmtMoney(totalLateFees)}
            note="Across all payments"
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="COLLECTION RATE"
            value={`${collectionRate}%`}
            note="Paid vs total due"
          />
        </StaggerIn>
      </section>

      {/* Payment Ledger */}
      <section>
        <SectionLabel>PAYMENT LEDGER</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500">
                <th
                  className="px-6 py-4 font-medium"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Date
                </th>
                <th
                  className="px-6 py-4 font-medium"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Tenant
                </th>
                <th
                  className="hidden px-6 py-4 font-medium md:table-cell"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Property
                </th>
                <th
                  className="px-6 py-4 font-medium text-right"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Amount
                </th>
                <th
                  className="px-6 py-4 font-medium"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Status
                </th>
                <th
                  className="hidden px-6 py-4 font-medium lg:table-cell"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Method
                </th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((payment: any) => {
                const sc = statusColor(payment.status);
                const displayDate = payment.paid_date || payment.due_date;
                const displayAmount =
                  payment.status === "paid"
                    ? Number(payment.amount_paid || 0)
                    : Number(payment.amount_due || 0);

                return (
                  <tr
                    key={payment.id}
                    className="border-b border-stone-100 last:border-0 transition-colors hover:bg-[#FAFAF7]"
                  >
                    <td
                      className="px-6 py-3 text-stone-600"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {displayDate ? fmtDate(displayDate) : "--"}
                    </td>
                    <td className="px-6 py-3 font-medium text-stone-900">
                      {payment.tenantName}
                    </td>
                    <td className="hidden px-6 py-3 text-stone-600 md:table-cell">
                      {payment.propertyAddress}
                    </td>
                    <td
                      className="px-6 py-3 text-right font-medium text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {fmtMoney(displayAmount)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: sc.bg, color: sc.text }}
                      >
                        <StatusDot color={sc.text} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="hidden px-6 py-3 lg:table-cell">
                      {payment.payment_method ? (
                        <span className="inline-flex items-center rounded-full border border-stone-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-500">
                          {payment.payment_method}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {enriched.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-stone-400"
                  >
                    No payment records found.
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
