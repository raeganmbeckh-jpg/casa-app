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

const PRIORITY_ORDER = ["emergency", "high", "medium", "low"] as const;

function priorityStyle(priority: string) {
  switch (priority) {
    case "emergency":
      return {
        bg: "rgba(185,28,28,0.06)",
        border: "#DC2626",
        text: "#B91C1C",
        label: "Emergency",
      };
    case "high":
      return {
        bg: "rgba(234,88,12,0.06)",
        border: "#EA580C",
        text: "#C2410C",
        label: "High",
      };
    case "medium":
      return {
        bg: "rgba(217,119,6,0.06)",
        border: "#D97706",
        text: "#92400E",
        label: "Medium",
      };
    case "low":
      return {
        bg: "rgba(168,162,158,0.08)",
        border: "#A8A29E",
        text: "#78716C",
        label: "Low",
      };
    default:
      return {
        bg: "rgba(168,162,158,0.08)",
        border: "#A8A29E",
        text: "#78716C",
        label: priority,
      };
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "open":
      return { bg: "rgba(185,28,28,0.08)", text: T.red, label: "Open" };
    case "in_progress":
      return { bg: "rgba(249,217,106,0.2)", text: "#92700C", label: "In Progress" };
    case "scheduled":
      return { bg: "rgba(37,99,235,0.08)", text: "#2563EB", label: "Scheduled" };
    case "completed":
      return { bg: "rgba(21,128,61,0.08)", text: T.green, label: "Completed" };
    default:
      return { bg: "rgba(168,162,158,0.15)", text: T.dim, label: status };
  }
}

export default async function MaintenancePage() {
  const supabase = createServerClient();

  const [{ data: requests }, { data: properties }] = await Promise.all([
    supabase
      .from("maintenance_requests")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("id, address"),
  ]);

  const reqList = requests ?? [];
  const propList = properties ?? [];
  const propMap = new Map(propList.map((p: any) => [p.id, p]));

  // Enrich with property address
  const enriched = reqList.map((r: any) => ({
    ...r,
    propertyAddress: propMap.get(r.property_id)?.address ?? "Unknown Property",
  }));

  // KPIs
  const openTickets = enriched.filter(
    (r: any) => r.status !== "completed"
  ).length;

  const completedTickets = enriched.filter(
    (r: any) => r.status === "completed" && r.completed_date && r.created_at
  );
  const avgResolutionDays =
    completedTickets.length > 0
      ? Math.round(
          completedTickets.reduce((sum: number, r: any) => {
            const created = new Date(r.created_at).getTime();
            const completed = new Date(r.completed_date).getTime();
            return sum + (completed - created) / 86400000;
          }, 0) / completedTickets.length
        )
      : 0;

  const totalSpend = enriched.reduce(
    (s: number, r: any) => s + Number(r.actual_cost || 0),
    0
  );

  const emergencyCount = enriched.filter(
    (r: any) => r.priority === "emergency"
  ).length;

  // Group by priority
  const grouped: Record<string, any[]> = {};
  for (const p of PRIORITY_ORDER) {
    grouped[p] = [];
  }
  for (const r of enriched) {
    const p = r.priority?.toLowerCase() ?? "medium";
    if (!grouped[p]) grouped[p] = [];
    grouped[p].push(r);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="OPERATIONS"
        title={
          <>
            Mainte<em className="italic">nance</em>
          </>
        }
        subtitle="Priority-grouped work orders. Live data from your maintenance pipeline."
      />

      {/* KPI Cards */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard
            label="OPEN TICKETS"
            value={openTickets}
            note="Excluding completed"
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard
            label="AVG RESOLUTION"
            value={`${avgResolutionDays}d`}
            note="Created to completed"
          />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard
            label="TOTAL SPEND"
            value={fmtMoney(totalSpend)}
            note="Sum of actual costs"
          />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard
            label="EMERGENCIES"
            value={emergencyCount}
            note="Emergency priority tickets"
          />
        </StaggerIn>
      </section>

      {/* Priority Groups */}
      {PRIORITY_ORDER.map((priority, groupIdx) => {
        const tickets = grouped[priority];
        if (!tickets || tickets.length === 0) return null;
        const ps = priorityStyle(priority);
        const isEmergency = priority === "emergency";

        return (
          <section key={priority} className="mb-8">
            <StaggerIn index={groupIdx}>
              <div className="mb-4 flex items-center gap-3">
                <SectionLabel>{ps.label.toUpperCase()}</SectionLabel>
                <YellowBadge>{`${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}</YellowBadge>
              </div>

              <div
                className={`grid gap-4 ${
                  isEmergency
                    ? "grid-cols-1 lg:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {tickets.map((ticket: any, i: number) => {
                  const sb = statusBadge(ticket.status);
                  const isCompleted = ticket.status === "completed";
                  const cost = Number(ticket.actual_cost || ticket.estimated_cost || 0);

                  return (
                    <div
                      key={ticket.id}
                      className={`rounded-[2.5rem] border bg-[#fffdf8] shadow-sm shadow-stone-200/40 transition-all ${
                        isCompleted ? "opacity-50" : ""
                      } ${isEmergency ? "p-8" : "p-6"}`}
                      style={{
                        borderColor: isEmergency
                          ? "transparent"
                          : "rgb(214 211 209 / 0.3)",
                        borderLeftWidth: isEmergency ? "4px" : "1px",
                        borderLeftColor: isEmergency ? ps.border : undefined,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-medium text-stone-900 ${
                              isEmergency ? "text-lg" : "text-sm"
                            }`}
                          >
                            {ticket.title}
                          </h3>
                          <p className="mt-1 text-xs text-stone-500">
                            {ticket.propertyAddress}
                          </p>
                        </div>
                        <span
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: sb.bg, color: sb.text }}
                        >
                          <StatusDot color={sb.text} />
                          {sb.label}
                        </span>
                      </div>

                      {/* Details */}
                      <div
                        className={`mt-4 grid gap-3 ${
                          isEmergency ? "grid-cols-3" : "grid-cols-2"
                        }`}
                      >
                        {ticket.vendor_name && (
                          <div>
                            <p
                              className="text-[10px] uppercase tracking-[0.14em] text-stone-400"
                              style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                              Vendor
                            </p>
                            <p className="mt-0.5 text-xs text-stone-700">
                              {ticket.vendor_name}
                            </p>
                          </div>
                        )}
                        {cost > 0 && (
                          <div>
                            <p
                              className="text-[10px] uppercase tracking-[0.14em] text-stone-400"
                              style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                              {ticket.actual_cost ? "Actual Cost" : "Est. Cost"}
                            </p>
                            <p
                              className="mt-0.5 text-xs font-medium text-stone-700"
                              style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                              {fmtMoney(cost)}
                            </p>
                          </div>
                        )}
                        {isEmergency && ticket.created_at && (
                          <div>
                            <p
                              className="text-[10px] uppercase tracking-[0.14em] text-stone-400"
                              style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                              Reported
                            </p>
                            <p className="mt-0.5 text-xs text-stone-700">
                              {fmtDate(ticket.created_at.split("T")[0])}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Emergency: show description */}
                      {isEmergency && ticket.description && (
                        <p className="mt-4 text-xs leading-5 text-stone-500 border-t border-stone-100 pt-3">
                          {ticket.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </StaggerIn>
          </section>
        );
      })}

      {enriched.length === 0 && (
        <Card>
          <p className="py-8 text-center text-sm text-stone-400">
            No maintenance requests found.
          </p>
        </Card>
      )}
    </div>
  );
}
