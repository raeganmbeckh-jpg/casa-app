import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Mail,
  Phone,
  MessageSquare,
  UserCircle,
  CalendarClock,
  Send,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const supabase = createServerClient();

  const [{ data: outreach }, { data: parcels }] = await Promise.all([
    supabase
      .from("land_outreach")
      .select("*")
      .order("outreach_date", { ascending: false }),
    supabase.from("land_parcels").select("id, address, city, owner_name"),
  ]);

  const outreachList = outreach ?? [];
  const parcelList = parcels ?? [];

  // Parcel lookup
  const parcelMap = new Map(parcelList.map((p) => [p.id, p]));

  // KPIs
  const totalContacts = outreachList.length;
  const responded = outreachList.filter(
    (o) => o.response && o.response.toLowerCase() !== "none" && o.response.toLowerCase() !== "no response"
  );
  const responseRate =
    totalContacts > 0
      ? ((responded.length / totalContacts) * 100).toFixed(0)
      : "0";
  const interested = outreachList.filter((o) =>
    (o.response || "").toLowerCase().includes("interested")
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followupsDue = outreachList.filter((o) => {
    if (!o.next_followup_date) return false;
    const fdate = new Date(o.next_followup_date + "T00:00:00");
    return fdate <= today;
  }).length;

  // Outreach type icon
  const typeIcon = (type: string | null) => {
    const t = (type || "").toLowerCase();
    if (t.includes("email") || t.includes("mail"))
      return <Mail className="h-4 w-4 text-stone-600" />;
    if (t.includes("phone") || t.includes("call"))
      return <Phone className="h-4 w-4 text-stone-600" />;
    if (t.includes("text") || t.includes("sms"))
      return <MessageSquare className="h-4 w-4 text-stone-600" />;
    return <Send className="h-4 w-4 text-stone-600" />;
  };

  // Response color
  const responseColor = (response: string | null) => {
    const r = (response || "").toLowerCase();
    if (r.includes("interested")) return T.green;
    if (r.includes("not interested") || r.includes("declined") || r.includes("rejected"))
      return T.red;
    if (r.includes("no response") || r === "none" || !response) return T.dim;
    return "#CA8A04";
  };

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="OWNER OUTREACH"
        title={
          <>
            Outreach <em className="italic text-stone-500">Log</em>
          </>
        }
        subtitle="Track every owner conversation, follow-up, and response across your pipeline."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DarkStatCard
          label="TOTAL CONTACTS"
          value={totalContacts}
          icon={<UserCircle className="h-5 w-5 text-stone-400" />}
        />
        <KpiCard
          label="RESPONSE RATE"
          value={`${responseRate}%`}
          note={`${responded.length} of ${totalContacts} responded`}
        />
        <KpiCard
          label="INTERESTED"
          value={interested}
          note="Positive responses"
        />
        <KpiCard
          label="FOLLOW-UPS DUE"
          value={followupsDue}
          note="On or before today"
        />
      </section>

      {/* Outreach Timeline */}
      <SectionLabel>OUTREACH TIMELINE</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {outreachList.map((o, i) => {
          const parcel = o.parcel_id ? parcelMap.get(o.parcel_id) : null;
          const rColor = responseColor(o.response);

          return (
            <StaggerIn key={o.id} index={i}>
              <Card>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl bg-stone-100 p-2.5">
                      {typeIcon(o.outreach_type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-medium text-stone-900">
                        {o.contact_name || "Unknown Contact"}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {o.contact_type || "Contact"}
                        {o.outreach_type ? ` via ${o.outreach_type}` : ""}
                      </p>
                    </div>
                  </div>
                  {o.response && (
                    <span
                      className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor:
                          rColor === T.green
                            ? "rgba(21,128,61,0.08)"
                            : rColor === T.red
                            ? "rgba(185,28,28,0.08)"
                            : "rgba(202,138,4,0.08)",
                        color: rColor,
                      }}
                    >
                      <StatusDot color={rColor} />
                      {o.response}
                    </span>
                  )}
                </div>

                {/* Linked parcel */}
                {parcel && (
                  <div className="mt-3 rounded-xl bg-[#FAFAF7] px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">
                      Linked Parcel
                    </p>
                    <p className="text-sm text-stone-700">
                      {parcel.address}
                      {parcel.city ? `, ${parcel.city}` : ""}
                    </p>
                  </div>
                )}

                {/* Date + Follow-up */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-3">
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Outreach Date
                    </span>
                    <p className="text-sm text-stone-900">
                      {o.outreach_date
                        ? new Date(
                            o.outreach_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Next Follow-up
                    </span>
                    <p
                      className="text-sm"
                      style={{
                        color:
                          o.next_followup_date &&
                          new Date(o.next_followup_date + "T00:00:00") <= today
                            ? T.red
                            : "rgb(28,25,23)",
                        fontWeight:
                          o.next_followup_date &&
                          new Date(o.next_followup_date + "T00:00:00") <= today
                            ? 600
                            : 400,
                      }}
                    >
                      {o.next_followup_date
                        ? new Date(
                            o.next_followup_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "None"}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {o.notes && (
                  <div className="mt-3 rounded-xl bg-[#FAFAF7] px-3 py-2">
                    <p className="text-xs leading-relaxed text-stone-600">
                      {o.notes}
                    </p>
                  </div>
                )}
              </Card>
            </StaggerIn>
          );
        })}
        {outreachList.length === 0 && (
          <Card className="col-span-full">
            <div className="flex flex-col items-center py-12 text-stone-400">
              <Mail className="h-8 w-8 mb-3" />
              <p className="text-sm">
                No outreach records found. Log your first contact to get started.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
