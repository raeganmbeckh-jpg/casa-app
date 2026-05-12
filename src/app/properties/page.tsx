"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Building2,
  ChevronRight,
  FileText,
  Home,
  LineChart,
  Search,
  Sparkles,
  WalletCards,
} from "lucide-react";

const CASA_YELLOW = "#F9D96A";
const CASA_CREAM = "#FAFAF7";
const INK = "#111111";
const RED = "#B91C1C";
const GREEN = "#15803D";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/prototype" },
  { label: "Properties", icon: Building2, href: "/properties" },
  { label: "Intelligence", icon: Sparkles, href: "/prototype" },
  { label: "Deals", icon: WalletCards, href: "/prototype" },
  { label: "Market", icon: LineChart, href: "/prototype" },
  { label: "Documents", icon: FileText, href: "/prototype" },
  { label: "Archive", icon: Archive, href: "/prototype" },
];

type Property = {
  id: string;
  address: string;
  city: string;
  type: "Multifamily" | "Single Family" | "Mixed Use" | "Commercial" | "Land";
  units: number;
  valuation: number;
  valueDelta: number;
  noi: number;
  capRate: number;
  occupancy: number;
  truthScore: number;
  demandTrend: number[];
  flag: "negotiate" | "watch" | "act" | null;
  lastUpdated: string;
};

const MOCK_PROPERTIES: Property[] = [
  { id: "p1", address: "2167 Villa Sonoma Glen", city: "San Diego, CA",   type: "Multifamily",   units: 18, valuation: 6840000,  valueDelta:  4.8, noi: 412000, capRate: 6.02, occupancy: 96, truthScore: 8.3, demandTrend: [42,44,46,48,51,53,55,58,61,63,64,66], flag: "negotiate", lastUpdated: "4s" },
  { id: "p2", address: "3053 Broadway",          city: "San Diego, CA",   type: "Mixed Use",     units:  6, valuation: 2410000,  valueDelta:  2.1, noi: 168000, capRate: 6.97, occupancy: 100, truthScore: 7.6, demandTrend: [50,52,53,53,55,57,57,58,60,62,63,64], flag: null,        lastUpdated: "12s" },
  { id: "p3", address: "1140 Mission Bay Dr",    city: "San Diego, CA",   type: "Multifamily",   units: 32, valuation: 14200000, valueDelta:  6.3, noi: 845000, capRate: 5.95, occupancy: 94, truthScore: 8.9, demandTrend: [60,62,65,68,70,72,75,78,82,84,86,88], flag: "act",       lastUpdated: "23s" },
  { id: "p4", address: "847 North Park Row",     city: "San Diego, CA",   type: "Single Family", units:  1, valuation:  985000,  valueDelta: -1.2, noi:  42000, capRate: 4.26, occupancy: 100, truthScore: 6.1, demandTrend: [55,54,52,51,50,49,49,48,47,46,45,44], flag: "watch",     lastUpdated: "1m" },
  { id: "p5", address: "562 Cortez Hill",        city: "San Diego, CA",   type: "Multifamily",   units: 12, valuation: 4120000,  valueDelta:  3.4, noi: 251000, capRate: 6.09, occupancy: 91, truthScore: 7.8, demandTrend: [40,42,43,45,46,47,49,50,52,53,55,56], flag: null,        lastUpdated: "1m" },
  { id: "p6", address: "2900 Adams Ave",         city: "San Diego, CA",   type: "Commercial",    units:  4, valuation: 3500000,  valueDelta:  0.8, noi: 215000, capRate: 6.14, occupancy: 87, truthScore: 7.2, demandTrend: [48,48,49,50,50,51,52,53,54,54,55,56], flag: null,        lastUpdated: "2m" },
  { id: "p7", address: "415 University Ave",     city: "San Diego, CA",   type: "Mixed Use",     units:  9, valuation: 4750000,  valueDelta:  5.1, noi: 298000, capRate: 6.27, occupancy: 100, truthScore: 8.5, demandTrend: [52,54,57,59,61,63,65,68,70,72,73,75], flag: "negotiate", lastUpdated: "3m" },
  { id: "p8", address: "1208 Sunset Cliffs",     city: "San Diego, CA",   type: "Land",          units:  0, valuation: 1850000,  valueDelta:  8.4, noi:      0, capRate: 0,    occupancy:   0, truthScore: 7.9, demandTrend: [38,40,43,46,49,52,55,58,61,64,67,70], flag: "act",       lastUpdated: "3m" },
  { id: "p9", address: "3340 Talbot St",         city: "San Diego, CA",   type: "Multifamily",   units: 24, valuation: 9800000,  valueDelta:  2.7, noi: 588000, capRate: 6.00, occupancy: 92, truthScore: 7.4, demandTrend: [50,51,52,53,55,55,56,57,58,59,60,61], flag: null,        lastUpdated: "4m" },
  { id: "p10",address: "611 J Street",           city: "San Diego, CA",   type: "Commercial",    units:  1, valuation: 2100000,  valueDelta: -2.4, noi: 124000, capRate: 5.90, occupancy: 75, truthScore: 5.8, demandTrend: [62,60,58,56,55,53,52,51,50,49,48,47], flag: "watch",     lastUpdated: "5m" },
  { id: "p11",address: "1875 Texas St",          city: "San Diego, CA",   type: "Single Family", units:  1, valuation: 1120000,  valueDelta:  1.9, noi:  48000, capRate: 4.29, occupancy: 100, truthScore: 7.0, demandTrend: [54,55,55,56,57,57,58,59,60,60,61,62], flag: null,        lastUpdated: "6m" },
  { id: "p12",address: "729 Bankers Hill",       city: "San Diego, CA",   type: "Multifamily",   units: 14, valuation: 5640000,  valueDelta:  4.1, noi: 342000, capRate: 6.06, occupancy: 100, truthScore: 8.0, demandTrend: [45,47,49,51,53,55,57,59,61,63,65,67], flag: null,        lastUpdated: "8m" },
];

