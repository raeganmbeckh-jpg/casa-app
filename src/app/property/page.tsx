"use client";

import { useEffect, useState, useRef, useCallback, Suspense, useMemo } from "react";
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

/* ── useInView hook ─────────────────────────────────────────────── */

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── CountUp component ──────────────────────────────────────────── */

function CountUp({
  end,
  duration = 1200,
  prefix = "",
  suffix = "",
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let startTime: number | null = null;
    let raf: number;

    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * end);
      setDisplay(current.toLocaleString("en-US"));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

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
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    occupied: { bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" },
    vacant: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    maintenance: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
    prospecting: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  };
  const c = colors[status] || colors.vacant;
  return (
    <span
      className="px-3 py-1 rounded text-[10px] uppercase tracking-widest border"
      style={{
        fontFamily: "var(--font-geist-mono)",
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
      }}
    >
      {status}
    </span>
  );
}

/* ── Section Label ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
      style={{ fontFamily: "var(--font-heading)", color: "#E8C84A" }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#F9D96A" }} />
      {children}
    </h2>
  );
}

/* ── Card Shell ──────────────────────────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`${className}`}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EEEEEE",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        borderRadius: 16,
      }}
    >
      {children}
    </div>
  );
}

/* ── Animated Section Wrapper ───────────────────────────────────── */

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
      }}
    >
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
  animate,
}: {
  label: string;
  icon: any;
  ageYears: number;
  lifespan: number;
  costEstimate: string;
  animate: boolean;
}) {
  const remaining = Math.max(0, lifespan - ageYears);
  const pct = Math.max(0, Math.min(100, (remaining / lifespan) * 100));
  const urgency =
    pct <= 10
      ? { label: "REPLACE", bg: "#fef2f2", text: "#dc2626", border: "#fecaca" }
      : pct <= 30
        ? { label: "AGING", bg: "#fffbeb", text: "#d97706", border: "#fde68a" }
        : { label: "GOOD", bg: "#ecfdf5", text: "#059669", border: "#a7f3d0" };
  const barColor =
    pct <= 10 ? "#ef4444" : pct <= 30 ? "#f59e0b" : "#10b981";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: "#6B6B6B" }} />
          <span
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}
          >
            {label}
          </span>
        </div>
        <span
          className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border"
          style={{
            fontFamily: "var(--font-geist-mono)",
            backgroundColor: urgency.bg,
            color: urgency.text,
            borderColor: urgency.border,
          }}
        >
          {urgency.label}
        </span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F0F0" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: animate ? `${pct}%` : "0%",
            backgroundColor: barColor,
            transition: "width 1s ease-out 0.2s",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
        <span>Est. {ageYears}y old / {lifespan}y life</span>
        <span>{remaining}y remaining</span>
      </div>
      <p className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
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
  const [systemBarsAnimate, setSystemBarsAnimate] = useState(false);

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

  /* Trigger system bar animation after mount */
  useEffect(() => {
    const timer = setTimeout(() => setSystemBarsAnimate(true), 200);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-6 h-6 border-2 rounded-full" style={{ borderColor: "#F9D96A", borderTopColor: "transparent" }} />
          <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
            Loading property data
          </span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="text-center space-y-3">
          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Property not found</p>
          <button
            onClick={() => router.back()}
            className="text-xs uppercase tracking-wider hover:opacity-70"
            style={{ fontFamily: "var(--font-geist-mono)", color: "#E8C84A" }}
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
    <div className="min-h-screen pb-12" style={{ backgroundColor: "#FFFFFF", color: "#1A1A1A", fontFamily: "var(--font-inter)" }}>
      {/* Global fadeIn keyframe */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ─── 1. HEADER ─────────────────────────────────────────────── */}
      <header className="px-6 py-5" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #F0F0F0" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{ border: "1px solid #F0F0F0" }}
            >
              <ArrowLeft className="w-4 h-4" style={{ color: "#6B6B6B" }} />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="text-lg font-bold tracking-tight truncate"
                  style={{ fontFamily: "var(--font-heading)", color: "#1A1A1A" }}
                >
                  {property.address}
                </h1>
                <StatusBadge status={property.status} />
              </div>
              <p className="text-xs mt-1 flex items-center gap-1.5" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                <MapPin className="w-3 h-3" />
                {property.city}, {property.state} {property.zip}
                {property.property_type && (
                  <>
                    <span className="mx-1" style={{ color: "#F0F0F0" }}>|</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden" style={{ backgroundColor: "#F0F0F0", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #EEEEEE" }}>
          {[
            { label: "Market Value", value: property.estimated_value, isDollar: true, displayFallback: fmt$(property.estimated_value), sub: property.assessed_value ? `Assessed ${fmt$(property.assessed_value)}` : null },
            { label: "Monthly Rent", value: property.monthly_rent || null, isDollar: true, displayFallback: fmt$(property.monthly_rent || null), sub: property.monthly_rent ? `${fmt$(property.monthly_rent * 12)}/yr` : null },
            { label: "Annual Taxes", value: property.annual_taxes, isDollar: true, displayFallback: fmt$(property.annual_taxes), sub: property.annual_taxes && property.estimated_value ? `${fmtPct((property.annual_taxes / property.estimated_value) * 100)} eff. rate` : null },
            { label: "Cap Rate", value: null, isDollar: false, displayFallback: capRate != null ? fmtPct(capRate) : "---", sub: capRate != null ? (capRate >= 6 ? "Strong yield" : "Below avg") : null },
            { label: "Living Area", value: property.sqft || null, isDollar: false, isSqft: true, displayFallback: property.sqft ? `${fmtNum(property.sqft)} sf` : "---", sub: property.lot_sqft ? `${fmtNum(property.lot_sqft)} sf lot` : null },
            { label: "Year Built", value: null, isDollar: false, displayFallback: property.year_built?.toString() || "---", sub: age != null ? `${age} years old` : null },
          ].map((m, i) => (
            <div key={i} className="p-4 text-center" style={{ backgroundColor: "#FFFFFF" }}>
              <p className="text-[9px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                {m.label}
              </p>
              <p className="text-xl font-bold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                {m.value != null && m.isDollar ? (
                  <CountUp end={m.value} prefix="$" />
                ) : m.value != null && (m as any).isSqft ? (
                  <CountUp end={m.value} suffix=" sf" />
                ) : (
                  m.displayFallback
                )}
              </p>
              {m.sub && (
                <p className="text-[10px] mt-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>{m.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* ─── 3. PROPERTY DETAILS GRID ──────────────────────────── */}
        <AnimatedSection>
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
                      <Icon className="w-3.5 h-3.5" style={{ color: "#6B6B6B" }} />
                      <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                        {item.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                      {item.value}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>
        </AnimatedSection>

        {/* ─── 4. ROOM BREAKDOWN ─────────────────────────────────── */}
        <AnimatedSection>
          <section>
            <SectionLabel>Room Breakdown</SectionLabel>
            {hasRoomData ? (
              <Card className="p-5" >
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
                    <div key={i} className="rounded-lg p-3" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                      <p className="text-[9px] uppercase tracking-[0.15em] mb-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                        {r.label}
                      </p>
                      <p className="text-base font-semibold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                        {r.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-5 flex items-center gap-3">
                <CircleDot className="w-4 h-4 shrink-0" style={{ color: "#6B6B6B" }} />
                <div>
                  <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                    Room data available with property inspection
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                    Connect ATTOM data or add manual inspection to populate room breakdown
                  </p>
                </div>
              </Card>
            )}
          </section>
        </AnimatedSection>

        {/* ─── 5. SYSTEMS HEALTH ─────────────────────────────────── */}
        <AnimatedSection>
          <section>
            <SectionLabel>Systems Health</SectionLabel>
            {age != null ? (
              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 16 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SystemBar
                      label="HVAC System"
                      icon={ThermometerSun}
                      ageYears={Math.min(age, Math.round(age * 0.7))}
                      lifespan={20}
                      costEstimate={systemCosts.hvac}
                      animate={systemBarsAnimate}
                    />
                    <SystemBar
                      label="Roof"
                      icon={Shield}
                      ageYears={Math.min(age, Math.round(age * 0.8))}
                      lifespan={25}
                      costEstimate={systemCosts.roof}
                      animate={systemBarsAnimate}
                    />
                    <SystemBar
                      label="Plumbing"
                      icon={Droplets}
                      ageYears={age}
                      lifespan={50}
                      costEstimate={systemCosts.plumbing}
                      animate={systemBarsAnimate}
                    />
                    <SystemBar
                      label="Electrical"
                      icon={Zap}
                      ageYears={age}
                      lifespan={40}
                      costEstimate={systemCosts.electrical}
                      animate={systemBarsAnimate}
                    />
                    <SystemBar
                      label="Water Heater"
                      icon={Flame}
                      ageYears={Math.min(age, 12)}
                      lifespan={12}
                      costEstimate={systemCosts.waterHeater}
                      animate={systemBarsAnimate}
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-5 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#d97706" }} />
                <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                  Year built unknown -- unable to estimate system ages
                </p>
              </Card>
            )}
          </section>
        </AnimatedSection>

        {/* ─── 6. NEIGHBORHOOD INTEL ─────────────────────────────── */}
        <AnimatedSection>
          <section>
            <SectionLabel>Neighborhood Intel</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Footprints className="w-4 h-4" style={{ color: "#E8C84A" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      Walk Score
                    </span>
                  </div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                    {walkScore}
                    <span className="text-sm ml-1" style={{ color: "#6B6B6B" }}>/ 100</span>
                  </p>
                  <div className="w-full h-1.5 rounded-full mt-3 overflow-hidden" style={{ backgroundColor: "#F0F0F0" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${walkScore}%`, backgroundColor: "#E8C84A" }}
                    />
                  </div>
                  <p className="text-[10px] mt-2" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                    {walkScore >= 70 ? "Very Walkable" : walkScore >= 50 ? "Somewhat Walkable" : "Car-Dependent"}
                  </p>
                </div>
              </Card>

              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4" style={{ color: "#10b981" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      School Rating
                    </span>
                  </div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                    7<span className="text-sm ml-1" style={{ color: "#6B6B6B" }}>/ 10</span>
                  </p>
                  <div className="flex gap-1 mt-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1.5 flex-1 rounded-full"
                        style={{ backgroundColor: i < 7 ? "#10b981" : "#F0F0F0" }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] mt-2" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                    Above Average (nearby district)
                  </p>
                </div>
              </Card>

              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4" style={{ color: "#F9D96A" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      Sun Exposure
                    </span>
                  </div>
                  <p className="text-lg font-bold mt-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                    Good
                  </p>
                  <p className="text-xs mt-2" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                    Southern exposure estimated
                  </p>
                  <p className="text-[10px] mt-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                    Solar potential: ~5.2 kWh/m2/day
                  </p>
                </div>
              </Card>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── 7. TENANT & LEASE ─────────────────────────────────── */}
        <AnimatedSection>
          <section>
            <SectionLabel>Tenant &amp; Lease</SectionLabel>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tenant */}
              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4" style={{ color: "#6B6B6B" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      Current Tenant
                    </span>
                  </div>
                  {activeTenant ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                          {activeTenant.name}
                        </p>
                        <span
                          className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            ...(activeTenant.background_check === "passed"
                              ? { color: "#059669", backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }
                              : activeTenant.background_check === "flagged"
                                ? { color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#fecaca" }
                                : { color: "#d97706", backgroundColor: "#fffbeb", borderColor: "#fde68a" }),
                          }}
                        >
                          BG: {activeTenant.background_check}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Credit Score</p>
                          <p className="text-base font-bold" style={{
                            fontFamily: "var(--font-geist-mono)",
                            color: activeTenant.credit_score >= 700
                              ? "#059669"
                              : activeTenant.credit_score >= 600
                                ? "#d97706"
                                : "#dc2626",
                          }}>
                            {activeTenant.credit_score}
                          </p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Move-In</p>
                          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{fmtDate(activeTenant.move_in_date)}</p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Monthly Income</p>
                          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                            {fmt$(activeTenant.monthly_income)}
                            {activeTenant.income_verified && (
                              <CheckCircle2 className="w-3 h-3 inline ml-1" style={{ color: "#059669" }} />
                            )}
                          </p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Eviction Risk</p>
                          <p className="text-sm" style={{
                            fontFamily: "var(--font-geist-mono)",
                            color: activeTenant.eviction_risk <= 3
                              ? "#059669"
                              : activeTenant.eviction_risk <= 6
                                ? "#d97706"
                                : "#dc2626",
                          }}>
                            {activeTenant.eviction_risk}/10
                          </p>
                        </div>
                      </div>
                      {/* Payment History */}
                      {activeTenant.payment_history && activeTenant.payment_history.length > 0 && (
                        <div>
                          <p className="text-[9px] uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                            Recent Payments
                          </p>
                          <div className="flex gap-1">
                            {activeTenant.payment_history.slice(-12).map((p, i) => (
                              <div
                                key={i}
                                title={`${fmtDate(p.date)}: ${fmt$(p.amount)} (${p.status})`}
                                className="h-5 flex-1 rounded-sm"
                                style={{
                                  backgroundColor:
                                    p.status === "paid"
                                      ? "#d1fae5"
                                      : p.status === "late"
                                        ? "#fef3c7"
                                        : "#fee2e2",
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[8px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>12 mo history</span>
                            <div className="flex gap-3">
                              <span className="text-[8px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#059669" }}>Paid</span>
                              <span className="text-[8px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#d97706" }}>Late</span>
                              <span className="text-[8px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#dc2626" }}>Missed</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>No active tenant on file</p>
                  )}
                </div>
              </Card>

              {/* Lease */}
              <Card className="p-5" >
                <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4" style={{ color: "#6B6B6B" }} />
                    <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      Current Lease
                    </span>
                  </div>
                  {activeLease ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                          {fmtDate(activeLease.start_date)} - {fmtDate(activeLease.end_date)}
                        </p>
                        <span
                          className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            ...(activeLease.esign_status === "signed"
                              ? { color: "#059669", backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }
                              : activeLease.esign_status === "expired"
                                ? { color: "#dc2626", backgroundColor: "#fef2f2", borderColor: "#fecaca" }
                                : { color: "#d97706", backgroundColor: "#fffbeb", borderColor: "#fde68a" }),
                          }}
                        >
                          <PenLine className="w-3 h-3" />
                          {activeLease.esign_status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Monthly Rent</p>
                          <p className="text-base font-bold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{fmt$(activeLease.monthly_rent)}</p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Security Deposit</p>
                          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{fmt$(activeLease.security_deposit)}</p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Late Fee</p>
                          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                            {fmt$(activeLease.late_fee)} after {activeLease.grace_days}d
                          </p>
                        </div>
                        <div className="rounded p-2.5" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                          <p className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Auto Renew</p>
                          <p className="text-sm" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
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
                          <div className="rounded p-3 flex items-center justify-between" style={{ backgroundColor: "#FAFAFA", border: "1px solid #F0F0F0" }}>
                            <span className="text-[9px] uppercase tracking-wider" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                              Lease Remaining
                            </span>
                            <span
                              className="text-sm font-bold"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                                color: daysLeft <= 30
                                  ? "#dc2626"
                                  : daysLeft <= 90
                                    ? "#d97706"
                                    : "#1A1A1A",
                              }}
                            >
                              {daysLeft > 0 ? `${daysLeft} days` : "Expired"}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>No active lease on file</p>
                  )}
                </div>
              </Card>
            </div>
          </section>
        </AnimatedSection>

        {/* ─── 8. FINANCIAL SUMMARY ──────────────────────────────── */}
        <AnimatedSection>
          <section>
            <SectionLabel>Financial Summary</SectionLabel>
            <Card className="p-5" >
              <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 16 }}>
                {/* Totals row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Total Income</p>
                    <p className="text-xl font-bold flex items-center justify-center gap-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#059669" }}>
                      <TrendingUp className="w-4 h-4" />
                      {fmt$(financials.income)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Total Expenses</p>
                    <p className="text-xl font-bold flex items-center justify-center gap-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#dc2626" }}>
                      <TrendingDown className="w-4 h-4" />
                      {fmt$(financials.expenses)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>Net</p>
                    <p
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: financials.net >= 0 ? "#059669" : "#dc2626",
                      }}
                    >
                      {fmt$(financials.net)}
                    </p>
                  </div>
                </div>

                {/* Transaction list */}
                {transactions.length > 0 ? (
                  <div className="pt-4" style={{ borderTop: "1px solid #F0F0F0" }}>
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-3" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      Recent Transactions
                    </p>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {transactions
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 20)
                        .map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor: tx.type === "income" ? "#10b981" : "#ef4444",
                                }}
                              />
                              <div className="min-w-0">
                                <p className="text-xs truncate" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                                  {tx.description}
                                </p>
                                <p className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                                  {tx.category} / {fmtDate(tx.date)}
                                </p>
                              </div>
                            </div>
                            <p
                              className="text-sm font-semibold shrink-0 ml-4"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                                color: tx.type === "income" ? "#059669" : "#dc2626",
                              }}
                            >
                              {tx.type === "income" ? "+" : "-"}{fmt$(tx.amount)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4" style={{ borderTop: "1px solid #F0F0F0" }}>
                    <p className="text-xs text-center" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                      No transactions recorded for this property
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </section>
        </AnimatedSection>

        {/* ─── 9. WORK ORDERS ────────────────────────────────────── */}
        <AnimatedSection>
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
                    const priorityStyle: Record<string, { bg: string; text: string; border: string }> = {
                      emergency: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
                      high: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
                      medium: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
                      low: { bg: "#f9fafb", text: "#6B6B6B", border: "#e5e7eb" },
                    };
                    const statusColors: Record<string, string> = {
                      open: "#d97706",
                      in_progress: "#2563eb",
                      completed: "#059669",
                    };
                    const ps = priorityStyle[wo.priority] || priorityStyle.low;
                    return (
                      <Card key={wo.id} className="p-4">
                        <div style={{ borderLeft: "3px solid #F9D96A", paddingLeft: 12 }}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <Wrench className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#6B6B6B" }} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>
                                  {wo.title}
                                </p>
                                <p className="text-xs mt-0.5 truncate" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                                  {wo.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  <span className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                                    Vendor: {wo.vendor || "Unassigned"}
                                  </span>
                                  <span className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                                    Est. {fmt$(wo.estimated_cost)}
                                  </span>
                                  <span className="text-[10px]" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                                    {fmtDate(wo.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span
                                className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                  backgroundColor: ps.bg,
                                  color: ps.text,
                                  borderColor: ps.border,
                                }}
                              >
                                {wo.priority}
                              </span>
                              <span
                                className="text-[10px] uppercase tracking-wider flex items-center gap-1"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                  color: statusColors[wo.status] || "#6B6B6B",
                                }}
                              >
                                <Clock className="w-3 h-3" />
                                {wo.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            ) : workOrders.length > 0 ? (
              <Card className="p-5 flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#059669" }} />
                <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                  All {workOrders.length} work order(s) completed -- no active requests
                </p>
              </Card>
            ) : (
              <Card className="p-5 flex items-center gap-3">
                <Wrench className="w-4 h-4 shrink-0" style={{ color: "#6B6B6B" }} />
                <p className="text-xs" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
                  No work orders for this property
                </p>
              </Card>
            )}
          </section>
        </AnimatedSection>
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-6 h-6 border-2 rounded-full" style={{ borderColor: "#F9D96A", borderTopColor: "transparent" }} />
            <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>
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
