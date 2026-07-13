import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { TrendingUp, Building2, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default async function MarketPage() {
  const supabase = createServerClient();

  // Fetch properties — core data
  const { data: properties } = await supabase
    .from("properties")
    .select("id, address, city, monthly_rent, cap_rate, estimated_value, units, sqft, status");

  const propList = (properties ?? []) as any[];

  // Try optional market tables — don't crash if they don't exist
  let benchmarks: any[] = [];
  let submarketData: any[] = [];

  try {
    const { data } = await supabase.from("cap_rate_benchmarks").select("*");
    benchmarks = data ?? [];
  } catch {
    // table may not exist
  }

  try {
    const { data } = await supabase.from("submarket_data").select("*");
    submarketData = data ?? [];
  } catch {
    // table may not exist
  }

  // Portfolio-level metrics
  const propsWithCap = propList.filter(
    (p) => p.cap_rate !== null && p.cap_rate !== undefined && Number(p.cap_rate) > 0
  );
  const avgCapRate =
    propsWithCap.length > 0
      ? propsWithCap.reduce((s, p) => s + Number(p.cap_rate), 0) / propsWithCap.length
      : 0;

  const totalUnits = propList.reduce((s, p) => s + (p.units || 0), 0);
  const totalValue = propList.reduce(
    (s, p) => s + Number(p.estimated_value || 0),
    0
  );
  const totalMonthlyRent = propList.reduce(
    (s, p) => s + Number(p.monthly_rent || 0),
    0
  );
  const valuePerUnit = totalUnits > 0 ? Math.round(totalValue / totalUnits) : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="MARKET INTELLIGENCE"
        title={
          <>
            Market <em className="italic">Analysis</em>
          </>
        }
        subtitle="Portfolio positioning, cap rates, and market comparisons."
      />

      {/* Hero: Portfolio Cap Rate */}
      <section className="mb-10 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DarkStatCard
            label="PORTFOLIO AVG CAP RATE"
            value={avgCapRate > 0 ? fmtPct(avgCapRate) : "N/A"}
            subtitle={
              propsWithCap.length > 0
                ? `Computed across ${propsWithCap.length} properties with cap rate data`
                : "No cap rate data available yet"
            }
            icon={<TrendingUp className="h-5 w-5 text-stone-400" />}
          />
        </div>
        <div className="flex flex-col gap-4">
          <KpiCard
            label="TOTAL VALUE"
            value={totalValue > 0 ? fmtMoney(totalValue) : "N/A"}
            note={totalUnits > 0 ? `${fmtMoney(valuePerUnit)} per unit` : undefined}
          />
          <KpiCard
            label="MONTHLY RENT"
            value={fmtMoney(totalMonthlyRent)}
            note={`${propList.length} properties`}
          />
        </div>
      </section>

      {/* Property-level comparison */}
      <section className="mb-10">
        <SectionLabel>PROPERTY COMPARISON</SectionLabel>
        {propList.length === 0 ? (
          <Card className="mt-3">
            <div className="py-12 text-center">
              <Building2 className="mx-auto mb-3 h-8 w-8 text-stone-300" />
              <p className="text-sm text-stone-500">
                No properties found. Add properties to see market analysis.
              </p>
            </div>
          </Card>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {propList.map((prop, i) => {
              const rent = Number(prop.monthly_rent || 0);
              const capRate = prop.cap_rate ? Number(prop.cap_rate) : null;
              const value = Number(prop.estimated_value || 0);
              const units = prop.units || 1;
              const valuePerU = value > 0 ? Math.round(value / units) : null;
              const sqft = prop.sqft ? Number(prop.sqft) : null;
              const rentPerSqft =
                sqft && sqft > 0 && rent > 0
                  ? (rent / sqft).toFixed(2)
                  : null;

              return (
                <StaggerIn key={prop.id} index={i}>
                  <Card>
                    <p className="text-sm font-medium text-stone-900">
                      {prop.address}
                    </p>
                    {prop.city && (
                      <p className="text-xs text-stone-500">{prop.city}</p>
                    )}

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Monthly Rent</span>
                        <span
                          className="font-medium text-stone-900"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {fmtMoney(rent)}
                        </span>
                      </div>

                      {capRate !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">Cap Rate</span>
                          <span
                            className="font-medium"
                            style={{
                              fontFamily: "var(--font-geist-mono)",
                              color:
                                capRate >= avgCapRate && avgCapRate > 0
                                  ? T.green
                                  : T.red,
                            }}
                          >
                            {fmtPct(capRate)}
                          </span>
                        </div>
                      )}

                      {valuePerU !== null && valuePerU > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">Value / Unit</span>
                          <span
                            className="font-medium text-stone-900"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            {fmtMoney(valuePerU)}
                          </span>
                        </div>
                      )}

                      {rentPerSqft && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-stone-500">Rent / sqft</span>
                          <span
                            className="font-medium text-stone-900"
                            style={{ fontFamily: "var(--font-geist-mono)" }}
                          >
                            ${rentPerSqft}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">Units</span>
                        <span className="text-stone-700">{units}</span>
                      </div>
                    </div>
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        )}
      </section>

      {/* Benchmarks — if data exists */}
      {benchmarks.length > 0 && (
        <section className="mb-10">
          <SectionLabel>CAP RATE BENCHMARKS</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benchmarks.map((b: any, i: number) => {
              const label =
                b.submarket || b.market || b.name || b.area || `Benchmark ${i + 1}`;
              const rate = b.cap_rate ?? b.rate ?? b.value;
              return (
                <StaggerIn key={b.id ?? i} index={i}>
                  <Card>
                    <p className="text-sm font-medium text-stone-900">{label}</p>
                    {rate !== undefined && (
                      <p
                        className="mt-2 text-2xl font-medium tracking-tight"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        {typeof rate === "number" ? fmtPct(rate) : String(rate)}
                      </p>
                    )}
                    {avgCapRate > 0 && typeof rate === "number" && (
                      <p className="mt-1 text-xs text-stone-500">
                        Portfolio is{" "}
                        {avgCapRate > rate
                          ? `${fmtPct(avgCapRate - rate)} above`
                          : avgCapRate < rate
                            ? `${fmtPct(rate - avgCapRate)} below`
                            : "at"}{" "}
                        this benchmark
                      </p>
                    )}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      {/* Submarket data — if data exists */}
      {submarketData.length > 0 && (
        <section className="mb-10">
          <SectionLabel>SUBMARKET DATA</SectionLabel>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {submarketData.map((s: any, i: number) => {
              const keys = Object.keys(s).filter(
                (k) => k !== "id" && k !== "created_at" && k !== "updated_at"
              );
              return (
                <StaggerIn key={s.id ?? i} index={i}>
                  <Card>
                    {keys.map((key) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize text-stone-500">
                          {key.replace(/_/g, " ")}
                        </span>
                        <span className="font-medium text-stone-900">
                          {String(s[key])}
                        </span>
                      </div>
                    ))}
                  </Card>
                </StaggerIn>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state for market feeds */}
      {benchmarks.length === 0 && submarketData.length === 0 && (
        <section>
          <Card>
            <div className="py-8 text-center">
              <BarChart3 className="mx-auto mb-3 h-8 w-8 text-stone-300" />
              <p className="text-sm font-medium text-stone-700">
                Market data feeds not yet connected
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Add cap_rate_benchmarks or submarket_data to see market comparisons.
              </p>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
