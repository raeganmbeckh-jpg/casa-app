import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  ShieldAlert,
  Droplets,
  Flame,
  AlertTriangle,
  Waves,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiskPage() {
  const supabase = createServerClient();

  const { data: parcels } = await supabase
    .from("land_parcels")
    .select("*")
    .order("address");

  const parcelList = parcels ?? [];

  // Risk tallies
  const floodRiskCount = parcelList.filter(
    (p) => p.flood_zone && p.flood_zone !== "None" && p.flood_zone !== "X"
  ).length;
  const wildfireRiskCount = parcelList.filter(
    (p) => p.wildfire_risk && p.wildfire_risk !== "None" && p.wildfire_risk !== "Low"
  ).length;
  const faultZoneCount = parcelList.filter((p) => p.fault_zone === true).length;
  const wetlandsCount = parcelList.filter((p) => p.wetlands === true).length;

  // Calculate risk level per parcel
  const getRiskFactors = (p: (typeof parcelList)[0]) => {
    const factors: { label: string; level: "high" | "moderate" | "low"; icon: string }[] = [];

    if (p.flood_zone && p.flood_zone !== "None" && p.flood_zone !== "X") {
      const isHighFlood = ["A", "AE", "AH", "AO", "V", "VE"].some((z) =>
        (p.flood_zone || "").toUpperCase().startsWith(z)
      );
      factors.push({
        label: `Flood Zone: ${p.flood_zone}`,
        level: isHighFlood ? "high" : "moderate",
        icon: "flood",
      });
    } else {
      factors.push({ label: "Flood Zone: Minimal", level: "low", icon: "flood" });
    }

    if (p.wildfire_risk) {
      const risk = p.wildfire_risk.toLowerCase();
      factors.push({
        label: `Wildfire: ${p.wildfire_risk}`,
        level: risk.includes("high") || risk.includes("very")
          ? "high"
          : risk.includes("moderate") || risk.includes("medium")
          ? "moderate"
          : "low",
        icon: "fire",
      });
    } else {
      factors.push({ label: "Wildfire: Unknown", level: "low", icon: "fire" });
    }

    factors.push({
      label: p.fault_zone ? "Fault Zone: Yes" : "Fault Zone: No",
      level: p.fault_zone ? "high" : "low",
      icon: "fault",
    });

    factors.push({
      label: p.wetlands ? "Wetlands: Present" : "Wetlands: None",
      level: p.wetlands ? "moderate" : "low",
      icon: "wetlands",
    });

    return factors;
  };

  const getOverallRisk = (factors: ReturnType<typeof getRiskFactors>) => {
    if (factors.some((f) => f.level === "high")) return "high";
    if (factors.some((f) => f.level === "moderate")) return "moderate";
    return "low";
  };

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="RISK ASSESSMENT"
        title={
          <>
            Environmental &amp; <em className="italic text-stone-500">Risk</em>
          </>
        }
        subtitle="Flood zones, wildfire risk, fault lines, and wetlands for every tracked parcel."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-5">
        <DarkStatCard
          label="PARCELS ASSESSED"
          value={parcelList.length}
          icon={<ShieldAlert className="h-5 w-5 text-stone-400" />}
        />
        <KpiCard
          label="FLOOD RISK"
          value={floodRiskCount}
          note="Parcels in flood zones"
        />
        <KpiCard
          label="WILDFIRE RISK"
          value={wildfireRiskCount}
          note="Moderate or higher"
        />
        <KpiCard
          label="FAULT ZONE"
          value={faultZoneCount}
          note="Parcels on faults"
        />
        <KpiCard
          label="WETLANDS"
          value={wetlandsCount}
          note="Parcels with wetlands"
        />
      </section>

      {/* Risk Matrix Cards */}
      <SectionLabel>RISK MATRIX BY PARCEL</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelList.map((p, i) => {
          const factors = getRiskFactors(p);
          const overall = getOverallRisk(factors);
          const overallColor =
            overall === "high" ? T.red : overall === "moderate" ? "#CA8A04" : T.green;
          const overallBg =
            overall === "high"
              ? "rgba(185,28,28,0.06)"
              : overall === "moderate"
              ? "rgba(202,138,4,0.06)"
              : "rgba(21,128,61,0.06)";

          return (
            <StaggerIn key={p.id} index={i}>
              <Card>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-stone-400" />
                      <h3 className="truncate text-base font-medium text-stone-900">
                        {p.address || "No Address"}
                      </h3>
                    </div>
                    <p className="ml-6 text-xs text-stone-500">
                      {[p.city, p.county].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <div
                    className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: overallBg,
                      color: overallColor,
                    }}
                  >
                    {overall}
                  </div>
                </div>

                {/* Risk factors */}
                <div className="mt-5 space-y-2">
                  {factors.map((f, fi) => {
                    const color =
                      f.level === "high"
                        ? T.red
                        : f.level === "moderate"
                        ? "#CA8A04"
                        : T.green;
                    const bg =
                      f.level === "high"
                        ? "bg-red-50 border-red-200"
                        : f.level === "moderate"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-green-50 border-green-200";
                    const Icon =
                      f.icon === "flood"
                        ? Droplets
                        : f.icon === "fire"
                        ? Flame
                        : f.icon === "fault"
                        ? AlertTriangle
                        : Waves;

                    return (
                      <div
                        key={fi}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 ${bg}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" style={{ color }} />
                          <span className="text-sm text-stone-700">
                            {f.label}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color }}
                        >
                          {f.level}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Acreage + Zoning context */}
                <div className="mt-4 flex items-center gap-4 border-t border-stone-200 pt-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">
                      Acreage
                    </span>
                    <p className="text-sm text-stone-900">
                      {p.acreage ? `${Number(p.acreage).toFixed(2)} ac` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">
                      Zoning
                    </span>
                    <p className="text-sm text-stone-900">
                      {p.zoning_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400">
                      APN
                    </span>
                    <p
                      className="text-sm text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {p.apn || "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </StaggerIn>
          );
        })}
        {parcelList.length === 0 && (
          <Card>
            <p className="py-8 text-center text-sm text-stone-400">
              No parcels found. Risk data will appear once parcels are added.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
