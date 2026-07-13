import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  StatusDot,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Flame,
  Leaf,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

type AgingCategory = "fresh" | "active" | "stale" | "critical";

function getAgingCategory(dom: number): {
  category: AgingCategory;
  label: string;
  color: string;
  icon: typeof Leaf;
} {
  if (dom < 14) return { category: "fresh", label: "Fresh", color: T.green, icon: Leaf };
  if (dom < 30) return { category: "active", label: "Active", color: T.yellow, icon: Activity };
  if (dom < 60) return { category: "stale", label: "Stale", color: "#D97706", icon: Clock };
  return { category: "critical", label: "Critical", color: T.red, icon: AlertTriangle };
}

export default async function DomPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .order("days_on_market", { ascending: false });

  const listings = data ?? [];

  const avgDom = listings.length
    ? Math.round(
        listings.reduce((s, l) => s + (l.days_on_market || 0), 0) /
          listings.length
      )
    : 0;

  const maxDom = listings.length
    ? Math.max(...listings.map((l) => l.days_on_market || 0))
    : 0;

  const freshCount = listings.filter((l) => (l.days_on_market || 0) < 14).length;
  const activeCount = listings.filter(
    (l) => (l.days_on_market || 0) >= 14 && (l.days_on_market || 0) < 30
  ).length;
  const staleCount = listings.filter(
    (l) => (l.days_on_market || 0) >= 30 && (l.days_on_market || 0) < 60
  ).length;
  const criticalCount = listings.filter(
    (l) => (l.days_on_market || 0) >= 60
  ).length;

  const categories = [
    { label: "Fresh (<14d)", count: freshCount, color: T.green },
    { label: "Active (14-30d)", count: activeCount, color: T.yellow },
    { label: "Stale (30-60d)", count: staleCount, color: "#D97706" },
    { label: "Critical (60+d)", count: criticalCount, color: T.red },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="PERFORMANCE"
        title="Days on Market"
        subtitle="Listing aging analysis with freshness categories and actionable insights."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <DarkStatCard
            label="Avg DOM"
            value={`${avgDom}`}
            subtitle={`Max: ${maxDom} days | ${listings.length} listings`}
            icon={<Clock size={20} className="text-stone-400" />}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <KpiCard
              key={cat.label}
              label={cat.label}
              value={cat.count}
              note={`of ${listings.length} total`}
            />
          ))}
        </div>
      </div>

      {/* Aging Distribution Visual */}
      <div className="mt-10">
        <SectionLabel>AGING DISTRIBUTION</SectionLabel>
        <div className="mt-4">
          <Card>
            <div className="flex h-8 w-full overflow-hidden rounded-full">
              {categories.map((cat) => {
                const pct =
                  listings.length > 0
                    ? (cat.count / listings.length) * 100
                    : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={cat.label}
                    className="flex items-center justify-center text-[10px] font-medium text-white transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                      minWidth: pct > 0 ? "2rem" : 0,
                    }}
                  >
                    {cat.count > 0 && cat.count}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {categories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-1.5">
                  <StatusDot color={cat.color} />
                  <span className="text-xs text-stone-600">{cat.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Per-Listing DOM Analysis */}
      <div className="mt-10">
        <SectionLabel>LISTING DOM ANALYSIS</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing, i) => {
            const dom = listing.days_on_market || 0;
            const aging = getAgingCategory(dom);
            const AgingIcon = aging.icon;
            const barPct = maxDom > 0 ? Math.min((dom / maxDom) * 100, 100) : 0;

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
                    <div
                      className="flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{
                        backgroundColor: aging.color + "15",
                      }}
                    >
                      <AgingIcon size={11} style={{ color: aging.color }} />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: aging.color }}
                      >
                        {aging.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className="text-4xl font-semibold tracking-tight"
                      style={{ color: aging.color }}
                    >
                      {dom}
                    </span>
                    <span className="text-sm text-stone-500">days</span>
                  </div>

                  {/* DOM bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${barPct}%`,
                        backgroundColor: aging.color,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                    <span>
                      {fmtMoney(Number(listing.list_price || 0))}
                    </span>
                    <span>
                      {listing.showings ?? 0} showings / {listing.offers ?? 0}{" "}
                      offers
                    </span>
                  </div>

                  {listing.status && (
                    <div className="mt-2">
                      <YellowBadge>{listing.status}</YellowBadge>
                    </div>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
