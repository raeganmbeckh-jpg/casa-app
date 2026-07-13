import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  IconChip,
  T,
} from "@/components/ui/primitives";
import { BarChart3, Home, Calculator, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (d: string | null) => {
  if (!d) return "N/A";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default async function CmaPage() {
  const supabase = createServerClient();

  const [compsRes, listingsRes] = await Promise.all([
    supabase.from("comparable_sales").select("*").order("sale_date", { ascending: false }),
    supabase.from("listings").select("*").order("list_price", { ascending: false }),
  ]);

  const comps = compsRes.data ?? [];
  const listings = listingsRes.data ?? [];

  const avgCompPrice = comps.length
    ? Math.round(comps.reduce((s, c) => s + Number(c.sale_price || 0), 0) / comps.length)
    : 0;
  const avgPricePerSqft = comps.length
    ? Math.round(
        comps.reduce((s, c) => s + Number(c.price_per_sqft || 0), 0) / comps.length
      )
    : 0;
  const avgCompDom = comps.length
    ? Math.round(
        comps.reduce((s, c) => s + (c.days_on_market || 0), 0) / comps.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="MARKET ANALYSIS"
        title="CMA Generator"
        subtitle="Comparable sales analysis with price-per-sqft benchmarking."
      />

      <div className="mt-6 grid grid-cols-3 gap-4">
        <KpiCard
          label="Avg Comp Price"
          value={fmtMoney(avgCompPrice)}
          note={`${comps.length} recent sales`}
        />
        <KpiCard
          label="Avg $/Sqft"
          value={`$${avgPricePerSqft}`}
          note="Comparable sales"
        />
        <KpiCard
          label="Avg Comp DOM"
          value={`${avgCompDom} days`}
          note="Time to sell"
        />
      </div>

      {/* Comparable Sales Table */}
      <div className="mt-10">
        <SectionLabel>COMPARABLE SALES</SectionLabel>
        <div className="mt-4">
          <ListContainer>
            <ListHeader label="RECENT COMPS" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left">
                    <th className="px-6 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Address
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Sale Price
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Bd/Ba
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Sqft
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      $/Sqft
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      DOM
                    </th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-stone-400 font-medium">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comps.map((comp, i) => (
                    <tr
                      key={i}
                      className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-stone-900">
                        {comp.comp_address}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">
                        {fmtMoney(Number(comp.sale_price || 0))}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {fmtDate(comp.sale_date)}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {comp.beds}/{comp.baths}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-600">
                        {(comp.sqft || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-stone-700">
                        ${comp.price_per_sqft || 0}
                      </td>
                      <td className="px-4 py-3 text-stone-600">
                        {comp.days_on_market ?? "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {comp.property_type && (
                          <YellowBadge>{comp.property_type}</YellowBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ListContainer>
        </div>
      </div>

      {/* Subject Listings with Price Analysis */}
      <div className="mt-12">
        <SectionLabel>SUBJECT LISTING ANALYSIS</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, i) => {
            const listingPpsf = listing.sqft
              ? Math.round(Number(listing.list_price || 0) / listing.sqft)
              : 0;
            const priceDelta = avgPricePerSqft
              ? Math.round(((listingPpsf - avgPricePerSqft) / avgPricePerSqft) * 100)
              : 0;

            return (
              <StaggerIn key={listing.id} index={i}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {listing.address}
                      </p>
                      <p className="text-xs text-stone-500">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                    <IconChip>
                      <Calculator size={14} className="text-stone-700" />
                    </IconChip>
                  </div>

                  <p className="mt-4 text-2xl font-medium tracking-tight text-stone-900">
                    {fmtMoney(Number(listing.list_price || 0))}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-stone-600">
                    <span>{listing.beds} bd / {listing.baths} ba</span>
                    <span className="text-stone-300">|</span>
                    <span>{(listing.sqft || 0).toLocaleString()} sqft</span>
                  </div>

                  <div className="mt-4 rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">
                        $/Sqft
                      </span>
                      <span className="font-mono text-sm font-medium text-stone-900">
                        ${listingPpsf}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">
                        vs Comp Avg
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          priceDelta > 0 ? "text-emerald-700" : priceDelta < 0 ? "text-red-700" : "text-stone-600"
                        }`}
                      >
                        {priceDelta > 0 ? "+" : ""}
                        {priceDelta}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400">
                        DOM
                      </span>
                      <span className="text-sm text-stone-700">
                        {listing.days_on_market ?? 0} days
                      </span>
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
