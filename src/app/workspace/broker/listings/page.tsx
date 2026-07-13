import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  T,
} from "@/components/ui/primitives";
import { Clock, Eye, FileText, MapPin, User } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-800 border border-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-800 border border-amber-200";
    case "under_contract":
    case "under contract":
      return "bg-purple-50 text-purple-800 border border-purple-200";
    case "sold":
      return "bg-stone-100 text-stone-600 border border-stone-300";
    case "coming_soon":
    case "coming soon":
      return "bg-blue-50 text-blue-800 border border-blue-200";
    default:
      return "bg-stone-100 text-stone-600 border border-stone-300";
  }
};

export default async function ListingsPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("list_price", { ascending: false });

  const listings = data ?? [];

  const total = listings.length;
  const active = listings.filter((l) => l.status === "active").length;
  const pending = listings.filter((l) => l.status === "pending").length;
  const underContract = listings.filter(
    (l) => l.status === "under_contract" || l.status === "under contract"
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="LISTINGS"
        title="Active Listings"
        subtitle="Every property in the pipeline with live performance data."
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Listings" value={total} note="All statuses" />
        <KpiCard label="Active" value={active} note="On market" />
        <KpiCard label="Pending" value={pending} note="Offers accepted" />
        <KpiCard
          label="Under Contract"
          value={underContract}
          note="Closing in progress"
        />
      </div>

      <div className="mt-10">
        <SectionLabel>ALL LISTINGS</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, i) => (
            <StaggerIn key={listing.id} index={i}>
              <Card className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-stone-900">
                        {listing.address}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                        <MapPin size={11} />
                        {listing.city}, {listing.state} {listing.zip}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusColor(
                        listing.status
                      )}`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  {listing.property_type && (
                    <div className="mt-3">
                      <YellowBadge>{listing.property_type}</YellowBadge>
                    </div>
                  )}

                  <p className="mt-4 text-3xl font-medium tracking-tight text-stone-900">
                    {fmtMoney(Number(listing.list_price || 0))}
                  </p>

                  <div className="mt-3 flex items-center gap-3 text-sm text-stone-600">
                    <span>{listing.beds} bd</span>
                    <span className="text-stone-300">|</span>
                    <span>{listing.baths} ba</span>
                    <span className="text-stone-300">|</span>
                    <span>{(listing.sqft || 0).toLocaleString()} sqft</span>
                  </div>

                  {listing.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-stone-500">
                      {listing.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
                  <div className="flex items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {listing.days_on_market ?? 0} DOM
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {listing.showings ?? 0} showings
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} /> {listing.offers ?? 0} offers
                    </span>
                  </div>
                </div>

                {listing.agent_name && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-400">
                    <User size={11} /> {listing.agent_name}
                  </div>
                )}
              </Card>
            </StaggerIn>
          ))}
        </div>
      </div>
    </div>
  );
}
