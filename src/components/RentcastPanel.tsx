"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Home, BarChart3, Loader2, AlertTriangle } from "lucide-react";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const TX = "#1A1A1A";
const TX2 = "#6B6B6B";
const BORDER = "#EEEEEE";

function AnimNum({ value }: { value: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = 900; const start = performance.now(); let f: number;
    function tick(now: number) { const p = Math.min((now - start) / dur, 1); setV(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) f = requestAnimationFrame(tick); }
    f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f);
  }, [value]);
  return <>{v.toLocaleString()}</>;
}

function Sparkline({ data }: { data: { date: string; rent: number }[] }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.rent);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const w = 280;
  const h = 50;
  const points = vals.map((v, i) => `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`).join(" ");

  return (
    <div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w }}>
        <defs>
          <linearGradient id="rentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.3" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#rentGrad)" />
        <polyline points={points} fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {vals.map((v, i) => i === vals.length - 1 ? (
          <circle key={i} cx={(i / (vals.length - 1)) * w} cy={h - ((v - min) / range) * (h - 8) - 4} r={3} fill={GOLD} stroke="#fff" strokeWidth={1.5} />
        ) : null)}
      </svg>
      <div className="flex justify-between text-[8px] mt-1" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

interface RentcastData {
  estimate: { rent: number | null; rentLow: number | null; rentHigh: number | null; confidence: number | null; bedrooms: number | null; bathrooms: number | null; sqft: number | null } | null;
  comps: any[];
  market: { medianRent: number | null; rentGrowth: number | null; vacancyRate: number | null; activeListings: number | null; zipCode: string } | null;
  history: { date: string; rent: number }[];
  sources: string[];
}

