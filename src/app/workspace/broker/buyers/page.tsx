import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  StatusDot,
  IconChip,
  KpiCard,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Users,
  Target,
  Heart,
  AlertTriangle,
  Sparkles,
  Timer,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const motivationLabel = (score: number) => {
  if (score >= 9) return "Very High";
  if (score >= 7) return "High";
  if (score >= 5) return "Moderate";
  if (score >= 3) return "Low";
  return "Passive";
};

const motivationColor = (score: number) => {
  if (score >= 9) return T.green;
  if (score >= 7) return T.yellow;
  return T.red;
};

type BuyerMatch = {
  id: string;
  listing_id: string;
  buyer_id: string;
  match_score: number;
  match_reasons: string[] | null;
  mismatch_reasons: string[] | null;
  status: string;
  listing?: {
    address: string;
    city: string;
    list_price: number;
  } | null;
};

export default async function BuyerMatchPage() {
  const supabase = createServerClient();

  const [buyersRes, matchesRes] = await Promise.all([
    supabase.from("buyer_profiles").select("*").order("name"),
    supabase
      .from("buyer_matches")
      .select("*, listing:listings(address, city, list_price)")
      .order("match_score", { ascending: false }),
  ]);

  const buyers = buyersRes.data ?? [];
  const allMatches = (matchesRes.data ?? []) as BuyerMatch[];

  const matchesByBuyer: Record<string, BuyerMatch[]> = {};
  for (const m of allMatches) {
    if (!matchesByBuyer[m.buyer_id]) matchesByBuyer[m.buyer_id] = [];
    matchesByBuyer[m.buyer_id].push(m);
  }

  const totalBuyers = buyers.length;
  const highMotivation = buyers.filter((b) => (b.motivation ?? 0) >= 8).length;
  const totalMatches = allMatches.length;
  const avgScore = totalMatches
    ? Math.round(
        allMatches.reduce((s, m) => s + (m.match_score || 0), 0) / totalMatches
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="BUYER INTELLIGENCE"
        title="Buyer Match"
        subtitle="AI-scored buyer-to-listing matches ranked by compatibility."
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Buyers" value={totalBuyers} note="In database" />
        <KpiCard
          label="High Motivation"
          value={highMotivation}
          note="Score 8+"
        />
        <KpiCard
          label="Active Matches"
          value={totalMatches}
          note="Across all buyers"
        />
        <KpiCard label="Avg Match Score" value={avgScore} note="Out of 100" />
      </div>

      <div className="mt-10 space-y-8">
        {buyers.map((buyer, i) => {
          const buyerMatches = matchesByBuyer[buyer.id] ?? [];

          return (
            <StaggerIn key={buyer.id} index={i}>
              <Card className="overflow-hidden">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <IconChip>
                        <Users size={16} className="text-stone-700" />
                      </IconChip>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-900">
                          {buyer.name}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {buyer.email}
                          {buyer.phone ? ` / ${buyer.phone}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                      <span className="flex items-center gap-1">
                        <Target size={13} /> Budget:{" "}
                        {fmtMoney(Number(buyer.budget_min || 0))} &ndash;{" "}
                        {fmtMoney(Number(buyer.budget_max || 0))}
                      </span>
                      {buyer.timeline && (
                        <span className="flex items-center gap-1">
                          <Timer size={13} /> {buyer.timeline}
                        </span>
                      )}
                    </div>

                    {buyer.property_types &&
                      Array.isArray(buyer.property_types) &&
                      buyer.property_types.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {buyer.property_types.map((pt: string) => (
                            <YellowBadge key={pt}>{pt}</YellowBadge>
                          ))}
                        </div>
                      )}

                    {buyer.must_haves &&
                      Array.isArray(buyer.must_haves) &&
                      buyer.must_haves.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400">
                            Must-haves
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {buyer.must_haves.map((mh: string) => (
                              <span
                                key={mh}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700"
                              >
                                <Heart size={9} /> {mh}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {buyer.deal_breakers &&
                      Array.isArray(buyer.deal_breakers) &&
                      buyer.deal_breakers.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] uppercase tracking-wider text-stone-400">
                            Deal-breakers
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {buyer.deal_breakers.map((db: string) => (
                              <span
                                key={db}
                                className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-700"
                              >
                                <AlertTriangle size={9} /> {db}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex items-center gap-3 lg:flex-col lg:items-end">
                    <div className="flex items-center gap-2">
                      <StatusDot
                        color={motivationColor(buyer.motivation ?? 0)}
                      />
                      <span className="text-xs text-stone-500">
                        Motivation: {buyer.motivation ?? 0}/10 (
                        {motivationLabel(buyer.motivation ?? 0)})
                      </span>
                    </div>
                    {buyer.status && (
                      <YellowBadge>{buyer.status}</YellowBadge>
                    )}
                  </div>
                </div>

                {buyerMatches.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-stone-200 bg-[#FAFAF7] p-4">
                    <p className="mb-3 text-[10px] uppercase tracking-wider text-stone-400">
                      Matched Listings
                    </p>
                    <div className="space-y-2">
                      {buyerMatches.map((match) => (
                        <div
                          key={match.id}
                          className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Sparkles
                              size={14}
                              className="shrink-0 text-amber-500"
                            />
                            <div>
                              <p className="text-sm font-medium text-stone-900">
                                {match.listing?.address ?? "Unknown"}
                              </p>
                              {match.listing?.city && (
                                <p className="text-xs text-stone-400">
                                  {match.listing.city}
                                </p>
                              )}
                              {match.match_reasons &&
                                Array.isArray(match.match_reasons) && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {match.match_reasons
                                      .slice(0, 3)
                                      .map((r, ri) => (
                                        <span
                                          key={ri}
                                          className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700"
                                        >
                                          {r}
                                        </span>
                                      ))}
                                  </div>
                                )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-stone-900">
                              {match.match_score}
                            </p>
                            <p className="text-[9px] uppercase tracking-wider text-stone-400">
                              Score
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </StaggerIn>
          );
        })}
      </div>
    </div>
  );
}
