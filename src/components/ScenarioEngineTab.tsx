"use client";

import { useState, useEffect } from "react";
import { Zap, TrendingUp, Shield, DollarSign, AlertTriangle, ChevronDown, ChevronUp, BarChart3, Target, Users, Loader2, Download } from "lucide-react";
import { getProperties } from "@/lib/portfolio";
import type { PortfolioProperty } from "@/lib/types";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BORDER = "#EEEEEE";
const CARD = "0 4px 24px rgba(0,0,0,0.06)";

type Priority = "cashflow" | "growth" | "safety" | "balanced";

function AnimNum({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 900; const start = performance.now(); let f: number;
    function tick(now: number) { const p = Math.min((now - start) / dur, 1); setV(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) f = requestAnimationFrame(tick); }
    f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f);
  }, [value]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

function riskColor(r: string) { return r === "low" ? "#10b981" : r === "medium" ? "#f59e0b" : "#ef4444"; }
function riskBg(r: string) { return r === "low" ? "#ecfdf5" : r === "medium" ? "#fffbeb" : "#fef2f2"; }
function stratColor(s: string) { return s === "cash_flow" ? "#3b82f6" : s === "growth" ? "#8b5cf6" : s === "safety" ? "#10b981" : GOLD; }

const AGENT_ICONS: Record<string, any> = { conservative: Shield, growth: TrendingUp, cashflow: DollarSign, risk: AlertTriangle };
const AGENT_COLORS: Record<string, string> = { conservative: "#10b981", growth: "#8b5cf6", cashflow: "#3b82f6", risk: "#ef4444" };

