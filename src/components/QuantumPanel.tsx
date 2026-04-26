"use client";

import { useState, useEffect, useRef } from "react";
import { Zap, Loader2, Shield, TrendingUp, AlertTriangle, Eye } from "lucide-react";

const GOLD = "#E8C84A";
const ACCENT = "#F9D96A";
const BORDER = "#EEEEEE";
const PHASES = [
  { key: "superposition", label: "Superposition", color: "#3b82f6", desc: "Multi-state valuations" },
  { key: "entanglement", label: "Entanglement", color: "#10b981", desc: "Signal correlation" },
  { key: "tunneling", label: "Tunneling", color: "#8b5cf6", desc: "Barrier penetration" },
  { key: "interference", label: "Interference", color: GOLD, desc: "Wave collapse" },
];

function AnimatedScore({ score }: { score: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1500; const start = performance.now(); let f: number;
    function tick(now: number) { const p = Math.min((now - start) / dur, 1); setVal(Math.round(score * (1 - Math.pow(1 - p, 3)))); if (p < 1) f = requestAnimationFrame(tick); }
    f = requestAnimationFrame(tick); return () => cancelAnimationFrame(f);
  }, [score]);
  const r = 45; const circ = 2 * Math.PI * r; const offset = circ - (circ * val) / 100;
  const color = val >= 75 ? "#10b981" : val >= 50 ? ACCENT : val >= 30 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: 110, height: 110 }}>
      <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={55} cy={55} r={r} fill="none" stroke={BORDER} strokeWidth={6} />
        <circle cx={55} cy={55} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.05s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-heading)", color }}>{val}</span>
        <span style={{ fontSize: 8, color: "#9B9B9B", fontFamily: "var(--font-geist-mono)", letterSpacing: 2 }}>QIS</span>
      </div>
    </div>
  );
}

function WavePattern({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const w = 300; const h = 40;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - v * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: 300 }}>
      <defs><linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" /><stop offset="33%" stopColor="#10b981" stopOpacity="0.6" /><stop offset="66%" stopColor="#8b5cf6" stopOpacity="0.6" /><stop offset="100%" stopColor={GOLD} stopOpacity="0.8" /></linearGradient></defs>
      <polyline points={points} fill="none" stroke="url(#waveGrad)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => i === data.length - 1 ? <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - v * h} r={2.5} fill={GOLD} stroke="#fff" strokeWidth={1.5} /> : null)}
    </svg>
  );
}

