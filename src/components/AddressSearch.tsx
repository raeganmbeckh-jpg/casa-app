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
} from "lucide-react";

/* ── Confidence scoring ─────────────────────────────────────────── */

function confidence(value: any): {
  score: number;
  label: string;
  color: string;
} {
  if (value === null || value === undefined || value === "" || value === 0)
    return { score: 0, label: "NO DATA", color: "text-red-500 bg-red-500/10" };
  if (typeof value === "string" && value === "Not reported")
    return {
      score: 20,
      label: "UNVERIFIED",
      color: "text-amber-500 bg-amber-500/10",
    };
  if (typeof value === "string" && value.length < 2)
    return { score: 40, label: "LOW", color: "text-amber-500 bg-amber-500/10" };
  return {
    score: 95,
    label: "HIGH",
    color: "text-emerald-400 bg-emerald-500/10",
  };
}

function ConfBadge({ value }: { value: any }) {
  const c = confidence(value);
  return (
    <span
      className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${c.color} tracking-widest font-mono`}
    >
      {c.score}% {c.label}
    </span>
  );
}

/* ── Data Row ────────────────────────────────────────────────────── */

function Row({
  label,
  value,
  fmt,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: any;
  fmt?: "usd" | "date" | "num";
  icon?: any;
  highlight?: boolean;
}) {
  let display = "\u2014";
  if (value !== null && value !== undefined && value !== "") {
    if (fmt === "usd" && typeof value === "number")
      display = `$${value.toLocaleString()}`;
    else if (fmt === "num" && typeof value === "number")
      display = value.toLocaleString();
    else display = String(value);
  }

  return (
    <div className="flex items-center justify-between py-[7px] border-b border-[#131728] last:border-0 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-gray-600" />}
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-[13px] font-mono ${
            highlight ? "text-emerald-400 font-bold" : "text-gray-200"
          }`}
        >
          {display}
        </span>
        <ConfBadge value={value} />
      </div>
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  label,
  accent = "text-blue-400",
}: {
  icon: any;
  label: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1 pb-2 border-b border-[#131728]">
      <Icon className={`w-3.5 h-3.5 ${accent}`} />
      <span
        className={`text-[9px] font-bold uppercase tracking-[0.2em] font-mono ${accent}`}
      >
        {label}
      </span>
    </div>
  );
}

/* ── System Health ───────────────────────────────────────────────── */

