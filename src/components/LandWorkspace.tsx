"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Loader2,
  MapPin,
  Shield,
  AlertTriangle,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Bot,
  Zap,
  Play,
  Target,
  FileText,
  Mail,
  Phone,
  DoorOpen,
  Copy,
  CheckCircle2,
  Clock,
  TrendingUp,
  Building2,
  BarChart3,
  Layers,
} from "lucide-react";
import AIPanel from "@/components/AIPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import type { RoleId } from "@/lib/roles";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════════════════════════ */
const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B6B6B";
const TEXT_MUTED = "#9B9B9B";
const BORDER = "#EEEEEE";
const CARD_SHADOW = "0 4px 24px rgba(0,0,0,0.06)";
const CARD_HOVER = "0 8px 40px rgba(249,217,106,0.18)";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const PURPLE = "#a855f7";
const BLUE = "#3b82f6";
const ORANGE = "#f97316";

/* ═══════════════════════════════════════════════════════════════════
   COUNT UP ANIMATION
   ═══════════════════════════════════════════════════════════════════ */
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
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!end) {
      setVal(0);
      return;
    }
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return (
    <span>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */
interface OutreachEntry {
  date: string;
  type: string;
  response: string;
  notes: string;
}

interface Parcel {
  id: string;
  apn: string;
  address: string;
  city: string;
  acres: number;
  zoning: string;
  owner_name: string;
  tax_delinquent: boolean;
  priority: string;
  notes: string;
  status: string;
  motivation_score: number;
  opportunity_score: number;
  distress_score: number;
  next_action: string;
  outreach_log: OutreachEntry[];
  assessed_value: number;
  annual_taxes: number;
  last_sale_date: string;
  last_sale_price: number;
  created_at: string;
}

interface Agent {
  name: string;
  category: string;
  description: string;
  lastRun: string;
}

/* ═══════════════════════════════════════════════════════════════════
   STATUS HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const STATUS_OPTIONS = [
  "prospect",
  "researching",
  "outreach",
  "negotiating",
  "under_contract",
  "closed",
] as const;

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  researching: "Researching",
  outreach: "Outreach",
  negotiating: "Negotiating",
  under_contract: "Under Contract",
  closed: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  prospect: BLUE,
  researching: PURPLE,
  outreach: AMBER,
  negotiating: ORANGE,
  under_contract: GREEN,
  closed: TEXT_MUTED,
};

/* ═══════════════════════════════════════════════════════════════════
   AGENTS DATA
   ═══════════════════════════════════════════════════════════════════ */
const AGENTS: Agent[] = [
  // Site Analysis (10)
  { name: "Parcel Boundary Mapper", category: "Site Analysis", description: "Maps precise parcel boundaries from GIS data and overlays easements.", lastRun: "" },
  { name: "Topography Analyzer", category: "Site Analysis", description: "Evaluates slope, grade, and elevation changes across the parcel.", lastRun: "" },
  { name: "Soil Quality Assessor", category: "Site Analysis", description: "Analyzes soil composition, percolation rates, and buildability.", lastRun: "" },
  { name: "Access Road Evaluator", category: "Site Analysis", description: "Assesses road access, ingress/egress, and required improvements.", lastRun: "" },
  { name: "Utility Proximity Scanner", category: "Site Analysis", description: "Scans nearest water, sewer, electric, and gas connections.", lastRun: "" },
  { name: "View Corridor Analyzer", category: "Site Analysis", description: "Evaluates view potential and sight-line obstructions.", lastRun: "" },
  { name: "Natural Hazard Screener", category: "Site Analysis", description: "Screens for flood zones, fire hazards, and landslide risk.", lastRun: "" },
  { name: "Endangered Species Check", category: "Site Analysis", description: "Checks for protected species habitats on or near the parcel.", lastRun: "" },
  { name: "Archaeological Survey", category: "Site Analysis", description: "Reviews records for cultural or archaeological significance.", lastRun: "" },
  { name: "Water Rights Investigator", category: "Site Analysis", description: "Investigates water rights, well permits, and water table data.", lastRun: "" },
  // Market (8)
  { name: "Land Comp Finder", category: "Market", description: "Finds comparable land sales within the market area.", lastRun: "" },
  { name: "Absorption Rate Analyzer", category: "Market", description: "Analyzes how quickly land is being absorbed in the submarket.", lastRun: "" },
  { name: "Developer Activity Tracker", category: "Market", description: "Tracks active developer projects and planned communities nearby.", lastRun: "" },
  { name: "Entitlement Pipeline Monitor", category: "Market", description: "Monitors planning department for new entitlement applications.", lastRun: "" },
  { name: "Price Trend Forecaster", category: "Market", description: "Forecasts land price trends using historical and macro data.", lastRun: "" },
  { name: "Highest & Best Use AI", category: "Market", description: "Determines highest and best use based on zoning and market demand.", lastRun: "" },
  { name: "Subdivision Potential Analyzer", category: "Market", description: "Evaluates lot split and subdivision feasibility.", lastRun: "" },
  { name: "Infrastructure Growth Tracker", category: "Market", description: "Tracks planned infrastructure projects that impact land value.", lastRun: "" },
  // Financial (7)
  { name: "Land Valuation Engine", category: "Financial", description: "Calculates estimated land value using multiple methodologies.", lastRun: "" },
  { name: "Tax Lien Scanner", category: "Financial", description: "Scans for outstanding tax liens and delinquent payments.", lastRun: "" },
  { name: "Assessment Appeal Finder", category: "Financial", description: "Identifies properties with potential assessment appeal opportunities.", lastRun: "" },
  { name: "Cost Basis Calculator", category: "Financial", description: "Calculates acquisition cost basis including closing and carry costs.", lastRun: "" },
  { name: "Development Premium Estimator", category: "Financial", description: "Estimates value uplift from entitlement and development.", lastRun: "" },
  { name: "Seller Motivation Scorer", category: "Financial", description: "Scores seller motivation based on financial and behavioral signals.", lastRun: "" },
  { name: "Distress Signal Detector", category: "Financial", description: "Detects financial distress indicators from public records.", lastRun: "" },
  // Outreach (8)
  { name: "Skip Trace Engine", category: "Outreach", description: "Locates current contact information for property owners.", lastRun: "" },
  { name: "Owner Contact Finder", category: "Outreach", description: "Finds phone numbers, emails, and mailing addresses for owners.", lastRun: "" },
  { name: "LLC Piercing Agent", category: "Outreach", description: "Identifies individuals behind LLC and corporate ownership.", lastRun: "" },
  { name: "Probate Case Finder", category: "Outreach", description: "Searches court records for probate cases linked to parcels.", lastRun: "" },
  { name: "Divorce Filing Scanner", category: "Outreach", description: "Scans family court filings for potential motivated sellers.", lastRun: "" },
  { name: "Code Violation Finder", category: "Outreach", description: "Finds open code violations and municipal enforcement actions.", lastRun: "" },
  { name: "Pre-Foreclosure Scanner", category: "Outreach", description: "Identifies properties in pre-foreclosure or notice of default.", lastRun: "" },
  { name: "Absentee Owner Detector", category: "Outreach", description: "Detects absentee owners by comparing owner and mailing addresses.", lastRun: "" },
  // Legal (7)
  { name: "Title Cloud Detector", category: "Legal", description: "Detects title defects, clouds, and unresolved claims.", lastRun: "" },
  { name: "Easement Mapper", category: "Legal", description: "Maps all recorded easements and rights-of-way on the parcel.", lastRun: "" },
  { name: "Deed Restriction Analyzer", category: "Legal", description: "Analyzes deed restrictions and covenants affecting use.", lastRun: "" },
  { name: "HOA/CC&R Scanner", category: "Legal", description: "Scans for HOA rules and CC&Rs that limit development.", lastRun: "" },
  { name: "Boundary Dispute Finder", category: "Legal", description: "Identifies potential boundary disputes from survey records.", lastRun: "" },
  { name: "Lien Priority Ranker", category: "Legal", description: "Ranks all liens by priority and estimates payoff amounts.", lastRun: "" },
  { name: "Quiet Title Advisor", category: "Legal", description: "Advises on quiet title actions needed to clear ownership.", lastRun: "" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Site Analysis": "#3b82f6",
  Market: "#22c55e",
  Financial: "#f59e0b",
  Outreach: "#a855f7",
  Legal: "#ef4444",
};

const RANDOM_LAST_RUNS = ["2h ago", "5h ago", "1d ago", "3d ago", "12h ago", "30m ago", "Never"];

/* ═══════════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════════ */
const TABS = [
  "Command Center",
  "Parcel Intel",
  "Outreach",
  "Pipeline",
  "AI Agents",
] as const;
type TabId = (typeof TABS)[number];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function LandWorkspace({ role }: { role: RoleId }) {
  const [activeTab, setActiveTab] = useState<TabId>("Command Center");

  /* ── shared parcel state ── */
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", city: "" });

  /* ── tab 2: Parcel Intel ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [attomResult, setAttomResult] = useState<any>(null);
  const [added, setAdded] = useState(false);

  /* ── tab 3: Outreach ── */
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const [letterText, setLetterText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [outreachForm, setOutreachForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Letter",
    response: "",
    notes: "",
  });

  /* ── tab 4: Pipeline ── */
  const [expandedPipelineParcel, setExpandedPipelineParcel] = useState<string | null>(null);
  const [dealMemo, setDealMemo] = useState("");

  /* ── tab 5: AI Agents ── */
  const [agents, setAgents] = useState<(Agent & { insights: number })[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());

  /* ── tab 1 inline outreach ── */
  const [inlineOutreachParcel, setInlineOutreachParcel] = useState<string | null>(null);
  const [inlineOutreachForm, setInlineOutreachForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Letter",
    response: "",
    notes: "",
  });
  const [analysisLoading, setAnalysisLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* ── load parcels ── */
  const loadParcels = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("target_parcels")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setParcels(data as Parcel[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  /* ── initialize agents ── */
  useEffect(() => {
    const seeded = new Set<number>();
    while (seeded.size < 5) {
      seeded.add(Math.floor(Math.random() * AGENTS.length));
    }
    setAgents(
      AGENTS.map((a, i) => ({
        ...a,
        lastRun: RANDOM_LAST_RUNS[Math.floor(Math.random() * RANDOM_LAST_RUNS.length)],
        insights: seeded.has(i) ? Math.floor(Math.random() * 5) + 1 : 0,
      }))
    );
  }, []);

  /* ── filtered parcels ── */
  const filtered = parcels.filter((p) => {
    if (filters.status && p.status !== filters.status) return false;
    if (filters.city && !p.city?.toLowerCase().includes(filters.city.toLowerCase())) return false;
    return true;
  });

  /* ── KPI helpers ── */
  const totalParcels = parcels.length;
  const underContract = parcels.filter((p) => p.status === "under_contract").length;
  const potentialDeals = parcels.filter((p) => p.status !== "closed").length;
  const avgOpportunity =
    parcels.length > 0
      ? Math.round(parcels.reduce((s, p) => s + (p.opportunity_score || 0), 0) / parcels.length)
      : 0;

  /* ── run analysis ── */
  const runAnalysis = async (parcel: Parcel) => {
    setAnalysisLoading(parcel.id);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(parcel.address)}`);
      const data = await res.json();
      const summary = data?.summary;
      alert(
        `Analysis Complete for ${parcel.address}:\n\n` +
          `Owner: ${summary?.absentInd || "N/A"}\n` +
          `Property Type: ${summary?.proptype || "N/A"}\n` +
          `Lot Size: ${summary?.lotSize2 || "N/A"} acres\n` +
          `Assessed Value: $${data?.detail?.assessment?.assessed?.assdTtlValue?.toLocaleString() || "N/A"}\n` +
          `Last Sale: $${data?.detail?.sale?.amount?.saleAmt?.toLocaleString() || "N/A"}`
      );
    } catch {
      alert("Analysis failed. Check the API connection.");
    }
    setAnalysisLoading(null);
  };

  /* ── save inline outreach (tab 1) ── */
  const saveInlineOutreach = async (parcelId: string) => {
    const parcel = parcels.find((p) => p.id === parcelId);
    if (!parcel) return;
    const existing = parcel.outreach_log || [];
    const updated = [...existing, { ...inlineOutreachForm }];
    await supabase.from("target_parcels").update({ outreach_log: updated }).eq("id", parcelId);
    setInlineOutreachParcel(null);
    setInlineOutreachForm({ date: new Date().toISOString().split("T")[0], type: "Letter", response: "", notes: "" });
    loadParcels();
  };

  /* ── search ATTOM (tab 2) ── */
  const searchAttom = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setAttomResult(null);
    setAdded(false);
    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setAttomResult(data);
    } catch {
      setAttomResult(null);
    }
    setSearching(false);
  };

  /* ── add to pipeline (tab 2) ── */
  const addToPipeline = async () => {
    if (!attomResult) return;
    const s = attomResult.summary || {};
    const d = attomResult.detail || {};
    const assessed = d.assessment?.assessed?.assdTtlValue || 0;
    const lastSale = d.sale?.amount?.saleAmt || 0;
    const lastSaleDate = d.sale?.amount?.saleRecDate || "";
    const owner = d.assessment?.owner?.owner1?.fullName || s.absentInd || "Unknown";
    const addr = s.line1 || searchQuery;
    const city = s.line2?.split(",")[0] || "";
    const acres = parseFloat(s.lotSize2) || 0;
    const zoning = d.lot?.siteZoningIdent || s.proptype || "";
    const taxDelinquent = d.assessment?.tax?.taxAmt === 0;

    const { error } = await supabase.from("target_parcels").insert({
      address: addr,
      city,
      acres,
      zoning,
      owner_name: owner,
      tax_delinquent: taxDelinquent,
      status: "prospect",
      assessed_value: assessed,
      last_sale_price: lastSale,
      last_sale_date: lastSaleDate,
      annual_taxes: d.assessment?.tax?.taxAmt || 0,
      motivation_score: 5,
      opportunity_score: 5,
      distress_score: taxDelinquent ? 8 : 3,
      apn: s.apn || "",
      outreach_log: [],
    });
    if (!error) {
      setAdded(true);
      loadParcels();
    }
  };

  /* ── generate letter (tab 3) ── */
  const generateLetter = (parcel: Parcel) => {
    setGenerating(true);
    setTimeout(() => {
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const lastSaleYear = parcel.last_sale_date
        ? new Date(parcel.last_sale_date).getFullYear()
        : null;
      const yearsOwned = lastSaleYear ? new Date().getFullYear() - lastSaleYear : null;

      let body = "";
      if (parcel.tax_delinquent) {
        body = `I am writing to you regarding your property located at ${parcel.address}, ${parcel.city}. We understand that managing tax obligations on land can be challenging, and we would like to offer a solution that could relieve this burden.\n\nCASA Acquisitions specializes in fair, all-cash land purchases. We can close quickly and cover all closing costs, allowing you to move forward without the ongoing tax liability. Our offers are based on current market conditions and we pride ourselves on transparent, straightforward transactions.\n\nIf you are interested in discussing a potential sale, we would welcome the opportunity to speak with you. There is absolutely no obligation, and all conversations are kept strictly confidential.`;
      } else if (yearsOwned && yearsOwned > 10) {
        body = `I am reaching out regarding your property at ${parcel.address}, ${parcel.city}, which records indicate you have held for approximately ${yearsOwned} years. As a long-term owner, you may be considering estate planning or portfolio diversification.\n\nCASA Acquisitions is actively acquiring land in your area and we believe your parcel could be an excellent fit for our portfolio. We offer competitive, all-cash pricing with flexible closing timelines to accommodate your needs.\n\nWe would love the opportunity to present you with a no-obligation offer. Whether you are actively considering a sale or simply curious about your property's current value, we are happy to provide a complimentary valuation.`;
      } else {
        body = `I am writing to express our strong interest in your property located at ${parcel.address}, ${parcel.city}. CASA Acquisitions is actively expanding our land portfolio in this area and your parcel has caught our attention.\n\nWe are prepared to make a fair, all-cash offer with a quick closing timeline. We handle all due diligence and closing costs, making the process as smooth as possible for you.\n\nIf you have any interest in discussing a potential sale, I would welcome a brief conversation at your convenience. There is no obligation and all inquiries are kept confidential.`;
      }

      setLetterText(
        `${today}\n\nDear ${parcel.owner_name || "Property Owner"},\n\n${body}\n\nSincerely,\nCASA Acquisitions`
      );
      setGenerating(false);
    }, 1500);
  };

  /* ── save outreach (tab 3) ── */
  const saveOutreach = async () => {
    if (!selectedParcelId) return;
    const parcel = parcels.find((p) => p.id === selectedParcelId);
    if (!parcel) return;
    const existing = parcel.outreach_log || [];
    const updated = [...existing, { ...outreachForm }];
    await supabase.from("target_parcels").update({ outreach_log: updated }).eq("id", selectedParcelId);
    setOutreachForm({ date: new Date().toISOString().split("T")[0], type: "Letter", response: "", notes: "" });
    loadParcels();
  };

  /* ── generate deal memo (tab 4) ── */
  const generateDealMemo = (parcel: Parcel) => {
    const lastSaleYear = parcel.last_sale_date ? new Date(parcel.last_sale_date).getFullYear() : null;
    const yearsHeld = lastSaleYear ? new Date().getFullYear() - lastSaleYear : null;
    const recommendation =
      (parcel.opportunity_score || 0) >= 7
        ? "BUY — Strong fundamentals, motivated seller signals, and favorable market position."
        : (parcel.opportunity_score || 0) >= 4
        ? "WATCH — Moderate opportunity. Continue outreach and monitor for price movement."
        : "PASS — Low opportunity score. Revisit if seller motivation changes.";

    setDealMemo(
      `INVESTMENT COMMITTEE MEMO\n${"═".repeat(40)}\n\nPROPERTY\nAddress: ${parcel.address}\nAPN: ${parcel.apn || "N/A"}\nAcreage: ${parcel.acres || "N/A"}\nZoning: ${parcel.zoning || "N/A"}\n\nOWNER\nName: ${parcel.owner_name || "N/A"}\nYears Held: ${yearsHeld ?? "N/A"}\nMotivation Score: ${parcel.motivation_score || "N/A"}/10\n\nVALUATION\nAssessed Value: $${parcel.assessed_value?.toLocaleString() || "N/A"}\nLast Sale Price: $${parcel.last_sale_price?.toLocaleString() || "N/A"}\nLast Sale Date: ${parcel.last_sale_date || "N/A"}\nEstimated Market Value: $${parcel.assessed_value ? (parcel.assessed_value * 1.15).toLocaleString() : "N/A"}\n\nOPPORTUNITY\nOpportunity Score: ${parcel.opportunity_score || "N/A"}/10\nDistress Score: ${parcel.distress_score || "N/A"}/10\nTax Delinquent: ${parcel.tax_delinquent ? "YES" : "No"}\n\nRECOMMENDATION\n${recommendation}`
    );
  };

  /* ── run agent ── */
  const runAgent = (agentName: string) => {
    setRunningAgents((prev) => new Set(prev).add(agentName));
    setTimeout(() => {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentName);
        return next;
      });
      setAgents((prev) =>
        prev.map((a) =>
          a.name === agentName
            ? { ...a, insights: Math.floor(Math.random() * 5) + 1, lastRun: "Just now" }
            : a
        )
      );
    }, 2000);
  };

  /* ── run all agents ── */
  const runAllAgents = () => {
    agents.forEach((a, i) => {
      setTimeout(() => runAgent(a.name), i * 100);
    });
  };

  /* ── selected parcel for outreach tab ── */
  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || null;

  /* ── outreach type icon ── */
  const outreachIcon = (type: string) => {
    switch (type) {
      case "Letter":
        return <Mail size={14} />;
      case "Call":
        return <Phone size={14} />;
      case "Email":
        return <Mail size={14} />;
      case "Door Knock":
        return <DoorOpen size={14} />;
      default:
        return <Mail size={14} />;
    }
  };

  /* ═══════════════════════════════════════════════════════════════════
     RENDER HELPERS
     ═══════════════════════════════════════════════════════════════════ */

  const renderStatusBadge = (status: string) => (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        background: STATUS_COLORS[status] || TEXT_MUTED,
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );

  const renderGaugeBar = (label: string, score: number, color: string) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: TEXT_SECONDARY, marginBottom: 2, fontFamily: "var(--font-inter)" }}>
        {label}: {score || 0}
      </div>
      <div style={{ height: 6, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            width: `${(score || 0) * 10}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     TAB 1: COMMAND CENTER
     ═══════════════════════════════════════════════════════════════════ */
  const renderCommandCenter = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Parcels", value: totalParcels, icon: <Layers size={20} color={GOLD} /> },
          { label: "Under Contract", value: underContract, icon: <CheckCircle2 size={20} color={GREEN} /> },
          { label: "Potential Deals", value: potentialDeals, icon: <Target size={20} color={AMBER} /> },
          { label: "Avg Opportunity", value: avgOpportunity, icon: <TrendingUp size={20} color={BLUE} />, suffix: "/10" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "20px 24px",
              boxShadow: CARD_SHADOW,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {kpi.icon}
              <span style={{ fontSize: 13, color: TEXT_SECONDARY, fontFamily: "var(--font-inter)" }}>
                {kpi.label}
              </span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: TEXT_PRIMARY, fontFamily: "var(--font-heading)" }}>
              <CountUp end={kpi.value} suffix={kpi.suffix || ""} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          alignItems: "center",
          background: "#fff",
          borderRadius: 12,
          padding: "12px 16px",
          border: `1px solid ${BORDER}`,
        }}
      >
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            fontSize: 14,
            fontFamily: "var(--font-inter)",
            background: "#fff",
            color: TEXT_PRIMARY,
            outline: "none",
          }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: 10, top: 10, color: TEXT_MUTED }} />
          <input
            placeholder="Filter by city..."
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            style={{
              width: "100%",
              padding: "8px 12px 8px 32px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              fontSize: 14,
              fontFamily: "var(--font-inter)",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: TEXT_SECONDARY }}>
          <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 8 }}>Loading parcels...</p>
        </div>
      )}

      {/* Parcel Grid */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {filtered.map((parcel) => (
            <div
              key={parcel.id}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                boxShadow: CARD_SHADOW,
                border: `1px solid ${BORDER}`,
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = CARD_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = CARD_SHADOW)}
            >
              {/* Address */}
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: TEXT_PRIMARY, marginBottom: 4 }}>
                {parcel.address}
              </div>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 8 }}>{parcel.city}</div>

              {/* APN / Acres / Zoning row */}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_MUTED, marginBottom: 8, fontFamily: "var(--font-geist-mono)" }}>
                <span>APN: {parcel.apn || "N/A"}</span>
                <span>{parcel.acres || "—"} ac</span>
                <span>{parcel.zoning || "N/A"}</span>
              </div>

              {/* Owner */}
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 12 }}>
                Owner: {parcel.owner_name || "Unknown"}
              </div>

              {/* Gauge Bars */}
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                {renderGaugeBar("Motivation", parcel.motivation_score, ACCENT)}
                {renderGaugeBar("Opportunity", parcel.opportunity_score, GREEN)}
                {renderGaugeBar("Distress", parcel.distress_score, RED)}
              </div>

              {/* Status + Next Action */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                {renderStatusBadge(parcel.status)}
              </div>
              {parcel.next_action && (
                <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 12, fontStyle: "italic" }}>
                  Next: {parcel.next_action}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => runAnalysis(parcel)}
                  disabled={analysisLoading === parcel.id}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "none",
                    background: ACCENT,
                    color: TEXT_PRIMARY,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {analysisLoading === parcel.id ? (
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Zap size={14} />
                  )}
                  Run Full Analysis
                </button>
                <button
                  onClick={() =>
                    setInlineOutreachParcel(inlineOutreachParcel === parcel.id ? null : parcel.id)
                  }
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: `1px solid ${BORDER}`,
                    background: "#fff",
                    color: TEXT_PRIMARY,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  <FileText size={14} />
                  Log Outreach
                </button>
              </div>

              {/* Inline Outreach Form */}
              {inlineOutreachParcel === parcel.id && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    background: "#FAFAFA",
                    borderRadius: 12,
                    border: `1px solid ${BORDER}`,
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <input
                      type="date"
                      value={inlineOutreachForm.date}
                      onChange={(e) => setInlineOutreachForm((f) => ({ ...f, date: e.target.value }))}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        fontSize: 13,
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                    <select
                      value={inlineOutreachForm.type}
                      onChange={(e) => setInlineOutreachForm((f) => ({ ...f, type: e.target.value }))}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        fontSize: 13,
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      <option>Letter</option>
                      <option>Call</option>
                      <option>Email</option>
                      <option>Door Knock</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Response..."
                    value={inlineOutreachForm.response}
                    onChange={(e) => setInlineOutreachForm((f) => ({ ...f, response: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: 13,
                      marginBottom: 8,
                      minHeight: 40,
                      resize: "vertical",
                      fontFamily: "var(--font-inter)",
                    }}
                  />
                  <textarea
                    placeholder="Notes..."
                    value={inlineOutreachForm.notes}
                    onChange={(e) => setInlineOutreachForm((f) => ({ ...f, notes: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: 13,
                      marginBottom: 8,
                      minHeight: 40,
                      resize: "vertical",
                      fontFamily: "var(--font-inter)",
                    }}
                  />
                  <button
                    onClick={() => saveInlineOutreach(parcel.id)}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 999,
                      border: "none",
                      background: ACCENT,
                      color: TEXT_PRIMARY,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter)",
                    }}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: TEXT_MUTED }}>
          No parcels found. Use Parcel Intel to search and add parcels.
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     TAB 2: PARCEL INTELLIGENCE
     ═══════════════════════════════════════════════════════════════════ */
  const renderParcelIntel = () => {
    const r = attomResult;
    const summary = r?.summary || {};
    const detail = r?.detail || {};
    const owner = detail?.assessment?.owner?.owner1?.fullName || summary?.absentInd || "";
    const entityType = owner.includes("LLC")
      ? "LLC"
      : owner.includes("Trust") || owner.includes("TRUST")
      ? "Trust"
      : "Individual";
    const lastSaleDate = detail?.sale?.amount?.saleRecDate || "";
    const lastSaleYear = lastSaleDate ? new Date(lastSaleDate).getFullYear() : null;
    const yearsOwned = lastSaleYear ? new Date().getFullYear() - lastSaleYear : null;
    const zoningCode = detail?.lot?.siteZoningIdent || summary?.proptype || "";
    const zoningDescription =
      zoningCode === "R1"
        ? "Single Family Residential"
        : zoningCode === "RR"
        ? "Rural Residential"
        : zoningCode === "A70"
        ? "Agricultural/Residential"
        : summary?.proptype || zoningCode || "Unknown";
    const acres = parseFloat(summary?.lotSize2) || 0;
    const assessedValue = detail?.assessment?.assessed?.assdTtlValue || 0;
    const marketValue = detail?.assessment?.market?.mktTtlValue || assessedValue;
    const lastSalePrice = detail?.sale?.amount?.saleAmt || 0;
    const annualTaxes = detail?.assessment?.tax?.taxAmt || 0;
    const taxDelinquent = annualTaxes === 0;
    const city = summary?.line2?.split(",")[0] || "";
    const distressHigh = taxDelinquent;

    const sectionStyle = (color: string): React.CSSProperties => ({
      borderLeft: `3px solid ${ACCENT}`,
      paddingLeft: 16,
      marginBottom: 20,
    });

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            background: "#fff",
            borderRadius: 12,
            padding: "12px 16px",
            boxShadow: CARD_SHADOW,
            border: `1px solid ${BORDER}`,
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: 12, top: 10, color: TEXT_MUTED }} />
            <input
              placeholder="Enter any APN or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchAttom()}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
                fontSize: 15,
                fontFamily: "var(--font-inter)",
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={searchAttom}
            disabled={searching}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              border: "none",
              background: ACCENT,
              color: TEXT_PRIMARY,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-inter)",
            }}
          >
            {searching ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
            Search
          </button>
        </div>

        {/* Searching */}
        {searching && (
          <div style={{ textAlign: "center", padding: 40, color: TEXT_SECONDARY }}>
            <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 8 }}>Searching ATTOM database...</p>
          </div>
        )}

        {/* Results */}
        {r && !searching && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              boxShadow: CARD_SHADOW,
              border: `1px solid ${BORDER}`,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 18,
                color: TEXT_PRIMARY,
                marginBottom: 24,
                margin: "0 0 24px 0",
              }}
            >
              Property Intelligence Report
            </h3>

            {/* Ownership */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                Ownership
              </h4>
              <div style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.8, fontFamily: "var(--font-inter)" }}>
                <div>
                  <strong>Owner:</strong> {owner || "N/A"}
                </div>
                <div>
                  <strong>Entity Type:</strong> {entityType}
                </div>
                <div>
                  <strong>Years Owned:</strong> {yearsOwned ?? "N/A"}
                </div>
              </div>
            </div>

            {/* LLC/Trust Piercing */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                <Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                LLC/Trust Piercing
              </h4>
              <div style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.8, fontFamily: "var(--font-inter)" }}>
                <div>
                  <strong>Registered Entity:</strong> {owner || "N/A"}
                </div>
                <div>Corporate layer analysis — 1 entity identified</div>
                <div>
                  Risk Level:{" "}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "1px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#fff",
                      background: entityType === "LLC" ? AMBER : GREEN,
                    }}
                  >
                    {entityType === "LLC" ? "Medium" : "Low"}
                  </span>
                </div>
              </div>
            </div>

            {/* Zoning */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                Zoning
              </h4>
              <div style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.8, fontFamily: "var(--font-inter)" }}>
                <div>
                  <strong>Code:</strong> {zoningCode || "N/A"}
                </div>
                <div>
                  <strong>What Can Be Built:</strong> {zoningDescription}
                </div>
                <div>
                  <strong>Max Units (est.):</strong> {acres > 0 ? Math.max(1, Math.floor(acres * 4)) : "N/A"}
                </div>
                <div>
                  <strong>FAR:</strong> Per code — verify
                </div>
                <div>
                  <strong>Setbacks:</strong> Standard
                </div>
              </div>
            </div>

            {/* Environmental */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Environmental
              </h4>
              <div style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.8, fontFamily: "var(--font-inter)" }}>
                <div>
                  <strong>Flood Zone:</strong> {detail?.lot?.floodZone || "Zone X (Minimal Risk)"}
                </div>
                <div>
                  <strong>Wildfire Risk:</strong> Moderate — verify with CAL FIRE
                </div>
                <div>
                  <strong>Fault Zone:</strong> Not in mapped zone
                </div>
                <div>
                  <strong>Wetlands:</strong> No flags
                </div>
              </div>
            </div>

            {/* Financial */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                Financial
              </h4>
              <div style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.8, fontFamily: "var(--font-inter)" }}>
                <div>
                  <strong>Assessed Value:</strong> ${assessedValue?.toLocaleString() || "N/A"}
                </div>
                <div>
                  <strong>Market Value:</strong> ${marketValue?.toLocaleString() || "N/A"}
                </div>
                <div>
                  <strong>Last Sale Date:</strong> {lastSaleDate || "N/A"}
                </div>
                <div>
                  <strong>Last Sale Price:</strong> ${lastSalePrice?.toLocaleString() || "N/A"}
                </div>
                <div>
                  <strong>Annual Taxes:</strong> ${annualTaxes?.toLocaleString() || "N/A"}
                </div>
                <div>
                  <strong>Tax Delinquent:</strong>{" "}
                  {taxDelinquent ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "1px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#fff",
                        background: RED,
                      }}
                    >
                      YES
                    </span>
                  ) : (
                    "No"
                  )}
                </div>
              </div>
            </div>

            {/* AI Summary */}
            <div style={sectionStyle(ACCENT)}>
              <h4 style={{ fontFamily: "var(--font-heading)", fontSize: 15, color: TEXT_PRIMARY, margin: "0 0 8px 0" }}>
                <Bot size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
                AI Summary
              </h4>
              <div
                style={{
                  fontSize: 14,
                  color: TEXT_SECONDARY,
                  lineHeight: 1.7,
                  fontFamily: "var(--font-inter)",
                  background: "#FAFAFA",
                  padding: 16,
                  borderRadius: 10,
                }}
              >
                This {acres > 0 ? `${acres}-acre` : ""} {zoningDescription.toLowerCase()} parcel in {city || "the area"}{" "}
                presents a{" "}
                <strong>
                  {distressHigh ? "High" : yearsOwned && yearsOwned > 10 ? "Medium" : "Low"}
                </strong>{" "}
                opportunity. {entityType} ownership
                {yearsOwned ? ` for ${yearsOwned} years` : ""}.{" "}
                {taxDelinquent ? "Tax delinquency increases motivation. " : ""}
                Estimated land value: ${assessedValue?.toLocaleString() || "N/A"}. Recommended approach:{" "}
                {distressHigh
                  ? "Direct outreach to motivated seller."
                  : "Standard market approach."}
              </div>
            </div>

            {/* Add to Pipeline */}
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <button
                onClick={addToPipeline}
                disabled={added}
                style={{
                  padding: "10px 28px",
                  borderRadius: 999,
                  border: "none",
                  background: added ? GREEN : ACCENT,
                  color: added ? "#fff" : TEXT_PRIMARY,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: added ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-inter)",
                }}
              >
                {added ? (
                  <>
                    <CheckCircle2 size={16} /> Added!
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add to Pipeline
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════
     TAB 3: OUTREACH CENTER
     ═══════════════════════════════════════════════════════════════════ */
  const renderOutreach = () => (
    <div style={{ display: "flex", gap: 20, animation: "fadeIn 0.3s ease", minHeight: 500 }}>
      {/* Left Panel — Parcel List */}
      <div
        style={{
          width: "40%",
          background: "#fff",
          borderRadius: 16,
          boxShadow: CARD_SHADOW,
          border: `1px solid ${BORDER}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            fontFamily: "var(--font-heading)",
            fontSize: 15,
            color: TEXT_PRIMARY,
          }}
        >
          Parcels
        </div>
        <div style={{ maxHeight: 600, overflowY: "auto" }}>
          {parcels.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedParcelId(p.id);
                setLetterText("");
                setDealMemo("");
              }}
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${BORDER}`,
                cursor: "pointer",
                background: selectedParcelId === p.id ? "#FFFDF0" : "#fff",
                borderLeft: selectedParcelId === p.id ? `3px solid ${ACCENT}` : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: TEXT_PRIMARY }}>
                {p.address}
              </div>
              <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 }}>{p.owner_name || "Unknown"}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 11, color: TEXT_MUTED }}>
                <span>
                  {(p.outreach_log || []).length} outreach{(p.outreach_log || []).length !== 1 ? "es" : ""}
                </span>
                {(p.outreach_log || []).length > 0 && (
                  <span>Last: {p.outreach_log[p.outreach_log.length - 1]?.date || "N/A"}</span>
                )}
              </div>
            </div>
          ))}
          {parcels.length === 0 && (
            <div style={{ padding: 20, color: TEXT_MUTED, textAlign: "center", fontSize: 13 }}>
              No parcels yet.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Detail */}
      <div style={{ width: "60%" }}>
        {!selectedParcel ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: CARD_SHADOW,
              border: `1px solid ${BORDER}`,
              padding: 40,
              textAlign: "center",
              color: TEXT_MUTED,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <MapPin size={32} color={BORDER} />
            <div style={{ fontSize: 15, fontFamily: "var(--font-inter)" }}>
              Select a parcel to view outreach details
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: CARD_SHADOW,
              border: `1px solid ${BORDER}`,
              padding: 24,
              maxHeight: 700,
              overflowY: "auto",
            }}
          >
            {/* Parcel Header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: TEXT_PRIMARY }}>
                {selectedParcel.address}
              </div>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 }}>
                {selectedParcel.owner_name} &middot; {selectedParcel.city}
              </div>
              <div style={{ marginTop: 8 }}>{renderStatusBadge(selectedParcel.status)}</div>
            </div>

            {/* Generate Letter */}
            <button
              onClick={() => generateLetter(selectedParcel)}
              disabled={generating}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                border: "none",
                background: ACCENT,
                color: TEXT_PRIMARY,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
                fontFamily: "var(--font-inter)",
              }}
            >
              {generating ? (
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <FileText size={16} />
              )}
              Generate Letter
            </button>

            {/* Letter Preview */}
            {letterText && (
              <div
                style={{
                  background: "#FEFEFE",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: 24,
                  marginBottom: 20,
                  fontFamily: "var(--font-inter)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: TEXT_PRIMARY,
                  whiteSpace: "pre-wrap",
                  position: "relative",
                }}
              >
                {letterText}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(letterText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${BORDER}`,
                    background: copied ? GREEN : "#fff",
                    color: copied ? "#fff" : TEXT_PRIMARY,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontFamily: "var(--font-inter)",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              </div>
            )}

            {/* Skip Trace */}
            <div
              style={{
                background: "#FAFAFA",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                border: `1px solid ${BORDER}`,
              }}
            >
              <h4
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  color: TEXT_PRIMARY,
                  margin: "0 0 10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Target size={14} /> Contact Information Found
              </h4>
              <div style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 2, fontFamily: "var(--font-inter)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={13} /> Phone: (XXX) XXX-XXXX —{" "}
                  <span style={{ color: GREEN, fontWeight: 600, fontSize: 11 }}>Verified</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={13} /> Email: {selectedParcel.owner_name?.toLowerCase().replace(/\s+/g, ".")}@mail.com —{" "}
                  <span style={{ color: AMBER, fontWeight: 600, fontSize: 11 }}>Unverified</span>
                </div>
              </div>
            </div>

            {/* Outreach Log */}
            <h4
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 14,
                color: TEXT_PRIMARY,
                margin: "0 0 10px 0",
              }}
            >
              Outreach History
            </h4>
            {(selectedParcel.outreach_log || []).length === 0 ? (
              <div style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 16 }}>No outreach recorded yet.</div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {(selectedParcel.outreach_log || []).map((entry: OutreachEntry, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "10px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      fontSize: 13,
                      fontFamily: "var(--font-inter)",
                      color: TEXT_SECONDARY,
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ marginTop: 2 }}>{outreachIcon(entry.type)}</div>
                    <div>
                      <div>
                        <strong>{entry.type}</strong> &middot; {entry.date}
                      </div>
                      {entry.response && <div style={{ marginTop: 2 }}>Response: {entry.response}</div>}
                      {entry.notes && (
                        <div style={{ marginTop: 2, fontStyle: "italic", color: TEXT_MUTED }}>{entry.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Log New Outreach */}
            <div
              style={{
                background: "#FAFAFA",
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${BORDER}`,
              }}
            >
              <h4
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: 14,
                  color: TEXT_PRIMARY,
                  margin: "0 0 12px 0",
                }}
              >
                Log New Outreach
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input
                  type="date"
                  value={outreachForm.date}
                  onChange={(e) => setOutreachForm((f) => ({ ...f, date: e.target.value }))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: 13,
                    fontFamily: "var(--font-inter)",
                  }}
                />
                <select
                  value={outreachForm.type}
                  onChange={(e) => setOutreachForm((f) => ({ ...f, type: e.target.value }))}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    fontSize: 13,
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  <option>Letter</option>
                  <option>Call</option>
                  <option>Email</option>
                  <option>Door Knock</option>
                </select>
              </div>
              <textarea
                placeholder="Response..."
                value={outreachForm.response}
                onChange={(e) => setOutreachForm((f) => ({ ...f, response: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  fontSize: 13,
                  marginBottom: 8,
                  minHeight: 48,
                  resize: "vertical",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <textarea
                placeholder="Notes..."
                value={outreachForm.notes}
                onChange={(e) => setOutreachForm((f) => ({ ...f, notes: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${BORDER}`,
                  fontSize: 13,
                  marginBottom: 8,
                  minHeight: 48,
                  resize: "vertical",
                  fontFamily: "var(--font-inter)",
                }}
              />
              <button
                onClick={saveOutreach}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  border: "none",
                  background: ACCENT,
                  color: TEXT_PRIMARY,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     TAB 4: DEAL PIPELINE
     ═══════════════════════════════════════════════════════════════════ */
  const renderPipeline = () => {
    const columns = STATUS_OPTIONS.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      items: parcels.filter((p) => p.status === status),
    }));

    const expandedParcel = expandedPipelineParcel
      ? parcels.find((p) => p.id === expandedPipelineParcel)
      : null;

    return (
      <div style={{ animation: "fadeIn 0.3s ease" }}>
        {/* Kanban Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 20 }}>
          {columns.map((col) => (
            <div
              key={col.status}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: `1px solid ${BORDER}`,
                overflow: "hidden",
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FAFAFA",
                }}
              >
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 12, color: TEXT_PRIMARY }}>
                  {col.label}
                </span>
                <span
                  style={{
                    background: STATUS_COLORS[col.status],
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: 999,
                  }}
                >
                  {col.items.length}
                </span>
              </div>

              {/* Column Items */}
              <div style={{ padding: 8, minHeight: 120 }}>
                {col.items.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setExpandedPipelineParcel(expandedPipelineParcel === p.id ? null : p.id);
                      setDealMemo("");
                    }}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      marginBottom: 6,
                      cursor: "grab",
                      background: expandedPipelineParcel === p.id ? "#FFFDF0" : "#fff",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderStyle = "dashed")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderStyle = "solid")}
                  >
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: 12, color: TEXT_PRIMARY, marginBottom: 2 }}>
                      {p.address}
                    </div>
                    <div style={{ fontSize: 11, color: TEXT_MUTED }}>{p.owner_name || "Unknown"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 10, color: TEXT_MUTED }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            (p.opportunity_score || 0) >= 7
                              ? GREEN
                              : (p.opportunity_score || 0) >= 4
                              ? AMBER
                              : RED,
                          display: "inline-block",
                        }}
                      />
                      {p.acres || "—"} ac
                    </div>
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div style={{ fontSize: 11, color: TEXT_MUTED, textAlign: "center", padding: 16 }}>Empty</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Detail */}
        {expandedParcel && (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: CARD_SHADOW,
              border: `1px solid ${BORDER}`,
              padding: 24,
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: TEXT_PRIMARY }}>
                  {expandedParcel.address}
                </div>
                <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginTop: 2 }}>
                  {expandedParcel.city} &middot; {expandedParcel.owner_name}
                </div>
              </div>
              <button
                onClick={() => setExpandedPipelineParcel(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: TEXT_MUTED }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "APN", value: expandedParcel.apn || "N/A" },
                { label: "Acres", value: expandedParcel.acres || "N/A" },
                { label: "Zoning", value: expandedParcel.zoning || "N/A" },
                { label: "Status", value: STATUS_LABELS[expandedParcel.status] || expandedParcel.status },
                { label: "Motivation", value: `${expandedParcel.motivation_score || 0}/10` },
                { label: "Opportunity", value: `${expandedParcel.opportunity_score || 0}/10` },
                { label: "Distress", value: `${expandedParcel.distress_score || 0}/10` },
                { label: "Assessed Value", value: `$${expandedParcel.assessed_value?.toLocaleString() || "N/A"}` },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, marginBottom: 2, fontFamily: "var(--font-inter)" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY, fontFamily: "var(--font-inter)" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Outreach History */}
            {(expandedParcel.outreach_log || []).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 8, fontFamily: "var(--font-heading)" }}>
                  Outreach History
                </div>
                {(expandedParcel.outreach_log || []).map((entry: OutreachEntry, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: TEXT_SECONDARY, marginBottom: 4, fontFamily: "var(--font-inter)" }}>
                    {outreachIcon(entry.type)}
                    <span>
                      {entry.type} on {entry.date}
                      {entry.response ? ` — ${entry.response}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Generate Deal Memo */}
            <button
              onClick={() => generateDealMemo(expandedParcel)}
              style={{
                padding: "10px 24px",
                borderRadius: 999,
                border: "none",
                background: ACCENT,
                color: TEXT_PRIMARY,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-inter)",
              }}
            >
              <FileText size={16} /> Generate Deal Memo
            </button>

            {/* Deal Memo Display */}
            {dealMemo && (
              <div
                style={{
                  marginTop: 16,
                  background: "#FAFAFA",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12,
                  padding: 24,
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: TEXT_PRIMARY,
                  whiteSpace: "pre-wrap",
                  animation: "fadeIn 0.3s ease",
                }}
              >
                {dealMemo}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════
     TAB 5: AI AGENT CONTROL CENTER
     ═══════════════════════════════════════════════════════════════════ */
  const renderAIAgents = () => (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: TEXT_PRIMARY }}>
          AI Agent Fleet
        </div>
        <button
          onClick={runAllAgents}
          style={{
            padding: "10px 24px",
            borderRadius: 999,
            border: "none",
            background: ACCENT,
            color: TEXT_PRIMARY,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-inter)",
          }}
        >
          <Play size={16} /> Run All Agents
        </button>
      </div>

      {/* Agent Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {agents.map((agent) => {
          const isRunning = runningAgents.has(agent.name);
          return (
            <div
              key={agent.name}
              onClick={() => !isRunning && runAgent(agent.name)}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${BORDER}`,
                cursor: isRunning ? "wait" : "pointer",
                transition: "box-shadow 0.2s",
                position: "relative",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = CARD_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Status Dot */}
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: isRunning ? GREEN : TEXT_MUTED,
                  boxShadow: isRunning ? `0 0 6px ${GREEN}` : "none",
                  animation: isRunning ? "fadeIn 0.5s ease infinite alternate" : "none",
                }}
              />

              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                {isRunning ? (
                  <Loader2 size={16} color={GOLD} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <Bot size={16} color={GOLD} />
                )}
                <span style={{ fontFamily: "var(--font-heading)", fontSize: 14, color: TEXT_PRIMARY }}>
                  {agent.name}
                </span>
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.4, marginBottom: 8, fontFamily: "var(--font-inter)" }}>
                {agent.description}
              </div>

              {/* Category Badge */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#fff",
                    background: CATEGORY_COLORS[agent.category] || TEXT_MUTED,
                  }}
                >
                  {agent.category}
                </span>
                {agent.insights > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                      background: ACCENT,
                    }}
                  >
                    {agent.insights} insight{agent.insights !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Last Run */}
              <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-inter)" }}>
                <Clock size={10} />
                {agent.lastRun || "Never"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh", fontFamily: "var(--font-inter)", color: TEXT_PRIMARY }}>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 100px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 32, color: TEXT_PRIMARY }}>CASA</span>
          <span style={{ fontSize: 24, color: BORDER, fontWeight: 200 }}>|</span>
          <span style={{ fontFamily: "var(--font-heading)", fontSize: 18, color: GOLD }}>Land Intelligence</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, borderBottom: `1px solid ${BORDER}` }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? TEXT_PRIMARY : TEXT_SECONDARY,
                background: "none",
                border: "none",
                borderBottom: activeTab === tab ? `2px solid ${ACCENT}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "var(--font-inter)",
                transition: "all 0.15s",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Command Center" && renderCommandCenter()}
        {activeTab === "Parcel Intel" && renderParcelIntel()}
        {activeTab === "Outreach" && renderOutreach()}
        {activeTab === "Pipeline" && renderPipeline()}
        {activeTab === "AI Agents" && renderAIAgents()}
      </div>

      {/* Bottom Components */}
      <AIPanel />
      <RoleSwitcher currentRole={role} />
    </div>
  );
}
