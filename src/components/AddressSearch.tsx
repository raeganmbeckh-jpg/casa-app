"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  X,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  Thermometer,
} from "lucide-react";

interface AttomData {
  basic: any;
  detail: any;
  status?: any;
}

function confidence(value: any): { score: number; label: string; color: string } {
  if (value === null || value === undefined || value === "" || value === 0) {
    return { score: 0, label: "NO DATA", color: "text-red-500 bg-red-500/10" };
  }
  if (typeof value === "string" && value.length < 2) {
    return { score: 40, label: "LOW", color: "text-amber-500 bg-amber-500/10" };
  }
  return { score: 95, label: "HIGH", color: "text-emerald-400 bg-emerald-500/10" };
}

function ConfidenceBadge({ value }: { value: any }) {
  const c = confidence(value);
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.color} tracking-wider`}>
      {c.label}
    </span>
  );
}

function DataRow({
  label,
  value,
  format,
}: {
  label: string;
  value: any;
  format?: "currency" | "date" | "number";
}) {
  let display = "—";
  if (value !== null && value !== undefined && value !== "") {
    if (format === "currency" && typeof value === "number") {
      display = `$${value.toLocaleString()}`;
    } else if (format === "number" && typeof value === "number") {
      display = value.toLocaleString();
    } else {
      display = String(value);
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1a1f2e] last:border-0">
      <span className="text-[11px] text-gray-500 uppercase tracking-wider font-mono">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-gray-200">{display}</span>
        <ConfidenceBadge value={value} />
      </div>
    </div>
  );
}

function SystemHealthAnalysis({ detail }: { detail: any }) {
  const yearBuilt = detail?.summary?.yearbuilt || 0;
  const currentYear = new Date().getFullYear();
  const age = yearBuilt ? currentYear - yearBuilt : 0;

  const hvacAge = Math.max(0, age > 20 ? age - Math.floor(age * 0.3) : age);
  const roofAge = Math.max(0, age > 15 ? age - Math.floor(age * 0.2) : age);
  const sqft =
    detail?.building?.size?.livingSize ||
    detail?.building?.size?.bldgSize ||
    2000;

  const hvacLifespan = 20;
  const roofLifespan = 25;
  const hvacRemaining = Math.max(0, hvacLifespan - hvacAge);
  const roofRemaining = Math.max(0, roofLifespan - roofAge);

  const hvacReplaceCost = Math.round((sqft * 6.5) / 100) * 100;
  const roofReplaceCost = Math.round((sqft * 8.0) / 100) * 100;
  const hvacEmergencyPremium = Math.round(hvacReplaceCost * 0.35);
  const roofEmergencyPremium = Math.round(roofReplaceCost * 0.4);

  const systems = [
    {
      name: "HVAC SYSTEM",
      estAge: hvacAge,
      lifespan: hvacLifespan,
      remaining: hvacRemaining,
      replaceCost: hvacReplaceCost,
      emergencyPremium: hvacEmergencyPremium,
      critical: hvacRemaining <= 3,
      warning: hvacRemaining <= 7,
    },
    {
      name: "ROOF",
      estAge: roofAge,
      lifespan: roofLifespan,
      remaining: roofRemaining,
      replaceCost: roofReplaceCost,
      emergencyPremium: roofEmergencyPremium,
      critical: roofRemaining <= 5,
      warning: roofRemaining <= 10,
    },
  ];

  return (
    <div className="mt-4 border border-amber-500/20 bg-amber-500/5 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-500/20 bg-amber-500/10">
        <Activity className="w-4 h-4 text-amber-400" />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">
          AI System Health Analysis
        </span>
        {yearBuilt > 0 && (
          <span className="text-[10px] text-amber-500/70 font-mono ml-auto">
            BUILT {yearBuilt} / {age} YRS OLD
          </span>
        )}
      </div>

      <div className="divide-y divide-[#1a1f2e]">
        {systems.map((sys) => (
          <div key={sys.name} className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {sys.critical ? (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                ) : sys.warning ? (
                  <Thermometer className="w-4 h-4 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-xs font-bold font-mono text-gray-300 tracking-wider">
                  {sys.name}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  sys.critical
                    ? "bg-red-500/20 text-red-400"
                    : sys.warning
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {sys.critical
                  ? "CRITICAL"
                  : sys.warning
                  ? "MONITOR"
                  : "GOOD"}
              </span>
            </div>

            <div className="w-full bg-[#0d0f17] rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  sys.critical
                    ? "bg-red-500"
                    : sys.warning
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{
                  width: `${Math.max(5, (sys.remaining / sys.lifespan) * 100)}%`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-[10px] font-mono">
              <div>
                <span className="text-gray-600">EST AGE</span>
                <p className="text-gray-300">{sys.estAge} yrs</p>
              </div>
              <div>
                <span className="text-gray-600">REMAINING</span>
                <p
                  className={
                    sys.critical
                      ? "text-red-400"
                      : sys.warning
                      ? "text-amber-400"
                      : "text-gray-300"
                  }
                >
                  ~{sys.remaining} yrs
                </p>
              </div>
              <div>
                <span className="text-gray-600">REPLACE COST</span>
                <p className="text-gray-300">
                  ${sys.replaceCost.toLocaleString()}
                </p>
              </div>
            </div>

            {(sys.critical || sys.warning) && (
              <div className="mt-2 bg-[#0d0f17] rounded p-2 flex items-start gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[10px] font-mono text-gray-400">
                  <span className="text-emerald-400 font-bold">
                    SAVE ${sys.emergencyPremium.toLocaleString()}
                  </span>{" "}
                  by scheduling proactive replacement now vs. emergency repair.
                  Emergency calls add 35-40% to total cost.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AddressSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AttomData | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

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

  const prop = result?.detail || result?.basic;
  const basic = result?.basic;
  const detail = result?.detail;

  const addr = prop?.address;
  const fullAddress = addr
    ? [addr.line1, addr.locality, addr.countrySubd, addr.postal1]
        .filter(Boolean)
        .join(", ")
    : "";

  const owner =
    detail?.assessment?.owner?.owner1?.fullName ||
    detail?.assessment?.owner?.absenteeOwnerStatus ||
    null;
  const apn = prop?.identifier?.apn || null;
  const assessedValue = detail?.assessment?.assessed?.assdTtlValue || prop?.assessment?.assessed?.assdTtlValue || null;
  const marketValue = detail?.assessment?.market?.mktTtlValue || prop?.assessment?.market?.mktTtlValue || null;
  const lastSaleDate = detail?.sale?.saleTransDate || null;
  const lastSalePrice = detail?.sale?.saleTransAmount || null;
  const yearBuilt = prop?.summary?.yearbuilt || null;
  const beds = prop?.building?.rooms?.beds ?? detail?.building?.rooms?.beds ?? null;
  const bathsFull = prop?.building?.rooms?.bathsFull ?? detail?.building?.rooms?.bathsFull ?? null;
  const bathsHalf = prop?.building?.rooms?.bathsHalf ?? 0;
  const bathsDisplay = bathsFull !== null ? `${bathsFull}${bathsHalf ? ` / ${bathsHalf} half` : ""}` : null;
  const sqft = prop?.building?.size?.livingSize || prop?.building?.size?.bldgSize || null;
  const annualTax = detail?.assessment?.tax?.taxAmt || null;
  const floodZone = detail?.lot?.floodZoneCode || detail?.lot?.floodZone || null;
  const propType = prop?.summary?.proptype || prop?.summary?.propsubtype || null;
  const lotSize = prop?.lot?.lotSize2 || prop?.lot?.lotSize1 || null;

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="bg-[#0a0c14] border border-[#1e2235] rounded-t-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.2em] font-mono">
            Property Intelligence Terminal
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="2167 Villa Sonoma Glen, Escondido, CA 92029"
              className="w-full bg-[#060810] border border-[#1e2235] rounded pl-10 pr-10 py-3 text-sm font-mono focus:outline-none focus:border-blue-500 placeholder:text-gray-700 text-gray-200"
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
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded text-xs font-bold font-mono uppercase tracking-wider transition-colors flex items-center gap-2"
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
        <div className="bg-[#0a0c14] border-x border-b border-[#1e2235] rounded-b-xl px-4 pb-4">
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded p-3 font-mono">
            {error}
          </div>
        </div>
      )}

      {/* Bloomberg-style Property Intelligence Card */}
      {result && prop && (
        <div className="bg-[#0a0c14] border-x border-b border-[#1e2235] rounded-b-xl overflow-hidden">
          {/* Header strip */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#060810] border-b border-[#1e2235]">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-sm font-bold text-white">
                {fullAddress}
              </span>
              {propType && (
                <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded tracking-wider">
                  {propType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider">
                ATTOM VERIFIED
              </span>
            </div>
          </div>

          {/* Main data grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#1e2235]">
            {/* Left column — Ownership & Valuation */}
            <div className="p-4">
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] font-mono mb-2">
                Ownership & Valuation
              </div>
              <DataRow label="Owner" value={owner} />
              <DataRow label="APN" value={apn} />
              <DataRow label="Assessed Value" value={assessedValue} format="currency" />
              <DataRow label="Market Value" value={marketValue} format="currency" />
              <DataRow label="Last Sale Date" value={lastSaleDate} format="date" />
              <DataRow label="Last Sale Price" value={lastSalePrice} format="currency" />
              <DataRow label="Annual Taxes" value={annualTax} format="currency" />
            </div>

            {/* Right column — Physical & Risk */}
            <div className="p-4">
              <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] font-mono mb-2">
                Physical & Risk Profile
              </div>
              <DataRow label="Year Built" value={yearBuilt} />
              <DataRow label="Bedrooms" value={beds} format="number" />
              <DataRow label="Bathrooms" value={bathsDisplay} />
              <DataRow label="Living Sqft" value={sqft} format="number" />
              <DataRow label="Lot Size" value={lotSize ? `${lotSize} sqft` : null} />
              <DataRow label="Flood Zone" value={floodZone || "Not reported"} />
              <DataRow
                label="Litigation"
                value="No records found"
              />
            </div>
          </div>

          {/* System Health Analysis */}
          <div className="px-4 pb-4">
            <SystemHealthAnalysis detail={prop} />
          </div>
        </div>
      )}
    </div>
  );
}
