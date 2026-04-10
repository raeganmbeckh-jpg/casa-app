"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  Home,
  Shield,
  Droplets,
  Zap,
  Flame,
  ThermometerSun,
  Sun,
  GraduationCap,
  Footprints,
  User,
  FileText,
  CreditCard,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  TrendingDown,
  Building,
  Hash,
  LandPlot,
  ChevronRight,
  CircleDot,
  PenLine,
} from "lucide-react";
import {
  getProperties,
  getTenants,
  getLeases,
  getWorkOrders,
  getTransactions,
} from "@/lib/portfolio";
import type {
  PortfolioProperty,
  Tenant,
  Lease,
  WorkOrder,
  Transaction,
} from "@/lib/types";
import AIPanel from "@/components/AIPanel";

/* ── Formatters ──────────────────────────────────────────────────── */

function fmt$(n: number | null | undefined): string {
  if (n == null) return "---";
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "---";
  return n.toLocaleString("en-US");
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return "---";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtPct(n: number): string {
  return n.toFixed(1) + "%";
}

/* ── Status Badge ────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: PortfolioProperty["status"] }) {
  const colors: Record<string, string> = {
    occupied: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    vacant: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    maintenance: "bg-red-500/20 text-red-400 border-red-500/30",
    prospecting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <span
      className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest border ${colors[status] || colors.vacant}`}
    >
      {status}
    </span>
  );
}

/* ── Section Label ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-blue-500/60" />
      {children}
    </h2>
  );
}

/* ── Card Shell ──────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0c0e18] border border-[#1e2235] rounded-lg ${className}`}>
      {children}
    </div>
  );
}

/* ── Systems Health Bar ──────────────────────────────────────────── */

function SystemBar({
  label,
  icon: Icon,
  ageYears,
  lifespan,
  costEstimate,
}: {
  label: string;
  icon: any;
  ageYears: number;
  lifespan: number;
  costEstimate: string;
}) {
  const remaining = Math.max(0, lifespan - ageYears);
  const pct = Math.max(0, Math.min(100, (remaining / lifespan) * 100));
  const urgency =
    pct <= 10
      ? { label: "REPLACE", color: "text-red-400 bg-red-500/20 border-red-500/30" }
      : pct <= 30
        ? { label: "AGING", color: "text-amber-400 bg-amber-500/20 border-amber-500/30" }
        : { label: "GOOD", color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" };
  const barColor =
    pct <= 10 ? "bg-red-500" : pct <= 30 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono uppercase tracking-wider text-gray-300">
            {label}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${urgency.color}`}
        >
          {urgency.label}
        </span>
      </div>
      <div className="w-full h-2 bg-[#1e2235] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-gray-600">
        <span>Est. {ageYears}y old / {lifespan}y life</span>
        <span>{remaining}y remaining</span>
      </div>
      <p className="text-[10px] font-mono text-gray-500">
        Replacement est. {costEstimate}
      </p>
    </div>
  );
}

/* ── Main Content ────────────────────────────────────────────────── */

function PropertyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [property, setProperty] = useState<PortfolioProperty | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    const p = getProperties().find((p) => p.id === id) || null;
    setProperty(p);
    setTenants(getTenants().filter((t) => t.property_id === id));
    setLeases(getLeases().filter((l) => l.property_id === id));
    setWorkOrders(getWorkOrders().filter((w) => w.property_id === id));
    setTransactions(getTransactions().filter((t) => t.property_id === id));
    setLoading(false);
  }, [id]);

  const financials = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const capRate = useMemo(() => {
    if (!property?.estimated_value || !property.monthly_rent) return null;
    const annualNOI = property.monthly_rent * 12 - (property.annual_taxes || 0);
    return (annualNOI / property.estimated_value) * 100;
  }, [property]);

  const currentYear = new Date().getFullYear();
  const age = property?.year_built ? currentYear - property.year_built : null;

  const walkScore = useMemo(() => {
    if (!property) return 55;
    const type = property.property_type?.toLowerCase() || "";
    if (type.includes("condo") || type.includes("apt")) return 75;
    if (type.includes("town")) return 65;
    if (type.includes("multi")) return 70;
    return 55;
  }, [property]);

  /* ── Loading / 404 ─────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
            Loading property data
          </span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-gray-500 font-mono text-sm">Property not found</p>
          <button
            onClick={() => router.back()}
            className="text-blue-400 text-xs font-mono uppercase tracking-wider hover:text-blue-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const activeTenant = tenants[0] || null;
  const activeLease = leases.find((l) => l.esign_status === "signed") || leases[0] || null;
  const activeWorkOrders = workOrders.filter((w) => w.status !== "completed");

  const sqft = property.sqft || 1500;
  const systemCosts = {
    hvac: fmt$(Math.round(sqft * 4.5)),
    roof: fmt$(Math.round(sqft * 5)),
    plumbing: fmt$(Math.round(sqft * 3)),
    electrical: fmt$(Math.round(sqft * 2.5)),
    waterHeater: fmt$(1800),
  };

  /* ── Attom room data ───────────────────────────────────────────── */
  const attomBuilding = property.attom_raw?.detail?.building || property.attom_raw?.basic?.building;
  const hasRoomData = !!(
    attomBuilding?.rooms?.beds ||
    attomBuilding?.rooms?.bathsFull ||
    attomBuilding?.rooms?.roomsTotal
  );

  return (
    <div className="min-h-screen bg-[#080a12] text-gray-200 pb-12">
      {/* ─── 1. HEADER ─────────────────────────────────────────────── */}
      <header className="border-b border-[#1e2235] px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border border-[#1e2235] hover:border-gray-600 hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-lg font-mono font-bold tracking-tight truncate">
                  {property.address}
                </h1>
                <StatusBadge status={property.status} />
              </div>
              <p className="text-xs font-mono text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {property.city}, {property.state} {property.zip}
                {property.property_type && (
                  <>
                    <span className="text-gray-700 mx-1">|</span>
                    <Home className="w-3 h-3" />
                    {property.property_type}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
        {/* ─── 2. KEY METRICS BAR ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[#1e2235] rounded-lg overflow-hidden">
          {[
            { label: "Market Value", value: fmt$(property.estimated_value), sub: property.assessed_value ? `Assessed ${fmt$(property.assessed_value)}` : null },
            { label: "Monthly Rent", value: fmt$(property.monthly_rent || null), sub: property.monthly_rent ? `${fmt$(property.monthly_rent * 12)}/yr` : null },
            { label: "Annual Taxes", value: fmt$(property.annual_taxes), sub: property.annual_taxes && property.estimated_value ? `${fmtPct((property.annual_taxes / property.estimated_value) * 100)} eff. rate` : null },
            { label: "Cap Rate", value: capRate != null ? fmtPct(capRate) : "---", sub: capRate != null ? (capRate >= 6 ? "Strong yield" : "Below avg") : null },
            { label: "Living Area", value: property.sqft ? `${fmtNum(property.sqft)} sf` : "---", sub: property.lot_sqft ? `${fmtNum(property.lot_sqft)} sf lot` : null },
            { label: "Year Built", value: property.year_built?.toString() || "---", sub: age != null ? `${age} years old` : null },
          ].map((m, i) => (
            <div key={i} className="bg-[#0c0e18] p-4 text-center">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-2">
                {m.label}
              </p>
              <p className="text-xl font-mono font-bold text-gray-100">
                {m.value}
              </p>
              {m.sub && (
                <p className="text-[10px] font-mono text-gray-600 mt-1">{m.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* ─── 3. PROPERTY DETAILS GRID ──────────────────────────── */}
        <section>
          <SectionLabel>Property Details</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Bed, label: "Bedrooms", value: property.beds != null ? String(property.beds) : "---" },
              { icon: Bath, label: "Bathrooms", value: property.baths != null ? String(property.baths) : "---" },
              { icon: Ruler, label: "Living Sqft", value: property.sqft ? fmtNum(property.sqft) : "---" },
              { icon: LandPlot, label: "Lot Size", value: property.lot_sqft ? `${fmtNum(property.lot_sqft)} sf` : "---" },
              { icon: Calendar, label: "Year Built", value: property.year_built?.toString() || "---" },
              { icon: Building, label: "Property Type", value: property.property_type || "---" },
              { icon: Droplets, label: "Flood Zone", value: property.flood_zone || "X (Minimal)" },
              { icon: Hash, label: "APN", value: property.apn || "---" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-gray-600" />
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm font-mono font-semibold text-gray-200">
                    {item.value}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ─── 4. ROOM BREAKDOWN ─────────────────────────────────── */}
        <section>
          <SectionLabel>Room Breakdown</SectionLabel>
          {hasRoomData ? (
            <Card className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Rooms", value: attomBuilding.rooms?.roomsTotal || "---" },
                  { label: "Bedrooms", value: attomBuilding.rooms?.beds || property.beds || "---" },
                  { label: "Full Baths", value: attomBuilding.rooms?.bathsFull || "---" },
                  { label: "Half Baths", value: attomBuilding.rooms?.bathsHalf || "0" },
                  { label: "Living Size", value: attomBuilding.size?.livingSize ? `${fmtNum(attomBuilding.size.livingSize)} sf` : "---" },
                  { label: "Building Size", value: attomBuilding.size?.bldgSize ? `${fmtNum(attomBuilding.size.bldgSize)} sf` : "---" },
                  { label: "Stories", value: attomBuilding.summary?.levels || "---" },
                  { label: "Units", value: attomBuilding.summary?.unitsCount || "1" },
                ].map((r, i) => (
                  <div key={i} className="bg-[#080a12] rounded-lg p-3 border border-[#1e2235]/50">
                    <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-600 mb-1">
                      {r.label}
                    </p>
                    <p className="text-base font-mono font-semibold text-gray-200">
                      {r.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-5 flex items-center gap-3">
              <CircleDot className="w-4 h-4 text-gray-600 shrink-0" />
              <div>
                <p className="text-xs font-mono text-gray-400">
                  Room data available with property inspection
                </p>
                <p className="text-[10px] font-mono text-gray-600 mt-0.5">
                  Connect ATTOM data or add manual inspection to populate room breakdown
                </p>
              </div>
            </Card>
          )}
        </section>

        {/* ─── 5. SYSTEMS HEALTH ─────────────────────────────────── */}
        <section>
          <SectionLabel>Systems Health</SectionLabel>
          {age != null ? (
            <Card className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SystemBar
                  label="HVAC System"
                  icon={ThermometerSun}
                  ageYears={Math.min(age, Math.round(age * 0.7))}
                  lifespan={20}
                  costEstimate={systemCosts.hvac}
                />
                <SystemBar
                  label="Roof"
                  icon={Shield}
                  ageYears={Math.min(age, Math.round(age * 0.8))}
                  lifespan={25}
                  costEstimate={systemCosts.roof}
                />
                <SystemBar
                  label="Plumbing"
                  icon={Droplets}
                  ageYears={age}
                  lifespan={50}
                  costEstimate={systemCosts.plumbing}
                />
                <SystemBar
                  label="Electrical"
                  icon={Zap}
                  ageYears={age}
                  lifespan={40}
                  costEstimate={systemCosts.electrical}
                />
                <SystemBar
                  label="Water Heater"
                  icon={Flame}
                  ageYears={Math.min(age, 12)}
                  lifespan={12}
                  costEstimate={systemCosts.waterHeater}
                />
              </div>
            </Card>
          ) : (
            <Card className="p-5 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500/60 shrink-0" />
              <p className="text-xs font-mono text-gray-500">
                Year built unknown -- unable to estimate system ages
              </p>
            </Card>
          )}
        </section>

        {/* ─── 6. NEIGHBORHOOD INTEL ─────────────────────────────── */}
        <section>
          <SectionLabel>Neighborhood Intel</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Footprints className="w-4 h-4 text-blue-400/60" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                  Walk Score
                </span>
              </div>
              <p className="text-3xl font-mono font-bold text-gray-100">
                {walkScore}
                <span className="text-sm text-gray-600 ml-1">/ 100</span>
              </p>
              <div className="w-full h-1.5 bg-[#1e2235] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${walkScore}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-gray-600 mt-2">
                {walkScore >= 70 ? "Very Walkable" : walkScore >= 50 ? "Somewhat Walkable" : "Car-Dependent"}
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-emerald-400/60" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                  School Rating
                </span>
              </div>
              <p className="text-3xl font-mono font-bold text-gray-100">
                7<span className="text-sm text-gray-600 ml-1">/ 10</span>
              </p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i < 7 ? "bg-emerald-500" : "bg-[#1e2235]"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] font-mono text-gray-600 mt-2">
                Above Average (nearby district)
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-4 h-4 text-amber-400/60" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                  Sun Exposure
                </span>
              </div>
              <p className="text-lg font-mono font-bold text-gray-100 mt-1">
                Good
              </p>
              <p className="text-xs font-mono text-gray-400 mt-2">
                Southern exposure estimated
              </p>
              <p className="text-[10px] font-mono text-gray-600 mt-1">
                Solar potential: ~5.2 kWh/m2/day
              </p>
            </Card>
          </div>
        </section>

        {/* ─── 7. TENANT & LEASE ─────────────────────────────────── */}
        <section>
          <SectionLabel>Tenant &amp; Lease</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tenant */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                  Current Tenant
                </span>
              </div>
              {activeTenant ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-semibold text-gray-200">
                      {activeTenant.name}
                    </p>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                        activeTenant.background_check === "passed"
                          ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
                          : activeTenant.background_check === "flagged"
                            ? "text-red-400 bg-red-500/20 border-red-500/30"
                            : "text-amber-400 bg-amber-500/20 border-amber-500/30"
                      }`}
                    >
                      BG: {activeTenant.background_check}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Credit Score</p>
                      <p className={`text-base font-mono font-bold ${
                        activeTenant.credit_score >= 700
                          ? "text-emerald-400"
                          : activeTenant.credit_score >= 600
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}>
                        {activeTenant.credit_score}
                      </p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Move-In</p>
                      <p className="text-sm font-mono text-gray-300">{fmtDate(activeTenant.move_in_date)}</p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Monthly Income</p>
                      <p className="text-sm font-mono text-gray-300">
                        {fmt$(activeTenant.monthly_income)}
                        {activeTenant.income_verified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 inline ml-1" />
                        )}
                      </p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Eviction Risk</p>
                      <p className={`text-sm font-mono ${
                        activeTenant.eviction_risk <= 3
                          ? "text-emerald-400"
                          : activeTenant.eviction_risk <= 6
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}>
                        {activeTenant.eviction_risk}/10
                      </p>
                    </div>
                  </div>
                  {/* Payment History */}
                  {activeTenant.payment_history && activeTenant.payment_history.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600 mb-2">
                        Recent Payments
                      </p>
                      <div className="flex gap-1">
                        {activeTenant.payment_history.slice(-12).map((p, i) => (
                          <div
                            key={i}
                            title={`${fmtDate(p.date)}: ${fmt$(p.amount)} (${p.status})`}
                            className={`h-5 flex-1 rounded-sm ${
                              p.status === "paid"
                                ? "bg-emerald-500/40"
                                : p.status === "late"
                                  ? "bg-amber-500/40"
                                  : "bg-red-500/40"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[8px] font-mono text-gray-700">12 mo history</span>
                        <div className="flex gap-3">
                          <span className="text-[8px] font-mono text-emerald-500/60">Paid</span>
                          <span className="text-[8px] font-mono text-amber-500/60">Late</span>
                          <span className="text-[8px] font-mono text-red-500/60">Missed</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs font-mono text-gray-600">No active tenant on file</p>
              )}
            </Card>

            {/* Lease */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600">
                  Current Lease
                </span>
              </div>
              {activeLease ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-semibold text-gray-200">
                      {fmtDate(activeLease.start_date)} - {fmtDate(activeLease.end_date)}
                    </p>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 ${
                        activeLease.esign_status === "signed"
                          ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/30"
                          : activeLease.esign_status === "expired"
                            ? "text-red-400 bg-red-500/20 border-red-500/30"
                            : "text-amber-400 bg-amber-500/20 border-amber-500/30"
                      }`}
                    >
                      <PenLine className="w-3 h-3" />
                      {activeLease.esign_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Monthly Rent</p>
                      <p className="text-base font-mono font-bold text-gray-200">{fmt$(activeLease.monthly_rent)}</p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Security Deposit</p>
                      <p className="text-sm font-mono text-gray-300">{fmt$(activeLease.security_deposit)}</p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Late Fee</p>
                      <p className="text-sm font-mono text-gray-300">
                        {fmt$(activeLease.late_fee)} after {activeLease.grace_days}d
                      </p>
                    </div>
                    <div className="bg-[#080a12] rounded p-2.5 border border-[#1e2235]/50">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-gray-600">Auto Renew</p>
                      <p className="text-sm font-mono text-gray-300">
                        {activeLease.auto_renew ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  {/* Days remaining */}
                  {(() => {
                    const daysLeft = Math.round(
                      (new Date(activeLease.end_date).getTime() - Date.now()) / 86400000
                    );
                    return (
                      <div className="bg-[#080a12] rounded p-3 border border-[#1e2235]/50 flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-600">
                          Lease Remaining
                        </span>
                        <span
                          className={`text-sm font-mono font-bold ${
                            daysLeft <= 30
                              ? "text-red-400"
                              : daysLeft <= 90
                                ? "text-amber-400"
                                : "text-gray-300"
                          }`}
                        >
                          {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-xs font-mono text-gray-600">No active lease on file</p>
              )}
            </Card>
          </div>
        </section>

        {/* ─── 8. FINANCIAL SUMMARY ──────────────────────────────── */}
        <section>
          <SectionLabel>Financial Summary</SectionLabel>
          <Card className="p-5">
            {/* Totals row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-1">Total Income</p>
                <p className="text-xl font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {fmt$(financials.income)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-1">Total Expenses</p>
                <p className="text-xl font-mono font-bold text-red-400 flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {fmt$(financials.expenses)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-1">Net</p>
                <p
                  className={`text-xl font-mono font-bold ${
                    financials.net >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {fmt$(financials.net)}
                </p>
              </div>
            </div>

            {/* Transaction list */}
            {transactions.length > 0 ? (
              <div className="border-t border-[#1e2235] pt-4">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-3">
                  Recent Transactions
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-2 px-3 rounded hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              tx.type === "income" ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-gray-300 truncate">
                              {tx.description}
                            </p>
                            <p className="text-[10px] font-mono text-gray-600">
                              {tx.category} / {fmtDate(tx.date)}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-mono font-semibold shrink-0 ml-4 ${
                            tx.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}{fmt$(tx.amount)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-[#1e2235] pt-4">
                <p className="text-xs font-mono text-gray-600 text-center">
                  No transactions recorded for this property
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* ─── 9. WORK ORDERS ────────────────────────────────────── */}
        <section>
          <SectionLabel>Work Orders</SectionLabel>
          {activeWorkOrders.length > 0 ? (
            <div className="space-y-3">
              {activeWorkOrders
                .sort((a, b) => {
                  const pri = { emergency: 0, high: 1, medium: 2, low: 3 };
                  return (pri[a.priority] ?? 4) - (pri[b.priority] ?? 4);
                })
                .map((wo) => {
                  const priorityStyle: Record<string, string> = {
                    emergency: "text-red-400 bg-red-500/20 border-red-500/30",
                    high: "text-amber-400 bg-amber-500/20 border-amber-500/30",
                    medium: "text-blue-400 bg-blue-500/20 border-blue-500/30",
                    low: "text-gray-400 bg-gray-500/20 border-gray-500/30",
                  };
                  const statusStyle: Record<string, string> = {
                    open: "text-amber-400",
                    in_progress: "text-blue-400",
                    completed: "text-emerald-400",
                  };
                  return (
                    <Card key={wo.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <Wrench className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-mono font-semibold text-gray-200">
                              {wo.title}
                            </p>
                            <p className="text-xs font-mono text-gray-500 mt-0.5 truncate">
                              {wo.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-[10px] font-mono text-gray-600">
                                Vendor: {wo.vendor || "Unassigned"}
                              </span>
                              <span className="text-[10px] font-mono text-gray-600">
                                Est. {fmt$(wo.estimated_cost)}
                              </span>
                              <span className="text-[10px] font-mono text-gray-600">
                                {fmtDate(wo.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${
                              priorityStyle[wo.priority] || priorityStyle.low
                            }`}
                          >
                            {wo.priority}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 ${
                              statusStyle[wo.status] || "text-gray-400"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {wo.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          ) : workOrders.length > 0 ? (
            <Card className="p-5 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500/60 shrink-0" />
              <p className="text-xs font-mono text-gray-500">
                All {workOrders.length} work order(s) completed -- no active requests
              </p>
            </Card>
          ) : (
            <Card className="p-5 flex items-center gap-3">
              <Wrench className="w-4 h-4 text-gray-600 shrink-0" />
              <p className="text-xs font-mono text-gray-600">
                No work orders for this property
              </p>
            </Card>
          )}
        </section>
      </div>

      <AIPanel />
    </div>
  );
}

/* ── Page Export with Suspense ────────────────────────────────────── */

export default function PropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080a12] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-gray-600">
              Loading property data
            </span>
          </div>
        </div>
      }
    >
      <PropertyContent />
    </Suspense>
  );
}
