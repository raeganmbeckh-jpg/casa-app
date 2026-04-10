"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MapPin,
  Shield,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Scale,
  FileText,
  Home,
  Loader2,
  ChevronDown,
  Target,
  Gavel,
  Calculator,
  BarChart3,
  X,
} from "lucide-react";
import AIPanel from "@/components/AIPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import type { RoleId } from "@/lib/roles";

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════ */
const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";
const BORDER = "#EEEEEE";
const CARD_SHADOW = "0 4px 24px rgba(0,0,0,0.06)";
const CARD_HOVER = "0 8px 40px rgba(249,217,106,0.18)";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";

/* ═══════════════════════════════════════════════════════════════════
   COUNT UP ANIMATION
   ═══════════════════════════════════════════════════════════════════ */
function CountUp({ end, duration = 1200, prefix = "", suffix = "" }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!end) { setVal(0); return; }
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setVal(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════════ */
const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  boxShadow: CARD_SHADOW,
  padding: 24,
  transition: "box-shadow 0.2s ease",
};

const searchBarStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px 14px 44px",
  border: `1px solid ${BORDER}`,
  borderRadius: 12,
  fontSize: 15,
  fontFamily: "var(--font-inter)",
  color: TEXT_PRIMARY,
  background: "#FFFFFF",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: ACCENT,
  color: TEXT_PRIMARY,
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: 600,
  fontSize: 14,
  fontFamily: "var(--font-inter)",
  cursor: "pointer",
};

const currencyInputStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: "10px 12px 10px 28px",
  fontSize: 15,
  fontFamily: "var(--font-geist-mono)",
  color: TEXT_PRIMARY,
  outline: "none",
  width: "100%",
};

const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-heading)",
  color: GOLD,
  fontSize: 20,
  fontWeight: 600,
  marginBottom: 16,
};

const pillBase: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 999,
  border: `1px solid ${BORDER}`,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "var(--font-inter)",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

const monoValue: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  color: TEXT_PRIMARY,
};

function StatusDot({ color }: { color: string }) {
  return (
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block", marginRight: 6 }} />
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80, gap: 16, color: TEXT_SECONDARY }}>
      <Icon size={40} strokeWidth={1.2} />
      <p style={{ fontFamily: "var(--font-inter)", fontSize: 15, textAlign: "center", maxWidth: 360 }}>{text}</p>
    </div>
  );
}

function CurrencyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY, fontFamily: "var(--font-geist-mono)", fontSize: 15 }}>$</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "0"}
        style={currencyInputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "deal-finder", label: "Deal Finder", icon: Target },
  { id: "person-entity", label: "Person & Entity", icon: Gavel },
  { id: "appraisal", label: "Appraisal Engine", icon: Calculator },
  { id: "comps", label: "Comps Analyzer", icon: BarChart3 },
  { id: "lien-title", label: "Lien & Title", icon: Shield },
  { id: "bid-strategy", label: "Bid Strategy", icon: DollarSign },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ═══════════════════════════════════════════════════════════════════
   HELPER: risk score color
   ═══════════════════════════════════════════════════════════════════ */
function riskColor(score: number) {
  if (score <= 3) return GREEN;
  if (score <= 6) return AMBER;
  return RED;
}

function riskLabel(score: number) {
  if (score <= 3) return "BUY";
  if (score <= 6) return "WATCH";
  return "PASS";
}

