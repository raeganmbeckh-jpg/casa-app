import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  StatusDot,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Eye,
  FileText,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

type PricingHealth = "strong" | "moderate" | "weak";

function getPricingHealth(
  showings: number,
  offers: number,
  dom: number
): { health: PricingHealth; label: string; color: string } {
  const showingsToOffers = showings > 0 ? offers / showings : 0;

  if (showingsToOffers >= 0.2 && dom <= 21) {
    return { health: "strong", label: "Strong", color: T.green };
  }
  if (showingsToOffers >= 0.1 || dom <= 45) {
    return { health: "moderate", label: "Moderate", color: T.yellow };
  }
  return { health: "weak", label: "Needs Adjustment", color: T.red };
}

export default async function PricingPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("list_price", { ascending: false });

  const listings = data ?? [];

  const avgPrice = listings.length
    ? Math.round(
        listings.reduce((s, l) => s + Number(l.list_price || 0), 0) /
          listings.length
      )
    : 0;

  const avgPpsf = listings.length
    ? Math.round(
        listings
          .filter((l) => l.sqft > 0)
          .reduce(
            (s, l) => s + Number(l.list_price || 0) / l.sqft,
            0
          ) / listings.filter((l) => l.sqft > 0).length
      )
    : 0;

  const totalShowings = listings.reduce((s, l) => s + (l.showings || 0), 0);
  const totalOffers = listings.reduce((s, l) => s + (l.offers || 0), 0);
  const overallRatio =
    totalShowings > 0 ? ((totalOffers / totalShowings) * 100).toFixed(1) : "0";

  const strongCount = listings.filter((l) => {
    const h = getPricingHealth(l.showings || 0, l.offers || 0, l.days_on_market || 0);
    return h.health === "strong";
  }).length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="PRICING STRATEGY"
        title="List Price Analysis"
        subtitle="Showings-to-offers conversion and pricing health by listing."
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Avg List Price"
          value={fmtMoney(avgPrice)}
          note="Across all listings"
        />
        <KpiCard
          label="Avg $/Sqft"
          value={`$${avgPpsf}`}
          note="Price per square foot"
        />
        <KpiCard
          label="Showing-to-Offer"
          value={`${overallRatio}%`}
          note="Conversion rate"
        />
        <KpiCard
          label="Strong Pricing"
          value={`${strongCount}/${listings.length}`}
          note="Well-priced listings"
        />
      </div>

      <div className="mt-10">
        <SectionLabel>PER-LISTING PRICING ANALYSIS</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, i) => {
            const ppsf = listing.sqft
              ? Math.round(Number(listing.list_price || 0) / listing.sqft)
              : 0;
            const showingToOffer =
              listing.showings > 0
                ? ((listing.offers / listing.showings) * 100).toFixed(1)
                : "0.0";
            const health = getPricingHealth(
              listing.showings || 0,
              listing.offers || 0,
              listing.days_on_market || 0
            );

            return (
              <StaggerIn key={listing.id} index={i}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900">
                        {listing.address}
                      </p>
                      <p className="text-xs text-stone-500">
                        {listing.city}, {listing.state}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusDot color={health.color} />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: health.color }}
                      >
                        {health.label}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-2xl font-medium tracking-tight text-stone-900">
                    {fmtMoney(Number(listing.list_price || 0))}
                  </p>

                  {listing.property_type && (
                    <div className="mt-2">
                      <YellowBadge>{listing.property_type}</YellowBadge>
                    </div>
                  )}

                  <div className="mt-4 space-y-2 rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <DollarSign size={11} /> $/Sqft
                      </span>
                      <span className="font-mono font-medium text-stone-800">
                        ${ppsf}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Eye size={11} /> Showings
                      </span>
                      <span className="font-mono text-stone-800">
                        {listing.showings ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <FileText size={11} /> Offers
                      </span>
                      <span className="font-mono text-stone-800">
                        {listing.offers ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Activity size={11} /> S/O Ratio
                      </span>
                      <span className="font-mono font-medium text-stone-800">
                        {showingToOffer}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Clock size={11} /> DOM
                      </span>
                      <span
                        className="font-mono font-medium"
                        style={{
                          color:
                            (listing.days_on_market ?? 0) > 60
                              ? T.red
                              : (listing.days_on_market ?? 0) > 30
                              ? T.yellow
                              : T.green,
                        }}
                      >
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
