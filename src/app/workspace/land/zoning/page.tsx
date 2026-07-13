import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Scale, ArrowRightLeft, Calendar, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ZoningPage() {
  const supabase = createServerClient();

  const [{ data: parcels }, { data: zoningChanges }] = await Promise.all([
    supabase.from("land_parcels").select("*").order("address"),
    supabase.from("zoning_changes").select("*").order("hearing_date", { ascending: false }),
  ]);

  const parcelList = parcels ?? [];
  const changeList = zoningChanges ?? [];

  // KPIs
  const uniqueZones = new Set(parcelList.map((p) => p.zoning_code).filter(Boolean));
  const totalMaxUnits = parcelList.reduce((s, p) => s + Number(p.max_units || 0), 0);
  const pendingChanges = changeList.filter(
    (c) => c.status?.toLowerCase().includes("pending") || c.status?.toLowerCase().includes("proposed")
  ).length;

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="ZONING INTELLIGENCE"
        title={
          <>
            Zoning <em className="italic text-stone-500">Analyzer</em>
          </>
        }
        subtitle="Zoning codes, descriptions, and density analysis for every tracked parcel."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="PARCELS ANALYZED" value={parcelList.length} />
        <KpiCard label="UNIQUE ZONES" value={uniqueZones.size} />
        <KpiCard label="TOTAL MAX UNITS" value={totalMaxUnits.toLocaleString()} note="Buildable density" />
        <KpiCard label="PENDING CHANGES" value={pendingChanges} note={`of ${changeList.length} tracked`} />
      </section>

      {/* Per-parcel zoning cards */}
      <SectionLabel>PARCEL ZONING</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelList.map((p, i) => (
          <StaggerIn key={p.id} index={i}>
            <Card>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-medium text-stone-900">
                    {p.address || "No Address"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {[p.city, p.state].filter(Boolean).join(", ")}
                  </p>
                </div>
                {p.zoning_code && (
                  <span
                    className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold"
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      color: "#92700C",
                    }}
                  >
                    {p.zoning_code}
                  </span>
                )}
              </div>

              {p.zoning_description && (
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {p.zoning_description}
                </p>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-4">
                <ZoneDetail label="Max Units" value={p.max_units ? String(p.max_units) : "N/A"} />
                <ZoneDetail label="Acreage" value={p.acreage ? `${Number(p.acreage).toFixed(2)} ac` : "N/A"} />
                <ZoneDetail
                  label="Density"
                  value={
                    p.max_units && p.acreage && Number(p.acreage) > 0
                      ? `${(Number(p.max_units) / Number(p.acreage)).toFixed(1)} units/ac`
                      : "N/A"
                  }
                />
                <ZoneDetail label="APN" value={p.apn || "N/A"} mono />
              </div>
            </Card>
          </StaggerIn>
        ))}
        {parcelList.length === 0 && (
          <Card>
            <p className="py-8 text-center text-sm text-stone-400">
              No parcels found. Zoning data will appear once parcels are added.
            </p>
          </Card>
        )}
      </div>

      {/* Zoning Changes */}
      {changeList.length > 0 && (
        <section className="mt-10">
          <SectionLabel>ZONING CHANGES</SectionLabel>
          <div className="mt-4">
            <ListContainer>
              <ListHeader label="RECENT CHANGES & PROPOSALS" />
              {changeList.map((c, i) => (
                <div key={c.id} className="px-4 pb-2">
                  <ListRow last={i === changeList.length - 1}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-xl bg-stone-100 p-2">
                        <ArrowRightLeft className="h-4 w-4 text-stone-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-stone-900">
                          {c.address || "Unknown Address"}
                        </p>
                        <p className="text-xs text-stone-500">
                          {c.jurisdiction || "Unknown Jurisdiction"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p
                          className="text-xs text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {c.current_zoning || "?"} &rarr; {c.proposed_zoning || "?"}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {c.change_type || "Rezone"}
                        </p>
                      </div>
                      {c.hearing_date && (
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.hearing_date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </div>
                      )}
                      {c.status && (
                        <StatusDot
                          color={
                            c.status.toLowerCase().includes("approved")
                              ? T.green
                              : c.status.toLowerCase().includes("denied")
                              ? T.red
                              : T.yellow
                          }
                        />
                      )}
                    </div>
                  </ListRow>
                </div>
              ))}
            </ListContainer>
          </div>

          {/* Impact summaries */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {changeList
              .filter((c) => c.impact_summary)
              .slice(0, 4)
              .map((c, i) => (
                <StaggerIn key={c.id} index={i}>
                  <Card>
                    <div className="flex items-center gap-2 mb-2">
                      <Scale className="h-4 w-4 text-stone-500" />
                      <p className="text-sm font-medium text-stone-900">
                        {c.address}
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-stone-600">
                      {c.impact_summary}
                    </p>
                    {c.value_impact_est && (
                      <p
                        className="mt-2 text-xs font-medium text-stone-500"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Est. Value Impact: {c.value_impact_est}
                      </p>
                    )}
                  </Card>
                </StaggerIn>
              ))}
          </div>
        </section>
      )}

      {changeList.length === 0 && (
        <section className="mt-10">
          <SectionLabel>ZONING CHANGES</SectionLabel>
          <Card className="mt-4">
            <p className="py-6 text-center text-sm text-stone-400">
              No zoning changes tracked. Changes will appear here when added.
            </p>
          </Card>
        </section>
      )}
    </div>
  );
}

function ZoneDetail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <span
        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <p
        className="text-sm text-stone-900"
        style={mono ? { fontFamily: "var(--font-geist-mono)" } : undefined}
      >
        {value}
      </p>
    </div>
  );
}
