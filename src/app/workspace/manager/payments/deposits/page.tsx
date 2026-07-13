import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Banknote, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusBadge = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "held")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(21,128,61,0.08)", color: T.green }}
      >
        Held
      </span>
    );
  if (s === "refunded")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(17,17,17,0.05)", color: T.dim }}
      >
        Refunded
      </span>
    );
  if (s === "partially_refunded" || s === "partial")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(217,119,6,0.08)", color: "#D97706" }}
      >
        Partial Refund
      </span>
    );
  if (s === "pending" || s === "pending_refund")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(249,217,106,0.2)", color: "#92700C" }}
      >
        Pending Refund
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
      {status || "Unknown"}
    </span>
  );
};

export default async function DepositsPage() {
  const supabase = createServerClient();

  const [{ data: deposits }, { data: leases }, { data: properties }] =
    await Promise.all([
      supabase
        .from("security_deposits")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("leases").select("id, tenant_name, property_id"),
      supabase.from("properties").select("id, address"),
    ]);

  const depositList = (deposits ?? []) as any[];
  const leaseMap = new Map<string, any>();
  for (const l of leases ?? []) {
    leaseMap.set(l.id, l);
  }
  const propMap = new Map<string, string>();
  for (const p of properties ?? []) {
    propMap.set(p.id, p.address);
  }

  // KPIs
  const totalHeld = depositList
    .filter((d) => d.status === "held")
    .reduce((s, d) => s + Number(d.amount || 0), 0);

  const pendingRefund = depositList.filter(
    (d) =>
      d.status === "pending_refund" ||
      d.status === "pending" ||
      d.status === "partially_refunded"
  ).length;

  const refundedCount = depositList.filter(
    (d) => d.status === "refunded"
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="DEPOSITS"
        title={
          <>
            Security <em className="italic">Deposits</em>
          </>
        }
        subtitle="Track held deposits, pending refunds, and deductions."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="TOTAL HELD"
          value={fmtMoney(totalHeld)}
          note={`${depositList.filter((d) => d.status === "held").length} deposits`}
        />
        <KpiCard
          label="PENDING REFUND"
          value={pendingRefund}
          note={pendingRefund > 0 ? "Requires action" : "All clear"}
        />
        <KpiCard label="REFUNDED" value={refundedCount} />
      </section>

      {/* Deposit cards */}
      <SectionLabel>ALL DEPOSITS</SectionLabel>

      {depositList.length === 0 ? (
        <Card className="mt-3">
          <div className="py-12 text-center">
            <Wallet className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              No security deposits found.
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {depositList.map((dep, i) => {
            const lease = dep.lease_id ? leaseMap.get(dep.lease_id) : null;
            const tenantName = lease?.tenant_name || "Unknown Tenant";
            const propAddress = lease?.property_id
              ? propMap.get(lease.property_id)
              : null;
            const deductions = dep.deductions;
            const hasDeductions =
              deductions &&
              ((Array.isArray(deductions) && deductions.length > 0) ||
                (typeof deductions === "object" &&
                  Object.keys(deductions).length > 0));

            return (
              <StaggerIn key={dep.id} index={Math.min(i, 12)}>
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconChip>
                        <Banknote className="h-4 w-4 text-stone-800" />
                      </IconChip>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {tenantName}
                        </p>
                        {propAddress && (
                          <p className="text-xs text-stone-500">
                            {propAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    {statusBadge(dep.status)}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-stone-400">
                      Amount
                    </span>
                    <span
                      className="text-lg font-semibold tracking-tight text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {fmtMoney(Number(dep.amount || 0))}
                    </span>
                  </div>

                  {/* Deductions */}
                  {hasDeductions && (
                    <div className="mt-3 rounded-xl border border-stone-100 bg-[#FAFAF7] p-3">
                      <p className="mb-2 text-[10px] uppercase tracking-widest text-stone-400">
                        Deductions
                      </p>
                      {Array.isArray(deductions)
                        ? deductions.map((ded: any, j: number) => (
                            <div
                              key={j}
                              className="flex items-center justify-between text-xs text-stone-600"
                            >
                              <span>
                                {ded.label || ded.description || ded.reason || `Item ${j + 1}`}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                  color: T.red,
                                }}
                              >
                                {fmtMoney(Number(ded.amount || 0))}
                              </span>
                            </div>
                          ))
                        : Object.entries(deductions).map(
                            ([key, val]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between text-xs text-stone-600"
                              >
                                <span className="capitalize">
                                  {key.replace(/_/g, " ")}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "var(--font-geist-mono)",
                                    color: T.red,
                                  }}
                                >
                                  {typeof val === "number"
                                    ? fmtMoney(val)
                                    : String(val)}
                                </span>
                              </div>
                            )
                          )}
                    </div>
                  )}

                  <p className="mt-3 text-xs text-stone-400">
                    Created {fmtDate(dep.created_at)}
                  </p>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
