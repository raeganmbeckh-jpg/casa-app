"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Shield, Zap, DollarSign, Home, Sun, ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BORDER = "#EEEEEE";

type Priority = "cashflow" | "growth" | "safety";

interface Scenario {
  rank: number;
  label: string;
  tag: string;
  tagColor: string;
  action: string;
  noiDelta: number;
  cashOnCash: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  projectedValue?: number;
  totalReturn?: number;
  details: string;
  icon: any;
}

function riskColor(r: string) {
  return r === "LOW" ? "#10b981" : r === "MEDIUM" ? "#f59e0b" : "#ef4444";
}

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 800;
    const start = performance.now();
    let f: number;
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      setV(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) f = requestAnimationFrame(tick);
    }
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [value]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

function generateScenarios(rent: number, debt: number, expenses: number, value: number, yearBuilt: number, priority: Priority): Scenario[] {
  const monthlyNOI = rent - debt - expenses;
  const annualNOI = monthlyNOI * 12;
  const equity = value * 0.25; // assume 25% equity
  const currentCoC = equity > 0 ? (annualNOI / equity) * 100 : 0;
  const age = new Date().getFullYear() - (yearBuilt || 1980);

  const scenarios: Scenario[] = [
    {
      rank: 0, label: "Raise Rent + ADU", tag: "BEST RISK/REWARD", tagColor: "#10b981",
      action: `Raise rent $150/mo + build ADU generating $1,800/mo`,
      noiDelta: (150 + 1800) * 12, cashOnCash: ((annualNOI + (150 + 1800) * 12) / equity) * 100,
      risk: "LOW", details: "ADU adds a second income stream with minimal downside. Rent increase is within 5% market tolerance.",
      icon: Home,
    },
    {
      rank: 0, label: "Refinance to 30yr Fixed", tag: "STRONG CASH FLOW", tagColor: "#3b82f6",
      action: `Refinance to reduce payment by ~$340/mo at current rates`,
      noiDelta: 340 * 12, cashOnCash: ((annualNOI + 340 * 12) / equity) * 100,
      risk: "LOW", details: "Locking a 30yr fixed eliminates rate risk. Payment reduction flows directly to cash flow.",
      icon: DollarSign,
    },
    {
      rank: 0, label: "Solar + Rent Increase", tag: "AGGRESSIVE GROWTH", tagColor: "#8b5cf6",
      action: `Install solar ($18K, 6yr payback) + raise rent $200/mo`,
      noiDelta: 200 * 12 + 1200, cashOnCash: ((annualNOI + 200 * 12 + 1200) / equity) * 100,
      risk: "MEDIUM", details: "Solar reduces utility cost by ~$100/mo and adds $15K to property value. Combined with rent increase for strong returns.",
      icon: Sun,
    },
    {
      rank: 0, label: "Conservative Hold", tag: "SAFE HARBOR", tagColor: "#10b981",
      action: `No changes, hold 5 years with 4% annual appreciation`,
      noiDelta: 0, cashOnCash: currentCoC,
      risk: "LOW", projectedValue: Math.round(value * Math.pow(1.04, 5)), totalReturn: Math.round((Math.pow(1.04, 5) - 1) * 100),
      details: "Minimal effort strategy. San Diego market projected to appreciate 3-5% annually. Steady cash flow continues.",
      icon: Shield,
    },
    {
      rank: 0, label: "BRRRR Exit", tag: "EQUITY PLAY", tagColor: "#f59e0b",
      action: `Cash-out refi at 75% LTV → pull $${Math.round(value * 0.75 * 0.001)}K → reinvest`,
      noiDelta: -Math.round(value * 0.75 * 0.005) * 12, cashOnCash: ((annualNOI - value * 0.75 * 0.005 * 12) / (equity * 0.3)) * 100,
      risk: "MEDIUM", details: "Extract equity to acquire next property. Higher leverage increases both returns and risk.",
      icon: ArrowUpRight,
    },
    {
      rank: 0, label: "Kitchen/Bath Reno", tag: "VALUE ADD", tagColor: "#8b5cf6",
      action: `$35K renovation → raise rent $400/mo + value increase $60K`,
      noiDelta: 400 * 12, cashOnCash: ((annualNOI + 400 * 12) / (equity + 35000)) * 100,
      risk: "MEDIUM", projectedValue: value + 60000,
      details: "Kitchen and bath renovations in San Diego yield 150-170% ROI. Rent increase justified by market comps.",
      icon: Home,
    },
    {
      rank: 0, label: "Short-Term Rental", tag: "HIGH UPSIDE", tagColor: "#ef4444",
      action: `Convert to Airbnb — projected $4,800/mo gross`,
      noiDelta: (4800 - rent) * 12, cashOnCash: ((4800 - expenses - 800) * 12 / equity) * 100,
      risk: "HIGH", details: "STR revenue 70% higher but requires permits, furnishing ($15K), and active management. Regulatory risk in San Diego.",
      icon: Zap,
    },
    {
      rank: 0, label: "1031 Exchange", tag: "TAX STRATEGY", tagColor: "#3b82f6",
      action: `Sell at $${Math.round(value / 1000)}K → 1031 into multifamily`,
      noiDelta: 0, cashOnCash: 0,
      risk: "LOW", projectedValue: Math.round(value * 2.2), totalReturn: 120,
      details: "Defer capital gains via 1031. Trade into a 4-plex for doubled cash flow and appreciation leverage.",
      icon: TrendingUp,
    },
    {
      rank: 0, label: "Proactive Maintenance", tag: "RISK REDUCTION", tagColor: "#10b981",
      action: age > 20 ? `Replace HVAC ($13K) + Roof ($16K) — save $12K vs emergency` : `Schedule deferred maintenance — prevent emergency costs`,
      noiDelta: age > 20 ? 1000 * 12 : 500 * 12, cashOnCash: currentCoC + 0.5,
      risk: "LOW", details: age > 20 ? "Systems are aging. Proactive replacement saves 35-40% vs emergency and protects tenant retention." : "Preventive maintenance reduces vacancy risk and extends system life.",
      icon: Shield,
    },
    {
      rank: 0, label: "Raise Rent to Market", tag: "QUICK WIN", tagColor: GOLD,
      action: `Raise rent $100/mo to match comparable properties`,
      noiDelta: 100 * 12, cashOnCash: ((annualNOI + 1200) / equity) * 100,
      risk: "LOW", details: "Market comps support a $100 increase. Low risk of tenant turnover at this level. Immediate NOI impact.",
      icon: DollarSign,
    },
  ];

  // Rank by priority
  if (priority === "cashflow") {
    scenarios.sort((a, b) => b.cashOnCash - a.cashOnCash);
  } else if (priority === "growth") {
    scenarios.sort((a, b) => b.noiDelta - a.noiDelta);
  } else {
    // safety: LOW risk first, then by cash on cash
    const riskOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
    scenarios.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || b.cashOnCash - a.cashOnCash);
  }

  return scenarios.map((s, i) => ({ ...s, rank: i + 1 }));
}

