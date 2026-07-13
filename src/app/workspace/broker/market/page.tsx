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
  StatusDot,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  LineChart,
  Building2,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Zap,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function MarketPulsePage() {
  const supabase = createServerClient();

  const [listingsRes, offMarketRes] = await Promise.all([
    supabase.from("listings").select("*"),
    supabase
      .from("off_market_leads")
      .select("*")
      .order("opportunity_score", { ascending: false }),
  ]);

  const listings = listingsRes.data ?? [];
  const offMarketLeads = offMarketRes.data ?? [];

  const totalInventory = listings.length;
  const avgListPrice = listings.length
    ? Math.round(
        listings.reduce((s, l) => s + Number(l.list_price || 0), 0) /
          listings.length
      )
    : 0;
  const avgDom = listings.length
    ? Math.round(
        listings.reduce((s, l) => s + (l.days_on_market || 0), 0) /
          listings.length
      )
    : 0;

  const activeCount = listings.filter((l) => l.status === "active").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const soldCount = listings.filter((l) => l.status === "sold").length;

  const statusBreakdown = [
    { label: "Active", count: activeCount, color: T.green },
    { label: "Pending", count: pendingCount, color: T.yellow },
    { label: "Sold", count: soldCount, color: T.dim },
  ];

  const totalShowings = listings.reduce((s, l) => s + (l.showings || 0), 0);
  const totalOffers = listings.reduce((s, l) => s + (l.offers || 0), 0);

  // Property type breakdown
  const typeMap: Record<string, number> = {};
  for (const l of listings) {
    const t = l.property_type || "Unknown";
    typeMap[t] = (typeMap[t] || 0) + 1;
  }
  const typeBreakdown = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="MARKET PULSE"
        title="Market Intelligence"
        subtitle="Aggregated market data, inventory analysis, and off-market opportunities."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <DarkStatCard
          label="Total Inventory"
          value={totalInventory}
          subtitle={`${fmtMoney(avgListPrice)} avg list price`}
          icon={<Building2 size={20} className="text-stone-400" />}
        />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <KpiCard
            label="Avg List Price"
            value={fmtMoney(avgListPrice)}
            note="All listings"
          />
          <KpiCard
            label="Avg DOM"
            value={`${avgDom} days`}
            note="Days on market"
          />
          <KpiCard
            label="Total Showings"
            value={totalShowings}
            note="Market activity"
          />
          <KpiCard
            label="Total Offers"
            value={totalOffers}
            note="Buyer interest"
          />
        </div>
      </div>

      {/* Market Activity Indicators */}
      <div className="mt-10">
        <SectionLabel>MARKET ACTIVITY</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Status Breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <IconChip>
                <BarChart3 size={14} className="text-stone-700" />
              </IconChip>
              <p className="text-sm font-semibold text-stone-900">
                Status Breakdown
              </p>
            </div>
            <div className="space-y-3">
              {statusBreakdown.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot color={s.color} />
                    <span className="text-sm text-stone-700">{s.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-stone-900">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Property Type Mix */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <IconChip>
                <Building2 size={14} className="text-stone-700" />
              </IconChip>
              <p className="text-sm font-semibold text-stone-900">
                Property Types
              </p>
            </div>
            <div className="space-y-2">
              {typeBreakdown.map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-lg border border-stone-100 bg-[#FAFAF7] px-3 py-2"
                >
                  <YellowBadge>{type}</YellowBadge>
                  <span className="text-sm font-medium text-stone-800">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Absorption Indicator */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <IconChip>
                <TrendingUp size={14} className="text-stone-700" />
              </IconChip>
              <p className="text-sm font-semibold text-stone-900">
                Market Velocity
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Showings/Listing
                </span>
                <span className="font-mono text-sm font-medium text-stone-900">
                  {listings.length
                    ? (totalShowings / listings.length).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Offers/Listing
                </span>
                <span className="font-mono text-sm font-medium text-stone-900">
                  {listings.length
                    ? (totalOffers / listings.length).toFixed(1)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Conversion Rate
                </span>
                <span className="font-mono text-sm font-medium text-stone-900">
                  {totalShowings > 0
                    ? ((totalOffers / totalShowings) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 p-2 text-center">
                <span
                  className="text-xs font-medium"
                  style={{
                    color:
                      avgDom < 21 ? T.green : avgDom < 45 ? T.yellow : T.red,
                  }}
                >
                  {avgDom < 21
                    ? "Hot Market"
                    : avgDom < 45
                    ? "Balanced Market"
                    : "Cooling Market"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Off-Market Leads */}
      {offMarketLeads.length > 0 && (
        <div className="mt-12">
          <SectionLabel>OFF-MARKET LEADS</SectionLabel>
          <div className="mt-4">
            <ListContainer>
              <ListHeader label="OPPORTUNITY PIPELINE" />
              {offMarketLeads.map((lead, i) => (
                <div key={i} className="px-4 pb-2">
                  <ListRow last={i === offMarketLeads.length - 1}>
                    <div className="flex items-center gap-3">
                      <IconChip>
                        <Zap size={14} className="text-stone-700" />
                      </IconChip>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {lead.address}
                        </p>
                        <p className="text-xs text-stone-500">
                          {lead.city} &middot; Owner: {lead.owner_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {lead.est_value && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-stone-800">
                            {fmtMoney(Number(lead.est_value))}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-stone-400">
                            Est. Value
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1">
                          {lead.distress_score != null && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor:
                                  lead.distress_score >= 7
                                    ? "rgba(185,28,28,0.1)"
                                    : "rgba(249,217,106,0.3)",
                                color:
                                  lead.distress_score >= 7
                                    ? T.red
                                    : "#92700C",
                              }}
                            >
                              D:{lead.distress_score}
                            </span>
                          )}
                          {lead.opportunity_score != null && (
                            <span
                              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: "rgba(21,128,61,0.1)",
                                color: T.green,
                              }}
                            >
                              O:{lead.opportunity_score}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListRow>
                </div>
              ))}
            </ListContainer>
          </div>
        </div>
      )}
    </div>
  );
}
