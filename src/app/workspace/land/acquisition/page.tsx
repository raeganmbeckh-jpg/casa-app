import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  StatusDot,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  DollarSign,
  TrendingDown,
  Building2,
  Target,
  Gauge,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function AcquisitionPage() {
  const supabase = createServerClient();

  const { data: parcels } = await supabase
    .from("land_parcels")
    .select("*")
    .order("opportunity_score", { ascending: false });

  const parcelList = parcels ?? [];

  // Only parcels with pricing data
  const pricedParcels = parcelList.filter(
    (p) => p.asking_price || p.assessed_value
  );

  // KPIs
  const totalAskingValue = parcelList.reduce(
    (s, p) => s + Number(p.asking_price || 0),
    0
  );
  const totalAssessedValue = parcelList.reduce(
    (s, p) => s + Number(p.assessed_value || 0),
    0
  );
  const totalAcreage = parcelList.reduce(
    (s, p) => s + Number(p.acreage || 0),
    0
  );
  const avgPricePerAcre =
    totalAcreage > 0 && totalAskingValue > 0
      ? totalAskingValue / totalAcreage
      : 0;

  // Distressed parcels (distress_score >= 7)
  const distressedCount = parcelList.filter(
    (p) => Number(p.distress_score || 0) >= 7
  ).length;

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="DEAL MODELING"
        title={
          <>
            Acquisition <em className="italic text-stone-500">Analysis</em>
          </>
        }
        subtitle="Price-to-value analysis, per-acre economics, and distress indicators for every parcel."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 lg:grid-cols-5">
        <DarkStatCard
          label="TOTAL ASKING VALUE"
          value={totalAskingValue > 0 ? fmtMoney(totalAskingValue) : "$0"}
          subtitle={`${parcelList.length} parcels tracked`}
          icon={<DollarSign className="h-5 w-5 text-stone-400" />}
        />
        <KpiCard
          label="TOTAL ASSESSED"
          value={totalAssessedValue > 0 ? fmtMoney(totalAssessedValue) : "$0"}
          note="County assessed value"
        />
        <KpiCard
          label="AVG $/ACRE"
          value={avgPricePerAcre > 0 ? fmtMoney(avgPricePerAcre) : "N/A"}
          note="Based on asking price"
        />
        <KpiCard
          label="DISTRESSED"
          value={distressedCount}
          note="Distress score >= 7"
        />
        <KpiCard
          label="TOTAL ACREAGE"
          value={totalAcreage.toFixed(1)}
          note="All parcels"
        />
      </section>

      {/* Per-Parcel Acquisition Cards */}
      <SectionLabel>ACQUISITION BREAKDOWN</SectionLabel>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {parcelList.map((p, i) => {
          const asking = Number(p.asking_price || 0);
          const assessed = Number(p.assessed_value || 0);
          const acreage = Number(p.acreage || 0);
          const maxUnits = Number(p.max_units || 0);

          const pricePerAcre = acreage > 0 && asking > 0 ? asking / acreage : 0;
          const pricePerUnit = maxUnits > 0 && asking > 0 ? asking / maxUnits : 0;

          // Value gap: asking vs assessed
          const valueGap =
            assessed > 0 && asking > 0
              ? ((asking - assessed) / assessed) * 100
              : null;

          const distressScore = Number(p.distress_score || 0);
          const opportunityScore = Number(p.opportunity_score || 0);
          const motivationScore = Number(p.motivation_score || 0);

          return (
            <StaggerIn key={p.id} index={i}>
              <Card>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-medium text-stone-900">
                      {p.address || "No Address"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {[p.city, p.county].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  {p.status && <YellowBadge>{p.status}</YellowBadge>}
                </div>

                {/* Price comparison */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <PriceBlock
                    label="Asking Price"
                    value={asking > 0 ? fmtMoney(asking) : "N/A"}
                    accent
                  />
                  <PriceBlock
                    label="Assessed Value"
                    value={assessed > 0 ? fmtMoney(assessed) : "N/A"}
                  />
                </div>

                {/* Value gap bar */}
                {valueGap !== null && (
                  <div className="mt-3 rounded-xl bg-stone-100 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-stone-500">
                        Price vs Assessed
                      </span>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{
                          color:
                            valueGap > 20
                              ? T.red
                              : valueGap < -10
                              ? T.green
                              : "#CA8A04",
                          fontFamily: "var(--font-geist-mono)",
                        }}
                      >
                        {valueGap > 0 ? "+" : ""}
                        {valueGap.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Unit economics */}
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-200 pt-3">
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      $/Acre
                    </span>
                    <p
                      className="text-sm font-medium text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {pricePerAcre > 0 ? fmtMoney(pricePerAcre) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      $/Unit
                    </span>
                    <p
                      className="text-sm font-medium text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {pricePerUnit > 0 ? fmtMoney(pricePerUnit) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Acreage
                    </span>
                    <p className="text-sm text-stone-900">
                      {acreage > 0 ? `${acreage.toFixed(2)} ac` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Max Units
                    </span>
                    <p className="text-sm text-stone-900">
                      {maxUnits > 0 ? maxUnits : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Score gauges */}
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-200 pt-3">
                  <MiniScore label="Opportunity" value={opportunityScore} />
                  <MiniScore label="Distress" value={distressScore} />
                  <MiniScore label="Motivation" value={motivationScore} />
                </div>

                {/* Distress flags */}
                {(p.tax_delinquent || distressScore >= 7) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.tax_delinquent && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        <TrendingDown className="h-3 w-3" />
                        Tax Delinquent
                      </span>
                    )}
                    {distressScore >= 7 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                        <Target className="h-3 w-3" />
                        High Distress
                      </span>
                    )}
                  </div>
                )}
              </Card>
            </StaggerIn>
          );
        })}
        {parcelList.length === 0 && (
          <Card>
            <p className="py-8 text-center text-sm text-stone-400">
              No parcels found. Add parcels with pricing data for acquisition analysis.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function PriceBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-3 py-2 ${
        accent ? "bg-amber-50 border border-amber-200" : "bg-stone-100"
      }`}
    >
      <p
        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-lg font-medium text-stone-900"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? T.green : value >= 5 ? "#CA8A04" : T.red;
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wider text-stone-400">
        {label}
      </p>
      <p
        className="text-lg font-bold tabular-nums"
        style={{ color, fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}