const fmtMoneyShort = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

function Sparkline({ data, color = INK }: { data: number[]; color?: string }) {
  const W = 64;
  const H = 18;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="1.25" points={points} />
    </svg>
  );
}

function DoorwayMark({ size = 34 }: { size?: number }) {
  return (
    <div className="relative overflow-hidden" style={{ width: size, height: size, borderRadius: size * 0.52, background: CASA_YELLOW }}>
      <div className="absolute bottom-0 left-0 right-0" style={{ height: size * 0.42, background: CASA_YELLOW }} />
    </div>
  );
}

function Sidebar() {
  const [active, setActive] = useState("Properties");

  return (
    <aside className="hidden h-screen w-[248px] shrink-0 border-r px-4 py-5 lg:flex lg:flex-col" style={{ borderColor: "rgba(17,17,17,0.08)", background: CASA_CREAM }}>
      <div className="flex items-center gap-3 px-2">
        <DoorwayMark />
        <div>
          <div className="font-serif text-xl tracking-[0.18em]" style={{ fontFamily: "Cormorant Garamond, serif", color: INK }}>CASA</div>
          <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(17,17,17,0.5)" }}>Intelligence Layer</div>
        </div>
      </div>

      <nav className="mt-10 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <motion.a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.label === "Properties") {
                  e.preventDefault();
                  setActive(item.label);
                }
              }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
              style={{ background: isActive ? CASA_YELLOW : "transparent", color: INK }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: isActive ? "transparent" : `radial-gradient(120% 80% at 0% 50%, ${CASA_YELLOW}33, transparent 60%)` }} />
              <Icon size={18} className="relative shrink-0" />
              <span className="relative flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="relative" style={{ color: INK }} />}
            </motion.a>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border p-4" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(17,17,17,0.5)" }}>&#x2318; Live Swarm</div>
        <div className="mt-2 text-sm leading-5" style={{ color: INK }}>4 agents monitoring market, debt, zoning, and risk signals.</div>
      </div>
    </aside>
  );
}

