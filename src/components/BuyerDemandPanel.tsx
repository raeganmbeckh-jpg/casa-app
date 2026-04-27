"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Hammer, Key, Building2, Palmtree, ClipboardList, Loader2, TrendingUp, AlertTriangle, Users, DollarSign } from "lucide-react";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BORDER = "#EEEEEE";

const ICON_MAP: Record<string, any> = { home: Home, hammer: Hammer, key: Key, building: Building2, palmtree: Palmtree, clipboard: ClipboardList };

function verdictColor(v: string) {
  if (v === "Strong Interest") return "#10b981";
  if (v === "Moderate Interest") return "#f59e0b";
  if (v === "Low Interest") return "#9B9B9B";
  return "#ef4444";
}
function verdictBg(v: string) {
  if (v === "Strong Interest") return "#ecfdf5";
  if (v === "Moderate Interest") return "#fffbeb";
  if (v === "Low Interest") return "#f9fafb";
  return "#fef2f2";
}

function AnimNum({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 1000; const start = performance.now(); let f: number;
    function tick(now: number) { const p = Math.min((now - start) / dur, 1); setV(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) f = requestAnimationFrame(tick); }
    f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f);
  }, [value]);
  return <>{prefix}{v.toLocaleString()}</>;
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 100); return () => clearTimeout(t); }, [score]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#f0f0f0", width: 80 }}>
      <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color, transition: "width 0.8s ease" }} />
    </div>
  );
}

export default function BuyerDemandPanel({ address, propertyData, rentcastData, quantumResult }: {
  address: string;
  propertyData: any;
  rentcastData?: any;
  quantumResult?: any;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);
  const lastAddress = useRef("");

  useEffect(() => {
    if (address !== lastAddress.current) hasFetched.current = false;
  }, [address]);

  useEffect(() => {
    if (!address || !propertyData) return;
    if (lastAddress.current === address) return;
    if (hasFetched.current) return;

    hasFetched.current = true;
    lastAddress.current = address;

    const run = async () => {
      setLoading(true);
      setData(null);
      try {
        const res = await fetch("/api/buyer-demand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyData,
            rentcastData: rentcastData || {},
            quantumResult: quantumResult || {},
            propertyId: propertyData?.basic?.identifier?.apn || propertyData?.detail?.identifier?.apn || address,
          }),
        });
        const d = await res.json();
        if (!d.error) setData(d);
      } catch { /* silent */ }
      setLoading(false);
    };
    run();
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && !data) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderLeft: "4px solid #8b5cf6" }}>
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: "#8b5cf6" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: TX }}>Buyer Demand Simulator</span>
          </div>
          {data?._cached && <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#f0f0f0", color: "#999", fontFamily: "var(--font-geist-mono)" }}>cached</span>}
        </div>
        <p className="text-[11px]" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>Who wants this property, what would they pay, and why might they pass?</p>
        <p className="text-[9px] mt-1" style={{ color: "#bbb", fontFamily: "var(--font-geist-mono)" }}>Powered by CASA Intelligence Engine · 6 buyer archetypes</p>
      </div>

      {loading && !data && (
        <div className="px-5 py-8 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: "#8b5cf6" }} />
          <p className="text-xs" style={{ color: TX2 }}>Simulating buyer demand across 6 archetypes...</p>
        </div>
      )}

      {data && (
        <div className="p-5 space-y-5" style={{ animation: "fadeIn 0.4s ease" }}>
          {/* KPI strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Demand Score</p>
              <p className="text-2xl font-bold" style={{ color: (data.overall_demand_score || 0) >= 60 ? "#10b981" : "#f59e0b", fontFamily: "var(--font-heading)" }}>
                <AnimNum value={data.overall_demand_score || 0} />
              </p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Median Bid</p>
              <p className="text-2xl font-bold" style={{ color: TX, fontFamily: "var(--font-heading)" }}>
                <AnimNum value={data.median_bid || 0} prefix="$" />
              </p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Bid Range</p>
              <p className="text-sm font-bold" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>
                ${(data.bid_range?.low || 0).toLocaleString()} – ${(data.bid_range?.high || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>Pass Rate</p>
              <p className="text-2xl font-bold" style={{ color: (data.pass_rate || 0) > 50 ? "#ef4444" : "#10b981", fontFamily: "var(--font-heading)" }}>
                <AnimNum value={data.pass_rate || 0} /><span className="text-sm">%</span>
              </p>
            </div>
          </div>

          {/* Best fit callout */}
          {data.best_fit_buyer && (
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFBF0", border: `1px solid ${ACCENT}40` }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>Best Fit Buyer</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: TX, fontFamily: "var(--font-inter)" }}>{data.best_fit_buyer}</p>
              <p className="text-xs mt-0.5" style={{ color: TX2 }}>{data.best_fit_reason}</p>
            </div>
          )}

          {/* Archetype cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data.archetypes || []).map((a: any, i: number) => {
              const Icon = ICON_MAP[a.icon] || Home;
              const vc = verdictColor(a.verdict);
              const vb = verdictBg(a.verdict);
              return (
                <div key={i} className="p-4 rounded-xl transition-all" style={{ border: `1px solid ${BORDER}`, backgroundColor: "#fff" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(249,217,106,0.12)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${vc}15` }}>
                        <Icon className="w-4 h-4" style={{ color: vc }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: TX, fontFamily: "var(--font-inter)" }}>{a.name}</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: vb, color: vc, fontFamily: "var(--font-geist-mono)" }}>{a.verdict}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] uppercase" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>Interest</p>
                      <div className="flex items-center gap-2">
                        <ScoreBar score={a.interest_score || 0} color={vc} />
                        <span className="text-xs font-bold" style={{ color: vc, fontFamily: "var(--font-geist-mono)" }}>{a.interest_score}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] mb-2" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>{a.key_reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>
                      <DollarSign className="w-3 h-3 inline" />{(a.estimated_bid || 0).toLocaleString()}
                    </span>
                    {a.deal_breakers?.length > 0 && (
                      <span className="text-[9px] flex items-center gap-1" style={{ color: "#ef4444" }}>
                        <AlertTriangle className="w-3 h-3" />{a.deal_breakers.length} concern{a.deal_breakers.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deal breakers */}
          {data.top_deal_breakers?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#ef4444", fontFamily: "var(--font-geist-mono)" }}>Top Deal Breakers</p>
              <div className="space-y-1.5">
                {data.top_deal_breakers.map((db: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#ef4444" }} />
                    <span className="text-[11px]" style={{ color: "#991b1b", fontFamily: "var(--font-inter)" }}>{db}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consensus + Insight */}
          {data.consensus && (
            <div className="p-4 rounded-xl" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <p className="text-xs leading-relaxed mb-2" style={{ color: TX, fontFamily: "var(--font-inter)" }}>{data.consensus}</p>
              {data.market_insight && (
                <p className="text-[11px] font-semibold" style={{ color: GOLD, fontFamily: "var(--font-inter)" }}>
                  <TrendingUp className="w-3 h-3 inline mr-1" />{data.market_insight}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
