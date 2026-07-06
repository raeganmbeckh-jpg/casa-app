'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────── */
type Property = {
  id: string;
  name: string;
  zip: string;
  avgRent: number;
  marketMedian: number;
  vacancyRate: number;
  units: number;
  rentGrowth: number[];
};

/* ── Mock data ─────────────────────────────────────────────── */
const PROPERTIES: Property[] = [
  { id: 'p1', name: 'Villa Sonoma',         zip: '92101', avgRent: 2900, marketMedian: 2750, vacancyRate: 3.2, units: 48, rentGrowth: [2.1, 2.4, 2.8, 3.1, 3.5, 3.8] },
  { id: 'p2', name: 'Mission Bay Lofts',    zip: '92109', avgRent: 3650, marketMedian: 3800, vacancyRate: 5.1, units: 36, rentGrowth: [3.2, 3.0, 2.8, 2.5, 2.3, 2.1] },
  { id: 'p3', name: 'North Park Row',       zip: '92104', avgRent: 2500, marketMedian: 2680, vacancyRate: 4.8, units: 24, rentGrowth: [1.8, 2.0, 2.2, 2.5, 2.8, 3.0] },
  { id: 'p4', name: 'Hillcrest Gardens',    zip: '92103', avgRent: 3200, marketMedian: 3150, vacancyRate: 2.9, units: 32, rentGrowth: [2.5, 2.7, 3.0, 3.2, 3.4, 3.6] },
  { id: 'p5', name: 'Pacific Beach Suites', zip: '92109', avgRent: 3100, marketMedian: 3800, vacancyRate: 6.2, units: 20, rentGrowth: [2.8, 2.5, 2.2, 1.9, 1.7, 1.5] },
  { id: 'p6', name: 'La Jolla Terrace',     zip: '92037', avgRent: 4800, marketMedian: 4600, vacancyRate: 1.8, units: 16, rentGrowth: [3.5, 3.8, 4.0, 4.2, 4.5, 4.8] },
  { id: 'p7', name: 'East Village Flats',   zip: '92101', avgRent: 2650, marketMedian: 2750, vacancyRate: 4.5, units: 40, rentGrowth: [2.0, 2.1, 2.3, 2.5, 2.6, 2.8] },
  { id: 'p8', name: 'Coronado Shores',      zip: '92118', avgRent: 5200, marketMedian: 5100, vacancyRate: 1.2, units: 12, rentGrowth: [3.0, 3.3, 3.5, 3.8, 4.0, 4.3] },
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function MarketPositionPage() {
  const [sortBy, setSortBy] = useState<'delta' | 'vacancy' | 'name'>('delta');

  const rows = useMemo(() => {
    const sorted = [...PROPERTIES];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'delta':   return (a.avgRent - a.marketMedian) - (b.avgRent - b.marketMedian);
        case 'vacancy': return b.vacancyRate - a.vacancyRate;
        case 'name':    return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [sortBy]);

  const totalUnits = PROPERTIES.reduce((s, p) => s + p.units, 0);
  const weightedAvgRent = Math.round(PROPERTIES.reduce((s, p) => s + p.avgRent * p.units, 0) / totalUnits);
  const weightedMarket = Math.round(PROPERTIES.reduce((s, p) => s + p.marketMedian * p.units, 0) / totalUnits);
  const belowMarket = PROPERTIES.filter((p) => p.avgRent < p.marketMedian).length;
  const totalUnrealized = PROPERTIES.reduce((s, p) => {
    const delta = p.marketMedian - p.avgRent;
    return delta > 0 ? s + delta * p.units : s;
  }, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Manager &middot; Market</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Market <em className="italic">Position</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Compare your rents to market medians. Identify upside and underperformance by property.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Refresh Market Data</motion.button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Avg rent" value={fmtMoney(weightedAvgRent)} hint={`Market: ${fmtMoney(weightedMarket)}`} />
            <Kpi label="Properties below market" value={String(belowMarket)} hint={`of ${PROPERTIES.length} total`} accent />
            <Kpi label="Unrealized monthly rent" value={fmtMoney(totalUnrealized)} hint="If raised to market" />
            <Kpi label="Total units" value={String(totalUnits)} hint={`${PROPERTIES.length} properties`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Property <em className="italic">comparison</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Your rent vs. market median by zip code</p>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'delta' | 'vacancy' | 'name')} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
              <option value="delta">Sort: Rent delta</option>
              <option value="vacancy">Sort: Vacancy rate</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Zip</th>
                  <th className="px-4 py-3 font-medium">Your avg rent</th>
                  <th className="px-4 py-3 font-medium">Market median</th>
                  <th className="px-4 py-3 font-medium">Delta</th>
                  <th className="px-4 py-3 font-medium">Vacancy</th>
                  <th className="px-4 py-3 font-medium">Rent growth (6 mo)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const delta = p.avgRent - p.marketMedian;
                  const deltaPct = ((delta / p.marketMedian) * 100).toFixed(1);
                  return (
                    <motion.tr
                      key={p.id}
                      whileHover={{ backgroundColor: '#FDF8E8' }}
                      className="border-b last:border-0"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: INK }}>{p.name}</div>
                        <div className="text-xs" style={{ color: DIM }}>{p.units} units</div>
                      </td>
                      <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{p.zip}</td>
                      <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.avgRent)}</td>
                      <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.marketMedian)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-medium" style={{ color: delta >= 0 ? GREEN : RED, fontFamily: 'var(--font-geist-mono)' }}>
                          {delta >= 0 ? '+' : ''}{fmtMoney(delta)}
                          <span className="text-xs font-normal">({delta >= 0 ? '+' : ''}{deltaPct}%)</span>
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: p.vacancyRate > 5 ? RED : MID, fontFamily: 'var(--font-geist-mono)' }}>{p.vacancyRate}%</td>
                      <td className="px-4 py-3"><Sparkline data={p.rentGrowth} /></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {rows.map((p) => {
              const delta = p.avgRent - p.marketMedian;
              const deltaPct = ((delta / p.marketMedian) * 100).toFixed(1);
              return (
                <motion.div key={p.id} whileHover={{ y: -1 }} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium" style={{ color: INK }}>{p.name}</div>
                      <div className="text-xs" style={{ color: DIM }}>{p.zip} &middot; {p.units} units</div>
                    </div>
                    <Sparkline data={p.rentGrowth} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div style={{ color: DIM }}>Your rent</div>
                      <div className="font-medium" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.avgRent)}</div>
                    </div>
                    <div>
                      <div style={{ color: DIM }}>Market</div>
                      <div className="font-medium" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.marketMedian)}</div>
                    </div>
                    <div>
                      <div style={{ color: DIM }}>Delta</div>
                      <div className="font-medium" style={{ color: delta >= 0 ? GREEN : RED, fontFamily: 'var(--font-geist-mono)' }}>
                        {delta >= 0 ? '+' : ''}{fmtMoney(delta)} ({deltaPct}%)
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: p.vacancyRate > 5 ? RED : DIM }}>Vacancy: {p.vacancyRate}%</div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </motion.div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const h = 24;
  const w = 64;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const trending = data[data.length - 1] >= data[0];

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={trending ? GREEN : RED}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