function Topbar({ onOpenK }: { onOpenK: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b px-6" style={{ borderColor: "rgba(17,17,17,0.08)", background: CASA_CREAM }}>
      <button onClick={onOpenK} className="flex flex-1 max-w-md items-center gap-3 rounded-full border px-4 py-2 text-left text-sm transition-colors hover:bg-white" style={{ borderColor: "rgba(17,17,17,0.12)", color: "rgba(17,17,17,0.55)" }}>
        <Search size={15} />
        <span className="flex-1">Search properties, addresses, signals...</span>
        <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-mono" style={{ borderColor: "rgba(17,17,17,0.15)", color: "rgba(17,17,17,0.55)" }}>&#x2318;K</kbd>
      </button>
      <div className="ml-auto flex items-center gap-3 text-xs" style={{ color: "rgba(17,17,17,0.55)" }}>
        <span className="font-mono tabular-nums">UPD 4s ago</span>
        <span className="inline-flex h-2 w-2 rounded-full" style={{ background: GREEN, boxShadow: `0 0 8px ${GREEN}88` }} />
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const base = [
      { label: "Jump to Properties", action: "-> /properties" },
      { label: "Jump to Dashboard", action: "-> /prototype" },
      { label: "New Deal", action: "create" },
      { label: "Upload property", action: "upload" },
      ...MOCK_PROPERTIES.map((p) => ({ label: p.address, action: `truth ${p.id}` })),
    ];
    if (!query) return base.slice(0, 8);
    return base.filter((b) => b.label.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
  }, [query]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" aria-modal>
      <div className="absolute inset-0" style={{ background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border bg-white shadow-2xl" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
        <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: "rgba(17,17,17,0.06)" }}>
          <Search size={16} style={{ color: "rgba(17,17,17,0.55)" }} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a command, address, or page..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: INK }} />
          <kbd className="rounded border px-1.5 py-0.5 text-[10px] font-mono" style={{ borderColor: "rgba(17,17,17,0.15)", color: "rgba(17,17,17,0.55)" }}>ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.map((it, i) => (
            <li key={i} className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#FDF8E8]" style={{ color: INK }}>
              <span className="truncate">{it.label}</span>
              <span className="ml-3 font-mono text-[10px]" style={{ color: "rgba(17,17,17,0.5)" }}>{it.action}</span>
            </li>
          ))}
          {items.length === 0 && <li className="px-3 py-3 text-sm" style={{ color: "rgba(17,17,17,0.55)" }}>No matches.</li>}
        </ul>
        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] uppercase tracking-[0.18em]" style={{ borderColor: "rgba(17,17,17,0.06)", color: "rgba(17,17,17,0.5)" }}>
          <span>&#x2191; &#x2193; to navigate &middot; &#x21B5; to select</span>
          <span className="font-mono tabular-nums">CASA &middot; COMMAND</span>
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"valuation" | "truthScore" | "noi" | "demand">("truthScore");
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo(() => {
    let r = [...MOCK_PROPERTIES];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((p) => p.address.toLowerCase().includes(q) || p.type.toLowerCase().includes(q));
    }
    r.sort((a, b) => {
      switch (sortBy) {
        case "valuation":  return b.valuation - a.valuation;
        case "truthScore": return b.truthScore - a.truthScore;
        case "noi":        return b.noi - a.noi;
        case "demand":     return (b.demandTrend[b.demandTrend.length-1] - b.demandTrend[0]) - (a.demandTrend[a.demandTrend.length-1] - a.demandTrend[0]);
      }
    });
    return r;
  }, [search, sortBy]);

  const totalAUM = MOCK_PROPERTIES.reduce((s, p) => s + p.valuation, 0);
  const totalNOI = MOCK_PROPERTIES.reduce((s, p) => s + p.noi, 0);
  const avgTruth = MOCK_PROPERTIES.reduce((s, p) => s + p.truthScore, 0) / MOCK_PROPERTIES.length;
  const flagCount = MOCK_PROPERTIES.filter((p) => p.flag).length;

  return (
    <div className="min-h-screen" style={{ background: CASA_CREAM, color: INK, fontFamily: "Inter, system-ui, sans-serif" }}>
      <div className="flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Topbar onOpenK={() => setCmdOpen(true)} />

          <header className="border-b px-6 py-8 lg:px-10" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "rgba(17,17,17,0.55)" }}>Intelligence Layer &middot; Properties</p>
            <h1 className="mt-2 text-5xl tracking-tight" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 500, color: INK }}>
              The <em className="italic">portfolio</em>.
            </h1>
            <p className="mt-2 max-w-xl text-sm" style={{ color: "rgba(17,17,17,0.65)" }}>
              {MOCK_PROPERTIES.length} assets under intelligence. Sorted by truth score so the deals worth your attention are at the top.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border md:grid-cols-4" style={{ borderColor: "rgba(17,17,17,0.08)", background: "rgba(17,17,17,0.08)" }}>
              <Kpi label="AUM"             value={fmtMoneyShort(totalAUM)} hint="Total valuation" />
              <Kpi label="Annual NOI"      value={fmtMoneyShort(totalNOI)} hint="Across portfolio" />
              <Kpi label="Avg Truth Score" value={avgTruth.toFixed(1)}     hint="0 - 10 scale" accent />
              <Kpi label="Active Flags"    value={String(flagCount)}       hint="Need attention" />
            </div>
          </header>

          <div className="flex flex-col gap-3 border-b px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10" style={{ borderColor: "rgba(17,17,17,0.08)" }}>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "rgba(17,17,17,0.55)" }}>{rows.length} properties &middot; Live</div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by address or type..." className="w-full rounded-md border bg-white px-3 py-1.5 text-sm placeholder:opacity-50 focus:outline-none sm:w-72" style={{ borderColor: "rgba(17,17,17,0.12)", color: INK }} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-md border bg-white px-3 py-1.5 text-sm focus:outline-none" style={{ borderColor: "rgba(17,17,17,0.12)", color: INK }}>
                <option value="truthScore">Sort: Truth Score</option>
                <option value="valuation">Sort: Valuation</option>
                <option value="noi">Sort: NOI</option>
                <option value="demand">Sort: Demand Delta</option>
              </select>
            </div>
          </div>

          <main className="px-6 py-6 lg:px-10">
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(17,17,17,0.08)", background: "white" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[10px] uppercase tracking-[0.16em]" style={{ borderColor: "rgba(17,17,17,0.08)", color: "rgba(17,17,17,0.55)" }}>
                    <th className="px-4 py-2.5 font-medium">Property</th>
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium text-right">Units</th>
                    <th className="px-4 py-2.5 font-medium text-right">Valuation</th>
                    <th className="px-4 py-2.5 font-medium text-right">&Delta; YoY</th>
                    <th className="px-4 py-2.5 font-medium text-right">NOI</th>
                    <th className="px-4 py-2.5 font-medium text-right">Cap</th>
                    <th className="px-4 py-2.5 font-medium text-right">Occ</th>
                    <th className="px-4 py-2.5 font-medium text-right">Truth</th>
                    <th className="px-4 py-2.5 font-medium">Demand</th>
                    <th className="px-4 py-2.5 font-medium">Flag</th>
                    <th className="px-4 py-2.5 font-medium text-right">Upd</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => {
                    const deltaColor = p.valueDelta >= 0 ? GREEN : RED;
                    const deltaSign = p.valueDelta >= 0 ? "+" : "";
                    const demandUp = p.demandTrend[p.demandTrend.length - 1] >= p.demandTrend[0];
                    return (
                      <tr key={p.id} className="cursor-pointer border-b transition-colors last:border-0 hover:bg-[#FDF8E8]" style={{ borderColor: "rgba(17,17,17,0.06)" }}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium" style={{ color: INK }}>{p.address}</div>
                          <div className="text-[11px]" style={{ color: "rgba(17,17,17,0.5)" }}>{p.city}</div>
                        </td>
                        <td className="px-4 py-2.5 text-[12px]" style={{ color: "rgba(17,17,17,0.7)" }}>{p.type}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.units}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">{fmtMoneyShort(p.valuation)}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums" style={{ color: deltaColor }}>{deltaSign}{p.valueDelta.toFixed(1)}%</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.noi > 0 ? fmtMoneyShort(p.noi) : "\u2014"}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.capRate > 0 ? p.capRate.toFixed(2) : "\u2014"}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.occupancy > 0 ? `${p.occupancy}%` : "\u2014"}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">{p.truthScore.toFixed(1)}</td>
                        <td className="px-4 py-2.5"><Sparkline data={p.demandTrend} color={demandUp ? GREEN : RED} /></td>
                        <td className="px-4 py-2.5">
                          {p.flag ? (
                            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-medium" style={{ background: CASA_YELLOW, color: INK }}>{p.flag}</span>
                          ) : (
                            <span className="text-[11px]" style={{ color: "rgba(17,17,17,0.35)" }}>{"\u2014"}</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-[11px]" style={{ color: "rgba(17,17,17,0.5)" }}>{p.lastUpdated}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between px-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(17,17,17,0.5)" }}>
              <span>
                <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]" style={{ borderColor: "rgba(17,17,17,0.15)" }}>&#x2318;K</kbd>
                <span className="ml-2">to search &middot; </span>
                <kbd className="ml-1 rounded border px-1 py-0.5 font-mono text-[10px]" style={{ borderColor: "rgba(17,17,17,0.15)" }}>&#x21B5;</kbd>
                <span className="ml-2">to open truth report</span>
              </span>
              <span className="font-mono tabular-nums">CASA &middot; INTELLIGENCE &middot; v0.4</span>
            </div>
          </main>
        </div>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="p-4" style={{ background: "white", borderLeft: accent ? `2px solid ${CASA_YELLOW}` : undefined }}>
      <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(17,17,17,0.55)" }}>{label}</div>
      <div className="mt-1.5 text-3xl" style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px]" style={{ color: "rgba(17,17,17,0.5)" }}>{hint}</div>}
    </div>
  );
}
