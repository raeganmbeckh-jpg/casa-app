import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { BarChart3, MapPin, Calendar, Ruler } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function CompsPage() {
  const supabase = createServerClient();

  const [{ data: comps }, { data: parcels }] = await Promise.all([
    supabase.from("land_comps").select("*").order("sale_date", { ascending: false }),
    supabase.from("land_parcels").select("id, address, city, acreage, zoning_code"),
  ]);

  const compList = comps ?? [];
  const parcelList = parcels ?? [];

  // Build parcel lookup
  const parcelMap = new Map(parcelList.map((p) => [p.id, p]));

  // Group comps by subject parcel
  const grouped = new Map<string, { parcel: (typeof parcelList)[0] | null; comps: typeof compList }>();
  compList.forEach((c) => {
    const key = c.subject_parcel_id || "unlinked";
    if (!grouped.has(key)) {
      grouped.set(key, {
        parcel: c.subject_parcel_id ? parcelMap.get(c.subject_parcel_id) ?? null : null,
        comps: [],
      });
    }
    grouped.get(key)!.comps.push(c);
  });

  // KPIs
  const totalComps = compList.length;
  const avgPricePerAcre =
    compList.length > 0
      ? compList.reduce((s, c) => s + Number(c.price_per_acre || 0), 0) /
        compList.length
      : 0;
  const maxSalePrice = compList.reduce(
    (m, c) => Math.max(m, Number(c.sale_price || 0)),
    0
  );
  const subjectParcelsWithComps = new Set(
    compList.map((c) => c.subject_parcel_id).filter(Boolean)
  ).size;

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="LAND COMPS"
        title={
          <>
            Comparable <em className="italic text-stone-500">Sales</em>
          </>
        }
        subtitle="Recent land transactions grouped by subject parcel for valuation analysis."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard label="TOTAL COMPS" value={totalComps} />
        <KpiCard
          label="AVG $/ACRE"
          value={avgPricePerAcre > 0 ? fmtMoney(avgPricePerAcre) : "$0"}
          note="Across all comps"
        />
        <KpiCard
          label="MAX SALE PRICE"
          value={maxSalePrice > 0 ? fmtMoney(maxSalePrice) : "$0"}
        />
        <KpiCard
          label="PARCELS W/ COMPS"
          value={subjectParcelsWithComps}
          note={`of ${parcelList.length} tracked`}
        />
      </section>

      {/* Grouped by subject parcel */}
      {Array.from(grouped.entries()).map(([key, { parcel, comps: groupComps }], gi) => (
        <section key={key} className="mb-8">
          {/* Subject header */}
          <div className="flex items-center gap-3 mb-4">
            <IconChip>
              <MapPin className="h-4 w-4 text-stone-700" />
            </IconChip>
            <div>
              <h2 className="text-lg font-medium text-stone-900">
                {parcel?.address || "Unlinked Comps"}
              </h2>
              {parcel && (
                <p className="text-xs text-stone-500">
                  {parcel.city}
                  {parcel.acreage ? ` | ${Number(parcel.acreage).toFixed(2)} ac` : ""}
                  {parcel.zoning_code ? ` | ${parcel.zoning_code}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Comp cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groupComps.map((c, i) => (
              <StaggerIn key={c.id} index={i}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-medium text-stone-900">
                        {c.comp_address || "No Address"}
                      </h3>
                      <p className="text-xs text-stone-500">
                        {c.comp_city || "Unknown City"}
                      </p>
                    </div>
                    {c.product_type && (
                      <YellowBadge>{c.product_type}</YellowBadge>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <CompDetail
                      label="Sale Price"
                      value={c.sale_price ? fmtMoney(Number(c.sale_price)) : "N/A"}
                      highlight
                    />
                    <CompDetail
                      label="$/Acre"
                      value={c.price_per_acre ? fmtMoney(Number(c.price_per_acre)) : "N/A"}
                      highlight
                    />
                    <CompDetail
                      label="Acreage"
                      value={c.acreage ? `${Number(c.acreage).toFixed(2)} ac` : "N/A"}
                    />
                    <CompDetail
                      label="Zoning"
                      value={c.zoning_code || "N/A"}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
                    {c.sale_date && (
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(c.sale_date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </div>
                    )}
                    {c.distance_miles != null && (
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Ruler className="h-3 w-3" />
                        {Number(c.distance_miles).toFixed(1)} mi
                      </div>
                    )}
                    {c.source && (
                      <span className="text-[10px] text-stone-400">
                        {c.source}
                      </span>
                    )}
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        </section>
      ))}

      {compList.length === 0 && (
        <Card>
          <div className="flex flex-col items-center py-12 text-stone-400">
            <BarChart3 className="h-8 w-8 mb-3" />
            <p className="text-sm">No comparable sales found in the database.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

function CompDetail({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
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
        className={`text-sm ${highlight ? "font-medium" : ""} text-stone-900`}
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}
