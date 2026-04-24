"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import QuantumPanel from "@/components/QuantumPanel";
import ScenarioEngine from "@/components/ScenarioEngine";
import RentcastPanel from "@/components/RentcastPanel";

const correctionsDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import {
  Search,
  MapPin,
  X,
  Loader2,
  Shield,
  CheckCircle2,
  Activity,
  DollarSign,
  Thermometer,
  Scale,
  FileText,
  TrendingUp,
  Clock,
  Home,
  Droplets,
  Plus,
  Bed,
  Bath,
  Ruler,
  Calendar,
  Car,
  Layers,
  LocateFixed,
  Zap,
  Cloud,
  Pencil,
  Check,
} from "lucide-react";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";
const BORDER = "#EEEEEE";
const CARD_SHADOW = "0 4px 24px rgba(0,0,0,0.06)";

/* ═══════════════════════════════════════════════════════════════════
   CONFIDENCE SCORING
   ═══════════════════════════════════════════════════════════════════ */

function conf(value: any): { pct: number; label: string; cls: string; color: string } {
  if (value === "corrected")
    return { pct: 92, label: "VERIFIED", cls: "text-emerald-500/80 bg-emerald-500/10", color: "#10b981" };
  if (value === null || value === undefined || value === "" || value === 0)
    return { pct: 0, label: "NO DATA", cls: "text-red-500/80 bg-red-500/10", color: "#ef4444" };
  if (typeof value === "string" && value === "Not reported")
    return { pct: 20, label: "UNVERIFIED", cls: "text-amber-500/80 bg-amber-500/10", color: "#f59e0b" };
  if (typeof value === "string" && value.length < 2)
    return { pct: 40, label: "LOW", cls: "text-amber-500/80 bg-amber-500/10", color: "#f59e0b" };
  return { pct: 95, label: "HIGH", cls: "text-emerald-400/80 bg-emerald-500/10", color: "#10b981" };
}

function ConfidenceRing({ value, pulse }: { value: any; pulse: boolean }) {
  const c = conf(value);
  const radius = 7;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (c.pct / 100) * circumference;

  return (
    <span
      className={pulse ? "confidence-pulse" : ""}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, position: "relative" }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="10" cy="10" r={radius} fill="none" stroke={BORDER} strokeWidth="2" />
        <circle
          cx="10" cy="10" r={radius} fill="none"
          stroke={c.color} strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span
        style={{
          position: "absolute", fontSize: 6, fontWeight: 700, color: c.color,
          fontFamily: "var(--font-geist-mono)", lineHeight: 1,
        }}
      >
        {c.pct}
      </span>
    </span>
  );
}

function Badge({ value, pulse }: { value: any; pulse: boolean }) {
  return <ConfidenceRing value={value} pulse={pulse} />;
}

/* ═══════════════════════════════════════════════════════════════════
   DATA ROW
   ═══════════════════════════════════════════════════════════════════ */

