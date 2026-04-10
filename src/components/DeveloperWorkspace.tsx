"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { RoleId } from "@/lib/roles";
import AIPanel from "@/components/AIPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import {
  Search,
  Loader2,
  Building2,
  Target,
  Calculator,
  FileText,
  Bot,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Shield,
  TrendingUp,
  Clock,
  Zap,
  Play,
  BarChart3,
  Plus,
  CheckCircle2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CountUp                                                            */
/* ------------------------------------------------------------------ */
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
  const [value, setValue] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + (end - start) * eased));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [end, duration]);

  return (
    <span style={{ fontFamily: "var(--font-geist-mono)" }}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const daysBetween = (a: string, b: Date) => {
  const d = new Date(a);
  return Math.ceil((d.getTime() - b.getTime()) / 86400000);
};

const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  Entitlement: { bg: "#DBEAFE", text: "#1D4ED8" },
  Design: { bg: "#EDE9FE", text: "#7C3AED" },
  Construction: { bg: "#FEF3C7", text: "#B45309" },
  Closeout: { bg: "#D1FAE5", text: "#047857" },
};

const PHASE_PROGRESS: Record<string, number> = {
  Entitlement: 25,
  Design: 50,
  Construction: 75,
  Closeout: 95,
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Project {
  id: string;
  name: string;
  address: string;
  phase: string;
  budget: number;
  nextMilestone: string;
}

interface EntitlementApp {
  id: string;
  project: string;
  jurisdiction: string;
  type: string;
  submitted: string;
  nextHearing: string;
  planner: string;
}

interface WatchlistItem {
  address: string;
  addedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Agent data                                                         */
/* ------------------------------------------------------------------ */
const DEV_AGENTS = [
  { id: 1, name: "Zoning Analyzer", desc: "Evaluates zoning compatibility", category: "Site Analysis" },
  { id: 2, name: "Comp Scanner", desc: "Finds comparable developments", category: "Market" },
  { id: 3, name: "Cost Estimator", desc: "Estimates hard and soft costs", category: "Financial" },
  { id: 4, name: "Permit Tracker", desc: "Monitors permit applications", category: "Entitlements" },
  { id: 5, name: "Environmental Scanner", desc: "Checks Phase I/II requirements", category: "Site Analysis" },
  { id: 6, name: "Market Demand Analyzer", desc: "Analyzes absorption rates", category: "Market" },
  { id: 7, name: "Utility Mapper", desc: "Maps utility infrastructure", category: "Site Analysis" },
  { id: 8, name: "Traffic Study AI", desc: "Estimates traffic impact", category: "Site Analysis" },
  { id: 9, name: "Flood Risk Assessor", desc: "Evaluates flood and drainage", category: "Site Analysis" },
  { id: 10, name: "Soil Analyst", desc: "Reviews geotechnical data", category: "Site Analysis" },
  { id: 11, name: "Parking Calculator", desc: "Calculates parking requirements", category: "Design" },
  { id: 12, name: "Unit Mix Optimizer", desc: "Optimizes unit type distribution", category: "Design" },
  { id: 13, name: "Rent Forecaster", desc: "Projects rental rates", category: "Financial" },
  { id: 14, name: "IRR Calculator", desc: "Models investment returns", category: "Financial" },
  { id: 15, name: "Debt Structurer", desc: "Optimizes financing structure", category: "Financial" },
  { id: 16, name: "GC Bid Analyzer", desc: "Compares contractor bids", category: "Construction" },
  { id: 17, name: "Schedule Optimizer", desc: "Optimizes construction timeline", category: "Construction" },
  { id: 18, name: "Change Order Tracker", desc: "Monitors scope changes", category: "Construction" },
  { id: 19, name: "Draw Inspector", desc: "Reviews draw requests", category: "Construction" },
  { id: 20, name: "Lease-Up Strategist", desc: "Plans marketing and lease-up", category: "Marketing" },
  { id: 21, name: "Competitor Monitor", desc: "Tracks competing projects", category: "Market" },
  { id: 22, name: "Tax Incentive Finder", desc: "Identifies tax abatements", category: "Financial" },
  { id: 23, name: "Impact Fee Calculator", desc: "Estimates development fees", category: "Entitlements" },
  { id: 24, name: "HOA Structurer", desc: "Plans HOA or condo regime", category: "Legal" },
  { id: 25, name: "Exit Strategist", desc: "Models disposition scenarios", category: "Financial" },
];

const TABS = [
  { key: "command", label: "Command Center", icon: Target },
  { key: "screener", label: "Site Screener", icon: Search },
  { key: "proforma", label: "Pro Forma", icon: Calculator },
  { key: "entitlements", label: "Entitlements", icon: FileText },
  { key: "agents", label: "AI Agents", icon: Bot },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #EEEEEE",
  borderRadius: 16,
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  padding: 24,
};

const yellowBtn: React.CSSProperties = {
  background: "#F9D96A",
  color: "#1A1A1A",
  borderRadius: 999,
  border: "none",
  padding: "10px 24px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "var(--font-inter)",
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #EEEEEE",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 14,
  fontFamily: "var(--font-inter)",
  color: "#1A1A1A",
  outline: "none",
  width: "100%",
};

/* ================================================================== */
/*  MAIN COMPONENT                                                     */
/* ================================================================== */
export default function DeveloperWorkspace({ role }: { role: RoleId }) {
  const [activeTab, setActiveTab] = useState<TabKey>("command");

  /* ---------- TAB 1: Command Center state ---------- */
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProj, setNewProj] = useState({ name: "", address: "", phase: "Entitlement", budget: "", nextMilestone: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("casa-dev-projects");
      if (saved) setProjects(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("casa-dev-projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = () => {
    if (!newProj.name) return;
    setProjects((p) => [
      ...p,
      {
        id: crypto.randomUUID(),
        name: newProj.name,
        address: newProj.address,
        phase: newProj.phase,
        budget: Number(newProj.budget) || 0,
        nextMilestone: newProj.nextMilestone,
      },
    ]);
    setNewProj({ name: "", address: "", phase: "Entitlement", budget: "", nextMilestone: "" });
    setShowAddProject(false);
  };

  /* ---------- TAB 2: Site Screener state ---------- */
  const [siteAddress, setSiteAddress] = useState("");
  const [siteSearching, setSiteSearching] = useState(false);
  const [siteResult, setSiteResult] = useState<any>(null);
  const [showFeasibility, setShowFeasibility] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("casa-dev-watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("casa-dev-watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  const searchSite = async () => {
    if (!siteAddress.trim()) return;
    setSiteSearching(true);
    setSiteResult(null);
    setShowFeasibility(false);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(siteAddress)}`);
      const data = await res.json();
      setSiteResult(data);
    } catch {
      setSiteResult(null);
    } finally {
      setSiteSearching(false);
    }
  };

  /* ---------- TAB 3: Pro Forma state ---------- */
  const [pfForm, setPfForm] = useState({ address: "", productType: "Multifamily", units: "", avgUnitSize: "", targetRent: "" });
  const [pfResults, setPfResults] = useState(false);

  const pfCalc = useCallback(() => {
    const units = Number(pfForm.units) || 0;
    const avgUnitSize = Number(pfForm.avgUnitSize) || 0;
    const targetRent = Number(pfForm.targetRent) || 0;
    const totalSqft = units * avgUnitSize;
    const landCost = totalSqft * 50;
    const hardCosts = totalSqft * 175;
    const softCosts = hardCosts * 0.25;
    const financing = (landCost + hardCosts + softCosts) * 0.06;
    const totalDevCost = landCost + hardCosts + softCosts + financing;
    const grossRent = units * targetRent * 12;
    const vacancy = grossRent * 0.05;
    const opEx = grossRent * 0.35;
    const noi = grossRent - vacancy - opEx;
    const devYield = totalDevCost > 0 ? (noi / totalDevCost) * 100 : 0;
    const equity = totalDevCost * 0.3;
    const irr = devYield * 1.8;
    return { totalSqft, landCost, hardCosts, softCosts, financing, totalDevCost, grossRent, vacancy, opEx, noi, devYield, equity, irr };
  }, [pfForm]);

  /* ---------- TAB 4: Entitlements state ---------- */
  const [entApps, setEntApps] = useState<EntitlementApp[]>([]);
  const [showEntForm, setShowEntForm] = useState(false);
  const [newEnt, setNewEnt] = useState({ project: "", jurisdiction: "", type: "Site Plan", submitted: "", nextHearing: "", planner: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("casa-dev-entitlements");
      if (saved) setEntApps(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("casa-dev-entitlements", JSON.stringify(entApps));
  }, [entApps]);

  const addEntApp = () => {
    if (!newEnt.project) return;
    setEntApps((a) => [
      ...a,
      { id: crypto.randomUUID(), ...newEnt },
    ]);
    setNewEnt({ project: "", jurisdiction: "", type: "Site Plan", submitted: "", nextHearing: "", planner: "" });
    setShowEntForm(false);
  };

  /* ---------- TAB 5: Agents state ---------- */
  const [runningAgents, setRunningAgents] = useState<Set<number>>(new Set());
  const [insightAgents, setInsightAgents] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Seed 5 random agents with insights
    const ids = DEV_AGENTS.map((a) => a.id);
    const seeded = new Set<number>();
    while (seeded.size < 5) {
      seeded.add(ids[Math.floor(Math.random() * ids.length)]);
    }
    setInsightAgents(seeded);
  }, []);

  const toggleAgent = (id: number) => {
    if (runningAgents.has(id)) return;
    setRunningAgents((s) => new Set(s).add(id));
    setTimeout(() => {
      setRunningAgents((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setInsightAgents((s) => new Set(s).add(id));
    }, 2000);
  };

  const runAllAgents = () => {
    DEV_AGENTS.forEach((a) => toggleAgent(a.id));
  };

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  const today = new Date();

  const renderCommandCenter = () => {
    const constructionCount = projects.filter((p) => p.phase === "Construction").length;
    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const projectedNOI = totalBudget * 0.08;
    const constructionSqft = constructionCount * 5000;

    const upcomingMilestones = projects.filter((p) => {
      if (!p.nextMilestone) return false;
      const d = daysBetween(p.nextMilestone, today);
      return d >= 0 && d <= 7;
    }).length;

    const briefingText =
      projects.length === 0
        ? "Add your first project to receive daily AI insights."
        : `You have ${projects.length} active project${projects.length !== 1 ? "s" : ""}. ${constructionCount} ${constructionCount === 1 ? "is" : "are"} in construction phase. ${upcomingMilestones} milestone${upcomingMilestones !== 1 ? "s" : ""} coming up this week.`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Daily AI Briefing */}
        <div style={{ ...cardStyle, borderLeft: "4px solid #F9D96A" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Zap size={18} color="#E8C84A" />
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A" }}>Daily AI Briefing</span>
          </div>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#6B6B6B", margin: 0 }}>{briefingText}</p>
        </div>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Total Projects", value: projects.length, prefix: "", suffix: "" },
            { label: "Under Construction Sqft", value: constructionSqft, prefix: "", suffix: " sqft" },
            { label: "Total Budget", value: totalBudget, prefix: "$", suffix: "" },
            { label: "Projected NOI", value: Math.round(projectedNOI), prefix: "$", suffix: "" },
          ].map((kpi) => (
            <div key={kpi.label} style={cardStyle}>
              <div style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#9B9B9B", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A1A" }}>
                <CountUp end={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
              </div>
            </div>
          ))}
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <Building2 size={40} color="#9B9B9B" style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "var(--font-inter)", color: "#6B6B6B", margin: 0 }}>No projects yet. Add your first development project to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {projects.map((p) => {
              const daysUntil = p.nextMilestone ? daysBetween(p.nextMilestone, today) : null;
              const phaseColor = PHASE_COLORS[p.phase] || PHASE_COLORS.Entitlement;
              const progress = PHASE_PROGRESS[p.phase] || 25;
              return (
                <div key={p.id} style={{ ...cardStyle, transition: "box-shadow 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 40px rgba(249,217,106,0.18)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)")}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A" }}>{p.name}</div>
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#6B6B6B", marginTop: 4 }}>{p.address || "No address"}</div>
                    </div>
                    <span style={{ background: phaseColor.bg, color: phaseColor.text, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999, fontFamily: "var(--font-inter)" }}>{p.phase}</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginTop: 16, background: "#F5F5F5", borderRadius: 999, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${progress}%`, height: "100%", background: phaseColor.text, borderRadius: 999, transition: "width 0.6s ease" }} />
                  </div>

                  <div style={{ display: "flex", gap: 24, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontFamily: "var(--font-inter)", fontSize: 13 }}>
                      <span style={{ color: "#9B9B9B" }}>Budget: </span>
                      <span style={{ fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{p.budget ? fmt(p.budget) : "—"}</span>
                    </div>
                    {daysUntil !== null && (
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={14} color={daysUntil < 7 ? "#DC2626" : daysUntil < 30 ? "#D97706" : "#059669"} />
                        <span style={{ color: daysUntil < 7 ? "#DC2626" : daysUntil < 30 ? "#D97706" : "#059669" }}>{daysUntil} days until milestone</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 999, background: p.budget > 0 ? "#059669" : "#9B9B9B" }} />
                      <span style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#9B9B9B" }}>Budget {p.budget > 0 ? "set" : "pending"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add project button / form */}
        <button onClick={() => setShowAddProject(!showAddProject)} style={yellowBtn}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Add Project
          </span>
        </button>

        {showAddProject && (
          <div style={{ ...cardStyle, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 16 }}>New Project</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Project Name" value={newProj.name} onChange={(e) => setNewProj({ ...newProj, name: e.target.value })} style={inputStyle} />
              <input placeholder="Address" value={newProj.address} onChange={(e) => setNewProj({ ...newProj, address: e.target.value })} style={inputStyle} />
              <select value={newProj.phase} onChange={(e) => setNewProj({ ...newProj, phase: e.target.value })} style={inputStyle}>
                <option>Entitlement</option>
                <option>Design</option>
                <option>Construction</option>
                <option>Closeout</option>
              </select>
              <input placeholder="Budget ($)" type="number" value={newProj.budget} onChange={(e) => setNewProj({ ...newProj, budget: e.target.value })} style={inputStyle} />
              <input type="date" value={newProj.nextMilestone} onChange={(e) => setNewProj({ ...newProj, nextMilestone: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={addProject} style={yellowBtn}>Save Project</button>
              <button onClick={() => setShowAddProject(false)} style={{ ...yellowBtn, background: "#F5F5F5", color: "#6B6B6B" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSiteScreener = () => {
    const r = siteResult;
    const prop = r?.property?.[0] || r;
    const lot = prop?.lot || {};
    const summary = prop?.summary || {};
    const owner = prop?.assessment?.owner || prop?.owner || {};
    const sale = prop?.sale?.amount?.saleAmt || prop?.saleAmountData?.saleAmt || "";

    const lotSize = lot?.lotSize2 || lot?.lotsize2 || "—";
    const zoning = summary?.proptype || lot?.siteZoningIdent || "—";
    const ownerName = owner?.owner1?.last ? `${owner.owner1.last}, ${owner.owner1.first || ""}` : owner?.absenteeOwnerStatus || "—";

    const sqft = parseFloat(String(lotSize).replace(/[^0-9.]/g, "")) || 10000;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Search bar */}
        <div style={{ display: "flex", gap: 12 }}>
          <input
            placeholder="Enter property address..."
            value={siteAddress}
            onChange={(e) => setSiteAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchSite()}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={searchSite} disabled={siteSearching} style={yellowBtn}>
            {siteSearching ? <Loader2 size={16} className="animate-spin" /> : <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Search size={16} /> Query</span>}
          </button>
        </div>

        {/* Results */}
        {siteResult && (
          <div style={{ ...cardStyle, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 20 }}>Site Analysis</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Zoning", value: zoning },
                { label: "Lot Size", value: lotSize },
                { label: "Height Limit", value: "Per zoning - verify with jurisdiction" },
                { label: "Setbacks", value: "Standard - verify with jurisdiction" },
                { label: "FAR", value: "Per zoning code" },
                { label: "Utilities", value: "Available - municipal water, sewer, electric, gas" },
                { label: "Flood Zone", value: lot?.floodZone || "Zone X (Minimal Risk)" },
                { label: "Environmental", value: "No flags identified" },
                { label: "Ownership", value: ownerName },
                { label: "Last Sale Price", value: sale ? fmt(Number(sale)) : "—" },
              ].map((row) => (
                <div key={row.label} style={{ padding: "12px 0", borderBottom: "1px solid #EEEEEE" }}>
                  <div style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#6B6B6B", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, color: "#1A1A1A" }}>{row.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowFeasibility(true)} style={yellowBtn}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={16} /> Run Full Feasibility</span>
              </button>
              <button
                onClick={() => {
                  if (!watchlist.find((w) => w.address === siteAddress)) {
                    setWatchlist([...watchlist, { address: siteAddress, addedAt: new Date().toISOString() }]);
                  }
                }}
                style={{ ...yellowBtn, background: "#F5F5F5", color: "#1A1A1A" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Save to Watchlist</span>
              </button>
            </div>

            {showFeasibility && (
              <div style={{ marginTop: 20, padding: 20, background: "#FFFDF5", borderRadius: 12, border: "1px solid #F9D96A", animation: "fadeIn 0.3s ease" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#E8C84A", marginBottom: 12 }}>AI Feasibility Estimate</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>Projected Dev Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{fmt(sqft * 250)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>Projected NOI</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{fmt(sqft * 250 * 0.08)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>Development Yield</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>8.0%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!siteResult && !siteSearching && (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <MapPin size={40} color="#9B9B9B" style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "var(--font-inter)", color: "#6B6B6B", margin: 0 }}>Enter a property address to analyze site feasibility.</p>
          </div>
        )}

        {/* Watchlist */}
        {watchlist.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 16 }}>Watchlist</div>
            {watchlist.map((w) => (
              <div key={w.address} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #EEEEEE" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MapPin size={14} color="#6B6B6B" />
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#1A1A1A" }}>{w.address}</span>
                </div>
                <button onClick={() => setWatchlist(watchlist.filter((x) => x.address !== w.address))} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 13, fontFamily: "var(--font-inter)" }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderProForma = () => {
    const c = pfCalc();

    const sensitivityData = () => {
      const caps = [0.05, 0.06, 0.07];
      const rentMults = [0.9, 1.0, 1.1];
      return caps.map((cap) =>
        rentMults.map((mult) => {
          const adjNOI = c.noi * mult;
          const termValue = adjNOI / cap;
          const totalReturn = termValue - c.totalDevCost;
          const irrEst = c.totalDevCost > 0 ? ((totalReturn / c.equity) / 5) * 100 : 0;
          return irrEst.toFixed(1);
        })
      );
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Input form */}
        <div style={cardStyle}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 16 }}>Pro Forma Inputs</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input placeholder="Address" value={pfForm.address} onChange={(e) => setPfForm({ ...pfForm, address: e.target.value })} style={inputStyle} />
            <select value={pfForm.productType} onChange={(e) => setPfForm({ ...pfForm, productType: e.target.value })} style={inputStyle}>
              <option>SFR</option>
              <option>Multifamily</option>
              <option>Commercial</option>
              <option>Mixed-Use</option>
            </select>
            <input placeholder="Units" type="number" value={pfForm.units} onChange={(e) => setPfForm({ ...pfForm, units: e.target.value })} style={inputStyle} />
            <input placeholder="Avg Unit Size (sqft)" type="number" value={pfForm.avgUnitSize} onChange={(e) => setPfForm({ ...pfForm, avgUnitSize: e.target.value })} style={inputStyle} />
            <input placeholder="Target Rent ($/unit/mo)" type="number" value={pfForm.targetRent} onChange={(e) => setPfForm({ ...pfForm, targetRent: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => setPfResults(true)} style={yellowBtn}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calculator size={16} /> Generate Pro Forma</span>
            </button>
          </div>
        </div>

        {pfResults && Number(pfForm.units) > 0 ? (
          <div style={{ ...cardStyle, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 20 }}>
              Pro Forma — {pfForm.productType} | {pfForm.units} Units | {c.totalSqft.toLocaleString()} sqft
            </div>

            {/* Revenue */}
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#E8C84A", marginBottom: 8, marginTop: 8 }}>Revenue</div>
            {[
              { label: "Gross Potential Rent", value: c.grossRent },
              { label: "Less: Vacancy (5%)", value: -c.vacancy },
              { label: "Less: Operating Expenses (35%)", value: -c.opEx },
              { label: "Net Operating Income (NOI)", value: c.noi },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F5F5F5" }}>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: r.label.includes("NOI") ? "#1A1A1A" : "#6B6B6B", fontWeight: r.label.includes("NOI") ? 600 : 400 }}>{r.label}</span>
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, color: r.value < 0 ? "#DC2626" : "#1A1A1A", fontWeight: r.label.includes("NOI") ? 600 : 400 }}>{fmt(r.value)}</span>
              </div>
            ))}

            {/* Operating Expenses (already shown above inline) */}

            {/* Development Costs */}
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#E8C84A", marginBottom: 8, marginTop: 24 }}>Development Costs</div>
            {[
              { label: "Land Cost ($50/sqft)", value: c.landCost },
              { label: "Hard Costs ($175/sqft)", value: c.hardCosts },
              { label: "Soft Costs (25% of Hard)", value: c.softCosts },
              { label: "Financing (6%)", value: c.financing },
              { label: "Total Development Cost", value: c.totalDevCost },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F5F5F5" }}>
                <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: r.label.includes("Total") ? "#1A1A1A" : "#6B6B6B", fontWeight: r.label.includes("Total") ? 600 : 400 }}>{r.label}</span>
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 14, color: "#1A1A1A", fontWeight: r.label.includes("Total") ? 600 : 400 }}>{fmt(r.value)}</span>
              </div>
            ))}

            {/* Returns */}
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#E8C84A", marginBottom: 8, marginTop: 24 }}>Returns</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginTop: 8 }}>
              {[
                { label: "Total Dev Cost", value: fmt(c.totalDevCost) },
                { label: "Stabilized NOI", value: fmt(c.noi) },
                { label: "Dev Yield", value: `${c.devYield.toFixed(2)}%` },
                { label: "Equity Required", value: fmt(c.equity) },
                { label: "Projected IRR", value: `${c.irr.toFixed(1)}%` },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center", padding: 16, background: "#FAFAFA", borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: "#9B9B9B", fontFamily: "var(--font-inter)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-geist-mono)", color: "#1A1A1A" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Sensitivity table */}
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#E8C84A", marginBottom: 8, marginTop: 24 }}>Sensitivity Analysis (IRR %)</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-geist-mono)", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: 10, background: "#FAFAFA", border: "1px solid #EEEEEE", fontFamily: "var(--font-inter)", fontSize: 12, color: "#6B6B6B" }}>Exit Cap \ Rent</th>
                    <th style={{ padding: 10, background: "#FAFAFA", border: "1px solid #EEEEEE", color: "#6B6B6B" }}>-10%</th>
                    <th style={{ padding: 10, background: "#FAFAFA", border: "1px solid #EEEEEE", color: "#6B6B6B" }}>Base</th>
                    <th style={{ padding: 10, background: "#FAFAFA", border: "1px solid #EEEEEE", color: "#6B6B6B" }}>+10%</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitivityData().map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: 10, border: "1px solid #EEEEEE", fontWeight: 600, color: "#6B6B6B", fontFamily: "var(--font-inter)", fontSize: 12 }}>{["5%", "6%", "7%"][i]} Cap</td>
                      {row.map((val, j) => (
                        <td key={j} style={{ padding: 10, border: "1px solid #EEEEEE", textAlign: "center", color: parseFloat(val) > 0 ? "#059669" : "#DC2626" }}>{val}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export button */}
            <div style={{ marginTop: 20 }}>
              <button disabled style={{ ...yellowBtn, background: "#E5E5E5", color: "#9B9B9B", cursor: "not-allowed", position: "relative" }} title="Coming Soon">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><FileText size={16} /> Export to PDF — Coming Soon</span>
              </button>
            </div>
          </div>
        ) : !pfResults ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <Calculator size={40} color="#9B9B9B" style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "var(--font-inter)", color: "#6B6B6B", margin: 0 }}>Enter project details to generate a development pro forma.</p>
          </div>
        ) : null}
      </div>
    );
  };

  const renderEntitlements = () => {
    const approvalLikelihood = (type: string) => {
      if (type === "Site Plan" || type === "Subdivision") return { text: "High", color: "#059669" };
      if (type === "Conditional Use" || type === "Variance") return { text: "Medium", color: "#D97706" };
      return { text: "Low", color: "#DC2626" };
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {entApps.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: 48 }}>
            <FileText size={40} color="#9B9B9B" style={{ marginBottom: 12 }} />
            <p style={{ fontFamily: "var(--font-inter)", color: "#6B6B6B", margin: 0 }}>No entitlement applications yet. Add your first application to start tracking.</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-inter)", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#FAFAFA" }}>
                      {["Project", "Jurisdiction", "Type", "Submitted", "Status", "Next Hearing", "Planner"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid #EEEEEE", color: "#6B6B6B", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entApps.map((app) => {
                      const hearingDays = app.nextHearing ? daysBetween(app.nextHearing, today) : null;
                      const status = app.nextHearing && hearingDays !== null && hearingDays > 0 ? "Pending Review" : "Submitted";
                      const hearingSoon = hearingDays !== null && hearingDays >= 0 && hearingDays <= 30;
                      return (
                        <tr key={app.id} style={{ borderBottom: "1px solid #EEEEEE" }}>
                          <td style={{ padding: "12px 16px", color: "#1A1A1A", fontWeight: 500 }}>{app.project}</td>
                          <td style={{ padding: "12px 16px", color: "#6B6B6B" }}>{app.jurisdiction}</td>
                          <td style={{ padding: "12px 16px", color: "#6B6B6B" }}>{app.type}</td>
                          <td style={{ padding: "12px 16px", color: "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}>{app.submitted || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: status === "Pending Review" ? "#FEF3C7" : "#E5E7EB", color: status === "Pending Review" ? "#B45309" : "#6B6B6B" }}>{status}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontFamily: "var(--font-geist-mono)", color: "#6B6B6B" }}>{app.nextHearing || "—"}</span>
                            {hearingSoon && (
                              <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#FEE2E2", color: "#DC2626", fontWeight: 700, textTransform: "uppercase" }}>HEARING SOON</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#6B6B6B" }}>{app.planner || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Risk Assessment */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Shield size={18} color="#E8C84A" />
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A" }}>AI Risk Assessment</span>
              </div>
              {entApps.map((app) => {
                const likelihood = approvalLikelihood(app.type);
                return (
                  <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F5F5F5" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#1A1A1A" }}>{app.project}</span>
                      <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#9B9B9B", marginLeft: 8 }}>({app.type})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>Likelihood of Approval:</span>
                      <span style={{ fontWeight: 700, color: likelihood.color, fontFamily: "var(--font-inter)", fontSize: 14 }}>{likelihood.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div style={cardStyle}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 20 }}>Application Timeline</div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "10px 0" }}>
                {entApps.map((app, i) => (
                  <React.Fragment key={app.id}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100 }}>
                      <div style={{ width: 16, height: 16, borderRadius: 999, background: "#E8C84A", border: "3px solid #FFF", boxShadow: "0 0 0 2px #E8C84A" }} />
                      <div style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "#1A1A1A", marginTop: 8, textAlign: "center", maxWidth: 90 }}>{app.project}</div>
                      <div style={{ fontFamily: "var(--font-geist-mono)", fontSize: 10, color: "#9B9B9B", marginTop: 2 }}>{app.submitted || "—"}</div>
                    </div>
                    {i < entApps.length - 1 && <div style={{ flex: 1, height: 2, background: "#EEEEEE", minWidth: 40 }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Add Application */}
        <button onClick={() => setShowEntForm(!showEntForm)} style={yellowBtn}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Plus size={16} /> Add Application</span>
        </button>

        {showEntForm && (
          <div style={{ ...cardStyle, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A", marginBottom: 16 }}>New Application</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input placeholder="Project Name" value={newEnt.project} onChange={(e) => setNewEnt({ ...newEnt, project: e.target.value })} style={inputStyle} />
              <input placeholder="Jurisdiction" value={newEnt.jurisdiction} onChange={(e) => setNewEnt({ ...newEnt, jurisdiction: e.target.value })} style={inputStyle} />
              <select value={newEnt.type} onChange={(e) => setNewEnt({ ...newEnt, type: e.target.value })} style={inputStyle}>
                <option>Site Plan</option>
                <option>Conditional Use</option>
                <option>Variance</option>
                <option>Rezoning</option>
                <option>Subdivision</option>
              </select>
              <input type="date" placeholder="Submitted Date" value={newEnt.submitted} onChange={(e) => setNewEnt({ ...newEnt, submitted: e.target.value })} style={inputStyle} />
              <input type="date" placeholder="Next Hearing Date" value={newEnt.nextHearing} onChange={(e) => setNewEnt({ ...newEnt, nextHearing: e.target.value })} style={inputStyle} />
              <input placeholder="Assigned Planner" value={newEnt.planner} onChange={(e) => setNewEnt({ ...newEnt, planner: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={addEntApp} style={yellowBtn}>Save Application</button>
              <button onClick={() => setShowEntForm(false)} style={{ ...yellowBtn, background: "#F5F5F5", color: "#6B6B6B" }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAgents = () => {
    const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
      "Site Analysis": { bg: "#DBEAFE", text: "#1D4ED8" },
      Market: { bg: "#D1FAE5", text: "#047857" },
      Financial: { bg: "#FEF3C7", text: "#B45309" },
      Entitlements: { bg: "#EDE9FE", text: "#7C3AED" },
      Design: { bg: "#FCE7F3", text: "#BE185D" },
      Construction: { bg: "#FED7AA", text: "#C2410C" },
      Marketing: { bg: "#CCFBF1", text: "#0F766E" },
      Legal: { bg: "#E5E7EB", text: "#374151" },
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: "#1A1A1A" }}>AI Agent Fleet</div>
          <button onClick={runAllAgents} style={yellowBtn}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Play size={16} /> Run All Agents</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {DEV_AGENTS.map((agent) => {
            const isRunning = runningAgents.has(agent.id);
            const hasInsights = insightAgents.has(agent.id);
            const catColor = CATEGORY_COLORS[agent.category] || CATEGORY_COLORS.Legal;

            return (
              <div
                key={agent.id}
                onClick={() => toggleAgent(agent.id)}
                style={{
                  ...cardStyle,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  padding: 20,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 8px 40px rgba(249,217,106,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <Bot size={20} color="#E8C84A" />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isRunning ? (
                      <Loader2 size={14} color="#059669" style={{ animation: "spin 1s linear infinite" }} />
                    ) : (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: hasInsights ? "#F9D96A" : "#D1D5DB",
                          boxShadow: isRunning ? "0 0 0 3px rgba(5,150,105,0.3)" : "none",
                        }}
                      />
                    )}
                    {hasInsights && !isRunning && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#FEF3C7", color: "#B45309", fontWeight: 700, fontFamily: "var(--font-inter)" }}>3 insights</span>
                    )}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "#1A1A1A", marginBottom: 4 }}>{agent.name}</div>
                <div style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "#6B6B6B", marginBottom: 10 }}>{agent.desc}</div>
                <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 999, background: catColor.bg, color: catColor.text, fontWeight: 600, fontFamily: "var(--font-inter)", textTransform: "uppercase", letterSpacing: 0.5 }}>{agent.category}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ background: "#FFFFFF", minHeight: "100vh", fontFamily: "var(--font-inter)" }}>
        {/* Header */}
        <header style={{ background: "#FFFFFF", borderBottom: "1px solid #EEEEEE", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 32, color: "#1A1A1A", fontWeight: 700 }}>CASA</span>
            <div style={{ width: 1, height: 28, background: "#EEEEEE" }} />
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#6B6B6B" }}>Developer Intelligence</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: "#059669" }} />
            <span style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#6B6B6B" }}>developer</span>
          </div>
        </header>

        {/* Tab bar */}
        <nav style={{ display: "flex", gap: 0, borderBottom: "1px solid #EEEEEE", padding: "0 32px", background: "#FFFFFF" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: active ? "3px solid #F9D96A" : "3px solid transparent",
                  color: active ? "#1A1A1A" : "#9B9B9B",
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <main style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
          {activeTab === "command" && renderCommandCenter()}
          {activeTab === "screener" && renderSiteScreener()}
          {activeTab === "proforma" && renderProForma()}
          {activeTab === "entitlements" && renderEntitlements()}
          {activeTab === "agents" && renderAgents()}
        </main>

        {/* Bottom panels */}
        <AIPanel />
        <RoleSwitcher currentRole={role} />
      </div>
    </>
  );
}