export default function RentcastPanel({ address, currentRent }: { address: string; currentRent?: number }) {
  const [data, setData] = useState<RentcastData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/rentcast?address=${encodeURIComponent(address)}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [address]);

  if (loading) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, borderLeft: "4px solid #10b981" }}>
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: GOLD }} />
        <p className="text-xs" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>Loading Rentcast market data...</p>
      </div>
    );
  }

  if (!data || (!data.estimate && !data.market && data.comps.length === 0)) {
    return (
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderLeft: "4px solid #10b981" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: TX }}>Rental Market Intelligence</span>
          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#10b98115", color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>RENTCAST</span>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>Rental market data unavailable for this address.</p>
          <p className="text-xs mt-1" style={{ color: "#aaa", fontFamily: "var(--font-inter)" }}>Rentcast coverage may be limited in some areas. Sales comps from ATTOM are shown above.</p>
        </div>
      </div>
    );
  }

  const est = data.estimate;
  const belowMarket = currentRent && est?.rent && currentRent < est.rent * 0.9;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderLeft: "4px solid #10b981" }}>
      <style jsx global>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: TX }}>Rental Market Intelligence</span>
          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#10b98115", color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>RENTCAST</span>
        </div>
        {belowMarket && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#f59e0b", fontFamily: "var(--font-geist-mono)" }}>Below Market</span>
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* Rent Estimate */}
        {est && est.rent && (
          <div>
            <div className="flex items-end gap-4 mb-3">
              <div>
                <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>Estimated Market Rent</p>
                <p className="text-4xl font-bold" style={{ color: TX, fontFamily: "var(--font-heading)" }}>
                  $<AnimNum value={est.rent} /><span className="text-lg" style={{ color: TX2 }}>/mo</span>
                </p>
              </div>
              {est.confidence && (
                <div className="px-3 py-1 rounded-full" style={{ backgroundColor: `${est.confidence > 70 ? "#10b981" : "#f59e0b"}15`, border: `1px solid ${est.confidence > 70 ? "#10b981" : "#f59e0b"}30` }}>
                  <span className="text-[10px] font-bold" style={{ color: est.confidence > 70 ? "#10b981" : "#f59e0b", fontFamily: "var(--font-geist-mono)" }}>{est.confidence}% confidence</span>
                </div>
              )}
            </div>
            {/* Range bar */}
            {est.rentLow && est.rentHigh && (
              <div>
                <div className="flex justify-between text-[9px] mb-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  <span style={{ color: TX2 }}>${est.rentLow.toLocaleString()}</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>${est.rent.toLocaleString()}</span>
                  <span style={{ color: TX2 }}>${est.rentHigh.toLocaleString()}</span>
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#f0f0f0" }}>
                  <div className="absolute inset-y-0 rounded-full" style={{
                    left: "0%",
                    right: "0%",
                    background: "linear-gradient(90deg, #fde68a, #10b981, #fde68a)",
                  }} />
                  {/* Marker for estimate */}
                  <div className="absolute top-0 bottom-0 w-1 rounded-full" style={{
                    left: `${((est.rent - est.rentLow) / (est.rentHigh - est.rentLow)) * 100}%`,
                    backgroundColor: TX,
                  }} />
                  {/* Marker for current rent if provided */}
                  {currentRent && (
                    <div className="absolute top-0 bottom-0 w-1 rounded-full" style={{
                      left: `${Math.max(0, Math.min(100, ((currentRent - est.rentLow) / (est.rentHigh - est.rentLow)) * 100))}%`,
                      backgroundColor: belowMarket ? "#ef4444" : GOLD,
                    }} />
                  )}
                </div>
                {currentRent && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: belowMarket ? "#ef4444" : GOLD }} />
                    <span className="text-[9px]" style={{ color: belowMarket ? "#ef4444" : TX2, fontFamily: "var(--font-geist-mono)" }}>
                      Your rent: ${currentRent.toLocaleString()}/mo {belowMarket ? `(${Math.round(((est.rent - currentRent) / est.rent) * 100)}% below market)` : "(at market)"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Market Stats */}
        {data.market && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Median Rent", val: data.market.medianRent, prefix: "$", suffix: "", color: TX },
              { label: "Rent Growth", val: data.market.rentGrowth, prefix: "", suffix: "%", color: (data.market.rentGrowth || 0) >= 0 ? "#10b981" : "#ef4444" },
              { label: "Vacancy Rate", val: data.market.vacancyRate, prefix: "", suffix: "%", color: (data.market.vacancyRate || 0) > 8 ? "#ef4444" : "#10b981" },
              { label: "Active Listings", val: data.market.activeListings, prefix: "", suffix: "", color: TX },
            ].map((kpi) => (
              <div key={kpi.label} className="p-3 rounded-xl text-center" style={{ backgroundColor: "#FAFAFA", border: `1px solid ${BORDER}` }}>
                <p className="text-[8px] uppercase tracking-widest mb-1" style={{ color: "#aaa", fontFamily: "var(--font-geist-mono)" }}>{kpi.label}</p>
                <p className="text-xl font-bold" style={{ color: kpi.color, fontFamily: "var(--font-heading)" }}>
                  {kpi.val !== null && kpi.val !== undefined ? `${kpi.prefix}${typeof kpi.val === "number" ? kpi.val.toLocaleString() : kpi.val}${kpi.suffix}` : "—"}
                </p>
                {kpi.label === "Median Rent" && data.market?.zipCode && (
                  <p className="text-[8px]" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>ZIP {data.market.zipCode}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rent History Sparkline */}
        {data.history.length > 1 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest mb-2" style={{ color: TX2, fontFamily: "var(--font-geist-mono)" }}>Rent Trend</p>
            <Sparkline data={data.history} />
          </div>
        )}

        {/* Rental Comps */}
        {data.comps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-4 h-4" style={{ color: "#10b981" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>
                Rental Comps &middot; {data.comps.length} nearby
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
              <table className="w-full text-[11px]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FAFAFA" }}>
                    {["Address", "Beds", "Baths", "Sqft", "Rent", "$/Sqft", "Days"].map((h, i) => (
                      <th key={h} className={`${i === 0 ? "text-left" : "text-right"} px-3 py-2 text-[8px] uppercase tracking-widest`} style={{ color: "#aaa" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.comps.map((c: any, i: number) => (
                    <tr key={i} className="transition-colors" style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFBF0"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = i % 2 === 0 ? "#fff" : "#FAFAFA"; }}>
                      <td className="px-3 py-2 truncate max-w-[180px]" style={{ color: TX }}>{c.address || "—"}</td>
                      <td className="px-3 py-2 text-right" style={{ color: TX2 }}>{c.beds || "—"}</td>
                      <td className="px-3 py-2 text-right" style={{ color: TX2 }}>{c.baths || "—"}</td>
                      <td className="px-3 py-2 text-right" style={{ color: TX2 }}>{c.sqft ? c.sqft.toLocaleString() : "—"}</td>
                      <td className="px-3 py-2 text-right font-bold" style={{ color: "#10b981" }}>{c.rent ? `$${c.rent.toLocaleString()}` : "—"}</td>
                      <td className="px-3 py-2 text-right" style={{ color: GOLD }}>{c.pricePerSqft ? `$${c.pricePerSqft}` : "—"}</td>
                      <td className="px-3 py-2 text-right" style={{ color: TX2 }}>{c.daysOnMarket ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {est?.rent && (
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#FFFBF0", border: `1px solid ${ACCENT}40` }}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GOLD, fontFamily: "var(--font-geist-mono)" }}>Pricing Analysis</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: TX2, fontFamily: "var(--font-inter)" }}>
              {currentRent && belowMarket
                ? `This property is rented at $${currentRent.toLocaleString()}/mo, which is ${Math.round(((est.rent - currentRent) / est.rent) * 100)}% below the Rentcast market estimate of $${est.rent.toLocaleString()}/mo. There is approximately $${Math.round((est.rent - currentRent)).toLocaleString()}/mo in unrealized rental income. Consider a rent increase at lease renewal to capture $${Math.round((est.rent - currentRent) * 12).toLocaleString()}/year in additional revenue.`
                : currentRent
                ? `This property is rented at $${currentRent.toLocaleString()}/mo, which is within range of the Rentcast market estimate of $${est.rent.toLocaleString()}/mo. Pricing is competitive for the market.`
                : `Rentcast estimates this property could rent for $${est.rent.toLocaleString()}/mo (range: $${(est.rentLow || 0).toLocaleString()} – $${(est.rentHigh || 0).toLocaleString()}). ${data.market?.rentGrowth && data.market.rentGrowth > 0 ? `Market rents are growing at ${data.market.rentGrowth}% YoY in this zip code.` : ""}`
              }
            </p>
          </div>
        )}

        {/* Sources */}
        {data.sources.length > 0 && (
          <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
            <span className="text-[8px] uppercase tracking-widest" style={{ color: "#ddd", fontFamily: "var(--font-geist-mono)" }}>Sources:</span>
            {data.sources.map((s, i) => (
              <span key={s} className="text-[8px] uppercase tracking-wider" style={{ color: "#ccc", fontFamily: "var(--font-geist-mono)" }}>
                {i > 0 && " | "}{s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