export default function ScenarioEngine({ propertyData }: { propertyData: any }) {
  const [rent, setRent] = useState(0);
  const [debt, setDebt] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [priority, setPriority] = useState<Priority>("cashflow");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showEngine, setShowEngine] = useState(false);

  const prop = propertyData?.detail || propertyData?.basic;
  const value = prop?.assessment?.market?.mktTtlValue || prop?.assessment?.assessed?.assdTtlValue || 500000;
  const yearBuilt = prop?.summary?.yearbuilt || 1980;

  function calculate() {
    if (!rent) return;
    setScenarios(generateScenarios(rent, debt, expenses, value, yearBuilt, priority));
    setShowEngine(true);
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderLeft: "4px solid #F9D96A" }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: GOLD }} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: TX }}>Scenario Engine</span>
        </div>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: "#CCCCCC", fontFamily: "var(--font-geist-mono)" }}>10 STRATEGIES RANKED</span>
      </div>

      {/* Inputs */}
      <div className="p-5">
        <p className="text-xs mb-4" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>Enter your numbers to generate 10 ranked investment strategies</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Monthly Rent", val: rent, set: setRent, placeholder: "2,800" },
            { label: "Monthly Debt", val: debt, set: setDebt, placeholder: "2,100" },
            { label: "Monthly Expenses", val: expenses, set: setExpenses, placeholder: "400" },
          ].map((inp) => (
            <div key={inp.label}>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>{inp.label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#ccc" }}>$</span>
                <input
                  type="number"
                  value={inp.val || ""}
                  onChange={(e) => inp.set(Number(e.target.value))}
                  placeholder={inp.placeholder}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ border: `1px solid ${BORDER}`, fontFamily: "var(--font-geist-mono)", color: TX }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Priority selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[9px] uppercase tracking-widest" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>Optimize for:</span>
          {(["cashflow", "growth", "safety"] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize transition-all"
              style={{
                backgroundColor: priority === p ? ACCENT : "transparent",
                color: priority === p ? TX : TX2,
                border: `1px solid ${priority === p ? ACCENT : BORDER}`,
                fontFamily: "var(--font-inter)",
              }}
            >
              {p === "cashflow" ? "Cash Flow" : p === "growth" ? "Growth" : "Safety"}
            </button>
          ))}
          <button
            onClick={calculate}
            className="ml-auto px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:brightness-95"
            style={{ backgroundColor: ACCENT, color: TX, fontFamily: "var(--font-inter)" }}
          >
            Generate
          </button>
        </div>

        {/* Results */}
        {showEngine && scenarios.length > 0 && (
          <div className="space-y-2" style={{ animation: "fadeIn 0.4s ease" }}>
            {scenarios.map((s) => {
              const Icon = s.icon;
              const isExpanded = expanded === s.rank;
              return (
                <div
                  key={s.rank}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{
                    border: `1px solid ${s.rank === 1 ? ACCENT : BORDER}`,
                    boxShadow: s.rank === 1 ? "0 4px 24px rgba(249,217,106,0.15)" : undefined,
                  }}
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : s.rank)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                    style={{ backgroundColor: isExpanded ? "#FFFBF0" : "#fff" }}
                  >
                    {/* Rank */}
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: s.rank === 1 ? ACCENT : "#f5f5f5",
                        color: s.rank === 1 ? TX : TX2,
                        fontFamily: "var(--font-geist-mono)",
                      }}
                    >
                      {s.rank}
                    </div>

                    {/* Icon */}
                    <Icon className="w-4 h-4 shrink-0" style={{ color: s.tagColor }} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: TX, fontFamily: "var(--font-inter)" }}>{s.label}</span>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${s.tagColor}15`, color: s.tagColor, fontFamily: "var(--font-geist-mono)" }}>{s.tag}</span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>{s.action}</p>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 shrink-0">
                      {s.noiDelta !== 0 && (
                        <div className="text-right">
                          <p className="text-[8px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>NOI</p>
                          <p className="text-sm font-bold" style={{ color: s.noiDelta > 0 ? "#10b981" : "#ef4444", fontFamily: "var(--font-geist-mono)" }}>
                            {s.noiDelta > 0 ? "+" : ""}<AnimatedNumber value={s.noiDelta} prefix="$" suffix="/yr" />
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[8px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>CoC</p>
                        <p className="text-sm font-bold" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>{s.cashOnCash.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>RISK</p>
                        <p className="text-[10px] font-bold" style={{ color: riskColor(s.risk), fontFamily: "var(--font-geist-mono)" }}>{s.risk}</p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4" style={{ color: "#ccc" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#ccc" }} />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1" style={{ borderTop: `1px solid ${BORDER}`, animation: "fadeIn 0.2s ease" }}>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>{s.details}</p>
                      <div className="flex gap-4">
                        {s.projectedValue && (
                          <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: "#f0fdf4", border: "1px solid #a7f3d0" }}>
                            <span className="text-[8px] uppercase block" style={{ color: "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}>Projected Value</span>
                            <span className="text-sm font-bold" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>${s.projectedValue.toLocaleString()}</span>
                          </div>
                        )}
                        {s.totalReturn && (
                          <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: "#FFFBF0", border: `1px solid ${ACCENT}` }}>
                            <span className="text-[8px] uppercase block" style={{ color: "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}>Total Return</span>
                            <span className="text-sm font-bold" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>{s.totalReturn}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
