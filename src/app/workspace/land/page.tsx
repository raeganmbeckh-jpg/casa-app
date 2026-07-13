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
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { SwarmPanel } from "@/components/workspace/SwarmPanel";
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  Building2,
  Mail,
  MapPin,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function LandDashboard() {
  const supabase = createServerClient();

  const [{ data: parcels }, { data: outreach }] = await Promise.all([
    supabase.from("land_parcels").select("*"),
    supabase.from("land_outreach").select("*"),
  ]);

  const { data: agentActions } = await supabase.from("agent_actions").select("*").eq("role", "land").order("created_at", { ascending: false }).limit(20);

  const parcelList = parcels ?? [];
  const outreachList = outreach ?? [];

  // KPIs
  const activeCount = parcelList.length;
  const totalAcreage = parcelList.reduce(
    (s, p) => s + Number(p.acreage || 0),
    0
  );
  const avgOpportunity =
    parcelList.length > 0
      ? (
          parcelList.reduce((s, p) => s + Number(p.opportunity_score || 0), 0) /
          parcelList.length
        ).toFixed(1)
      : "0";
  const taxDelinquentCount = parcelList.filter(
    (p) => p.tax_delinquent === true
  ).length;
  const maxBuildableUnits = parcelList.reduce(
    (s, p) => s + Number(p.max_units || 0),
    0
  );

  // Top opportunities
  const topOpportunities = [...parcelList]
    .sort((a, b) => Number(b.opportunity_score || 0) - Number(a.opportunity_score || 0))
    .slice(0, 3);

  // Outreach summary by response
  const responseCounts: Record<string, number> = {};
  outreachList.forEach((o) => {
    const key = o.response || "No Response";
    responseCounts[key] = (responseCounts[key] || 0) + 1;
  });

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream }}
    >
      <PageTitle
        eyebrow="THE ACQUISITION ENGINE"
        title={
          <>
            Land <em className="italic text-stone-500">Intelligence</em>
          </>
        }
        subtitle="Your command center for land acquisition. Every parcel, every score, every opportunity."
      />

      {/* Hero stat + KPIs */}
      <section className="mb-10 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <DarkStatCard
            label="ACTIVE PARCELS"
            value={activeCount}
            subtitle={`${totalAcreage.toFixed(1)} total acres tracked`}
            icon={<Layers className="h-5 w-5 text-stone-400" />}
          />
        </div>
        <KpiCard
          label="TOTAL ACREAGE"
          value={totalAcreage.toFixed(1)}
          note="Sum across all parcels"
        />
        <KpiCard
          label="AVG OPPORTUNITY SCORE"
          value={avgOpportunity}
          note="Out of 10"
        />
        <KpiCard
          label="TAX DELINQUENT"
          value={taxDelinquentCount}
          note={`of ${activeCount} parcels`}
        />
        <KpiCard
          label="MAX BUILDABLE UNITS"
          value={maxBuildableUnits.toLocaleString()}
          note="Sum of max_units"
        />
      </section>

      {/* Top Opportunities */}
      <section className="mb-10">
        <SectionLabel>TOP OPPORTUNITIES</SectionLabel>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {topOpportunities.map((p, i) => (
            <StaggerIn key={p.id} index={i}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <IconChip>
                        <MapPin className="h-4 w-4 text-stone-700" />
                      </IconChip>
                      <div>
                        <h3 className="truncate text-lg font-medium text-stone-900">
                          {p.address || "No Address"}
                        </h3>
                        <p className="text-xs text-stone-500">
                          {p.city}
                          {p.county ? `, ${p.county}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  {p.status && <YellowBadge>{p.status}</YellowBadge>}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <ScoreBlock
                    label="Motivation"
                    value={p.motivation_score}
                  />
                  <ScoreBlock
                    label="Opportunity"
                    value={p.opportunity_score}
                  />
                  <ScoreBlock
                    label="Distress"
                    value={p.distress_score}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Acreage
                    </span>
                    <p className="text-sm font-medium text-stone-900">
                      {Number(p.acreage || 0).toFixed(2)} ac
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Zoning
                    </span>
                    <p className="text-sm font-medium text-stone-900">
                      {p.zoning_code || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span
                      className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Asking
                    </span>
                    <p className="text-sm font-medium text-stone-900">
                      {p.asking_price ? fmtMoney(Number(p.asking_price)) : "N/A"}
                    </p>
                  </div>
                </div>
              </Card>
            </StaggerIn>
          ))}
          {topOpportunities.length === 0 && (
            <Card>
              <p className="py-8 text-center text-sm text-stone-400">
                No parcels found. Add parcels to see top opportunities.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Outreach Summary */}
      <section>
        <SectionLabel>OUTREACH SUMMARY</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {Object.entries(responseCounts).map(([response, count], i) => (
            <StaggerIn key={response} index={i}>
              <Card>
                <div className="flex items-center gap-3">
                  <StatusDot
                    color={
                      response.toLowerCase().includes("interested")
                        ? T.green
                        : response.toLowerCase().includes("no")
                        ? T.red
                        : T.yellow
                    }
                  />
                  <div>
                    <p className="text-sm font-medium text-stone-900 capitalize">
                      {response}
                    </p>
                    <p
                      className="text-2xl font-medium tracking-tight text-stone-900"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {count}
                    </p>
                  </div>
                </div>
              </Card>
            </StaggerIn>
          ))}
          {Object.keys(responseCounts).length === 0 && (
            <Card>
              <div className="flex items-center gap-3 text-stone-400">
                <Mail className="h-4 w-4" />
                <p className="text-sm">No outreach recorded yet.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      <section className="mt-6">
        <SwarmPanel role="land" initialActions={agentActions ?? []} />
      </section>
    </div>
  );
}

function ScoreBlock({ label, value }: { label: string; value: number | null }) {
  const score = Number(value || 0);
  const color =
    score >= 8 ? T.green : score >= 5 ? "#CA8A04" : T.red;
  return (
    <div className="rounded-2xl bg-[#FAFAF7] px-3 py-2 text-center">
      <p
        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={{ color, fontFamily: "var(--font-geist-mono)" }}
      >
        {score}
      </p>
    </div>
  );
}
