import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Mail, MessageSquare, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtTimestamp = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return T.green;
    case "sent":
      return T.yellow;
    case "failed":
      return T.red;
    case "queued":
    default:
      return T.dim;
  }
};

export default async function CommunicationsPage() {
  const supabase = createServerClient();

  const [{ data: notifications }, { data: tenants }] = await Promise.all([
    supabase
      .from("notification_log")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("tenants").select("id, first_name, last_name"),
  ]);

  const notifList = (notifications ?? []) as any[];
  const tenantMap = new Map<string, string>();
  for (const t of tenants ?? []) {
    tenantMap.set(t.id, `${t.first_name} ${t.last_name}`);
  }

  // KPIs
  const totalSent = notifList.length;
  const deliveredCount = notifList.filter(
    (n) => n.status === "delivered"
  ).length;
  const failedCount = notifList.filter((n) => n.status === "failed").length;
  const distinctChannels = new Set(
    notifList.map((n) => n.channel).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="COMMUNICATIONS"
        title={
          <>
            Notification <em className="italic">Center</em>
          </>
        }
        subtitle="All outbound notifications — email, SMS, and system messages."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-4">
        <KpiCard label="TOTAL SENT" value={totalSent} />
        <KpiCard
          label="DELIVERED"
          value={deliveredCount}
          note={
            totalSent > 0
              ? `${Math.round((deliveredCount / totalSent) * 100)}% rate`
              : undefined
          }
        />
        <KpiCard
          label="FAILED"
          value={failedCount}
          note={failedCount > 0 ? "Requires attention" : "All clear"}
        />
        <KpiCard
          label="CHANNELS"
          value={distinctChannels}
          note={
            Array.from(
              new Set(notifList.map((n) => n.channel).filter(Boolean))
            ).join(", ") || "—"
          }
        />
      </section>

      {/* Message timeline */}
      <SectionLabel>NOTIFICATION LOG</SectionLabel>

      {notifList.length === 0 ? (
        <Card className="mt-3">
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              No notifications sent yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-3 space-y-3">
          {notifList.map((notif, i) => {
            const channel = notif.channel?.toLowerCase();
            const ChannelIcon =
              channel === "sms" ? MessageSquare : Mail;

            // Resolve recipient
            const tenantName = notif.tenant_id
              ? tenantMap.get(notif.tenant_id)
              : null;
            const recipient =
              tenantName ||
              notif.recipient_email ||
              notif.recipient_phone ||
              "Unknown";

            return (
              <StaggerIn key={notif.id} index={Math.min(i, 15)}>
                <Card>
                  <div className="flex items-start gap-4">
                    {/* Channel icon */}
                    <div
                      className="mt-0.5 rounded-xl p-2"
                      style={{
                        backgroundColor:
                          channel === "sms"
                            ? "rgba(147,51,234,0.08)"
                            : "rgba(59,130,246,0.08)",
                      }}
                    >
                      <ChannelIcon
                        className="h-4 w-4"
                        style={{
                          color:
                            channel === "sms"
                              ? "rgb(107,33,168)"
                              : "rgb(30,64,175)",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-stone-900">
                          {recipient}
                        </p>
                        {notif.event_type && (
                          <YellowBadge>
                            {notif.event_type.replace(/_/g, " ")}
                          </YellowBadge>
                        )}
                      </div>

                      {notif.subject && (
                        <p className="mt-1 truncate text-sm text-stone-600">
                          {notif.subject}
                        </p>
                      )}

                      <p
                        className="mt-2 text-xs text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {fmtTimestamp(notif.created_at)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusDot color={statusColor(notif.status)} />
                      <span className="text-xs capitalize text-stone-500">
                        {notif.status || "unknown"}
                      </span>
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