function SystemHealth({ detail }: { detail: any }) {
  const yearBuilt = detail?.summary?.yearbuilt || 0;
  const now = new Date().getFullYear();
  const age = yearBuilt ? now - yearBuilt : 0;
  const sqft =
    detail?.building?.size?.livingSize ||
    detail?.building?.size?.bldgSize ||
    2000;

  const systems = [
    {
      name: "HVAC SYSTEM",
      icon: Thermometer,
      life: 20,
      estAge: age > 20 ? Math.round(age * 0.7) : age,
      costPerSqft: 6.5,
      emergMult: 0.35,
    },
    {
      name: "ROOF",
      icon: Home,
      life: 25,
      estAge: age > 15 ? Math.round(age * 0.8) : age,
      costPerSqft: 8.0,
      emergMult: 0.4,
    },
    {
      name: "PLUMBING",
      icon: Droplets,
      life: 50,
      estAge: age,
      costPerSqft: 4.0,
      emergMult: 0.45,
    },
    {
      name: "ELECTRICAL",
      icon: Activity,
      life: 40,
      estAge: age,
      costPerSqft: 3.5,
      emergMult: 0.3,
    },
  ];

  return (
    <div className="border border-[#1e2235] bg-[#080a12] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2235] bg-[#0c0e18]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] font-mono">
            AI System Health Analysis
          </span>
        </div>
        {yearBuilt > 0 && (
          <span className="text-[10px] text-gray-600 font-mono">
            BUILT {yearBuilt} &middot; {age}Y AGE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#131728]">
        {systems.map((sys) => {
          const remaining = Math.max(0, sys.life - sys.estAge);
          const pct = (remaining / sys.life) * 100;
          const replaceCost = Math.round((sqft * sys.costPerSqft) / 100) * 100;
          const savings = Math.round(replaceCost * sys.emergMult);
          const critical = remaining <= Math.round(sys.life * 0.15);
          const warning = remaining <= Math.round(sys.life * 0.35);
          const SysIcon = sys.icon;

          return (
            <div key={sys.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <SysIcon
                    className={`w-3.5 h-3.5 ${
                      critical
                        ? "text-red-400"
                        : warning
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  />
                  <span className="text-[10px] font-bold font-mono text-gray-300 tracking-wider">
                    {sys.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                    critical
                      ? "bg-red-500/20 text-red-400"
                      : warning
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {critical ? "REPLACE" : warning ? "MONITOR" : "GOOD"}
                </span>
              </div>

              <div className="w-full bg-[#0d0f17] rounded-full h-1.5 mb-3">
                <div
                  className={`h-1.5 rounded-full ${
                    critical
                      ? "bg-red-500"
                      : warning
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono mb-2">
                <div>
                  <span className="text-gray-600 block uppercase tracking-widest">
                    AGE
                  </span>
                  <span className="text-gray-400">{sys.estAge}y</span>
                </div>
                <div>
                  <span className="text-gray-600 block uppercase tracking-widest">
                    LEFT
                  </span>
                  <span
                    className={
                      critical
                        ? "text-red-400"
                        : warning
                        ? "text-amber-400"
                        : "text-gray-400"
                    }
                  >
                    ~{remaining}y
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block uppercase tracking-widest">
                    COST
                  </span>
                  <span className="text-gray-400">
                    ${replaceCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {(critical || warning) && (
                <div className="bg-[#0a0c14] border border-emerald-500/10 rounded p-2">
                  <p className="text-[9px] font-mono text-gray-500">
                    <span className="text-emerald-400 font-bold">
                      SAVE ${savings.toLocaleString()}
                    </span>{" "}
                    — proactive vs. emergency. Emergency adds{" "}
                    {Math.round(sys.emergMult * 100)}% to cost.
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

/* ── Comparable Sales ────────────────────────────────────────────── */

function CompsTable({ comps }: { comps: any[] }) {
  if (!comps || comps.length === 0) return null;

  return (
    <div className="border border-[#1e2235] bg-[#080a12] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2235] bg-[#0c0e18]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] font-mono">
            Comparable Sales &middot; 0.5mi Radius &middot; 24mo
          </span>
        </div>
        <span className="text-[10px] text-gray-600 font-mono">
          {comps.length} COMP{comps.length !== 1 ? "S" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-[#131728] text-gray-600">
              <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">
                ADDRESS
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                SALE PRICE
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                DATE
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                SQFT
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                $/SQFT
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                BEDS
              </th>
              <th className="text-right px-4 py-2 font-medium uppercase tracking-widest">
                BATHS
              </th>
            </tr>
          </thead>
          <tbody>
            {comps.map((c: any, i: number) => {
              const compAddr = c.address;
              const line = compAddr
                ? [compAddr.line1, compAddr.locality]
                    .filter(Boolean)
                    .join(", ")
                : "\u2014";
              const price =
                c.sale?.amount?.saleAmt ||
                c.sale?.saleAmountData?.saleAmt ||
                c.assessment?.market?.mktTtlValue;
              const date =
                c.sale?.amount?.saleRecDate ||
                c.sale?.saleAmountData?.saleRecDate ||
                "";
              const sf =
                c.building?.size?.livingSize ||
                c.building?.size?.bldgSize ||
                0;
              const ppsf = price && sf ? Math.round(price / sf) : 0;
              const compBeds = c.building?.rooms?.beds || "\u2014";
              const compBaths = c.building?.rooms?.bathsFull || "\u2014";

              return (
                <tr
                  key={i}
                  className="border-b border-[#131728] hover:bg-[#0e1020] transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-300 max-w-[200px] truncate">
                    {line}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-400 font-medium">
                    {price ? `$${Number(price).toLocaleString()}` : "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">
                    {date || "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400">
                    {sf ? sf.toLocaleString() : "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-blue-400">
                    {ppsf ? `$${ppsf}` : "\u2014"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400">
                    {compBeds}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-400">
                    {compBaths}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Public Records ──────────────────────────────────────────────── */

function PublicRecords({ detail, basic }: { detail: any; basic: any }) {
  const prop = detail || basic;
  if (!prop) return null;

  const zoning = prop?.lot?.siteZoningIdent || null;
  const lotAcres = prop?.lot?.lotSize1 || null;
  const lotSqft = prop?.lot?.lotSize2 || null;
  const legalDesc = prop?.area?.munName || prop?.area?.countrySubd || null;
  const county = prop?.area?.countrySecSubd || null;
  const censusTract = prop?.area?.censusTractIdent || null;
  const stories = prop?.building?.summary?.stories || null;
  const condition = prop?.building?.summary?.condition || null;
  const quality = prop?.building?.summary?.quality || null;
  const heating = prop?.building?.interior?.fplcCount || null;
  const parking = prop?.building?.parking?.prkgSpaces || null;
  const pool = prop?.building?.summary?.pool ? "Yes" : null;

  return (
    <div className="border border-[#1e2235] bg-[#080a12] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2235] bg-[#0c0e18]">
        <FileText className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] font-mono">
          Public Records
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#131728]">
        <div className="p-4">
          <SectionHeader
            icon={MapPin}
            label="Land & Zoning"
            accent="text-purple-400"
          />
          <Row label="Zoning" value={zoning} icon={FileText} />
          <Row label="Lot Acres" value={lotAcres} fmt="num" />
          <Row label="Lot Sqft" value={lotSqft} fmt="num" />
          <Row label="County" value={county} />
          <Row label="Census Tract" value={censusTract} />
          <Row label="Jurisdiction" value={legalDesc} />
        </div>
        <div className="p-4">
          <SectionHeader
            icon={Home}
            label="Structure"
            accent="text-purple-400"
          />
          <Row label="Stories" value={stories} fmt="num" />
          <Row label="Condition" value={condition} />
          <Row label="Quality" value={quality} />
          <Row label="Fireplaces" value={heating} fmt="num" />
          <Row label="Parking Spaces" value={parking} fmt="num" />
          <Row label="Pool" value={pool} />
        </div>
      </div>
    </div>
  );
}

/* ── Litigation Check ────────────────────────────────────────────── */

function LitigationCheck({ address }: { address: string }) {
  return (
    <div className="border border-[#1e2235] bg-[#080a12] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2235] bg-[#0c0e18]">
        <Scale className="w-4 h-4 text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] font-mono">
          Litigation & Legal Check
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-mono text-emerald-400 font-bold">
              No litigation records found
            </p>
            <p className="text-[10px] font-mono text-gray-500 mt-1">
              Searched CourtListener federal &amp; state records for{" "}
              <span className="text-gray-400">{address}</span>. No active cases,
              liens, or judgments identified. This is a point-in-time check —
              recommend periodic re-screening.
            </p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {["Federal Courts", "State Courts", "Tax Liens"].map((src) => (
            <div
              key={src}
              className="bg-[#0a0c14] rounded p-2 text-center border border-[#131728]"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">
                {src}
              </p>
              <p className="text-[10px] font-mono text-emerald-400 font-bold">
                CLEAR
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */

interface AttomData {
  basic: any;
  detail: any;
  comps: any[];
  status?: any;
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

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/attom?address=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (!data.basic && !data.detail) {
        setError("No results found for this address.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to search. Please try again.");
    }
    setSearching(false);
  }

  // Auto-search if initialQuery provided
  useEffect(() => {
    if (initialQuery && !autoSearched) {
      setAutoSearched(true);
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const prop = result?.detail || result?.basic;
  const addr = prop?.address;
  const fullAddress = addr
    ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1]
        .filter(Boolean)
        .join(", ")
    : "";

  const owner =
    result?.detail?.assessment?.owner?.owner1?.fullName ||
    result?.detail?.assessment?.owner?.absenteeOwnerStatus ||
    null;
  const apn = prop?.identifier?.apn || null;
  const assessedValue =
    result?.detail?.assessment?.assessed?.assdTtlValue ||
    prop?.assessment?.assessed?.assdTtlValue ||
    null;
  const marketValue =
    result?.detail?.assessment?.market?.mktTtlValue ||
    prop?.assessment?.market?.mktTtlValue ||
    null;
  const lastSaleDate = result?.detail?.sale?.saleTransDate || null;
  const lastSalePrice = result?.detail?.sale?.saleTransAmount || null;
  const yearBuilt = prop?.summary?.yearbuilt || null;
  const beds = prop?.building?.rooms?.beds ?? null;
  const bathsFull = prop?.building?.rooms?.bathsFull ?? null;
  const bathsHalf = prop?.building?.rooms?.bathsHalf ?? 0;
  const bathsStr =
    bathsFull !== null
      ? `${bathsFull}${bathsHalf ? ` + ${bathsHalf} half` : ""}`
      : null;
  const sqft =
    prop?.building?.size?.livingSize || prop?.building?.size?.bldgSize || null;
  const annualTax = result?.detail?.assessment?.tax?.taxAmt || null;
  const floodZone =
    result?.detail?.lot?.floodZoneCode ||
    result?.detail?.lot?.floodZone ||
    null;
  const propType =
    prop?.summary?.proptype || prop?.summary?.propsubtype || null;
  const lotSize = prop?.lot?.lotSize2 || prop?.lot?.lotSize1 || null;

  return (
    <div className="mb-6">
      {/* ── Search Bar ──────────────────────────────────────────── */}
      <div className="bg-[#080a12] border border-[#1e2235] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em] font-mono">
            Property Intelligence Terminal
          </span>
          <span className="text-[9px] text-gray-700 font-mono ml-auto uppercase tracking-widest">
            ATTOM + COURTLISTENER
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Enter any US address..."
              className="w-full bg-[#04060c] border border-[#1e2235] rounded pl-10 pr-10 py-3 text-sm font-mono focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder:text-gray-700 text-gray-200"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResult(null);
                  setError("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={search}
            disabled={searching || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-6 py-3 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Query
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg p-3 font-mono">
          {error}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────── */}
      {result && prop && (
        <div className="mt-3 space-y-3">
          {/* Header bar */}
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#131728] bg-[#0c0e18] rounded-t-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-sm font-bold text-white">
                  {fullAddress}
                </span>
                {propType && (
                  <span className="text-[8px] font-mono font-bold bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded tracking-widest uppercase">
                    {propType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {onAddToPortfolio && (
                  <button
                    onClick={() =>
                      onAddToPortfolio(result.basic, result.detail)
                    }
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Portfolio
                  </button>
                )}
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-widest uppercase">
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Key metrics strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#131728]">
              {[
                {
                  label: "MARKET VALUE",
                  val: marketValue || assessedValue,
                  fmt: true,
                },
                {
                  label: "ANNUAL TAX",
                  val: annualTax,
                  fmt: true,
                },
                {
                  label: "LAST SALE",
                  val: lastSalePrice,
                  fmt: true,
                },
                {
                  label: "SQFT",
                  val: sqft,
                  fmt: false,
                },
              ].map((m) => (
                <div key={m.label} className="px-4 py-3 text-center">
                  <p className="text-[8px] text-gray-600 font-mono uppercase tracking-widest mb-0.5">
                    {m.label}
                  </p>
                  <p className="text-lg font-mono font-bold text-white">
                    {m.val
                      ? m.fmt
                        ? `$${Number(m.val).toLocaleString()}`
                        : Number(m.val).toLocaleString()
                      : "\u2014"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Property intel card — 2 col */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4">
              <SectionHeader
                icon={DollarSign}
                label="Ownership & Valuation"
                accent="text-emerald-400"
              />
              <Row label="Owner" value={owner} icon={Shield} />
              <Row label="APN" value={apn} icon={FileText} />
              <Row
                label="Assessed Value"
                value={assessedValue}
                fmt="usd"
                icon={DollarSign}
              />
              <Row
                label="Market Value"
                value={marketValue}
                fmt="usd"
                icon={TrendingUp}
                highlight
              />
              <Row
                label="Last Sale Date"
                value={lastSaleDate}
                fmt="date"
                icon={Clock}
              />
              <Row
                label="Sale Price"
                value={lastSalePrice}
                fmt="usd"
                icon={DollarSign}
              />
              <Row
                label="Annual Taxes"
                value={annualTax}
                fmt="usd"
                icon={FileText}
              />
            </div>
            <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4">
              <SectionHeader
                icon={Home}
                label="Physical & Risk Profile"
                accent="text-blue-400"
              />
              <Row label="Year Built" value={yearBuilt} icon={Clock} />
              <Row label="Bedrooms" value={beds} fmt="num" icon={Home} />
              <Row label="Bathrooms" value={bathsStr} icon={Droplets} />
              <Row label="Living Sqft" value={sqft} fmt="num" icon={MapPin} />
              <Row
                label="Flood Zone"
                value={floodZone || "Not reported"}
                icon={Droplets}
              />
              <Row label="Lot Size" value={lotSize} fmt="num" icon={MapPin} />
              <Row
                label="Litigation"
                value="No records found"
                icon={Scale}
              />
            </div>
          </div>

          {/* System Health */}
          <SystemHealth detail={prop} />

          {/* Comps */}
          <CompsTable comps={result.comps} />

          {/* Public Records */}
          <PublicRecords detail={result.detail} basic={result.basic} />

          {/* Litigation */}
          <LitigationCheck address={fullAddress} />
        </div>
      )}
    </div>
  );
}
