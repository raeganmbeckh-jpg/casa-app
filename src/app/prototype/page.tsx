"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Archive,
  BarChart3,
  Building2,
  ChevronRight,
  CircleDot,
  Command,
  FileText,
  Home,
  Layers3,
  LineChart,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
  Upload,
  WalletCards,
  Zap,
} from "lucide-react";

const CASA_YELLOW = "#F9D96A";
const CASA_CREAM = "#FAFAF7";
const INK = "#111111";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Properties", icon: Building2 },
  { label: "Intelligence", icon: Sparkles },
  { label: "Deals", icon: WalletCards },
  { label: "Market", icon: LineChart },
  { label: "Documents", icon: FileText },
  { label: "Archive", icon: Archive },
];

const agents = [
  { name: "Market Pulse", status: "Scanning comps", icon: BarChart3 },
  { name: "Debt Stack", status: "Stress testing rates", icon: Layers3 },
  { name: "Zoning Watch", status: "Checking constraints", icon: MapPin },
  { name: "Risk Agent", status: "Flagging exposure", icon: ShieldAlert },
];

const signals = [
  { label: "Rental demand", value: "+12.4%", note: "YoY neighborhood movement" },
  { label: "Price position", value: "High", note: "Listed 6.8% above comp set" },
  { label: "Insurance pressure", value: "Elevated", note: "Regional premium volatility" },
  { label: "Negotiation window", value: "7–9%", note: "Suggested offer reduction" },
];

