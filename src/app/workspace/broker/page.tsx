import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  StaggerIn,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import {
  Home,
  Building2,
  Users,
  DollarSign,
  Clock,
  Eye,
  FileText,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function BrokerDashboardPage() {
  const supabase = createServerClient();

  const [listingsRes, commissionsRes, matchesRes] = await Promise.all([
    supabase.from("listings").select("*"),
    supabase.from("commissions").select("*"),
    supabase
      .from("buyer_matches")
      .select("*, listing:listings(*), buyer:buyer_profiles(*)")
      .order("match_score", { ascending: false })
      .limit(5),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "broker").order("created_at", { ascending: false }).limit(20);

  const listings = listingsRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const matches = matchesRes.data ?? [];

  const activeListings = listings.filter(
    (l) => l.status === "active" || l.status === "pending"
  );
  const totalListPrice = activeListings.reduce(
    (s, l) => s + Number(l.list_price || 0),
    0
  );
  const totalShowings = listings.reduce((s, l) => s + (l.showings || 0), 0);
  const totalOffers = listings.reduce((s, l) => s + (l.offers || 0), 0);
  const pendingCommissions = commissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + Number(c.net_commission || 0), 0);
  const avgDom = listings.length
    ? Math.round(
        listings.reduce((s, l) => s + (l.days_on_market || 0), 0) /
          listings.length
      )
    : 0;

  const featuredListings = [...listings]
    .sort((a, b) => Number(b.list_price || 0) - Number(a.list_price || 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="THE DEAL DESK"
        title="Brokerage Operations"
        subtitle="Live pipeline, matches, and revenue at a glance."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <DarkStatCard
            label="Active Listings"
            value={activeListings.length}
            subtitle={`${fmtMoney(totalListPrice)} total list price`}
            icon={<Building2 size={20} className="text-stone-400" />}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <KpiCard
            label="Total Showings"
            value={totalShowings}
            note="Across all listings"
          />
          <KpiCard
            label="Total Offers"
            value={totalOffers}
            note="Received to date"
          />
          <KpiCard
            label="Pending Commissions"
            value={fmtMoney(pendingCommissions)}
            note="Awaiting close"
          />
          <KpiCard
            label="Avg Days on Market"
            value={`${avgDom} days`}
            note="All listings"
          />
        </div>
      </div>

      <div className="mt-12">
        <SectionLabel>FEATURED LISTINGS</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredListings.map((listing, i) => (
            <StaggerIn key={listing.id} index={i}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-stone-900">
                      {listing.address}
                    </p>
                    <p className="text-xs text-stone-500">
                      {listing.city}, {listing.state}
                    </p>
                  </div>
                  <YellowBadge>{listing.status ?? "active"}</YellowBadge>
                </div>
                <p className="mt-4 text-2xl font-medium tracking-tight text-stone-900">
                  {fmtMoney(Number(listing.list_price || 0))}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
                  <span>{listing.beds} bd</span>
                  <span className="text-stone-300">|</span>
                  <span>{listing.baths} ba</span>
                  <span className="text-stone-300">|</span>
                  <span>{(listing.sqft || 0).toLocaleString()} sqft</span>
                </div>
                <div className="mt-3 flex items-center gap-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {listing.days_on_market ?? 0} DOM
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {listing.showings ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> {listing.offers ?? 0}
                  </span>
                </div>
              </Card>
            </StaggerIn>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <SectionLabel>HOT MATCHES</SectionLabel>
        <div className="mt-4">
          <ListContainer>
            <ListHeader label="BUYER MATCHES BY SCORE" />
            {matches.map((m, i) => (
              <div key={m.id} className="px-4 pb-2">
                <ListRow last={i === matches.length - 1}>
                  <div className="flex items-center gap-4">
                    <IconChip>
                      <Sparkles size={16} className="text-stone-700" />
                    </IconChip>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {m.buyer?.name ?? "Unknown Buyer"}
                      </p>
                      <p className="text-xs text-stone-500">
                        {m.listing?.address ?? "Unknown Listing"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-stone-900">
                        {m.match_score}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">
                        Score
                      </p>
                    </div>
                    <StatusDot
                      color={
                        m.match_score >= 90
                          ? T.green
                          : m.match_score >= 70
                          ? T.yellow
                          : T.red
                      }
                    />
                  </div>
                </ListRow>
              </div>
            ))}
          </ListContainer>
        </div>
      </div>

      <section className="mt-6">
        <SwarmPanel role="broker" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}