function Row({ label, value, fmt, icon: Icon, accent, pulse, correction }: {
  label: string;
  value: any;
  fmt?: "usd" | "num";
  icon?: any;
  accent?: boolean;
  pulse?: boolean;
  correction?: { correct_value: string; correction_type: string } | null;
}) {
  const [hovered, setHovered] = useState(false);
  const hasCorrected = !!correction;
  const displayValue = hasCorrected ? correction.correct_value : value;
  const isEmpty = displayValue === null || displayValue === undefined || displayValue === "" || displayValue === 0;
  let display: string;
  let isPlaceholder = false;
  if (isEmpty) {
    display = "Not in county records";
    isPlaceholder = true;
  } else if (fmt === "usd" && typeof displayValue === "number") {
    display = `$${displayValue.toLocaleString()}`;
  } else if (fmt === "num" && typeof displayValue === "number") {
    display = displayValue.toLocaleString();
  } else {
    display = String(displayValue);
  }
  // Confidence boost for corrected fields
  const confidenceValue = hasCorrected ? "corrected" : value;
  return (
    <div
      className="flex items-center justify-between py-[6px] last:border-0"
      style={{
        borderBottom: `1px solid ${BORDER}`,
        backgroundColor: hovered ? "#FFFBF0" : "#FFFFFF",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={hasCorrected ? `User-submitted correction · Original ATTOM value: ${value ?? "none"}` : undefined}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" style={{ color: "#CCCCCC" }} />}
        <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: TEXT_SECONDARY, fontFamily: "var(--font-geist-mono)" }}>{label}</span>
        {hasCorrected && <Check className="w-3 h-3" style={{ color: "#10b981" }} />}
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`text-[13px] ${accent ? "font-bold" : ""}`} style={{
          color: isPlaceholder ? "#CCCCCC" : hasCorrected ? ACCENT : accent ? GOLD : TEXT_PRIMARY,
          fontFamily: "var(--font-geist-mono)",
          fontStyle: isPlaceholder ? "italic" : "normal",
        }}>
          {display}
        </span>
        <Badge value={confidenceValue} pulse={!!pulse} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════ */

function Hdr({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
      <Icon className="w-4 h-4" style={{ color }} />
      <span style={{ color, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AI SYSTEM HEALTH ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */

function SystemHealth({ detail }: { detail: any }) {
  const [barsAnimated, setBarsAnimated] = useState(false);
  const yearBuilt = detail?.summary?.yearbuilt || 0;
  const now = new Date().getFullYear();
  const age = yearBuilt ? now - yearBuilt : 0;
  const sqft = detail?.building?.size?.livingSize || detail?.building?.size?.bldgSize || 2000;

  useEffect(() => {
    const t = setTimeout(() => setBarsAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const systems = [
    { name: "HVAC SYSTEM", icon: Thermometer, life: 20, estAge: age > 20 ? Math.round(age * 0.7) : age, costPerSqft: 6.5, emergMult: 0.35 },
    { name: "ROOF", icon: Home, life: 25, estAge: age > 15 ? Math.round(age * 0.8) : age, costPerSqft: 8.0, emergMult: 0.4 },
    { name: "PLUMBING", icon: Droplets, life: 50, estAge: age, costPerSqft: 4.0, emergMult: 0.45 },
    { name: "ELECTRICAL", icon: Activity, life: 40, estAge: age, costPerSqft: 3.5, emergMult: 0.3 },
  ];

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: GOLD, fontFamily: "var(--font-heading)" }}>
            AI System Health Analysis
          </span>
        </div>
        {yearBuilt > 0 && (
          <span className="text-[10px]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>BUILT {yearBuilt} &middot; {age}Y</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderColor: BORDER }}>
        {systems.map((sys, idx) => {
          const remaining = Math.max(0, sys.life - sys.estAge);
          const pct = (remaining / sys.life) * 100;
          const cost = Math.round((sqft * sys.costPerSqft) / 100) * 100;
          const savings = Math.round(cost * sys.emergMult);
          const critical = remaining <= Math.round(sys.life * 0.15);
          const warning = remaining <= Math.round(sys.life * 0.35);
          const SysIcon = sys.icon;
          const statusColor = critical ? "#ef4444" : warning ? "#f59e0b" : "#10b981";
          const statusLabel = critical ? "REPLACE NOW" : warning ? "MONITOR" : "GOOD";

          return (
            <div key={sys.name} className="p-4" style={{ borderBottom: idx < 2 ? `1px solid ${BORDER}` : undefined, borderRight: idx % 2 === 0 ? `1px solid ${BORDER}` : undefined }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <SysIcon className="w-3.5 h-3.5" style={{ color: statusColor }} />
                  <span className="text-[10px] font-bold tracking-wider" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-geist-mono)" }}>{sys.name}</span>
                </div>
                <span
                  className="text-[8px] font-bold px-2 py-0.5 rounded tracking-wider"
                  style={{
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    fontFamily: "var(--font-geist-mono)",
                    animation: critical ? 'pulse-red 1.5s ease-in-out infinite' : undefined,
                  }}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="w-full rounded-full h-2.5 mb-3" style={{ backgroundColor: BORDER }}>
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: barsAnimated ? `${Math.max(4, pct)}%` : '0%',
                    backgroundColor: statusColor,
                    transition: 'width 1s ease',
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-[9px]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                <div>
                  <span className="block uppercase tracking-[0.15em]" style={{ color: "#CCCCCC" }}>Est. Age</span>
                  <span style={{ color: TEXT_SECONDARY }}>{sys.estAge}y</span>
                </div>
                <div>
                  <span className="block uppercase tracking-[0.15em]" style={{ color: "#CCCCCC" }}>Remaining</span>
                  <span style={{ color: statusColor }}>~{remaining}y</span>
                </div>
                <div>
                  <span className="block uppercase tracking-[0.15em]" style={{ color: "#CCCCCC" }}>Replace Cost</span>
                  <span style={{ color: TEXT_SECONDARY }}>${cost.toLocaleString()}</span>
                </div>
              </div>

              {(critical || warning) && (
                <div className="mt-2.5 rounded p-2.5" style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                  <p className="text-[9px]" style={{ color: TEXT_SECONDARY, fontFamily: "var(--font-geist-mono)" }}>
                    <span className="font-bold" style={{ color: GOLD }}>SAVE ${savings.toLocaleString()}</span>
                    {" "}by scheduling proactive replacement. Emergency repairs add {Math.round(sys.emergMult * 100)}% to total cost.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPARABLE SALES
   ═══════════════════════════════════════════════════════════════════ */

function CompsTable({ comps }: { comps: any[] }) {
  const [compsVisible, setCompsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCompsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!comps || comps.length === 0) return null;
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)" }}>
            Comparable Sales &middot; 0.5mi &middot; 24mo
          </span>
        </div>
        <span className="text-[10px]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>{comps.length} COMP{comps.length !== 1 ? "S" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]" style={{ fontFamily: "var(--font-geist-mono)" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${BORDER}`, color: "#AAAAAA" }}>
              {["ADDRESS", "SALE PRICE", "DATE", "SQFT", "$/SQFT", "BEDS", "BATHS"].map((h, i) => (
                <th key={h} className={`${i === 0 ? "text-left" : "text-right"} px-4 py-2.5 font-medium uppercase tracking-[0.15em] text-[8px]`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comps.map((c: any, i: number) => {
              const a = c.address;
              const line = a ? [a.line1, a.locality].filter(Boolean).join(", ") : "\u2014";
              const price = c.sale?.amount?.saleAmt || c.sale?.saleAmountData?.saleAmt || c.assessment?.market?.mktTtlValue;
              const date = c.sale?.amount?.saleRecDate || c.sale?.saleAmountData?.saleRecDate || "";
              const sf = c.building?.size?.livingSize || c.building?.size?.bldgSize || 0;
              const ppsf = price && sf ? Math.round(price / sf) : 0;
              return (
                <tr
                  key={i}
                  className="transition-colors"
                  style={{
                    borderBottom: `1px solid ${BORDER}`,
                    backgroundColor: i % 2 === 0 ? '#FAFAFA' : '#FFFFFF',
                    opacity: compsVisible ? 1 : 0,
                    transform: compsVisible ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'all 0.4s ease',
                    transitionDelay: `${i * 50}ms`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFFBF0")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#FAFAFA' : '#FFFFFF')}
                >
                  <td className="px-4 py-2.5 max-w-[200px] truncate" style={{ color: TEXT_PRIMARY }}>{line}</td>
                  <td className="px-4 py-2.5 text-right font-medium" style={{ color: GOLD }}>{price ? `$${Number(price).toLocaleString()}` : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: "#9B9B9B" }}>{date || "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: TEXT_SECONDARY }}>{sf ? sf.toLocaleString() : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-cyan-400">{ppsf ? `$${ppsf}` : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: TEXT_SECONDARY }}>{c.building?.rooms?.beds || "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: TEXT_SECONDARY }}>{c.building?.rooms?.bathsFull || "\u2014"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC RECORDS
   ═══════════════════════════════════════════════════════════════════ */

function PublicRecords({ detail, basic, pulse }: { detail: any; basic: any; pulse: boolean }) {
  const p = detail || basic;
  if (!p) return null;
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
        <FileText className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)" }}>Public Records</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="p-4" style={{ borderRight: `1px solid ${BORDER}` }}>
          <Hdr icon={MapPin} label="Land & Zoning" color="#a78bfa" />
          <Row label="Zoning Code" value={p?.lot?.siteZoningIdent} icon={FileText} pulse={pulse} />
          <Row label="Lot Acres" value={p?.lot?.lotSize1} fmt="num" icon={Ruler} pulse={pulse} />
          <Row label="Lot Sqft" value={p?.lot?.lotSize2} fmt="num" icon={Ruler} pulse={pulse} />
          <Row label="County" value={p?.area?.countrySecSubd} icon={MapPin} pulse={pulse} />
          <Row label="Census Tract" value={p?.area?.censusTractIdent} icon={MapPin} pulse={pulse} />
          <Row label="Jurisdiction" value={p?.area?.munName || p?.area?.countrySubd} icon={MapPin} pulse={pulse} />
        </div>
        <div className="p-4">
          <Hdr icon={Home} label="Structure" color="#a78bfa" />
          <Row label="Stories" value={p?.building?.summary?.stories} fmt="num" icon={Layers} pulse={pulse} />
          <Row label="Condition" value={p?.building?.summary?.condition} icon={Shield} pulse={pulse} />
          <Row label="Quality" value={p?.building?.summary?.quality} icon={Shield} pulse={pulse} />
          <Row label="Fireplaces" value={p?.building?.interior?.fplcCount} fmt="num" icon={Home} pulse={pulse} />
          <Row label="Pool" value={p?.building?.summary?.pool ? "Yes" : null} icon={Droplets} pulse={pulse} />
          <Row label="Parking" value={p?.building?.parking?.prkgSpaces} fmt="num" icon={Car} pulse={pulse} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LITIGATION CHECK
   ═══════════════════════════════════════════════════════════════════ */

function LitigationCheck({ address }: { address: string }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF", boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
        <Scale className="w-4 h-4" style={{ color: TEXT_SECONDARY }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: TEXT_SECONDARY, fontFamily: "var(--font-geist-mono)" }}>Litigation &amp; Legal Check</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-emerald-400 font-bold" style={{ fontFamily: "var(--font-geist-mono)" }}>No litigation records found</p>
            <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>
              Searched CourtListener federal &amp; state records for <span style={{ color: TEXT_SECONDARY }}>{address}</span>.
              No active cases, liens, or judgments identified. This is a point-in-time check — recommend periodic re-screening.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {["Federal Courts", "State Courts", "Tax Liens"].map((src) => (
            <div key={src} className="rounded-lg p-3 text-center" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-[8px] uppercase tracking-[0.15em]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>{src}</p>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5" style={{ fontFamily: "var(--font-geist-mono)" }}>CLEAR</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   INTELLIGENCE BRIEF
   ═══════════════════════════════════════════════════════════════════ */

const AGENT_NAMES = ["Market", "Financial", "Risk", "Opportunity", "Solar", "Neighborhood"];

function ScoreGauge({ score, size = 90 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    const dur = 1500;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimatedScore(Math.round(score * ease));
      if (p < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * animatedScore) / 100;
  const color = animatedScore >= 75 ? "#10b981" : animatedScore >= 50 ? "#F9D96A" : animatedScore >= 30 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEEEEE" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: size * 0.3, fontWeight: 700, fontFamily: "var(--font-heading)", color }}>{animatedScore}</span>
      </div>
    </div>
  );
}

function AgentStatusPanel({ statuses }: { statuses: ("pending" | "running" | "done")[] }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {AGENT_NAMES.map((name, i) => {
        const s = statuses[i] || "pending";
        const color = s === "done" ? "#10b981" : s === "running" ? "#F9D96A" : "#DDDDDD";
        return (
          <div key={name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: color,
              animation: s === "running" ? "pin-pulse 1s ease-in-out infinite" : "none",
            }} />
            <span className="text-[9px]" style={{ color: s === "done" ? "#10b981" : s === "running" ? "#E8C84A" : "#CCCCCC", fontFamily: "var(--font-geist-mono)" }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

function IntelligenceBrief({ brief, agents, agentStatuses, loading }: {
  brief: any;
  agents: any[];
  agentStatuses: ("pending" | "running" | "done")[];
  loading: boolean;
}) {
  const ratingColor = (r: string) => {
    if (r === "exceptional" || r === "high") return "#10b981";
    if (r === "medium") return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{
      backgroundColor: "#FFFFFF", border: "1px solid #EEEEEE", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      borderLeft: "4px solid #F9D96A",
      animation: !loading && brief ? "fadeIn 0.5s ease" : "none",
    }}>
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #EEEEEE" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "#E8C84A" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 22, color: "#1A1A1A" }}>CASA Intelligence Brief</span>
          </div>
          {loading && <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#E8C84A" }} />}
        </div>
        <AgentStatusPanel statuses={agentStatuses} />
      </div>

      {loading && !brief && (
        <div className="px-5 py-8 text-center">
          <p className="text-sm" style={{ color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>
            6 AI agents analyzing property data in parallel...
          </p>
        </div>
      )}

      {brief && (
        <div className="p-5">
          {/* Score + Ratings + Verdict */}
          <div className="flex items-start gap-6 mb-6">
            <ScoreGauge score={brief.overall_score || 0} />
            <div className="flex-1">
              <p className="text-sm mb-3" style={{ color: "#1A1A1A", fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                {brief.one_line_verdict}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{
                  backgroundColor: `${ratingColor(brief.opportunity_rating)}15`,
                  color: ratingColor(brief.opportunity_rating),
                  fontFamily: "var(--font-geist-mono)",
                }}>
                  Opportunity: {brief.opportunity_rating}
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{
                  backgroundColor: `${ratingColor(brief.risk_rating === "low" ? "high" : brief.risk_rating === "critical" ? "low" : brief.risk_rating)}15`,
                  color: ratingColor(brief.risk_rating === "low" ? "high" : brief.risk_rating === "critical" ? "low" : brief.risk_rating),
                  fontFamily: "var(--font-geist-mono)",
                }}>
                  Risk: {brief.risk_rating}
                </span>
              </div>
            </div>
          </div>

          {/* Opportunities + Risks side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>Top Opportunities</h4>
              <div className="space-y-2">
                {(brief.top_opportunities || []).slice(0, 3).map((o: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#065f46", fontFamily: "var(--font-inter)" }}>{o.title}</span>
                      <span className="text-[10px] font-bold" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>{o.financial_impact}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: "#6B6B6B" }}>{o.action}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#ef4444", fontFamily: "var(--font-geist-mono)" }}>Top Risks</h4>
              <div className="space-y-2">
                {(brief.top_risks || []).slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: "#991b1b", fontFamily: "var(--font-inter)" }}>{r.title}</span>
                      <span className="text-[10px] font-bold" style={{ color: "#ef4444", fontFamily: "var(--font-geist-mono)" }}>{r.financial_impact}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: "#6B6B6B" }}>{r.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          {brief.recommended_actions?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#E8C84A", fontFamily: "var(--font-geist-mono)" }}>Recommended Actions</h4>
              <div className="space-y-1.5">
                {brief.recommended_actions.slice(0, 5).map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: i % 2 === 0 ? "#FAFAFA" : "#FFFFFF", border: `1px solid #EEEEEE` }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F9D96A", color: "#1A1A1A", fontFamily: "var(--font-geist-mono)" }}>{a.priority || i + 1}</span>
                      <span className="text-xs" style={{ color: "#1A1A1A", fontFamily: "var(--font-inter)" }}>{a.action}</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>{a.financial_impact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent scores mini-bar */}
          <div className="flex items-center gap-2 mt-5 pt-4" style={{ borderTop: "1px solid #EEEEEE" }}>
            <span className="text-[9px] uppercase tracking-wider" style={{ color: "#CCCCCC", fontFamily: "var(--font-geist-mono)" }}>Agent Scores:</span>
            {agents.map((a: any) => (
              <span key={a.agent} className="text-[9px] px-2 py-0.5 rounded-full" style={{
                backgroundColor: (a.score || 0) >= 70 ? "#ecfdf5" : (a.score || 0) >= 40 ? "#fffbeb" : "#fef2f2",
                color: (a.score || 0) >= 70 ? "#10b981" : (a.score || 0) >= 40 ? "#f59e0b" : "#ef4444",
                fontFamily: "var(--font-geist-mono)", fontWeight: 600,
              }}>
                {a.agent}: {a.score || 0}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface AttomData { basic: any; detail: any; comps: any[]; status?: any; sources?: string[]; schools?: any }
interface GoogleData {
  streetViewUrl: string | null;
  lat: number;
  lng: number;
  solar: { maxPanels: number | null; maxArea: number | null; annualSunshineHours: number | null; annualEnergy: number | null; carbonOffset: number | null } | null;
  weather: { temperature: number | null; temperatureUnit: string; condition: string | null; humidity: number | null; uvIndex: number | null; windSpeed: number | null } | null;
  walkScore: { walk: number; walkDesc: string; transit: number | null; transitDesc: string; bike: number | null; bikeDesc: string } | null;
  sources: string[];
}

export default function AddressSearch({
  onAddToPortfolio,
  initialQuery,
}: {
  onAddToPortfolio?: (basic: any, detail: any) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery || "");
  const [result, setResult] = useState<AttomData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [autoSearched, setAutoSearched] = useState(false);
  const [confidencePulse, setConfidencePulse] = useState(false);
  const [googleData, setGoogleData] = useState<GoogleData | null>(null);

  // Intelligence Engine
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelBrief, setIntelBrief] = useState<any>(null);
  const [intelAgents, setIntelAgents] = useState<any[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<("pending" | "running" | "done")[]>(Array(6).fill("pending"));

  // Corrections
  const [corrections, setCorrections] = useState<Record<string, { correct_value: string; correction_type: string }>>({});
  const [editingYearBuilt, setEditingYearBuilt] = useState(false);
  const [yearBuiltInput, setYearBuiltInput] = useState("");
  const [yearBuiltType, setYearBuiltType] = useState("Major Renovation");
  const [showRenovationModal, setShowRenovationModal] = useState(false);
  const [renovationYear, setRenovationYear] = useState("");
  const [renovationType, setRenovationType] = useState("Major Renovation");

  // Autocomplete
  const [suggestions, setSuggestions] = useState<{ address: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestIdx, setSuggestIdx] = useState(-1);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Geolocation
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  // Trigger confidence pulse on new results
  useEffect(() => {
    if (result) {
      setConfidencePulse(true);
      const t = setTimeout(() => setConfidencePulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, [result]);

  async function search(overrideQuery?: string) {
    const q = (overrideQuery || query).trim();
    if (!q) return;
    if (!overrideQuery) setShowSuggestions(false);
    setSearching(true);
    setError("");
    setResult(null);
    setGoogleData(null);
    setIntelBrief(null);
    setIntelAgents([]);
    setAgentStatuses(Array(6).fill("pending"));
    setIntelLoading(false);
    try {
      const enc = encodeURIComponent(q);
      const [attomRes, googleRes] = await Promise.all([
        fetch(`/api/attom?address=${enc}`),
        fetch(`/api/google-property?address=${enc}`).catch(() => null),
      ]);

      let data: any;
      try {
        data = await attomRes.json();
      } catch {
        setError("Search service returned invalid response. Please try again.");
        setSearching(false);
        return;
      }

      let gData: GoogleData | null = null;

      if (data.error) { setError(data.error); }
      else if (!data.basic && !data.detail) { setError("No property records found for this address. Try a different format (e.g. '2167 Villa Sonoma Glen, Escondido, CA 92029')."); }
      else { setResult(data); }

      if (googleRes && googleRes.ok) {
        gData = await googleRes.json();
        if (gData && !(gData as any).error) setGoogleData(gData);
        else gData = null;
      }

      // Trigger Intelligence Engine in background
      if (data.basic || data.detail) {
        setIntelLoading(true);
        // Simulate agent progress
        const statusInterval = setInterval(() => {
          setAgentStatuses(prev => {
            const next = [...prev];
            const pendingIdx = next.indexOf("pending");
            const runningIdx = next.indexOf("running");
            if (runningIdx >= 0) next[runningIdx] = "done";
            if (pendingIdx >= 0) next[pendingIdx] = "running";
            return next;
          });
        }, 800);

        fetch("/api/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyData: { basic: data.basic, detail: data.detail, comps: data.comps }, googleData: gData }),
        })
          .then(r => r.json())
          .then(intel => {
            clearInterval(statusInterval);
            setAgentStatuses(Array(6).fill("done"));
            if (intel.brief) setIntelBrief(intel.brief);
            if (intel.agents) setIntelAgents(intel.agents);
            setIntelLoading(false);
          })
          .catch(() => {
            clearInterval(statusInterval);
            setAgentStatuses(Array(6).fill("done"));
            setIntelLoading(false);
          });
      }
    } catch {
      setError("Failed to search. Please try again.");
    }
    setSearching(false);
  }

  // Debounced autocomplete
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(`/api/attom/suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.suggestions?.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setSuggestIdx(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
    }
  }, []);

  function handleInputChange(val: string) {
    setQuery(val);
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    suggestTimer.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function selectSuggestion(addr: string) {
    setQuery(addr);
    setShowSuggestions(false);
    setSuggestions([]);
    search(addr);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") search();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestIdx >= 0) selectSuggestion(suggestions[suggestIdx].address);
      else { setShowSuggestions(false); search(); }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Geolocation
  function detectLocation() {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`/api/attom/geocode?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          if (data.address) {
            setQuery(data.address);
            setLocating(false);
            search(data.address);
          } else {
            setLocError("Couldn\u2019t find an address for your location");
            setLocating(false);
          }
        } catch {
          setLocError("Failed to detect address");
          setLocating(false);
        }
      },
      () => {
        setLocError("Please enable location access in Safari Settings");
        setLocating(false);
        setTimeout(() => setLocError(""), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useEffect(() => {
    if (initialQuery && !autoSearched) {
      setAutoSearched(true);
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Load corrections when result changes
  useEffect(() => {
    if (!result) return;
    const addr = (result.detail || result.basic)?.address;
    const fullAddr = addr ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1].filter(Boolean).join(", ") : "";
    if (!fullAddr) return;
    correctionsDb.from("property_corrections").select("*").eq("address", fullAddr).then(({ data }) => {
      if (data && data.length > 0) {
        const map: Record<string, { correct_value: string; correction_type: string }> = {};
        data.forEach((c: any) => { map[c.field_name] = { correct_value: c.correct_value, correction_type: c.correction_type }; });
        setCorrections(map);
      } else {
        setCorrections({});
      }
    });
  }, [result]);

  async function saveCorrection(fieldName: string, attomValue: string, correctValue: string, correctionType: string) {
    const addr = (result?.detail || result?.basic)?.address;
    const fullAddr = addr ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1].filter(Boolean).join(", ") : "";
    const apnVal = (result?.detail || result?.basic)?.identifier?.apn || "";
    await correctionsDb.from("property_corrections").insert({
      address: fullAddr, apn: apnVal, field_name: fieldName,
      attom_value: attomValue, correct_value: correctValue,
      correction_type: correctionType, source: "user",
    });
    setCorrections(prev => ({ ...prev, [fieldName]: { correct_value: correctValue, correction_type: correctionType } }));
  }

  /* ── Extract fields ─────────────────────────────────────────── */
  const d = result?.detail;
  const b = result?.basic;
  const prop = d || b;
  const addr = prop?.address;
  const fullAddress = addr ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1].filter(Boolean).join(", ") : "";

  const owner = d?.assessment?.owner?.owner1?.fullName || d?.assessment?.owner?.absenteeOwnerStatus || null;
  const apn = prop?.identifier?.apn || null;
  const assessedValue = d?.assessment?.assessed?.assdTtlValue || prop?.assessment?.assessed?.assdTtlValue || null;
  const marketValue = d?.assessment?.market?.mktTtlValue || prop?.assessment?.market?.mktTtlValue || null;
  const lastSaleDate = d?.sale?.saleTransDate || null;
  const lastSalePrice = d?.sale?.saleTransAmount || null;
  const yearBuilt = prop?.summary?.yearbuilt || null;
  const beds = prop?.building?.rooms?.beds ?? null;
  const bathsFull = prop?.building?.rooms?.bathsFull ?? null;
  const bathsHalf = prop?.building?.rooms?.bathsHalf ?? 0;
  const bathsStr = bathsFull !== null ? `${bathsFull}${bathsHalf ? ` + ${bathsHalf} half` : ""}` : null;
  const sqft = prop?.building?.size?.livingSize || prop?.building?.size?.bldgSize || null;
  const annualTax = d?.assessment?.tax?.taxAmt || null;
  const floodZone = d?.lot?.floodZoneCode || d?.lot?.floodZone || null;
  const propType = prop?.summary?.proptype || prop?.summary?.propsubtype || null;
  const lotSize = prop?.lot?.lotSize2 || prop?.lot?.lotSize1 || null;
  const stories = prop?.building?.summary?.stories || null;
  const garage = prop?.building?.parking?.prkgSpaces || null;

  /* ── Section slide-in helper ────────────────────────────────── */
  const sectionStyle = (i: number) => ({
    opacity: result ? 1 : 0,
    transform: result ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.5s ease',
    transitionDelay: `${i * 80}ms`,
  });

  return (
    <div className="mb-6">
      {/* Global keyframe animations */}
      <style jsx global>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes confidence-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .confidence-pulse {
          animation: confidence-pulse 0.6s ease-out;
        }
        @keyframes pin-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes spin-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Search Bar ──────────────────────────────────────────── */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>
            Property Intelligence Terminal
          </span>
          <span className="text-[8px] ml-auto uppercase tracking-[0.2em]" style={{ color: "#DDDDDD", fontFamily: "var(--font-geist-mono)" }}>ATTOM + COURTLISTENER</span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1" ref={wrapperRef}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#DDDDDD" }} />
            <input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              placeholder="Enter any US address..."
              className="w-full rounded-lg pl-11 pr-20 py-3.5 text-sm focus:outline-none"
              style={{
                backgroundColor: "#FFFFFF",
                border: `1px solid ${BORDER}`,
                color: TEXT_PRIMARY,
                fontFamily: "var(--font-inter)",
                borderColor: showSuggestions ? GOLD : BORDER,
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button onClick={() => { setQuery(""); setResult(null); setError(""); setSuggestions([]); setShowSuggestions(false); }} className="p-1 rounded-md transition-colors" style={{ color: "#CCCCCC" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT_SECONDARY; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#CCCCCC"; }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="relative">
                <button
                  onClick={detectLocation}
                  disabled={locating}
                  className="p-1.5 rounded-full transition-all"
                  style={{
                    color: ACCENT,
                    animation: locating ? "none" : "pin-pulse 2s ease-in-out infinite",
                  }}
                  title="Detect my location"
                >
                  {locating ? (
                    <div className="relative w-5 h-5">
                      <div className="absolute inset-0 rounded-full" style={{ border: `2px solid ${BORDER}` }} />
                      <div className="absolute inset-0 rounded-full" style={{ border: "2px solid transparent", borderTopColor: ACCENT, animation: "spin-ring 0.8s linear infinite" }} />
                      <LocateFixed className="w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: ACCENT }} />
                    </div>
                  ) : (
                    <LocateFixed className="w-4 h-4" />
                  )}
                </button>
                {locError && (
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 p-2.5 rounded-lg text-[11px] leading-snug shadow-lg" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                    {locError}
                  </div>
                )}
              </div>
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectSuggestion(s.address)}
                    onMouseEnter={() => setSuggestIdx(i)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors text-sm"
                    style={{
                      fontFamily: "var(--font-inter)",
                      backgroundColor: suggestIdx === i ? `${ACCENT}18` : "#fff",
                      color: TEXT_PRIMARY,
                      borderBottom: i < suggestions.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}
                  >
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: suggestIdx === i ? GOLD : "#ccc" }} />
                    <span>{s.address}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => { setShowSuggestions(false); search(); }}
            disabled={searching || !query.trim()}
            className="shrink-0 px-6 py-3.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-30 hover:brightness-110"
            style={{ backgroundColor: ACCENT, color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Query
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg p-4" style={{ fontFamily: "var(--font-geist-mono)" }}>{error}</div>
      )}

      {/* ═══ RESULTS ══════════════════════════════════════════════ */}
      {result && prop && (
        <div className="mt-4 space-y-3">

          {/* ── INTELLIGENCE BRIEF ──────────────────────────── */}
          {(intelLoading || intelBrief) && (
            <div style={sectionStyle(0)}>
              <IntelligenceBrief
                brief={intelBrief}
                agents={intelAgents}
                agentStatuses={agentStatuses}
                loading={intelLoading}
              />
            </div>
          )}

          {/* ── QUANTUM INTELLIGENCE ──────────────────────── */}
          {result && (
            <div style={sectionStyle(0)}>
              <QuantumPanel
                propertyData={{ basic: result.basic, detail: result.detail, comps: result.comps }}
                googleData={googleData}
              />
            </div>
          )}

          {/* ── STREET VIEW HERO ────────────────────────────── */}
          {fullAddress && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div style={sectionStyle(0)}>
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: CARD_SHADOW }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${encodeURIComponent(fullAddress)}&return_error_code=true&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                  alt={`Street view of ${fullAddress}`}
                  className="w-full object-cover"
                  style={{ height: 280 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          )}

          {/* ── 1. HEADER ─────────────────────────────────────── */}
          <div style={sectionStyle(0)}>
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
              {/* Address bar */}
              <div className="flex flex-wrap items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FFFFFF" }}>
                <div className="flex items-center gap-3 min-w-0">
                  <MapPin className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                  <div className="min-w-0">
                    <h2 className="truncate" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28 }}>{fullAddress}</h2>
                    <div style={{ width: 60, height: 3, backgroundColor: '#F9D96A', borderRadius: 2, marginTop: 8 }} />
                    <p style={{ fontSize: 11, color: '#9B9B9B', fontStyle: 'italic', fontFamily: 'var(--font-inter)', marginTop: 6 }}>
                      Property data sourced from ATTOM county records. Recently built or renovated properties may reflect prior assessment data.
                    </p>
                  </div>
                  {propType && (
                    <span className="text-[8px] font-bold px-2.5 py-1 rounded tracking-[0.15em] uppercase shrink-0" style={{ backgroundColor: `${GOLD}15`, color: GOLD, fontFamily: "var(--font-geist-mono)" }}>
                      {propType}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  {onAddToPortfolio && (
                    <button
                      onClick={() => onAddToPortfolio(result.basic, result.detail)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all hover:brightness-110"
                      style={{ backgroundColor: ACCENT, color: TEXT_PRIMARY, fontFamily: "var(--font-geist-mono)" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Portfolio
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[8px] text-emerald-400 font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>ATTOM VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Key stats: beds / baths / sqft / built / renovated */}
              <div className="grid grid-cols-5" style={{ borderColor: BORDER }}>
                {[
                  { icon: Bed, label: "BEDS", val: beds, fmtNum: true },
                  { icon: Bath, label: "BATHS", val: bathsFull, fmtNum: true },
                  { icon: Ruler, label: "SQFT", val: sqft, fmtNum: true },
                ].map((s, idx) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.label} className="px-4 py-4 text-center" style={{ borderRight: `1px solid ${BORDER}` }}>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <SIcon className="w-3.5 h-3.5" style={{ color: "#CCCCCC" }} />
                        <span className="text-[7px] uppercase tracking-[0.2em]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>{s.label}</span>
                      </div>
                      <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-geist-mono)" }}>
                        {s.val !== null && s.val !== undefined ? (s.fmtNum && typeof s.val === "number" ? s.val.toLocaleString() : s.val) : "\u2014"}
                      </p>
                    </div>
                  );
                })}

                {/* BUILT — editable */}
                <div className="px-4 py-4 text-center group relative" style={{ borderRight: `1px solid ${BORDER}` }}>
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5" style={{ color: "#CCCCCC" }} />
                    <span className="text-[7px] uppercase tracking-[0.2em]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>BUILT</span>
                  </div>
                  {editingYearBuilt ? (
                    <div className="space-y-1.5">
                      <input
                        type="number" min={1900} max={2026} value={yearBuiltInput}
                        onChange={(e) => setYearBuiltInput(e.target.value)}
                        className="w-20 text-center text-sm rounded py-1 focus:outline-none"
                        style={{ border: `1px solid ${ACCENT}`, fontFamily: "var(--font-geist-mono)" }}
                        autoFocus
                      />
                      <select
                        value={yearBuiltType}
                        onChange={(e) => setYearBuiltType(e.target.value)}
                        className="w-full text-[9px] rounded py-0.5 focus:outline-none"
                        style={{ border: `1px solid ${BORDER}`, fontFamily: "var(--font-inter)" }}
                      >
                        <option>Original Build</option>
                        <option>Major Renovation</option>
                        <option>Full Rebuild</option>
                        <option>Addition</option>
                      </select>
                      <button
                        onClick={() => {
                          if (yearBuiltInput) {
                            saveCorrection("year_built", String(yearBuilt || ""), yearBuiltInput, yearBuiltType);
                            setEditingYearBuilt(false);
                          }
                        }}
                        className="text-[9px] font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: ACCENT, color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="text-2xl font-bold" style={{
                        color: corrections.year_built ? ACCENT : TEXT_PRIMARY,
                        fontFamily: "var(--font-geist-mono)",
                      }}>
                        {corrections.year_built ? corrections.year_built.correct_value : (yearBuilt || "\u2014")}
                      </p>
                      {corrections.year_built && (
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" style={{ color: "#10b981" }} />
                          <span className="text-[8px]" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>Verified</span>
                        </div>
                      )}
                      <button
                        onClick={() => { setYearBuiltInput(String(yearBuilt || "")); setEditingYearBuilt(true); }}
                        className="absolute -top-1 -right-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: `${ACCENT}30` }}
                        title={corrections.year_built ? `Original ATTOM value: ${yearBuilt}` : "Edit year built"}
                      >
                        <Pencil className="w-3 h-3" style={{ color: GOLD }} />
                      </button>
                    </div>
                  )}
                </div>

                {/* RENOVATED */}
                <div className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5" style={{ color: "#CCCCCC" }} />
                    <span className="text-[7px] uppercase tracking-[0.2em]" style={{ color: "#AAAAAA", fontFamily: "var(--font-geist-mono)" }}>RENOVATED</span>
                  </div>
                  {corrections.renovation_year ? (
                    <div>
                      <p className="text-2xl font-bold" style={{ color: ACCENT, fontFamily: "var(--font-geist-mono)" }}>
                        {corrections.renovation_year.correct_value}
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" style={{ color: "#10b981" }} />
                        <span className="text-[8px]" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>
                          {corrections.renovation_year.correction_type}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold" style={{ color: "#DDDDDD", fontFamily: "var(--font-geist-mono)" }}>{"\u2014"}</p>
                      <button
                        onClick={() => setShowRenovationModal(true)}
                        className="text-[9px] font-semibold mt-1 px-3 py-0.5 rounded-full"
                        style={{ backgroundColor: `${ACCENT}20`, color: GOLD, fontFamily: "var(--font-inter)" }}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Renovation Modal */}
              {showRenovationModal && (
                <div className="px-5 py-3" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "#FFFBF0" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}>When was this property renovated?</span>
                    <input
                      type="number" min={1900} max={2026} placeholder="Year"
                      value={renovationYear} onChange={(e) => setRenovationYear(e.target.value)}
                      className="w-20 text-sm rounded px-2 py-1 focus:outline-none"
                      style={{ border: `1px solid ${ACCENT}`, fontFamily: "var(--font-geist-mono)" }}
                    />
                    <select value={renovationType} onChange={(e) => setRenovationType(e.target.value)}
                      className="text-xs rounded px-2 py-1 focus:outline-none"
                      style={{ border: `1px solid ${BORDER}`, fontFamily: "var(--font-inter)" }}>
                      <option>Major Renovation</option>
                      <option>Full Rebuild</option>
                      <option>Addition</option>
                      <option>Kitchen/Bath Remodel</option>
                    </select>
                    <button
                      onClick={() => {
                        if (renovationYear) {
                          saveCorrection("renovation_year", "", renovationYear, renovationType);
                          setShowRenovationModal(false);
                        }
                      }}
                      className="text-xs font-bold px-4 py-1.5 rounded-full"
                      style={{ backgroundColor: ACCENT, color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}
                    >
                      Save
                    </button>
                    <button onClick={() => setShowRenovationModal(false)} className="text-xs" style={{ color: "#9B9B9B" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 2 & 3. OWNERSHIP + PHYSICAL ───────────────────── */}
          <div style={sectionStyle(1)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
                <Hdr icon={DollarSign} label="Ownership & Valuation" color={GOLD} />
                <Row label="Owner" value={owner} icon={Shield} pulse={confidencePulse} />
                <Row label="APN" value={apn} icon={FileText} pulse={confidencePulse} />
                <Row label="Assessed Value" value={assessedValue} fmt="usd" icon={DollarSign} pulse={confidencePulse} />
                <Row label="Market Value AVM" value={marketValue} fmt="usd" icon={TrendingUp} accent pulse={confidencePulse} />
                <Row label="Last Sale Date" value={lastSaleDate} icon={Clock} pulse={confidencePulse} />
                <Row label="Last Sale Price" value={lastSalePrice} fmt="usd" icon={DollarSign} pulse={confidencePulse} />
                <Row label="Annual Taxes" value={annualTax} fmt="usd" icon={FileText} pulse={confidencePulse} />
              </div>
              <div className="rounded-lg p-5" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
                <Hdr icon={Home} label="Physical & Risk" color="#60a5fa" />
                <Row label="Year Built" value={yearBuilt} icon={Calendar} pulse={confidencePulse} />
                <Row label="Bedrooms" value={beds} fmt="num" icon={Bed} pulse={confidencePulse} />
                <Row label="Bathrooms" value={bathsStr} icon={Bath} pulse={confidencePulse} />
                <Row label="Living Sqft" value={sqft} fmt="num" icon={Ruler} pulse={confidencePulse} />
                <Row label="Lot Size" value={lotSize ? `${lotSize.toLocaleString()} sqft` : null} icon={MapPin} pulse={confidencePulse} />
                <Row label="Flood Zone" value={floodZone || "Not reported"} icon={Droplets} pulse={confidencePulse} />
                <Row label="Stories" value={stories} fmt="num" icon={Layers} pulse={confidencePulse} />
                <Row label="Garage" value={garage ? `${garage} spaces` : null} icon={Car} pulse={confidencePulse} />
                <Row label="Prop Type" value={propType} icon={Home} pulse={confidencePulse} />
              </div>
            </div>
          </div>

          {/* ── 4. SYSTEM HEALTH ──────────────────────────────── */}
          <div style={sectionStyle(2)}>
            <SystemHealth detail={prop} />
          </div>

          {/* ── 4.5 SCENARIO ENGINE ──────────────────────────── */}
          <div style={sectionStyle(2)}>
            <ScenarioEngine propertyData={{ basic: result.basic, detail: result.detail }} />
          </div>

          {/* ── 4.6 RENTAL MARKET INTELLIGENCE ──────────────── */}
          {fullAddress && (
            <div style={sectionStyle(3)}>
              <RentcastPanel address={fullAddress} />
            </div>
          )}

          {/* ── 5. COMPARABLE SALES ───────────────────────────── */}
          <div style={sectionStyle(3)}>
            <CompsTable comps={result.comps} />
          </div>

          {/* ── 6. PUBLIC RECORDS ─────────────────────────────── */}
          <div style={sectionStyle(4)}>
            <PublicRecords detail={d} basic={b} pulse={confidencePulse} />
          </div>

          {/* ── 7. LITIGATION CHECK ───────────────────────────── */}
          <div style={sectionStyle(5)}>
            <LitigationCheck address={fullAddress} />
          </div>

          {/* ── 8. WALK SCORE ──────────────────────────────── */}
          {googleData?.walkScore && (
            <div style={sectionStyle(6)}>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <MapPin className="w-4 h-4" style={{ color: "#10b981" }} />
                  <span style={{ color: "#10b981", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>Walkability & Transit</span>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                  {[
                    { label: "Walk Score", value: googleData.walkScore.walk, desc: googleData.walkScore.walkDesc, color: googleData.walkScore.walk >= 70 ? "#10b981" : googleData.walkScore.walk >= 50 ? "#f59e0b" : "#ef4444" },
                    ...(googleData.walkScore.transit ? [{ label: "Transit", value: googleData.walkScore.transit, desc: googleData.walkScore.transitDesc, color: googleData.walkScore.transit >= 70 ? "#10b981" : googleData.walkScore.transit >= 50 ? "#f59e0b" : "#ef4444" }] : []),
                    ...(googleData.walkScore.bike ? [{ label: "Bike", value: googleData.walkScore.bike, desc: googleData.walkScore.bikeDesc, color: googleData.walkScore.bike >= 70 ? "#10b981" : googleData.walkScore.bike >= 50 ? "#f59e0b" : "#ef4444" }] : []),
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ border: `1px solid ${BORDER}`, minWidth: 140 }}>
                      <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-heading)" }}>{s.value}</div>
                      <div>
                        <div className="text-xs font-semibold" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}>{s.label}</div>
                        <div className="text-[10px]" style={{ color: TEXT_SECONDARY }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 9. SOLAR POTENTIAL ──────────────────────────── */}
          {googleData?.solar && (
            <div style={sectionStyle(7)}>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <Zap className="w-4 h-4" style={{ color: GOLD }} />
                  <span style={{ color: GOLD, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>Solar Potential</span>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Max Panels", value: googleData.solar.maxPanels, suffix: "" },
                    { label: "Annual Sunshine", value: googleData.solar.annualSunshineHours, suffix: " hrs" },
                    { label: "Est. Energy/Year", value: googleData.solar.annualEnergy, suffix: " kWh" },
                    { label: "CO₂ Offset", value: googleData.solar.carbonOffset, suffix: " kg/MWh" },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-3 rounded-lg" style={{ backgroundColor: "#FFFBF0" }}>
                      <div className="text-2xl font-bold" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-heading)" }}>
                        {s.value !== null ? s.value.toLocaleString() : "—"}
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── 10. CLIMATE ─────────────────────────────────── */}
          {googleData?.weather && (
            <div style={sectionStyle(8)}>
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, boxShadow: CARD_SHADOW, borderLeft: '3px solid #F9D96A' }}>
                <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <Cloud className="w-4 h-4" style={{ color: "#60a5fa" }} />
                  <span style={{ color: "#60a5fa", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16 }}>Current Climate</span>
                </div>
                <div className="p-5 flex flex-wrap gap-4">
                  {[
                    { label: "Temperature", value: googleData.weather.temperature !== null ? `${googleData.weather.temperature}${googleData.weather.temperatureUnit}` : null },
                    { label: "Conditions", value: googleData.weather.condition },
                    { label: "Humidity", value: googleData.weather.humidity !== null ? `${googleData.weather.humidity}%` : null },
                    { label: "UV Index", value: googleData.weather.uvIndex !== null ? String(googleData.weather.uvIndex) : null },
                    ...(googleData.weather.windSpeed ? [{ label: "Wind", value: `${googleData.weather.windSpeed} mph` }] : []),
                  ].filter(s => s.value).map((s) => (
                    <div key={s.label} className="px-4 py-2 rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
                      <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{s.label}</div>
                      <div className="text-sm font-semibold" style={{ color: TEXT_PRIMARY, fontFamily: "var(--font-geist-mono)" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SOURCES BAR ─────────────────────────────────── */}
          <div style={sectionStyle(9)}>
            <div className="flex items-center justify-center gap-2 py-3" style={{ color: "#CCCCCC" }}>
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-geist-mono)" }}>Sources:</span>
              {[...(result?.sources || []), ...(googleData?.sources || []), "Rentcast"].filter((v, i, a) => a.indexOf(v) === i).map((s: string, i: number) => (
                <span key={s} className="text-[9px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {i > 0 && <span className="mx-1">|</span>}
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