function DoorwayMark({ size = 34 }: { size?: number }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width: size, height: size, borderRadius: size * 0.52, background: CASA_YELLOW }}
    >
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: size * 0.42, background: CASA_YELLOW }}
      />
    </div>
  );
}

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <aside className="hidden h-screen w-[248px] shrink-0 border-r border-stone-200/80 bg-[#FAFAF7] px-4 py-5 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <DoorwayMark />
        <div>
          <div className="font-serif text-xl tracking-[0.18em] text-[#111111]">CASA</div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Intelligence Layer</div>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={`group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                isActive ? "bg-[#F9D96A]/70 text-[#111111]" : "text-stone-600 hover:bg-stone-100/80 hover:text-[#111111]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {isActive && <CircleDot className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-stone-200 bg-[#fffdf6] p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500">
          <Command className="h-3.5 w-3.5" /> Live Swarm
        </div>
        <div className="text-sm leading-6 text-stone-700">
          4 agents monitoring market, debt, zoning, and risk signals.
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-[#FAFAF7]/85 px-5 py-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 rounded-full border border-stone-200 bg-[#fffdf8] px-4 py-2 text-sm text-stone-500 shadow-sm shadow-stone-200/30">
          <Search className="h-4 w-4" />
          Search properties, markets, documents...
        </div>
        <button className="rounded-full bg-[#111111] px-4 py-2 text-sm text-[#FAFAF7] shadow-sm transition hover:scale-[1.01]">
          New Analysis
        </button>
      </div>
    </header>
  );
}

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] border border-stone-200 bg-[#fffdf8] p-5 shadow-sm shadow-stone-200/40"
    >
      <div className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</div>
      <div className="mt-4 text-3xl font-medium tracking-tight text-[#111111]">{value}</div>
      <div className="mt-2 text-sm leading-6 text-stone-600">{note}</div>
    </motion.div>
  );
}

function Dashboard({ startUpload }: { startUpload: () => void }) {
  return (
    <main className="px-5 py-8 lg:px-8">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] p-8 shadow-sm shadow-stone-200/40">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-stone-500">CASA Intelligence</p>
              <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.95] tracking-tight text-[#111111] md:text-6xl">
                The intelligence layer for real estate.
              </h1>
            </div>
            <div className="hidden rounded-full bg-[#F9D96A] p-4 md:block">
              <Sparkles className="h-6 w-6 text-[#111111]" />
            </div>
          </div>

          <p className="max-w-2xl text-lg leading-8 text-stone-600">
            Upload a property, activate CASA&apos;s AI swarm, and receive a clear Truth Score with pricing, risk, debt, and market recommendations.
          </p>

          <button
            onClick={startUpload}
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#111111] px-6 py-3 text-sm font-medium text-[#FAFAF7] transition hover:scale-[1.01]"
          >
            Analyze a property <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-[2.5rem] border border-stone-200 bg-[#111111] p-7 text-[#FAFAF7] shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Truth Score</p>
            <Zap className="h-5 w-5" style={{ color: CASA_YELLOW }} />
          </div>
          <div className="mt-10 text-8xl font-semibold tracking-[-0.08em]">82</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "82%" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: CASA_YELLOW }}
            />
          </div>
          <p className="mt-6 text-sm leading-7 text-stone-300">
            Strong market momentum, but listed above comp range with elevated insurance exposure.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {signals.map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Swarm Activity</p>
          <div className="mt-6 space-y-4">
            {agents.map((agent, index) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between rounded-3xl border border-stone-200 bg-[#FAFAF7] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#F9D96A]/75 p-2">
                      <Icon className="h-4 w-4 text-[#111111]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#111111]">{agent.name}</div>
                      <div className="text-xs text-stone-500">{agent.status}</div>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#F9D96A]" />
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Portfolio Intelligence</p>
          <div className="mt-8 grid h-64 place-items-end rounded-[2rem] border border-stone-200 bg-[#FAFAF7] p-5">
            <div className="flex h-full w-full items-end gap-3">
              {[38, 52, 45, 66, 61, 72, 84, 78, 88].map((height, index) => (
                <motion.div
                  key={index}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: index * 0.04, duration: 0.8 }}
                  className="flex-1 rounded-t-2xl bg-[#111111]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function UploadFlow({ onAnalyze }: { onAnalyze: (addr: string) => void }) {
  const [address, setAddress] = useState("3053 Broadway, San Diego, CA");

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-5 py-10 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-[3rem] border border-stone-200 bg-[#fffdf8] p-8 shadow-sm shadow-stone-200/50"
      >
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#F9D96A]">
          <Upload className="h-7 w-7 text-[#111111]" />
        </div>
        <p className="text-center text-xs uppercase tracking-[0.26em] text-stone-500">New Property Analysis</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-center font-serif text-5xl leading-none tracking-tight text-[#111111]">
          Enter a property. CASA will reveal the truth.
        </h2>
        <div className="mt-10 rounded-[2rem] border border-stone-200 bg-[#FAFAF7] p-3">
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full rounded-[1.4rem] bg-transparent px-5 py-4 text-lg outline-none placeholder:text-stone-400"
            placeholder="Enter address or upload offering memo"
          />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["Offering Memo", "Rent Roll", "MLS Link"].map((item) => (
            <button key={item} className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500 hover:border-stone-500 hover:text-[#111111]">
              Add {item}
            </button>
          ))}
        </div>
        <button
          onClick={() => onAnalyze(address)}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#111111] px-6 py-4 text-sm font-medium text-[#FAFAF7] transition hover:scale-[1.005]"
        >
          Activate Intelligence Swarm <Sparkles className="h-4 w-4" />
        </button>
      </motion.div>
    </main>
  );
}

function LoadingAnalysis({ address, onDone }: { address: string; onDone: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <main className="grid min-h-[calc(100vh-73px)] place-items-center px-5 py-10 lg:px-8">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
          className="mx-auto grid h-40 w-40 place-items-center rounded-full border border-stone-200"
        >
          <DoorwayMark size={72} />
        </motion.div>
        <p className="mt-8 text-xs uppercase tracking-[0.26em] text-stone-500">CASA Swarm Activated</p>
        <h2 className="mt-4 font-serif text-5xl tracking-tight text-[#111111]">Analyzing property intelligence.</h2>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">{address}</p>
        <div className="mx-auto mt-8 max-w-xl space-y-3">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.18 }}
              className="rounded-2xl border border-stone-200 bg-[#fffdf8] px-5 py-3 text-left text-sm text-stone-600"
            >
              {agent.name}: {agent.status}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}

function TruthScorePage({ address, restart }: { address: string; restart: () => void }) {
  const score = 82;
  const verdict = useMemo(() => {
    if (score >= 85) return "Strong deal";
    if (score >= 70) return "Promising with negotiation";
    return "High caution";
  }, [score]);

  return (
    <main className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-stone-500">Truth Score Report</p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight text-[#111111]">{address}</h1>
        </div>
        <button onClick={restart} className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700 hover:border-[#111111] hover:text-[#111111]">
          Analyze another property
        </button>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[3rem] bg-[#111111] p-8 text-[#FAFAF7]">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-400">CASA Verdict</p>
          <div className="mt-10 text-9xl font-semibold tracking-[-0.09em]">{score}</div>
          <div className="mt-4 text-2xl font-medium" style={{ color: CASA_YELLOW }}>{verdict}</div>
          <p className="mt-5 text-sm leading-7 text-stone-300">
            CASA recommends pursuing the asset only with a 7–9% price reduction and additional insurance diligence before offer submission.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <MetricCard label="Suggested offer" value="$2.18M" note="Based on comp adjustment and risk premium" />
          <MetricCard label="Risk exposure" value="Medium" note="Insurance and pricing risk require diligence" />
          <MetricCard label="Market momentum" value="Rising" note="Demand signals are improving within submarket" />
          <MetricCard label="Hold strategy" value="3–5 yrs" note="Best under conservative rent growth model" />
        </div>
      </section>

      <section className="mt-6 rounded-[3rem] border border-stone-200 bg-[#fffdf8] p-7">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">AI Recommendation</p>
          <Sparkles className="h-5 w-5 text-[#111111]" />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            ["Negotiate", "Open 8% below ask due to pricing spread against comp set."],
            ["Verify", "Request insurance quotes and recent capital expenditure records."],
            ["Model", "Run downside scenario with flat rents and 75 bps higher debt cost."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[2rem] border border-stone-200 bg-[#FAFAF7] p-5">
              <div className="text-lg font-medium text-[#111111]">{title}</div>
              <p className="mt-3 text-sm leading-6 text-stone-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function CasaPrototype() {
  const [active, setActive] = useState("Dashboard");
  const [stage, setStage] = useState<"dashboard" | "upload" | "loading" | "truth">("dashboard");
  const [address, setAddress] = useState("3053 Broadway, San Diego, CA");

  const startUpload = () => {
    setActive("Intelligence");
    setStage("upload");
  };

  const analyze = (nextAddress: string) => {
    setAddress(nextAddress || address);
    setStage("loading");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ backgroundColor: CASA_CREAM, color: INK }}>
      <div className="flex">
        <Sidebar active={active} setActive={setActive} />
        <div className="min-w-0 flex-1">
          <Topbar />
          <AnimatePresence mode="wait">
            {stage === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard startUpload={startUpload} />
              </motion.div>
            )}
            {stage === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <UploadFlow onAnalyze={analyze} />
              </motion.div>
            )}
            {stage === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingAnalysis address={address} onDone={() => setStage("truth")} />
              </motion.div>
            )}
            {stage === "truth" && (
              <motion.div key="truth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TruthScorePage address={address} restart={startUpload} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