export default function ScenarioEngineTab() {
  const [rent, setRent] = useState(2800);
  const [debt, setDebt] = useState(2100);
  const [expenses, setExpenses] = useState(400);
  const [value, setValue] = useState(680000);
  const [vacancy, setVacancy] = useState(5);
  const [priority, setPriority] = useState<Priority>("balanced");
  const [portfolioMode, setPortfolioMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [agents, setAgents] = useState<any>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [properties] = useState<PortfolioProperty[]>(() => getProperties());

  async function runScenarios() {
    setLoading(true);
    setScenarios([]);
    setAgents(null);
    try {
      const body: any = { rent, debt, expenses, value, vacancy, priority };
      if (portfolioMode && properties.length > 0) {
        body.portfolio = properties.map(p => ({ address: p.address, value: p.estimated_value, rent: p.monthly_rent }));
      }
      const res = await fetch("/api/scenarios", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.scenarios) setScenarios(data.scenarios);
      if (data.agents) setAgents(data.agents);
    } catch { /* silent */ }
    setLoading(false);
  }

  const monthly = rent * (1 - vacancy / 100) - debt - expenses;
  const annual = monthly * 12;
  const equity = value * 0.25;
  const coc = equity > 0 ? ((annual / equity) * 100).toFixed(1) : "0";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 28, color: TX }}>Scenario Engine</h2>
          <p className="text-sm mt-1" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>10 investment strategies ranked by your priority</p>
        </div>
        <div className="flex items-center gap-2">
          {properties.length > 0 && (
            <button
              onClick={() => setPortfolioMode(!portfolioMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all"
              style={{
                backgroundColor: portfolioMode ? ACCENT : "transparent",
                color: portfolioMode ? TX : TX2,
                border: `1px solid ${portfolioMode ? ACCENT : BORDER}`,
                fontFamily: "var(--font-inter)",
              }}
            >
              <Users className="w-3 h-3" />
              Portfolio Mode {portfolioMode && `(${properties.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Input Card */}
      <div className="rounded-2xl p-5 mb-5" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: CARD }}>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4" style={{ color: GOLD }} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, color: GOLD }}>Your Property Numbers</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { label: "Monthly Rent", val: rent, set: setRent, ph: "2,800" },
            { label: "Monthly Debt", val: debt, set: setDebt, ph: "2,100" },
            { label: "Monthly Expenses", val: expenses, set: setExpenses, ph: "400" },
            { label: "Property Value", val: value, set: setValue, ph: "680,000" },
            { label: "Vacancy %", val: vacancy, set: setVacancy, ph: "5" },
          ].map((inp) => (
            <div key={inp.label}>
              <label className="text-[9px] uppercase tracking-widest block mb-1" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>{inp.label}</label>
              <div className="relative">
                {inp.label !== "Vacancy %" && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#ccc" }}>$</span>}
                <input type="number" value={inp.val || ""} onChange={(e) => inp.set(Number(e.target.value))} placeholder={inp.ph}
                  className={`w-full ${inp.label !== "Vacancy %" ? "pl-7" : "pl-3"} pr-3 py-2.5 rounded-xl text-sm focus:outline-none`}
                  style={{ border: `1px solid ${BORDER}`, fontFamily: "var(--font-geist-mono)", color: TX }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Current metrics */}
        <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl" style={{ backgroundColor: "#FAFAFA" }}>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Monthly Cash Flow</p>
            <p className="text-lg font-bold" style={{ color: monthly >= 0 ? "#10b981" : "#ef4444", fontFamily: "var(--font-heading)" }}>${monthly.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Annual NOI</p>
            <p className="text-lg font-bold" style={{ color: TX, fontFamily: "var(--font-heading)" }}>${annual.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Cash on Cash</p>
            <p className="text-lg font-bold" style={{ color: GOLD, fontFamily: "var(--font-heading)" }}>{coc}%</p>
          </div>
        </div>

        {/* Priority + Run */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-widest shrink-0" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>Optimize:</span>
          {(["cashflow", "growth", "safety", "balanced"] as Priority[]).map((p) => (
            <button key={p} onClick={() => setPriority(p)}
              className="px-3 py-1.5 rounded-full text-[10px] font-semibold capitalize transition-all"
              style={{ backgroundColor: priority === p ? ACCENT : "transparent", color: priority === p ? TX : TX2, border: `1px solid ${priority === p ? ACCENT : BORDER}`, fontFamily: "var(--font-inter)" }}>
              {p === "cashflow" ? "Cash Flow" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
          <button onClick={runScenarios} disabled={loading || !rent}
            className="ml-auto px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:brightness-95 disabled:opacity-40 flex items-center gap-2"
            style={{ backgroundColor: ACCENT, color: TX, fontFamily: "var(--font-inter)" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Run 10 Scenarios
          </button>
        </div>
      </div>

      {/* Agent Perspectives */}
      {agents && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5" style={{ animation: "fadeIn 0.4s ease" }}>
          {(["conservative", "growth", "cashflow", "risk"] as const).map((a) => {
            const Icon = AGENT_ICONS[a];
            const color = AGENT_COLORS[a];
            const data = agents[a];
            if (!data) return null;
            return (
              <div key={a} className="rounded-2xl p-4" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: CARD, borderTop: `3px solid ${color}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-xs font-bold capitalize" style={{ color, fontFamily: "var(--font-inter)" }}>{a} Agent</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: TX2, fontFamily: "var(--font-inter)", lineHeight: 1.5 }}>{data.verdict}</p>
                <div className="px-2 py-1 rounded-full inline-block text-[9px] font-bold" style={{ backgroundColor: `${color}15`, color, fontFamily: "var(--font-geist-mono)" }}>
                  PICK: {data.pick}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consensus */}
      {agents?.consensus && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3" style={{ backgroundColor: "#FFFBF0", border: `1px solid ${ACCENT}40`, boxShadow: "0 4px 24px rgba(249,217,106,0.12)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: ACCENT }}>
            <Zap className="w-5 h-5" style={{ color: TX }} />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>AI Consensus</span>
            <p className="text-sm font-semibold" style={{ color: TX, fontFamily: "var(--font-inter)" }}>
              All 4 agents agree: <span style={{ color: GOLD }}>{agents.consensus}</span> is the best strategy for your situation.
            </p>
          </div>
        </div>
      )}

      {/* Scenario Cards */}
      {scenarios.length > 0 && (
        <div className="space-y-2" style={{ animation: "fadeIn 0.4s ease" }}>
          {/* Cash flow impact chart */}
          <div className="rounded-2xl p-5 mb-4" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: CARD }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" style={{ color: GOLD }} />
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 16, color: GOLD }}>Cash Flow Impact</span>
            </div>
            <div className="space-y-2">
              {scenarios.map((s: any) => {
                const max = Math.max(...scenarios.map((x: any) => Math.abs(x.monthly_cash_flow_change || 0)), 1);
                const pct = Math.abs(s.monthly_cash_flow_change || 0) / max * 100;
                const positive = (s.monthly_cash_flow_change || 0) >= 0;
                return (
                  <div key={s.rank} className="flex items-center gap-3">
                    <span className="text-[10px] w-36 truncate shrink-0" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>{s.name}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#f5f5f5" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: positive ? "#10b981" : "#ef4444", transition: "width 0.8s ease" }} />
                    </div>
                    <span className="text-[10px] font-bold w-16 text-right" style={{ color: positive ? "#10b981" : "#ef4444", fontFamily: "var(--font-geist-mono)" }}>
                      {positive ? "+" : ""}${(s.monthly_cash_flow_change || 0).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scenario cards */}
          {scenarios.map((s: any) => {
            const isExp = expanded === s.rank;
            const isTop = s.rank <= 3;
            return (
              <div key={s.rank} className="rounded-2xl overflow-hidden transition-all"
                style={{ border: `1px solid ${isTop ? ACCENT : BORDER}`, boxShadow: isTop ? "0 4px 24px rgba(249,217,106,0.12)" : CARD }}>
                <button onClick={() => setExpanded(isExp ? null : s.rank)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 transition-colors"
                  style={{ backgroundColor: isExp ? "#FFFBF0" : "#fff" }}>
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ backgroundColor: isTop ? ACCENT : "#f5f5f5", color: isTop ? TX : TX2, fontFamily: "var(--font-geist-mono)" }}>{s.rank}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold" style={{ color: TX, fontFamily: "var(--font-inter)" }}>{s.name}</span>
                      <span className="text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${stratColor(s.strategy_type)}15`, color: stratColor(s.strategy_type), fontFamily: "var(--font-geist-mono)" }}>
                        {(s.strategy_type || "").replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] truncate" style={{ color: TX2 }}>{s.recommendation?.split(".")[0]}.</p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[7px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>CASH FLOW</p>
                      <p className="text-sm font-bold" style={{ color: (s.monthly_cash_flow_change || 0) >= 0 ? "#10b981" : "#ef4444", fontFamily: "var(--font-geist-mono)" }}>
                        {(s.monthly_cash_flow_change || 0) >= 0 ? "+" : ""}$<AnimNum value={Math.abs(s.monthly_cash_flow_change || 0)} />/mo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>CoC</p>
                      <p className="text-sm font-bold" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>{s.cash_on_cash_return || 0}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>RISK</p>
                      <p className="text-[10px] font-bold uppercase" style={{ color: riskColor(s.risk_level), fontFamily: "var(--font-geist-mono)" }}>{s.risk_level}</p>
                    </div>
                    {isExp ? <ChevronUp className="w-4 h-4" style={{ color: "#ccc" }} /> : <ChevronDown className="w-4 h-4" style={{ color: "#ccc" }} />}
                  </div>
                </button>

                {isExp && (
                  <div className="px-5 pb-4 pt-2 space-y-3" style={{ borderTop: `1px solid ${BORDER}`, animation: "fadeIn 0.2s ease" }}>
                    <p className="text-xs leading-relaxed" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>{s.recommendation}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Annual NOI Change", val: `${(s.annual_noi_change || 0) >= 0 ? "+" : ""}$${(s.annual_noi_change || 0).toLocaleString()}`, color: (s.annual_noi_change || 0) >= 0 ? "#10b981" : "#ef4444" },
                        { label: "New Property Value", val: `$${(s.new_property_value || 0).toLocaleString()}`, color: TX },
                        { label: "Upfront Cost", val: s.upfront_cost ? `$${s.upfront_cost.toLocaleString()}` : "$0", color: TX2 },
                        { label: "Payback Period", val: s.payback_period_months ? `${s.payback_period_months} months` : "Immediate", color: TX2 },
                      ].map((m) => (
                        <div key={m.label} className="px-3 py-2 rounded-xl" style={{ backgroundColor: "#FAFAFA" }}>
                          <span className="text-[8px] uppercase tracking-widest block" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>{m.label}</span>
                          <span className="text-sm font-bold" style={{ color: m.color, fontFamily: "var(--font-geist-mono)" }}>{m.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase tracking-widest" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Timeline: {s.time_to_implement}</span>
                      <span className="text-[9px] uppercase tracking-widest" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Confidence: {s.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Download button */}
          <div className="text-center pt-3">
            <button className="px-5 py-2 rounded-full text-[10px] font-semibold flex items-center gap-1.5 mx-auto opacity-50 cursor-not-allowed"
              style={{ border: `1px solid ${BORDER}`, color: TX2, fontFamily: "var(--font-inter)" }} title="Coming soon">
              <Download className="w-3.5 h-3.5" /> Download Report — Coming Soon
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && scenarios.length === 0 && (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: "#eee" }} />
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: 24, color: TX, fontWeight: 600 }}>Enter your numbers above</h3>
          <p className="text-sm mt-2" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>
            The Scenario Engine will generate 10 ranked strategies<br />optimized for your chosen priority
          </p>
        </div>
      )}
    </div>
  );
}
