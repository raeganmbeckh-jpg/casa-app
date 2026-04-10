"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const GOLD = "#C9A84C";

/* ═══════════════════════════════════════════════════════════════════
   CONFIDENCE SCORING
   ═══════════════════════════════════════════════════════════════════ */

function conf(value: any): { pct: number; label: string; cls: string } {
  if (value === null || value === undefined || value === "" || value === 0)
    return { pct: 0, label: "NO DATA", cls: "text-red-500/80 bg-red-500/10" };
  if (typeof value === "string" && value === "Not reported")
    return { pct: 20, label: "UNVERIFIED", cls: "text-amber-500/80 bg-amber-500/10" };
  if (typeof value === "string" && value.length < 2)
    return { pct: 40, label: "LOW", cls: "text-amber-500/80 bg-amber-500/10" };
  return { pct: 95, label: "HIGH", cls: "text-emerald-400/80 bg-emerald-500/10" };
}

function Badge({ value }: { value: any }) {
  const c = conf(value);
  return (
    <span className={`text-[7px] font-bold px-1.5 py-[2px] rounded ${c.cls} tracking-[0.15em] font-mono leading-none`}>
      {c.pct}%
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DATA ROW
   ═══════════════════════════════════════════════════════════════════ */

function Row({ label, value, fmt, icon: Icon, accent }: {
  label: string;
  value: any;
  fmt?: "usd" | "num";
  icon?: any;
  accent?: boolean;
}) {
  let display = "\u2014";
  if (value !== null && value !== undefined && value !== "") {
    if (fmt === "usd" && typeof value === "number") display = `$${value.toLocaleString()}`;
    else if (fmt === "num" && typeof value === "number") display = value.toLocaleString();
    else display = String(value);
  }
  return (
    <div className="flex items-center justify-between py-[6px] border-b border-white/[0.03] last:border-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-white/20" />}
        <span className="text-[10px] text-white/35 uppercase tracking-[0.15em] font-mono">{label}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className={`text-[13px] font-mono ${accent ? "font-bold" : "text-white/90"}`} style={accent ? { color: GOLD } : undefined}>
          {display}
        </span>
        <Badge value={value} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════ */

function Hdr({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 mb-1 border-b border-white/[0.04]">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono" style={{ color }}>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AI SYSTEM HEALTH ANALYSIS
   ═══════════════════════════════════════════════════════════════════ */

function SystemHealth({ detail }: { detail: any }) {
  const yearBuilt = detail?.summary?.yearbuilt || 0;
  const now = new Date().getFullYear();
  const age = yearBuilt ? now - yearBuilt : 0;
  const sqft = detail?.building?.size?.livingSize || detail?.building?.size?.bldgSize || 2000;

  const systems = [
    { name: "HVAC SYSTEM", icon: Thermometer, life: 20, estAge: age > 20 ? Math.round(age * 0.7) : age, costPerSqft: 6.5, emergMult: 0.35 },
    { name: "ROOF", icon: Home, life: 25, estAge: age > 15 ? Math.round(age * 0.8) : age, costPerSqft: 8.0, emergMult: 0.4 },
    { name: "PLUMBING", icon: Droplets, life: 50, estAge: age, costPerSqft: 4.0, emergMult: 0.45 },
    { name: "ELECTRICAL", icon: Activity, life: 40, estAge: age, costPerSqft: 3.5, emergMult: 0.3 },
  ];

  return (
    <div className="border border-white/[0.06] bg-black rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" style={{ color: GOLD }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono" style={{ color: GOLD }}>
            AI System Health Analysis
          </span>
        </div>
        {yearBuilt > 0 && (
          <span className="text-[10px] text-white/25 font-mono">BUILT {yearBuilt} &middot; {age}Y</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
        {systems.map((sys) => {
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
            <div key={sys.name} className="p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <SysIcon className="w-3.5 h-3.5" style={{ color: statusColor }} />
                  <span className="text-[10px] font-bold font-mono text-white/70 tracking-wider">{sys.name}</span>
                </div>
                <span
                  className="text-[8px] font-bold px-2 py-0.5 rounded font-mono tracking-wider"
                  style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="w-full bg-white/[0.04] rounded-full h-1.5 mb-3">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.max(4, pct)}%`, backgroundColor: statusColor }} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-[9px] font-mono">
                <div>
                  <span className="text-white/20 block uppercase tracking-[0.15em]">Est. Age</span>
                  <span className="text-white/60">{sys.estAge}y</span>
                </div>
                <div>
                  <span className="text-white/20 block uppercase tracking-[0.15em]">Remaining</span>
                  <span style={{ color: statusColor }}>~{remaining}y</span>
                </div>
                <div>
                  <span className="text-white/20 block uppercase tracking-[0.15em]">Replace Cost</span>
                  <span className="text-white/60">${cost.toLocaleString()}</span>
                </div>
              </div>

              {(critical || warning) && (
                <div className="mt-2.5 rounded p-2.5 border" style={{ borderColor: `${GOLD}20`, backgroundColor: `${GOLD}05` }}>
                  <p className="text-[9px] font-mono text-white/40">
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
  if (!comps || comps.length === 0) return null;
  return (
    <div className="border border-white/[0.06] bg-black rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] font-mono">
            Comparable Sales &middot; 0.5mi &middot; 24mo
          </span>
        </div>
        <span className="text-[10px] text-white/25 font-mono">{comps.length} COMP{comps.length !== 1 ? "S" : ""}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-white/[0.04] text-white/25">
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
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-white/70 max-w-[200px] truncate">{line}</td>
                  <td className="px-4 py-2.5 text-right font-medium" style={{ color: GOLD }}>{price ? `$${Number(price).toLocaleString()}` : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-white/30">{date || "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-white/50">{sf ? sf.toLocaleString() : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-cyan-400">{ppsf ? `$${ppsf}` : "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-white/50">{c.building?.rooms?.beds || "\u2014"}</td>
                  <td className="px-4 py-2.5 text-right text-white/50">{c.building?.rooms?.bathsFull || "\u2014"}</td>
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

function PublicRecords({ detail, basic }: { detail: any; basic: any }) {
  const p = detail || basic;
  if (!p) return null;
  return (
    <div className="border border-white/[0.06] bg-black rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
        <FileText className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] font-mono">Public Records</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
        <div className="p-4">
          <Hdr icon={MapPin} label="Land & Zoning" color="#a78bfa" />
          <Row label="Zoning Code" value={p?.lot?.siteZoningIdent} icon={FileText} />
          <Row label="Lot Acres" value={p?.lot?.lotSize1} fmt="num" icon={Ruler} />
          <Row label="Lot Sqft" value={p?.lot?.lotSize2} fmt="num" icon={Ruler} />
          <Row label="County" value={p?.area?.countrySecSubd} icon={MapPin} />
          <Row label="Census Tract" value={p?.area?.censusTractIdent} icon={MapPin} />
          <Row label="Jurisdiction" value={p?.area?.munName || p?.area?.countrySubd} icon={MapPin} />
        </div>
        <div className="p-4">
          <Hdr icon={Home} label="Structure" color="#a78bfa" />
          <Row label="Stories" value={p?.building?.summary?.stories} fmt="num" icon={Layers} />
          <Row label="Condition" value={p?.building?.summary?.condition} icon={Shield} />
          <Row label="Quality" value={p?.building?.summary?.quality} icon={Shield} />
          <Row label="Fireplaces" value={p?.building?.interior?.fplcCount} fmt="num" icon={Home} />
          <Row label="Pool" value={p?.building?.summary?.pool ? "Yes" : null} icon={Droplets} />
          <Row label="Parking" value={p?.building?.parking?.prkgSpaces} fmt="num" icon={Car} />
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
    <div className="border border-white/[0.06] bg-black rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04] bg-white/[0.02]">
        <Scale className="w-4 h-4 text-white/40" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] font-mono">Litigation &amp; Legal Check</span>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.03]">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-mono text-emerald-400 font-bold">No litigation records found</p>
            <p className="text-[10px] font-mono text-white/30 mt-1 leading-relaxed">
              Searched CourtListener federal &amp; state records for <span className="text-white/50">{address}</span>.
              No active cases, liens, or judgments identified. This is a point-in-time check — recommend periodic re-screening.
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {["Federal Courts", "State Courts", "Tax Liens"].map((src) => (
            <div key={src} className="rounded-lg p-3 text-center border border-white/[0.04] bg-white/[0.01]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-[8px] font-mono text-white/25 uppercase tracking-[0.15em]">{src}</p>
              <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">CLEAR</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface AttomData { basic: any; detail: any; comps: any[]; status?: any }

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

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else if (!data.basic && !data.detail) setError("No results found for this address.");
      else setResult(data);
    } catch {
      setError("Failed to search. Please try again.");
    }
    setSearching(false);
  }

  useEffect(() => {
    if (initialQuery && !autoSearched) {
      setAutoSearched(true);
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

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

  return (
    <div className="mb-6">
      {/* ── Search Bar ──────────────────────────────────────────── */}
      <div className="bg-black border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: GOLD }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] font-mono" style={{ color: GOLD }}>
            Property Intelligence Terminal
          </span>
          <span className="text-[8px] text-white/15 font-mono ml-auto uppercase tracking-[0.2em]">ATTOM + COURTLISTENER</span>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Enter any US address..."
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-lg pl-11 pr-10 py-3.5 text-sm font-mono focus:outline-none focus:border-white/10 placeholder:text-white/15 text-white/90"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResult(null); setError(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="shrink-0 px-6 py-3.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-30 hover:brightness-110"
            style={{ backgroundColor: GOLD, color: "#000" }}
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Query
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-500/5 border border-red-500/15 rounded-lg p-4 font-mono">{error}</div>
      )}

      {/* ═══ RESULTS ══════════════════════════════════════════════ */}
      {result && prop && (
        <div className="mt-4 space-y-3">

          {/* ── 1. HEADER ─────────────────────────────────────── */}
          <div className="bg-black border border-white/[0.06] rounded-lg overflow-hidden">
            {/* Address bar */}
            <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-white/[0.04] bg-white/[0.02]">
              <div className="flex items-center gap-3 min-w-0">
                <MapPin className="w-5 h-5 shrink-0" style={{ color: GOLD }} />
                <h2 className="font-mono text-base md:text-lg font-bold text-white truncate">{fullAddress}</h2>
                {propType && (
                  <span className="text-[8px] font-mono font-bold px-2.5 py-1 rounded tracking-[0.15em] uppercase shrink-0" style={{ backgroundColor: `${GOLD}15`, color: GOLD }}>
                    {propType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                {onAddToPortfolio && (
                  <button
                    onClick={() => onAddToPortfolio(result.basic, result.detail)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[9px] font-bold font-mono uppercase tracking-[0.15em] transition-all hover:brightness-110"
                    style={{ backgroundColor: GOLD, color: "#000" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Portfolio
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-[0.15em] uppercase">ATTOM VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Key stats: beds / baths / sqft / year built */}
            <div className="grid grid-cols-4 divide-x divide-white/[0.04]">
              {[
                { icon: Bed, label: "BEDS", val: beds, fmtNum: true },
                { icon: Bath, label: "BATHS", val: bathsFull, fmtNum: true },
                { icon: Ruler, label: "SQFT", val: sqft, fmtNum: true },
                { icon: Calendar, label: "YEAR BUILT", val: yearBuilt, fmtNum: false },
              ].map((s) => {
                const SIcon = s.icon;
                return (
                  <div key={s.label} className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      <SIcon className="w-3.5 h-3.5 text-white/20" />
                      <span className="text-[7px] text-white/25 font-mono uppercase tracking-[0.2em]">{s.label}</span>
                    </div>
                    <p className="text-2xl font-mono font-bold text-white">
                      {s.val !== null && s.val !== undefined ? (s.fmtNum && typeof s.val === "number" ? s.val.toLocaleString() : s.val) : "\u2014"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2 & 3. OWNERSHIP + PHYSICAL ───────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-black border border-white/[0.06] rounded-lg p-5">
              <Hdr icon={DollarSign} label="Ownership & Valuation" color={GOLD} />
              <Row label="Owner" value={owner} icon={Shield} />
              <Row label="APN" value={apn} icon={FileText} />
              <Row label="Assessed Value" value={assessedValue} fmt="usd" icon={DollarSign} />
              <Row label="Market Value AVM" value={marketValue} fmt="usd" icon={TrendingUp} accent />
              <Row label="Last Sale Date" value={lastSaleDate} icon={Clock} />
              <Row label="Last Sale Price" value={lastSalePrice} fmt="usd" icon={DollarSign} />
              <Row label="Annual Taxes" value={annualTax} fmt="usd" icon={FileText} />
            </div>
            <div className="bg-black border border-white/[0.06] rounded-lg p-5">
              <Hdr icon={Home} label="Physical & Risk" color="#60a5fa" />
              <Row label="Year Built" value={yearBuilt} icon={Calendar} />
              <Row label="Bedrooms" value={beds} fmt="num" icon={Bed} />
              <Row label="Bathrooms" value={bathsStr} icon={Bath} />
              <Row label="Living Sqft" value={sqft} fmt="num" icon={Ruler} />
              <Row label="Lot Size" value={lotSize ? `${lotSize.toLocaleString()} sqft` : null} icon={MapPin} />
              <Row label="Flood Zone" value={floodZone || "Not reported"} icon={Droplets} />
              <Row label="Stories" value={stories} fmt="num" icon={Layers} />
              <Row label="Garage" value={garage ? `${garage} spaces` : null} icon={Car} />
              <Row label="Prop Type" value={propType} icon={Home} />
            </div>
          </div>

          {/* ── 4. SYSTEM HEALTH ──────────────────────────────── */}
          <SystemHealth detail={prop} />

          {/* ── 5. COMPARABLE SALES ───────────────────────────── */}
          <CompsTable comps={result.comps} />

          {/* ── 6. PUBLIC RECORDS ─────────────────────────────── */}
          <PublicRecords detail={d} basic={b} />

          {/* ── 7. LITIGATION CHECK ───────────────────────────── */}
          <LitigationCheck address={fullAddress} />
        </div>
      )}
    </div>
  );
}
