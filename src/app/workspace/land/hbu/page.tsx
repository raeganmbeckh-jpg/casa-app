import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Lightbulb,
  Zap,
  Droplets,
  Flame,
  Plug,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HBUPage() {
  const supabase = createServerClient();

  const [{ data: screenings }, { data: parcels }] = await Promise.all([
    supabase.from("site_screenings").select("*").order("feasibility_score", { ascending: false }),
    supabase.from("land_parcels").select("*").order("opportunity_score", { ascending: false }),
  ]);

  const screeningList = screenings ?? [];
  const parcelList = parcels ?? [];

  const avgFeasibility =
    screeningList.length > 0
      ? (
          screeningList.reduce((s, r) => s + Number(r.feasibility_score || 0), 0) /
          screeningList.length
        ).toFixed(0)
      : "0";

  const hasScreenings = screeningList.length > 0;

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="SITE ANALYSIS"
        title={
          <>
            Highest &amp; Best <em className="italic text-stone-500">Use</em>
          </>
        }
        subtitle="Feasibility scores, recommended uses, and utility availability for screened sites."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="SITES SCREENED" value={screeningList.length} />
        <KpiCard
          label="AVG FEASIBILITY"
          value={avgFeasibility}
          note="Score out of 100"
        />
        <KpiCard
          label="PARCELS TRACKED"
          value={parcelList.length}
          note="For fallback analysis"
        />
        <KpiCard
          label="UNIQUE ZONES"
          value={new Set([...screeningList.map((s) => s.zoning_code), ...parcelList.map((p) => p.zoning_code)].filter(Boolean)).size}
        />
      </section>

      {/* Site Screenings */}
      {hasScreenings && (
        <section className="mb-10">
          <SectionLabel>SITE SCREENINGS</SectionLabel>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {screeningList.map((s, i) => {
              const score = Number(s.feasibility_score || 0);
              const scoreColor =
                score >= 80 ? T.green : score >= 50 ? "#CA8A04" : T.red;

              return (
                <StaggerIn key={s.id} index={i}>
                  <Card>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-medium text-stone-900">
                          {s.address || "No Address"}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {[s.city, s.state].filter(Boolean).join(", ")}
                          {s.apn ? ` | APN ${s.apn}` : ""}
                        </p>
                      </div>
                      {/* Feasibility score - LARGE */}
                      <div className="text-center">
                        <p
                          className="text-4xl font-bold tabular-nums"
                          style={{
                            color: scoreColor,
                            fontFamily: "var(--font-geist-mono)",
                          }}
                        >
                          {score}
                        </p>
                        <p className="text-[9px] uppercase tracking-wider text-stone-400">
                          Feasibility
                        </p>
                      </div>
                    </div>

                    {/* Recommended use */}
                    {s.recommended_use && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
                        <Lightbulb className="h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone-500">
                            Recommended Use
                          </p>
                          <p className="text-sm font-medium text-stone-900">
                            {s.recommended_use}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Utility Grid */}
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      <UtilityChip label="Water" available={s.water_available} />
                      <UtilityChip label="Sewer" available={s.sewer_available} />
                      <UtilityChip label="Gas" available={s.gas_available} />
                      <UtilityChip label="Electric" available={s.electric_available} />
                    </div>

                    {/* Zoning + extras */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-200 pt-4">
                      <div>
                        <span
                          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Zoning
                        </span>
                        <p className="text-sm text-stone-900">
                          {s.zoning_code || "N/A"}
                        </p>
                        {s.zoning_description && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {s.zoning_description}
                          </p>
                        )}
                      </div>
                      <div>
                        <span
                          className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          Flood Zone
                        </span>
                        <p className="text-sm text-stone-900">
                          {s.flood_zone || "N/A"}
                        </p>
                      </div>
                      {s.assessed_value && (
                        <div className="col-span-2">
                          <span
                            className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            Assessed Value
                          </span>
                          <p
                            className="text-sm font-medium text-stone-900"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {Number(s.assessed_value).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* AI Summary */}
                    {s.ai_summary && (
                      <div className="mt-4 rounded-2xl bg-[#FAFAF7] px-4 py-3">
                        <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">
                          AI Analysis
                        </p>
                        <p className="text-xs leading-relaxed text-stone-600">
                          {s.ai_summary}
                        </p>
                      </div>
                    )}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      {/* Fallback: Parcel-based HBU when no screenings */}
      {!hasScreenings && (
        <section>
          <SectionLabel>PARCEL-BASED ANALYSIS</SectionLabel>
          <p className="mt-1 mb-4 text-sm text-stone-500">
            No site screenings found. Showing parcel zoning and density as a basis for highest &amp; best use.
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {parcelList.map((p, i) => (
              <StaggerIn key={p.id} index={i}>
                <Card>
                  <h3 className="truncate text-base font-medium text-stone-900">
                    {p.address || "No Address"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {[p.city, p.state].filter(Boolean).join(", ")}
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-stone-100 px-3 py-2 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Zoning</p>
                      <p className="text-sm font-medium text-stone-900">{p.zoning_code || "N/A"}</p>
                    </div>
                    <div className="rounded-xl bg-stone-100 px-3 py-2 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Max Units</p>
                      <p className="text-sm font-medium text-stone-900">{p.max_units ?? "N/A"}</p>
                    </div>
                    <div className="rounded-xl bg-stone-100 px-3 py-2 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-400">Acreage</p>
                      <p className="text-sm font-medium text-stone-900">{p.acreage ? Number(p.acreage).toFixed(2) : "N/A"}</p>
                    </div>
                  </div>
                  {p.zoning_description && (
                    <p className="mt-3 text-xs leading-relaxed text-stone-500">
                      {p.zoning_description}
                    </p>
                  )}
                </Card>
              </StaggerIn>
            ))}
            {parcelList.length === 0 && (
              <Card>
                <p className="py-8 text-center text-sm text-stone-400">
                  No parcels or screenings found.
                </p>
              </Card>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function UtilityChip({
  label,
  available,
}: {
  label: string;
  available: boolean | null;
}) {
  const isAvailable = available === true;
  return (
    <div
      className={`rounded-xl border px-2 py-2 text-center ${
        isAvailable
          ? "border-green-200 bg-green-50"
          : "border-stone-200 bg-stone-50"
      }`}
    >
      <div className="flex justify-center mb-1">
        {isAvailable ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-stone-400" />
        )}
      </div>
      <p
        className={`text-[10px] font-medium ${
          isAvailable ? "text-green-700" : "text-stone-400"
        }`}
      >
        {label}
      </p>
    </div>
  );
}
