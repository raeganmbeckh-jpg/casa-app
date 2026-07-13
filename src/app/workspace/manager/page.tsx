import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  StaggerIn,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import {
  AlertTriangle,
  TrendingUp,
  Building2,
  Wrench,
  DollarSign,
  CalendarClock,
  Info,
} from "lucide-react";

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

export default async function ManagerDashboard() {
  const supabase = createServerClient();

  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 90 days from now for expiring leases
  const ninetyDaysOut = new Date(today);
  ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);
  const ninetyDaysISO = ninetyDaysOut.toISOString().split("T")[0];
  const todayISO = today.toISOString().split("T")[0];

  const [
    { data: transactions },
    { data: properties },
    { data: alerts },
    { data: maintenanceRequests },
    { data: leases },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, property_id, description, amount, type, date")
      .order("date", { ascending: false }),
    supabase
      .from("properties")
      .select("id, address, city, property_type, units, monthly_rent, status, estimated_value, cap_rate"),
    supabase
      .from("alerts")
      .select("id, type, title, message, severity, property_id, is_read, created_at")
      .eq("is_read", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("maintenance_requests")
      .select("id, property_id, title, priority, status, created_at, properties(address)")
      .in("status", ["open", "in_progress"])
      .order("created_at", { ascending: false }),
    supabase
      .from("leases")
      .select("id, status, end_date, monthly_rent, tenant_name, tenants(first_name, last_name), properties(address)")
      .gte("end_date", todayISO)
      .lte("end_date", ninetyDaysISO)
      .order("end_date", { ascending: true }),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "manager").order("created_at", { ascending: false }).limit(20);

  const txList = transactions ?? [];
  const propList = properties ?? [];
  const alertList = alerts ?? [];
  const mxList = maintenanceRequests ?? [];
  const expiringLeases = leases ?? [];

  // ── NOI Calculation ────────────────────────────────────────────
  const income = txList
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = txList
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const noi = income - expenses;

  // ── Property KPIs ─────────────────────────────────────────────
  const totalProperties = propList.length;
  const totalUnits = propList.reduce((s, p) => s + (p.units || 0), 0);
  const occupiedProps = propList.filter((p) => p.status === "occupied");
  const occupiedUnits = occupiedProps.reduce((s, p) => s + (p.units || 0), 0);
  const occupancyPct =
    totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const monthlyGrossRent = occupiedProps.reduce(
    (s, p) => s + Number(p.monthly_rent || 0),
    0,
  );

  // ── Recent 10 transactions ────────────────────────────────────
  const recentTx = txList.slice(0, 10);

  // ── Alert severity helpers ────────────────────────────────────
  const severityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-red-200",
          bg: "bg-red-50",
          iconColor: "text-red-700",
          titleColor: "text-red-900",
          msgColor: "text-red-700",
        };
      case "warning":
        return {
          border: "border-amber-200",
          bg: "bg-amber-50",
          iconColor: "text-amber-700",
          titleColor: "text-amber-900",
          msgColor: "text-amber-700",
        };
      default:
        return {
          border: "border-stone-200",
          bg: "bg-stone-50",
          iconColor: "text-stone-500",
          titleColor: "text-stone-800",
          msgColor: "text-stone-600",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      {/* ── Page Title ────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="COMMAND DESK"
        title={<>Portfolio <em className="italic">Operations</em></>}
        subtitle={todayStr}
      />

      {/* ── Hero: NOI + KPIs ───────────────────────────────────── */}
      <section className="mb-10 grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <DarkStatCard
            label="PORTFOLIO NOI"
            value={fmtMoney(noi)}
            subtitle={`${fmtMoney(income)} income \u2013 ${fmtMoney(expenses)} expenses`}
            icon={<TrendingUp className="h-5 w-5 text-stone-400" />}
          />
        </div>
        <KpiCard
          label="TOTAL PROPERTIES"
          value={totalProperties}
          note={`${totalUnits} total units`}
        />
        <KpiCard
          label="OCCUPANCY RATE"
          value={`${occupancyPct}%`}
          note={`${occupiedUnits} of ${totalUnits} units`}
        />
        <KpiCard
          label="MONTHLY GROSS RENT"
          value={fmtMoney(monthlyGrossRent)}
          note="From occupied properties"
        />
      </section>

      {/* ── Alert Strip ───────────────────────────────────────────── */}
      {alertList.length > 0 && (
        <section className="mb-10">
          <SectionLabel>UNREAD ALERTS</SectionLabel>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
            {alertList.map((alert, i) => {
              const s = severityStyle(alert.severity);
              return (
                <StaggerIn key={alert.id} index={i}>
                  <div
                    className={`flex min-w-[260px] shrink-0 items-start gap-3 rounded-2xl border ${s.border} ${s.bg} px-5 py-4 shadow-sm`}
                  >
                    {alert.severity === "info" ? (
                      <Info className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`} />
                    ) : (
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`}
                      />
                    )}
                    <div>
                      <p className={`text-sm font-medium ${s.titleColor}`}>
                        {alert.title}
                      </p>
                      <p className={`mt-0.5 text-xs ${s.msgColor}`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Two-Column: Maintenance + Expiring Leases ─────────────── */}
      <section className="mb-10 grid gap-6 lg:grid-cols-2">
        {/* Active Maintenance */}
        <ListContainer>
          <ListHeader
            label="ACTIVE MAINTENANCE"
            action={<YellowBadge>{`${mxList.length} open`}</YellowBadge>}
          />
          <div className="px-4 pb-4">
            {mxList.map((req: any, i) => {
              const statusColor =
                req.status === "open" ? T.red : T.yellow;
              return (
                <ListRow key={req.id} last={i === mxList.length - 1}>
                  <div className="flex items-center gap-3">
                    <IconChip>
                      <Wrench className="h-4 w-4 text-stone-800" />
                    </IconChip>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {req.title}
                      </p>
                      <p className="text-xs text-stone-500">
                        {req.properties?.address ?? "Unknown property"}
                        {req.priority && (
                          <span className="uppercase">
                            {" "}
                            &middot; {req.priority}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusDot color={statusColor} />
                    <span className="text-xs capitalize text-stone-600">
                      {req.status?.replace("_", " ")}
                    </span>
                  </div>
                </ListRow>
              );
            })}
            {mxList.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-400">
                No open maintenance requests.
              </p>
            )}
          </div>
        </ListContainer>

        {/* Expiring Leases (within 90 days) */}
        <ListContainer>
          <ListHeader
            label="EXPIRING LEASES"
            action={
              <YellowBadge>{`${expiringLeases.length} within 90 days`}</YellowBadge>
            }
          />
          <div className="px-4 pb-4">
            {expiringLeases.map((lease: any, i) => {
              const tenantName = lease.tenants
                ? `${lease.tenants.first_name} ${lease.tenants.last_name}`
                : lease.tenant_name || "Unknown";
              return (
                <ListRow
                  key={lease.id}
                  last={i === expiringLeases.length - 1}
                >
                  <div className="flex items-center gap-3">
                    <IconChip>
                      <CalendarClock className="h-4 w-4 text-stone-800" />
                    </IconChip>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {tenantName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {lease.properties?.address ?? "Unknown property"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-sm font-medium text-stone-800"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {fmtMoney(Number(lease.monthly_rent || 0))}
                    </p>
                    <p className="text-xs text-stone-500">
                      Ends {lease.end_date ? fmtDate(lease.end_date) : "—"}
                    </p>
                  </div>
                </ListRow>
              );
            })}
            {expiringLeases.length === 0 && (
              <p className="py-6 text-center text-sm text-stone-400">
                No leases expiring within 90 days.
              </p>
            )}
          </div>
        </ListContainer>
      </section>

      {/* ── Recent Transactions ───────────────────────────────────── */}
      <section>
        <SectionLabel>RECENT TRANSACTIONS</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTx.map((tx) => {
                const amt = Number(tx.amount);
                const isIncome = tx.type === "income";
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-6 py-3 text-stone-600">
                      {tx.date ? fmtDate(tx.date) : "\u2014"}
                    </td>
                    <td className="px-6 py-3 font-medium text-stone-900">
                      {tx.description}
                    </td>
                    <td
                      className="px-6 py-3 text-right font-medium"
                      style={{
                        color: isIncome ? T.green : T.red,
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      {isIncome ? "+" : "\u2013"}
                      {fmtMoney(Math.abs(amt))}
                    </td>
                  </tr>
                );
              })}
              {recentTx.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-stone-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6">
        <SwarmPanel role="manager" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}