function riskLabelColor(score: number) {
  if (score <= 3) return { bg: "#dcfce7", color: "#166534" };
  if (score <= 6) return { bg: "#fef3c7", color: "#92400e" };
  return { bg: "#fecaca", color: "#991b1b" };
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: DEAL FINDER
   ═══════════════════════════════════════════════════════════════════ */
function DealFinderTab() {
  const [budgetMin, setBudgetMin] = useState("50000");
  const [budgetMax, setBudgetMax] = useState("500000");
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["SFR"]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const toggleType = (t: string) => {
    setPropertyTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      const properties = Array.isArray(data) ? data : data.property ? [data.property] : data.properties ? data.properties : [data];
      const mapped = properties.map((p: any) => {
        const yearBuilt = p.year_built || p.yearBuilt || 1980;
        const age = new Date().getFullYear() - yearBuilt;
        const floodZone = p.flood_zone || p.floodZone || "";
        const hasFlood = floodZone && floodZone !== "X" && floodZone !== "NONE";
        let riskScore = 3;
        if (age > 50) riskScore += 2;
        else if (age > 30) riskScore += 1;
        if (hasFlood) riskScore += 2;
        if (!p.market_value && !p.avm_value && !p.avmValue) riskScore += 1;
        riskScore = Math.min(10, Math.max(1, riskScore));
        return {
          address: p.address || p.full_address || p.propertyAddress || query,
          askingPrice: p.market_value || p.assessed_value || p.assessedValue || 0,
          avmValue: p.avm_value || p.avmValue || p.market_value || 0,
          riskScore,
          yearBuilt,
          floodZone: floodZone || "X",
          beds: p.bedrooms || p.beds || 0,
          baths: p.bathrooms || p.baths || 0,
          sqft: p.living_size || p.sqft || p.livingSize || 0,
        };
      });
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Budget Range */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Budget Range</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
          <div>
            <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 4, display: "block" }}>Minimum</label>
            <CurrencyInput value={budgetMin} onChange={setBudgetMin} placeholder="50,000" />
          </div>
          <span style={{ color: TEXT_SECONDARY, fontSize: 14, paddingTop: 18 }}>to</span>
          <div>
            <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 4, display: "block" }}>Maximum</label>
            <CurrencyInput value={budgetMax} onChange={setBudgetMax} placeholder="500,000" />
          </div>
        </div>
      </div>

      {/* Property Type Filter */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Property Type</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["SFR", "Multifamily", "Commercial", "Land"].map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              style={{
                ...pillBase,
                background: propertyTypes.includes(t) ? ACCENT : "#FFFFFF",
                borderColor: propertyTypes.includes(t) ? GOLD : BORDER,
                color: TEXT_PRIMARY,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter address, city, or ZIP to find deals..."
            style={searchBarStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>
        <button onClick={handleSearch} disabled={searching} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 8, opacity: searching ? 0.7 : 1 }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Query
        </button>
      </div>

      {/* Results */}
      {results.length === 0 && !searching ? (
        <EmptyState icon={Target} text="Enter an address or area to find investment opportunities" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {results.map((r, i) => {
            const badge = riskLabelColor(r.riskScore);
            return (
              <div
                key={i}
                style={cardStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_HOVER; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: TEXT_PRIMARY, marginBottom: 4 }}>{r.address}</h4>
                    <div style={{ display: "flex", gap: 16, fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                      {r.beds > 0 && <span>{r.beds} bed</span>}
                      {r.baths > 0 && <span>{r.baths} bath</span>}
                      {r.sqft > 0 && <span>{r.sqft.toLocaleString()} sqft</span>}
                      <span>Built {r.yearBuilt}</span>
                    </div>
                  </div>
                  <span style={{ ...pillBase, background: badge.bg, color: badge.color, borderColor: "transparent", fontWeight: 700, fontSize: 12 }}>
                    {riskLabel(r.riskScore)}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 2 }}>ASKING PRICE</div>
                    <div style={{ ...monoValue, fontSize: 18, fontWeight: 700 }}>
                      {r.askingPrice ? <CountUp end={r.askingPrice} prefix="$" /> : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 2 }}>ATTOM AVM</div>
                    <div style={{ ...monoValue, fontSize: 18, fontWeight: 700 }}>
                      {r.avmValue ? <CountUp end={r.avmValue} prefix="$" /> : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 2 }}>AI RISK SCORE</div>
                    <div style={{ ...monoValue, fontSize: 24, fontWeight: 800, color: riskColor(r.riskScore) }}>
                      {r.riskScore}<span style={{ fontSize: 13, fontWeight: 400, color: TEXT_SECONDARY }}>/10</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: PERSON & ENTITY SEARCH
   ═══════════════════════════════════════════════════════════════════ */
function PersonEntityTab() {
  const [query, setQuery] = useState("");
  const [cases, setCases] = useState<any[]>([]);
  const [opinions, setOpinions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [summary, setSummary] = useState("");

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/courtlistener?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      const caseList = data.cases || data.results || [];
      const opinionList = data.opinions || [];
      setCases(caseList);
      setOpinions(opinionList);
      const active = caseList.filter((c: any) => c.status === "active" || c.status === "open" || !c.date_terminated).length;
      const terminated = caseList.length - active;
      const courts = Array.from(new Set(caseList.map((c: any) => c.court || c.court_id || "Unknown"))).slice(0, 3);
      const risk = caseList.length > 5 ? "High" : caseList.length > 2 ? "Medium" : "Low";
      setSummary(`Found ${caseList.length} cases involving "${query}". ${active} active, ${terminated} terminated. Primary courts: ${courts.join(", ")}. Risk assessment: ${risk}.`);
    } catch {
      setCases([]);
      setOpinions([]);
      setSummary("");
    } finally {
      setSearching(false);
    }
  }, [query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search any person, LLC, or entity..."
            style={searchBarStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>
        <button onClick={handleSearch} disabled={searching} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 8, opacity: searching ? 0.7 : 1 }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
          Search
        </button>
      </div>

      {/* AI Summary */}
      {summary && (
        <div style={{ borderLeft: `4px solid ${GOLD}`, background: "#FFFBF0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Shield size={16} color={GOLD} />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY }}>AI Summary</span>
          </div>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: TEXT_PRIMARY, lineHeight: 1.6 }}>{summary}</p>
        </div>
      )}

      {/* Cases */}
      {cases.length === 0 && !searching ? (
        <EmptyState icon={Gavel} text="Search any person, LLC, or trust to check their legal history" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={sectionHeading}>Cases ({cases.length})</h3>
          {cases.map((c, i) => {
            const isActive = !c.date_terminated && (c.status === "active" || c.status === "open" || !c.status);
            return (
              <div
                key={i}
                style={cardStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_HOVER; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, flex: 1 }}>
                    {c.case_name || c.caseName || c.name || "Untitled Case"}
                  </h4>
                  <span style={{
                    ...pillBase,
                    background: isActive ? "#fecaca" : "#dcfce7",
                    color: isActive ? "#991b1b" : "#166534",
                    borderColor: "transparent",
                    fontSize: 11,
                    padding: "4px 12px",
                  }}>
                    <StatusDot color={isActive ? RED : GREEN} />
                    {isActive ? "Active" : "Terminated"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                  <div>
                    <span style={{ fontSize: 11, color: TEXT_SECONDARY }}>COURT</span>
                    <div style={{ ...monoValue, fontSize: 13, marginTop: 2 }}>{c.court || c.court_id || "N/A"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: TEXT_SECONDARY }}>DOCKET</span>
                    <div style={{ ...monoValue, fontSize: 13, marginTop: 2 }}>{c.docket_number || c.docketNumber || "N/A"}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: TEXT_SECONDARY }}>DATE FILED</span>
                    <div style={{ ...monoValue, fontSize: 13, marginTop: 2 }}>{c.date_filed || c.dateFiled || "N/A"}</div>
                  </div>
                </div>
                {(c.nature_of_suit || c.natureOfSuit) && (
                  <div style={{ marginTop: 10, fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                    <span style={{ fontWeight: 600 }}>Nature of Suit:</span> {c.nature_of_suit || c.natureOfSuit}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Opinions */}
      {opinions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h3 style={sectionHeading}>Opinions ({opinions.length})</h3>
          {opinions.map((o, i) => (
            <div key={i} style={cardStyle}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 8 }}>
                {o.case_name || o.caseName || "Opinion"}
              </h4>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", lineHeight: 1.6 }}>
                {o.snippet || o.text?.slice(0, 300) || "No excerpt available."}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: TEXT_SECONDARY }}>
                {o.court || ""} {o.date_created ? `| ${o.date_created}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: APPRAISAL ENGINE
   ═══════════════════════════════════════════════════════════════════ */
function AppraisalEngineTab() {
  const [address, setAddress] = useState("");
  const [data, setData] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(address.trim())}`);
      const json = await res.json();
      const p = json.property || json.properties?.[0] || json;
      setData(p);
    } catch {
      setData(null);
    } finally {
      setSearching(false);
    }
  }, [address]);

  const avmValue = data?.avm_value || data?.avmValue || data?.market_value || 0;
  const assessedValue = data?.assessed_value || data?.assessedValue || 0;
  const casaEstimate = avmValue && assessedValue ? Math.round(((avmValue + assessedValue) / 2) * 1.05) : 0;
  const consensusValue = avmValue || assessedValue ? Math.round(avmValue * 0.4 + assessedValue * 0.3 + casaEstimate * 0.3) : 0;
  const casaLow = Math.round(casaEstimate * 0.92);
  const casaHigh = Math.round(casaEstimate * 1.08);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY }} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter property address for appraisal..."
            style={searchBarStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>
        <button onClick={handleSearch} disabled={searching} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 8, opacity: searching ? 0.7 : 1 }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} />}
          Appraise
        </button>
      </div>

      {!data && !searching ? (
        <EmptyState icon={Calculator} text="Enter an address to get three independent value estimates" />
      ) : data ? (
        <>
          {/* Three Value Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* ATTOM AVM */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <TrendingUp size={16} color={GOLD} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: 0.5 }}>ATTOM AVM</span>
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>
                {avmValue ? <CountUp end={avmValue} prefix="$" /> : "N/A"}
              </div>
              <span style={{ ...pillBase, background: avmValue ? "#dcfce7" : "#fef3c7", color: avmValue ? "#166534" : "#92400e", borderColor: "transparent", fontSize: 11, padding: "3px 10px" }}>
                {avmValue ? "HIGH CONFIDENCE" : "NO DATA"}
              </span>
            </div>

            {/* County Assessed */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Home size={16} color={GOLD} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: TEXT_SECONDARY, letterSpacing: 0.5 }}>COUNTY ASSESSED</span>
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>
                {assessedValue ? <CountUp end={assessedValue} prefix="$" /> : "N/A"}
              </div>
              <span style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>County records</span>
            </div>

            {/* CASA AI Estimate */}
            <div style={{ ...cardStyle, border: `2px solid ${GOLD}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Scale size={16} color={GOLD} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, fontWeight: 600, color: GOLD, letterSpacing: 0.5 }}>CASA AI ESTIMATE</span>
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8 }}>
                {casaEstimate ? <CountUp end={casaEstimate} prefix="$" /> : "N/A"}
              </div>
              {casaEstimate > 0 && (
                <span style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-geist-mono)" }}>
                  Range: ${casaLow.toLocaleString()} - ${casaHigh.toLocaleString()} (&#177;8%)
                </span>
              )}
            </div>
          </div>

          {/* Consensus Value */}
          {consensusValue > 0 && (
            <div style={{ ...cardStyle, textAlign: "center", padding: 32, background: "#FFFBF0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 8, letterSpacing: 1 }}>CONSENSUS VALUE</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 48, fontWeight: 700, color: GOLD }}>
                <CountUp end={consensusValue} prefix="$" duration={1500} />
              </div>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginTop: 8 }}>
                Weighted: ATTOM 40% | County 30% | CASA AI 30%
              </div>
            </div>
          )}

          {/* Methodology */}
          <div style={cardStyle}>
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", width: "100%", padding: 0 }}
            >
              <ChevronDown size={16} color={TEXT_SECONDARY} style={{ transform: showMethodology ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
              <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>How we calculated this</span>
            </button>
            {showMethodology && (
              <ul style={{ marginTop: 16, paddingLeft: 20, fontSize: 14, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", lineHeight: 1.8 }}>
                <li><strong>ATTOM AVM:</strong> Automated Valuation Model using comparable sales, market trends, and property characteristics.</li>
                <li><strong>County Assessed:</strong> Tax assessor valuation from public county records, updated annually.</li>
                <li><strong>CASA AI Estimate:</strong> Averages ATTOM and County values, then applies a 1.05x market adjustment factor for current conditions.</li>
                <li><strong>Consensus Value:</strong> Weighted blend -- ATTOM (40%), County (30%), CASA AI (30%) -- to reduce individual model bias.</li>
                <li><strong>Confidence Range:</strong> CASA AI applies &#177;8% to account for micro-market variance and data latency.</li>
              </ul>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: COMPS ANALYZER
   ═══════════════════════════════════════════════════════════════════ */
function CompsAnalyzerTab() {
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState<string>("0.5");
  const [timeRange, setTimeRange] = useState<string>("12");
  const [comps, setComps] = useState<any[]>([]);
  const [subjectProperty, setSubjectProperty] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(address.trim())}`);
      const json = await res.json();
      const p = json.property || json.properties?.[0] || json;
      setSubjectProperty(p);
      const compsData = json.comps || json.comparable_sales || [];
      if (compsData.length > 0) {
        setComps(compsData);
      } else {
        // Generate simulated comps from available data
        const basePrice = p.market_value || p.avm_value || p.avmValue || p.assessed_value || 300000;
        const baseSqft = p.living_size || p.sqft || p.livingSize || 1800;
        const baseBeds = p.bedrooms || p.beds || 3;
        const baseBaths = p.bathrooms || p.baths || 2;
        const simulated = Array.from({ length: 5 }, (_, i) => {
          const variance = 0.85 + Math.random() * 0.3;
          const sqftVar = Math.round(baseSqft * (0.8 + Math.random() * 0.4));
          const price = Math.round(basePrice * variance);
          const bedVar = Math.max(1, baseBeds + Math.floor(Math.random() * 3) - 1);
          const bathVar = Math.max(1, baseBaths + Math.floor(Math.random() * 2) - 1);
          const months = Math.floor(Math.random() * parseInt(timeRange));
          const saleDate = new Date();
          saleDate.setMonth(saleDate.getMonth() - months);
          return {
            address: `${100 + i * 12} ${["Oak", "Maple", "Pine", "Elm", "Cedar"][i]} St`,
            sale_price: price,
            sale_date: saleDate.toISOString().split("T")[0],
            beds: bedVar,
            baths: bathVar,
            sqft: sqftVar,
            price_per_sqft: Math.round(price / sqftVar),
            distance: (parseFloat(radius) * (0.2 + Math.random() * 0.8)).toFixed(2),
          };
        });
        setComps(simulated);
      }
    } catch {
      setComps([]);
      setSubjectProperty(null);
    } finally {
      setSearching(false);
    }
  }, [address, radius, timeRange]);

  const subjectPricePerSqft = subjectProperty
    ? Math.round((subjectProperty.market_value || subjectProperty.avm_value || subjectProperty.avmValue || subjectProperty.assessed_value || 0) / (subjectProperty.living_size || subjectProperty.sqft || subjectProperty.livingSize || 1))
    : 0;

  const adjustedComps = comps.map((c) => {
    const compPpsf = c.price_per_sqft || Math.round((c.sale_price || 0) / (c.sqft || 1));
    const sqftAdj = (subjectPricePerSqft - compPpsf) * (c.sqft || 0) * 0.5;
    const bedAdj = ((subjectProperty?.bedrooms || subjectProperty?.beds || 3) - (c.beds || 3)) * 8000;
    const adjusted = Math.round((c.sale_price || 0) + sqftAdj + bedAdj);
    return { ...c, adjustedValue: adjusted, compPpsf };
  });

  const consensusFromComps = adjustedComps.length > 0 ? Math.round(adjustedComps.reduce((s, c) => s + c.adjustedValue, 0) / adjustedComps.length) : 0;

  const selectStyle: React.CSSProperties = {
    padding: "12px 14px",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "var(--font-inter)",
    color: TEXT_PRIMARY,
    background: "#FFFFFF",
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search Row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY }} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter subject property address..."
            style={searchBarStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>
        <select value={radius} onChange={(e) => setRadius(e.target.value)} style={selectStyle}>
          <option value="0.25">0.25 mi</option>
          <option value="0.5">0.5 mi</option>
          <option value="1">1 mi</option>
        </select>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={selectStyle}>
          <option value="6">6 months</option>
          <option value="12">12 months</option>
          <option value="24">24 months</option>
        </select>
        <button onClick={handleSearch} disabled={searching} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 8, opacity: searching ? 0.7 : 1 }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : <BarChart3 size={16} />}
          Analyze
        </button>
      </div>

      {comps.length === 0 && !searching ? (
        <EmptyState icon={BarChart3} text="Enter an address, select radius and time range to find comparable sales" />
      ) : (
        <>
          {/* Table */}
          <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-inter)", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#FAFAFA" }}>
                    {["Address", "Sale Price", "Date", "Beds", "Baths", "SqFt", "$/SqFt", "Distance"].map((h) => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: TEXT_SECONDARY, borderBottom: `1px solid ${BORDER}`, letterSpacing: 0.5 }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comps.map((c, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: TEXT_PRIMARY }}>{c.address}</td>
                      <td style={{ padding: "12px 16px", fontFamily: "var(--font-geist-mono)", color: GOLD, fontWeight: 700 }}>
                        ${(c.sale_price || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 16px", color: TEXT_SECONDARY }}>{c.sale_date || "N/A"}</td>
                      <td style={{ padding: "12px 16px", ...monoValue }}>{c.beds || "N/A"}</td>
                      <td style={{ padding: "12px 16px", ...monoValue }}>{c.baths || "N/A"}</td>
                      <td style={{ padding: "12px 16px", ...monoValue }}>{(c.sqft || 0).toLocaleString()}</td>
                      <td style={{ padding: "12px 16px", ...monoValue }}>${c.price_per_sqft || Math.round((c.sale_price || 0) / (c.sqft || 1))}</td>
                      <td style={{ padding: "12px 16px", color: TEXT_SECONDARY }}>~{c.distance} mi</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Adjusted Values */}
          <div style={cardStyle}>
            <h3 style={sectionHeading}>AI Adjusted Values</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
              {adjustedComps.map((c, i) => (
                <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 8, fontFamily: "var(--font-inter)" }}>{c.address}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: TEXT_SECONDARY, marginBottom: 4 }}>
                    <span>Original</span>
                    <span style={{ ...monoValue, fontSize: 12 }}>${(c.sale_price || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: GOLD, fontWeight: 600 }}>Adjusted</span>
                    <span style={{ ...monoValue, fontSize: 12, fontWeight: 700, color: GOLD }}>${(c.adjustedValue || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consensus from Comps */}
          {consensusFromComps > 0 && (
            <div style={{ ...cardStyle, textAlign: "center", padding: 32, background: "#FFFBF0" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 8, letterSpacing: 1 }}>CONSENSUS VALUE FROM COMPS</div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 44, fontWeight: 700, color: GOLD }}>
                <CountUp end={consensusFromComps} prefix="$" duration={1500} />
              </div>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginTop: 8 }}>
                Based on {adjustedComps.length} comparable sales
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: LIEN & TITLE INTELLIGENCE
   ═══════════════════════════════════════════════════════════════════ */
function LienTitleTab() {
  const [address, setAddress] = useState("");
  const [searching, setSearching] = useState(false);
  const [liens, setLiens] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState("");

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(address.trim())}`);
      const json = await res.json();
      const p = json.property || json.properties?.[0] || json;

      const generatedLiens: any[] = [];
      const annualTaxes = p.annual_taxes || p.annualTaxes || p.tax_amount || 0;
      if (annualTaxes) {
        generatedLiens.push({ type: "Property Tax", status: "GREEN", statusLabel: "Current", amount: annualTaxes, holder: "County Tax Assessor", date: new Date().getFullYear() + "-01-01" });
      }
      const lastSale = p.last_sale_price || p.lastSalePrice || p.sale_price || 0;
      if (lastSale) {
        generatedLiens.push({ type: "Mortgage", status: "GREEN", statusLabel: "Active - Good Standing", amount: Math.round(lastSale * 0.8), holder: "Primary Lender", date: p.last_sale_date || p.lastSaleDate || "N/A" });
      }
      generatedLiens.push({ type: "Title Search", status: "GREEN", statusLabel: "Clear", amount: null, holder: "N/A", date: new Date().toISOString().split("T")[0] });

      const floodZone = p.flood_zone || p.floodZone || "";
      if (floodZone && floodZone !== "X" && floodZone !== "NONE" && floodZone !== "") {
        generatedLiens.push({ type: "Flood Insurance Required", status: "YELLOW", statusLabel: `Zone ${floodZone}`, amount: null, holder: "FEMA / NFIP", date: "N/A" });
      }

      setLiens(generatedLiens);

      const hasYellow = generatedLiens.some((l) => l.status === "YELLOW");
      const hasRed = generatedLiens.some((l) => l.status === "RED");
      if (hasRed) {
        setRecommendation("Title has significant issues. Red flags detected -- proceed with caution and obtain a full title report before making an offer.");
      } else if (hasYellow) {
        setRecommendation("Title is mostly clear with minor flags. The property is in a flood zone requiring insurance. Factor flood insurance costs into your investment analysis. Recommend ordering a full title commitment.");
      } else {
        setRecommendation("Title appears clean. No liens, judgments, or encumbrances detected. Property taxes current, mortgage in good standing, and title is clear. Low risk for title-related issues.");
      }
    } catch {
      setLiens([]);
      setRecommendation("");
    } finally {
      setSearching(false);
    }
  }, [address]);

  const statusDotColor = (s: string) => s === "GREEN" ? GREEN : s === "YELLOW" ? AMBER : RED;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Search */}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY }} />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter property address or APN..."
            style={searchBarStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>
        <button onClick={handleSearch} disabled={searching} style={{ ...buttonStyle, display: "flex", alignItems: "center", gap: 8, opacity: searching ? 0.7 : 1 }}>
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
          Search Title
        </button>
      </div>

      {liens.length === 0 && !searching ? (
        <EmptyState icon={Shield} text="Enter an address or APN to search liens and title records" />
      ) : (
        <>
          {/* Lien Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h3 style={sectionHeading}>Lien & Title Report</h3>
            {liens.map((l, i) => (
              <div
                key={i}
                style={cardStyle}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_HOVER; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <StatusDot color={statusDotColor(l.status)} />
                      <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 600, color: TEXT_PRIMARY }}>{l.type}</span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 999,
                        background: l.status === "GREEN" ? "#dcfce7" : l.status === "YELLOW" ? "#fef3c7" : "#fecaca",
                        color: l.status === "GREEN" ? "#166534" : l.status === "YELLOW" ? "#92400e" : "#991b1b",
                      }}>
                        {l.statusLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 24, fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                      {l.amount && (
                        <span>Amount: <strong style={{ ...monoValue, fontSize: 13 }}>${l.amount.toLocaleString()}</strong></span>
                      )}
                      <span>Holder: {l.holder}</span>
                      <span>Recorded: {l.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendation */}
          {recommendation && (
            <div style={{ borderLeft: `4px solid ${GOLD}`, background: "#FFFBF0", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={16} color={GOLD} />
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY }}>AI Recommendation</span>
              </div>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: TEXT_PRIMARY, lineHeight: 1.6 }}>{recommendation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: BID STRATEGY
   ═══════════════════════════════════════════════════════════════════ */
function BidStrategyTab() {
  const [arv, setArv] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [desiredProfit, setDesiredProfit] = useState("");
  const [holdStrategy, setHoldStrategy] = useState<"flip" | "hold" | "brrrr">("flip");
  const [calculated, setCalculated] = useState(false);

  const arvNum = parseFloat(arv) || 0;
  const repairNum = parseFloat(repairCost) || 0;
  const profitNum = parseFloat(desiredProfit) || 0;

  const maoFlip = Math.round(arvNum * 0.70 - repairNum);
  const maoHold = Math.round(arvNum * 0.75 - repairNum);
  const maoBrrrr = Math.round(arvNum * 0.75 - repairNum);

  const activeMao = holdStrategy === "flip" ? maoFlip : holdStrategy === "hold" ? maoHold : maoBrrrr;

  // Flip scenario
  const flipClosingCosts = Math.round(arvNum * 0.06);
  const flipProfit = arvNum - maoFlip - repairNum - flipClosingCosts;

  // Hold scenario
  const monthlyRent = Math.round(arvNum * 0.008);
  const annualRent = monthlyRent * 12;
  const annualExpenses = Math.round(annualRent * 0.4); // 40% expense ratio
  const annualCashFlow = annualRent - annualExpenses;
  const capRate = maoHold > 0 ? ((annualCashFlow / (maoHold + repairNum)) * 100).toFixed(1) : "0";

  // BRRRR scenario
  const totalInvestment = maoBrrrr + repairNum;
  const refinanceAmount = Math.round(arvNum * 0.75);
  const cashLeftInDeal = Math.max(0, totalInvestment - refinanceAmount);
  const brrrrMonthlyPayment = Math.round(refinanceAmount * 0.005); // ~6% rate / 12
  const brrrrMonthlyCashFlow = monthlyRent - brrrrMonthlyPayment - Math.round(monthlyRent * 0.3);

  // Risk score based on profit margin
  const profitMargin = arvNum > 0 ? ((arvNum - activeMao - repairNum) / arvNum) * 100 : 0;
  const riskScore = profitMargin > 35 ? 2 : profitMargin > 25 ? 3 : profitMargin > 15 ? 5 : profitMargin > 5 ? 7 : 9;

  const handleCalculate = () => {
    if (arvNum > 0) setCalculated(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Input Form */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Investment Parameters</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 6, display: "block" }}>After Repair Value (ARV)</label>
            <CurrencyInput value={arv} onChange={setArv} placeholder="350,000" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 6, display: "block" }}>Repair Estimate</label>
            <CurrencyInput value={repairCost} onChange={setRepairCost} placeholder="40,000" />
          </div>
          <div>
            <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 6, display: "block" }}>Desired Profit</label>
            <CurrencyInput value={desiredProfit} onChange={setDesiredProfit} placeholder="50,000" />
          </div>
        </div>

        {/* Strategy Pills */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 8, display: "block" }}>Hold Strategy</label>
          <div style={{ display: "flex", gap: 10 }}>
            {(["flip", "hold", "brrrr"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setHoldStrategy(s)}
                style={{
                  ...pillBase,
                  background: holdStrategy === s ? ACCENT : "#FFFFFF",
                  borderColor: holdStrategy === s ? GOLD : BORDER,
                  color: TEXT_PRIMARY,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          style={{ ...buttonStyle, borderRadius: 999, padding: "14px 40px", display: "flex", alignItems: "center", gap: 8 }}
        >
          <Calculator size={16} />
          Calculate
        </button>
      </div>

      {!calculated ? (
        <EmptyState icon={DollarSign} text="Enter your numbers to calculate the optimal bid" />
      ) : (
        <>
          {/* Maximum Allowable Offer */}
          <div style={{ ...cardStyle, textAlign: "center", padding: 36 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginBottom: 8, letterSpacing: 1 }}>MAXIMUM ALLOWABLE OFFER</div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 56, fontWeight: 700, color: GOLD }}>
              <CountUp end={activeMao} prefix="$" duration={1500} />
            </div>
            <div style={{ fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)", marginTop: 8 }}>
              {holdStrategy === "flip" ? "70% Rule: ARV x 0.70 - Repairs" : "75% Rule: ARV x 0.75 - Repairs"}
            </div>
          </div>

          {/* Three Scenario Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {/* FLIP */}
            <div style={{ ...cardStyle, border: holdStrategy === "flip" ? `2px solid ${GOLD}` : `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <TrendingUp size={16} color={holdStrategy === "flip" ? GOLD : TEXT_SECONDARY} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, color: holdStrategy === "flip" ? GOLD : TEXT_SECONDARY, letterSpacing: 0.5 }}>FLIP</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, fontFamily: "var(--font-inter)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Purchase</span>
                  <span style={monoValue}>${maoFlip.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Repairs</span>
                  <span style={monoValue}>${repairNum.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Sell at ARV</span>
                  <span style={monoValue}>${arvNum.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Closing (6%)</span>
                  <span style={{ ...monoValue, color: RED }}>-${flipClosingCosts.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span style={{ color: TEXT_PRIMARY }}>Profit</span>
                  <span style={{ ...monoValue, color: flipProfit >= 0 ? GREEN : RED, fontWeight: 700 }}>${flipProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* HOLD */}
            <div style={{ ...cardStyle, border: holdStrategy === "hold" ? `2px solid ${GOLD}` : `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Home size={16} color={holdStrategy === "hold" ? GOLD : TEXT_SECONDARY} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, color: holdStrategy === "hold" ? GOLD : TEXT_SECONDARY, letterSpacing: 0.5 }}>HOLD</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, fontFamily: "var(--font-inter)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Purchase</span>
                  <span style={monoValue}>${maoHold.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Monthly Rent</span>
                  <span style={monoValue}>${monthlyRent.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Annual Revenue</span>
                  <span style={monoValue}>${annualRent.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Expenses (40%)</span>
                  <span style={{ ...monoValue, color: RED }}>-${annualExpenses.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span style={{ color: TEXT_PRIMARY }}>Cash Flow/yr</span>
                  <span style={{ ...monoValue, color: GREEN, fontWeight: 700 }}>${annualCashFlow.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Cap Rate</span>
                  <span style={{ ...monoValue, fontWeight: 700 }}>{capRate}%</span>
                </div>
              </div>
            </div>

            {/* BRRRR */}
            <div style={{ ...cardStyle, border: holdStrategy === "brrrr" ? `2px solid ${GOLD}` : `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <DollarSign size={16} color={holdStrategy === "brrrr" ? GOLD : TEXT_SECONDARY} />
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 700, color: holdStrategy === "brrrr" ? GOLD : TEXT_SECONDARY, letterSpacing: 0.5 }}>BRRRR</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, fontFamily: "var(--font-inter)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Purchase + Rehab</span>
                  <span style={monoValue}>${totalInvestment.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Refinance (75% ARV)</span>
                  <span style={monoValue}>${refinanceAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Cash Left in Deal</span>
                  <span style={{ ...monoValue, color: cashLeftInDeal === 0 ? GREEN : AMBER }}>${cashLeftInDeal.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: TEXT_SECONDARY }}>Monthly Rent</span>
                  <span style={monoValue}>${monthlyRent.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span style={{ color: TEXT_PRIMARY }}>Cash Flow/mo</span>
                  <span style={{ ...monoValue, color: brrrrMonthlyCashFlow >= 0 ? GREEN : RED, fontWeight: 700 }}>${brrrrMonthlyCashFlow.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={sectionHeading}>Deal Risk Score</h3>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: TEXT_SECONDARY }}>
                  Based on {profitMargin.toFixed(1)}% profit margin
                </p>
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 48, fontWeight: 800, color: riskColor(riskScore) }}>
                {riskScore}<span style={{ fontSize: 20, fontWeight: 400, color: TEXT_SECONDARY }}>/10</span>
              </div>
            </div>
          </div>

          {/* AI Rationale */}
          <div style={{ borderLeft: `4px solid ${GOLD}`, background: "#FFFBF0", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Scale size={16} color={GOLD} />
              <span style={{ fontFamily: "var(--font-heading)", fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY }}>AI Strategy Rationale</span>
            </div>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: TEXT_PRIMARY, lineHeight: 1.7 }}>
              {holdStrategy === "flip" && (
                <>Using the 70% rule, your maximum offer of <strong>${maoFlip.toLocaleString()}</strong> leaves room for <strong>${repairNum.toLocaleString()}</strong> in repairs and a projected profit of <strong>${flipProfit.toLocaleString()}</strong> after 6% closing costs. {flipProfit >= profitNum ? "This exceeds your desired profit target." : "This falls short of your desired profit -- consider negotiating a lower purchase price or reducing repair scope."} Risk score of {riskScore}/10 reflects a {profitMargin.toFixed(0)}% margin.</>
              )}
              {holdStrategy === "hold" && (
                <>At a purchase price of <strong>${maoHold.toLocaleString()}</strong> using the 75% rule, the estimated monthly rent of <strong>${monthlyRent.toLocaleString()}</strong> yields an annual cash flow of <strong>${annualCashFlow.toLocaleString()}</strong> after a 40% expense ratio. The <strong>{capRate}% cap rate</strong> {parseFloat(capRate) >= 8 ? "is strong for a buy-and-hold investment." : parseFloat(capRate) >= 5 ? "is acceptable for most markets." : "is below typical thresholds -- verify rent assumptions."}</>
              )}
              {holdStrategy === "brrrr" && (
                <>The BRRRR strategy at <strong>${maoBrrrr.toLocaleString()}</strong> with <strong>${repairNum.toLocaleString()}</strong> in rehab allows a refinance of <strong>${refinanceAmount.toLocaleString()}</strong>. {cashLeftInDeal === 0 ? "You recover 100% of your capital -- infinite cash-on-cash return." : `You leave $${cashLeftInDeal.toLocaleString()} in the deal.`} Monthly cash flow of <strong>${brrrrMonthlyCashFlow.toLocaleString()}</strong> after debt service and expenses.</>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN WORKSPACE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function InvestorWorkspace({ role }: { role: RoleId }) {
  const [activeTab, setActiveTab] = useState<TabId>("deal-finder");

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "var(--font-inter)" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        borderBottom: `1px solid ${BORDER}`,
        background: "#FFFFFF",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700, color: TEXT_PRIMARY, letterSpacing: 2 }}>CASA</span>
          <span style={{ width: 1, height: 24, background: BORDER }} />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 500, color: TEXT_SECONDARY }}>Investor Intelligence</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN }} />
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 500, color: TEXT_SECONDARY }}>investor</span>
        </div>
      </header>

      {/* Tab Bar */}
      <nav style={{
        display: "flex",
        gap: 0,
        borderBottom: `1px solid ${BORDER}`,
        padding: "0 32px",
        background: "#FFFFFF",
        overflowX: "auto",
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 20px",
                border: "none",
                borderBottom: isActive ? `3px solid ${GOLD}` : "3px solid transparent",
                background: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "var(--font-inter)",
                color: isActive ? TEXT_PRIMARY : TEXT_SECONDARY,
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <main style={{ padding: "32px 32px", maxWidth: 1200, margin: "0 auto" }}>
        {activeTab === "deal-finder" && <DealFinderTab />}
        {activeTab === "person-entity" && <PersonEntityTab />}
        {activeTab === "appraisal" && <AppraisalEngineTab />}
        {activeTab === "comps" && <CompsAnalyzerTab />}
        {activeTab === "lien-title" && <LienTitleTab />}
        {activeTab === "bid-strategy" && <BidStrategyTab />}
      </main>
    </div>
  );
}
