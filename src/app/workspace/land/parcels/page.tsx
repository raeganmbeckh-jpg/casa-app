import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  MapPin,
  AlertTriangle,
  Droplets,
  Flame,
  Landmark,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function ParcelsPage() {
  const supabase = createServerClient();

  const { data: parcels } = await supabase
    .from("land_parcels")
    .select("*")
    .order("opportunity_score", { ascending: false });

  const parcelList = parcels ?? [];

  // KPIs
  const totalParcels = parcelList.length;
  const avgMotivation =
    totalParcels > 0
      ? (
          parcelList.reduce((s, p) => s + Number(p.motivation_score || 0), 0) /
          totalParcels
        ).toFixed(1)
      : "0";
  const highOpportunity = parcelList.filter(
    (p) => Number(p.opportunity_score || 0) >= 8
  ).length;
  const taxDelinquent = parcelList.filter(
    (p) => p.tax_delinquent === true
  ).length;

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="PARCEL SEARCH"
        title={
          <>
            Target <em className="italic text-stone-500">Parcels</em>
          </>
        }
        subtitle="Every tracked parcel with motivation, opportunity, and distress scores from live data."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="TOTAL PARCELS" value={totalParcels} />
        <KpiCard
          label="AVG MOTIVATION"
          value={avgMotivation}
          note="Score out of 10"
        />
        <KpiCard
          label="HIGH OPPORTUNITY"
          value={highOpportunity}
          note="Score >= 8"
        />
        <KpiCard
          label="TAX DELINQUENT"
          value={taxDelinquent}
          note={`${totalParcels > 0 ? ((taxDelinquent / totalParcels) * 100).toFixed(0) : 0}% of parcels`}
        />
      </section>

      {/* Parcel Cards */}
      <SectionLabel>ALL PARCELS</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelList.map((p, i) => (
          <StaggerIn key={p.id} index={i}>
            <Card>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-medium text-stone-900">
                    {p.address || "No Address"}
                  </h3>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {[p.city, p.county, p.state].filter(Boolean).join(", ")}
                  </p>
                  {p.apn && (
                    <p
                      className="mt-1 text-[11px] text-stone-400"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      APN {p.apn}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {p.status && <YellowBadge>{p.status}</YellowBadge>}
                  {p.tax_delinquent && (
                    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                      Tax Delinquent
                    </span>
                  )}
                </div>
              </div>

              {/* Scores - PROMINENT */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <ScorePill label="MOT" value={p.motivation_score} />
                <ScorePill label="OPP" value={p.opportunity_score} />
                <ScorePill label="DIS" value={p.distress_score} />
              </div>

              {/* Details grid */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-stone-200 pt-4">
                <Detail label="Acreage" value={p.acreage ? `${Number(p.acreage).toFixed(2)} ac` : "N/A"} />
                <Detail label="Zoning" value={p.zoning_code || "N/A"} />
                <Detail label="Owner" value={p.owner_name || "Unknown"} />
                <Detail
                  label="Entity"
                  value={p.owner_entity_type || "N/A"}
                />
                <Detail
                  label="Assessed"
                  value={p.assessed_value ? fmtMoney(Number(p.assessed_value)) : "N/A"}
                />
                <Detail
                  label="Max Units"
                  value={p.max_units ? String(p.max_units) : "N/A"}
                />
              </div>

              {/* Risk flags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {p.flood_zone && p.flood_zone !== "None" && p.flood_zone !== "X" && (
                  <RiskTag icon={<Droplets className="h-3 w-3" />} label={`Flood: ${p.flood_zone}`} />
                )}
                {p.wildfire_risk && p.wildfire_risk !== "None" && p.wildfire_risk !== "Low" && (
                  <RiskTag icon={<Flame className="h-3 w-3" />} label={`Fire: ${p.wildfire_risk}`} />
                )}
                {p.fault_zone && (
                  <RiskTag icon={<AlertTriangle className="h-3 w-3" />} label="Fault Zone" />
                )}
                {p.wetlands && (
                  <RiskTag icon={<Droplets className="h-3 w-3" />} label="Wetlands" />
                )}
              </div>

              {/* Notes / AI summary */}
              {(p.ai_summary || p.notes) && (
                <div className="mt-4 rounded-2xl bg-[#FAFAF7] px-4 py-3">
                  <p className="text-xs leading-relaxed text-stone-600">
                    {p.ai_summary || p.notes}
                  </p>
                </div>
              )}
            </Card>
          </StaggerIn>
        ))}
        {parcelList.length === 0 && (
          <Card>
            <p className="py-8 text-center text-sm text-stone-400">
              No parcels found in the database.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function ScorePill({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  const score = Number(value || 0);
  const color = score >= 8 ? T.green : score >= 5 ? "#CA8A04" : T.red;
  const bg =
    score >= 8
      ? "rgba(21,128,61,0.08)"
      : score >= 5
      ? "rgba(202,138,4,0.08)"
      : "rgba(185,28,28,0.08)";

  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{ backgroundColor: bg }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.16em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-xl font-bold tabular-nums"
        style={{ color, fontFamily: "var(--font-geist-mono)" }}
      >
        {score}
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </span>
      <p className="text-sm text-stone-900">{value}</p>
    </div>
  );
}

function RiskTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
      {icon}
      {label}
    </span>
  );
}