function ProbabilityBar({ scenarios }: { scenarios: any[] }) {
  if (!scenarios || scenarios.length === 0) return null;
  const colors = ["#ef4444", ACCENT, "#10b981"];
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-3 mb-2" style={{ backgroundColor: BORDER }}>
        {scenarios.map((s: any, i: number) => <div key={i} style={{ width: `${(s.probability || 0.33) * 100}%`, backgroundColor: colors[Math.min(i, 2)], transition: "width 1s ease" }} />)}
      </div>
      <div className="flex justify-between text-[9px]" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {scenarios.map((s: any, i: number) => <span key={i} style={{ color: colors[Math.min(i, 2)] }}>{s.name}: ${(s.value || 0).toLocaleString()} ({Math.round((s.probability || 0) * 100)}%)</span>)}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT — accepts address STRING, fetches its own data ──

export default function QuantumPanel({ address, propertyData, googleData }: { address: string; propertyData?: any; googleData?: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [phase, setPhase] = useState(-1);
  const [expanded, setExpanded] = useState(false);

  // Triple guard against loops
  const hasFetched = useRef(false);
  const lastAddress = useRef("");

  // Reset when address actually changes
  useEffect(() => {
    if (address !== lastAddress.current) {
      hasFetched.current = false;
    }
  }, [address]);

  useEffect(() => {
    // Guard 1: no address
    if (!address) return;

    // Guard 2: already fetched for this address
    if (lastAddress.current === address) return;

    // Guard 3: already running
    if (hasFetched.current) return;

    // Mark IMMEDIATELY before any async work
    hasFetched.current = true;
    lastAddress.current = address;

    const runQuantum = async () => {
      setLoading(true);
      setResult(null);
      setPhase(0);

      const phaseTimer = setInterval(() => {
        setPhase(p => Math.min(p + 1, 3));
      }, 1200);

      try {
        const res = await fetch("/api/quantum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyData: propertyData || {}, googleData: googleData || {} }),
        });
        const data = await res.json();
        clearInterval(phaseTimer);
        setPhase(4);
        if (!data.error && !data.rate_limited) {
          setResult(data);
        }
      } catch {
        clearInterval(phaseTimer);
        setPhase(4);
      } finally {
        setLoading(false);
      }
    };

    runQuantum();
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const qScore = result?.interference?.quantum_score || 0;

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", borderLeft: "4px solid #8b5cf6" }}>
      <style jsx global>{`@keyframes qPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>

      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: "#8b5cf6" }} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 20, color: "#1A1A1A" }}>Quantum Intelligence Network</span>
        </div>
        <div className="flex items-center gap-3">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: phase > i ? p.color : phase === i ? p.color : "#ddd", animation: phase === i ? "qPulse 1s ease-in-out infinite" : "none" }} />
              <span className="text-[8px] hidden md:inline" style={{ color: phase >= i ? p.color : "#ccc", fontFamily: "var(--font-geist-mono)" }}>{p.label}</span>
            </div>
          ))}
          {loading && <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#8b5cf6" }} />}
        </div>
      </div>

      {loading && !result && (
        <div className="px-5 py-6 text-center">
          <p className="text-sm" style={{ color: "#6B6B6B", fontFamily: "var(--font-inter)" }}>{PHASES[Math.min(phase, 3)]?.desc || "Initializing"}... ({Math.min(phase + 1, 4)}/4 phases)</p>
        </div>
      )}

      {result && (
        <div className="p-5">
          <div className="flex items-start gap-5 mb-5">
            <AnimatedScore score={qScore} />
            <div className="flex-1 pt-2">
              <p className="text-sm mb-2" style={{ color: "#1A1A1A", fontFamily: "var(--font-inter)", fontWeight: 500 }}>{result.interference?.final_verdict || "Analysis complete"}</p>
              <div className="text-[9px] mb-3" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>{result.agents_fired} agents fired across 4 quantum phases</div>
              <WavePattern data={result.interference?.wave_pattern || []} />
            </div>
          </div>

          {result.superposition?.scenarios?.length > 0 && (
            <div className="mb-5 p-4 rounded-lg" style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#3b82f6", fontFamily: "var(--font-geist-mono)" }}>Superposition Valuation</span>
              </div>
              <div className="flex items-center gap-6 mb-3">
                <div>
                  <span className="text-[9px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>MOST LIKELY</span>
                  <p className="text-xl font-bold" style={{ color: GOLD, fontFamily: "var(--font-heading)" }}>${(result.superposition.most_likely || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px]" style={{ color: "#9B9B9B", fontFamily: "var(--font-geist-mono)" }}>RANGE</span>
                  <p className="text-sm" style={{ color: "#6B6B6B", fontFamily: "var(--font-geist-mono)" }}>${(result.superposition.pessimistic || 0).toLocaleString()} – ${(result.superposition.optimistic || 0).toLocaleString()}</p>
                </div>
              </div>
              <ProbabilityBar scenarios={result.superposition.scenarios} />
            </div>
          )}

          <button onClick={() => setExpanded(!expanded)} className="w-full text-center py-2 text-[10px] font-semibold rounded-lg transition-colors" style={{ color: "#8b5cf6", backgroundColor: "rgba(139,92,246,0.05)", fontFamily: "var(--font-inter)" }}>
            <Eye className="w-3 h-3 inline mr-1" />{expanded ? "Hide" : "Show"} Details
          </button>

          {expanded && (
            <div className="mt-4 space-y-4" style={{ animation: "fadeIn 0.3s ease" }}>
              {result.interference?.constructive?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2"><TrendingUp className="w-3.5 h-3.5" style={{ color: "#10b981" }} /><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#10b981", fontFamily: "var(--font-geist-mono)" }}>Constructive Interference</span></div>
                  {result.interference.constructive.slice(0, 3).map((c: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg mb-1.5" style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                      <div className="flex justify-between text-xs"><span style={{ color: "#065f46" }}>{c.signal}</span><span style={{ color: "#10b981", fontWeight: 700 }}>{c.amplified_confidence}%</span></div>
                      <p className="text-[10px] mt-0.5" style={{ color: "#6B6B6B" }}>{c.reason}</p>
                    </div>
                  ))}
                </div>
              )}
              {result.interference?.destructive?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} /><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f59e0b", fontFamily: "var(--font-geist-mono)" }}>Destructive Interference</span></div>
                  {result.interference.destructive.slice(0, 3).map((d: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg mb-1.5" style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                      <div className="flex justify-between text-xs"><span style={{ color: "#92400e" }}>{d.signal}</span><span style={{ color: "#f59e0b", fontWeight: 700 }}>{d.reduced_confidence}%</span></div>
                      <p className="text-[10px] mt-0.5" style={{ color: "#6B6B6B" }}>{d.reason}</p>
                    </div>
                  ))}
                </div>
              )}
              {result.tunneling?.barriers_penetrated?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2"><Shield className="w-3.5 h-3.5" style={{ color: "#8b5cf6" }} /><span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8b5cf6", fontFamily: "var(--font-geist-mono)" }}>Tunneling Discoveries</span></div>
                  {result.tunneling.barriers_penetrated.slice(0, 3).map((b: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg mb-1.5" style={{ backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                      <div className="flex justify-between text-xs"><span style={{ color: "#5b21b6" }}>{b.barrier}</span><span style={{ color: "#8b5cf6", fontWeight: 700 }}>{b.hidden_value}</span></div>
                      <p className="text-[10px] mt-0.5" style={{ color: "#6B6B6B" }}>{b.path}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
