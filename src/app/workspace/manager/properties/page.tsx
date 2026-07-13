import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  YellowBadge,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtValue = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmtMoney(n);
};

const statusConfig: Record<
  string,
  { dot: string; border: string; label: string }
> = {
  occupied: { dot: T.green, border: T.green, label: "Occupied" },
  overdue: { dot: T.red, border: T.red, label: "Overdue" },
  vacant: { dot: "#D97706", border: "#D97706", label: "Vacant" },
  prospecting: { dot: "#9CA3AF", border: "#9CA3AF", label: "Prospecting" },
};

export default async function PropertiesPage() {
  const supabase = createServerClient();

  const [{ data: properties }, { data: leases }] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .order("status")
      .order("address"),
    supabase
      .from("leases")
      .select("property_id, tenant_name, status, monthly_rent, tenants(first_name, last_name)")
      .eq("status", "active"),
  ]);

  const propList = properties ?? [];
  const leaseList = leases ?? [];

  // Build a map of property_id -> active tenant name
  const tenantByProperty = new Map<string, string>();
  for (const lease of leaseList as any[]) {
    const name = lease.tenants
      ? `${lease.tenants.first_name} ${lease.tenants.last_name}`
      : lease.tenant_name || null;
    if (name && lease.property_id) {
      tenantByProperty.set(lease.property_id, name);
    }
  }

  // ── KPIs ──────────────────────────────────────────────────────
  const totalProperties = propList.length;
  const totalUnits = propList.reduce((s, p) => s + (p.units || 0), 0);
  const portfolioValue = propList.reduce(
    (s, p) => s + Number(p.estimated_value || 0),
    0,
  );
  const propsWithCap = propList.filter((p) => Number(p.cap_rate) > 0);
  const avgCapRate =
    propsWithCap.length > 0
      ? (
          propsWithCap.reduce((s, p) => s + Number(p.cap_rate), 0) /
          propsWithCap.length
        ).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="PORTFOLIO"
        title="Properties"
        subtitle={`${totalProperties} properties across your portfolio.`}
      />

      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="TOTAL PROPERTIES" value={totalProperties} />
        <KpiCard
          label="TOTAL UNITS"
          value={totalUnits}
          note={`Across ${totalProperties} properties`}
        />
        <KpiCard label="PORTFOLIO VALUE" value={fmtValue(portfolioValue)} />
        <KpiCard
          label="AVG CAP RATE"
          value={`${avgCapRate}%`}
          note={`${propsWithCap.length} properties with data`}
        />
      </section>

      {/* ── Property Card Grid ────────────────────────────────────── */}
      <section>
        <SectionLabel>ALL PROPERTIES</SectionLabel>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {propList.map((property, i) => {
            const status = property.status?.toLowerCase() ?? "prospecting";
            const sc = statusConfig[status] ?? statusConfig.prospecting;
            const tenantName = tenantByProperty.get(property.id) ?? null;

            return (
              <StaggerIn key={property.id} index={i}>
                <Card className="relative overflow-hidden" padded={false}>
                  {/* Color-coded left accent */}
                  <div
                    className="absolute left-0 top-0 h-full w-1 rounded-l-[2.5rem]"
                    style={{ backgroundColor: sc.border }}
                  />
                  <div className="p-6 pl-7">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-medium text-stone-900">
                          {property.address}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="h-3 w-3" />
                          {property.city}
                          {property.state ? `, ${property.state}` : ""}
                        </p>
                      </div>
                      <YellowBadge>
                        {property.property_type ?? "Unknown"}
                      </YellowBadge>
                    </div>

                    {/* Status */}
                    <div className="mt-4 flex items-center gap-2">
                      <StatusDot color={sc.dot} />
                      <span className="text-xs font-medium text-stone-700">
                        {sc.label}
                      </span>
                    </div>

                    {/* Tenant name if occupied */}
                    {tenantName && (
                      <p className="mt-2 text-xs text-stone-500">
                        Tenant: <span className="font-medium text-stone-700">{tenantName}</span>
                      </p>
                    )}

                    {/* Metrics grid */}
                    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-100 pt-4">
                      <MetricCell
                        label="Units"
                        value={String(property.units ?? 0)}
                      />
                      <MetricCell
                        label="Monthly Rent"
                        value={fmtMoney(Number(property.monthly_rent || 0))}
                      />
                      <MetricCell
                        label="Est. Value"
                        value={fmtValue(
                          Number(property.estimated_value || 0),
                        )}
                      />
                      <MetricCell
                        label="Cap Rate"
                        value={
                          Number(property.cap_rate) > 0
                            ? `${Number(property.cap_rate).toFixed(1)}%`
                            : "\u2014"
                        }
                      />
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
          {propList.length === 0 && (
            <div className="col-span-full py-12 text-center text-stone-400">
              No properties found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.14em] text-stone-500"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {label}
      </p>
      <p
        className="mt-0.5 text-sm font-medium text-stone-800"
        style={{ fontFamily: "var(--font-geist-mono)" }}
      >
        {value}
      </p>
    </div>
  );
}
