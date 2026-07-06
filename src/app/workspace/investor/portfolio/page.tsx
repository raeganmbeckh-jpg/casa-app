'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const GREEN = '#15803D';
const RED = '#B91C1C';

type Property = {
  id: string;
  name: string;
  address: string;
  market: string;
  type: string;
  units: number;
  acquisitionDate: string;
  purchasePrice: number;
  currentValue: number;
  equity: number;
  irr: number;
  noi: number;
  capRate: number;
};

const PORTFOLIO: Property[] = [
  { id: 'p1', name: 'Villa Sonoma', address: '4821 El Cajon Blvd', market: 'San Diego - East', type: 'Multifamily', units: 12, acquisitionDate: '2022-06-15', purchasePrice: 3200000, currentValue: 3850000, equity: 1420000, irr: 14.2, noi: 198000, capRate: 5.14 },
  { id: 'p2', name: 'Mission Bay Lofts', address: '1930 Mission Bay Dr', market: 'San Diego - Coast', type: 'Multifamily', units: 18, acquisitionDate: '2021-03-01', purchasePrice: 5400000, currentValue: 6720000, equity: 2850000, irr: 16.8, noi: 342000, capRate: 5.09 },
  { id: 'p3', name: 'North Park Row', address: '3055 University Ave', market: 'San Diego - Central', type: 'Mixed Use', units: 8, acquisitionDate: '2023-01-10', purchasePrice: 2100000, currentValue: 2380000, equity: 780000, irr: 11.5, noi: 138000, capRate: 5.80 },
  { id: 'p4', name: 'Kettner Crossing', address: '2280 Kettner Blvd', market: 'San Diego - Downtown', type: 'Mixed Use', units: 14, acquisitionDate: '2020-09-22', purchasePrice: 4100000, currentValue: 5200000, equity: 2100000, irr: 18.3, noi: 286000, capRate: 5.50 },
  { id: 'p5', name: 'Pacific Terrace', address: '940 Garnet Ave', market: 'Pacific Beach', type: 'Multifamily', units: 6, acquisitionDate: '2024-02-14', purchasePrice: 1850000, currentValue: 2050000, equity: 620000, irr: 9.8, noi: 108000, capRate: 5.27 },
  { id: 'p6', name: 'Laurel Heights', address: '555 Laurel St', market: 'San Diego - Bankers Hill', type: 'Multifamily', units: 10, acquisitionDate: '2023-08-01', purchasePrice: 2750000, currentValue: 3100000, equity: 1050000, irr: 12.7, noi: 172000, capRate: 5.55 },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const ALLOC_COLORS = ['#111111', '#6B7280', '#9CA3AF', '#D1D5DB', '#F9D96A', '#E5E7EB'];

export default function PortfolioPage() {
  const [sortBy, setSortBy] = useState<'irr' | 'equity' | 'value' | 'name'>('irr');

  const totalEquity = PORTFOLIO.reduce((s, p) => s + p.equity, 0);
  const totalValue = PORTFOLIO.reduce((s, p) => s + p.currentValue, 0);
  const weightedIRR = PORTFOLIO.reduce((s, p) => s + p.irr * p.equity, 0) / totalEquity;
  const totalUnits = PORTFOLIO.reduce((s, p) => s + p.units, 0);

  const sorted = useMemo(() => {
    const arr = [...PORTFOLIO];
    switch (sortBy) {
      case 'irr': return arr.sort((a, b) => b.irr - a.irr);
      case 'equity': return arr.sort((a, b) => b.equity - a.equity);
      case 'value': return arr.sort((a, b) => b.currentValue - a.currentValue);
      case 'name': return arr.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [sortBy]);

  const allocations = PORTFOLIO.map((p, i) => ({
    name: p.name,
    pct: (p.equity / totalEquity) * 100,
    color: ALLOC_COLORS[i % ALLOC_COLORS.length],
  }));

  // Geographic concentration
  const geoMap: Record<string, { count: number; equity: number }> = {};
  PORTFOLIO.forEach((p) => {
    if (!geoMap[p.market]) geoMap[p.market] = { count: 0, equity: 0 };
    geoMap[p.market].count++;
    geoMap[p.market].equity += p.equity;
  });
  const geoList = Object.entries(geoMap)
    .map(([market, data]) => ({ market, ...data, pct: (data.equity / totalEquity) * 100 }))
    .sort((a, b) => b.equity - a.equity);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Portfolio</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Portfolio <em className="italic">Analytics</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            {PORTFOLIO.length} properties, {totalUnits} units. Your entire portfolio at a glance.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total equity" value={fmtMoney(totalEquity)} />
            <Kpi label="Weighted IRR" value={fmtPct(weightedIRR)} accent />
            <Kpi label="Portfolio value" value={fmtMoney(totalValue)} />
            <Kpi label="Properties" value={String(PORTFOLIO.length)} hint={`${totalUnits} total units`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Allocation Bar */}
        <section className="mb-8">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Equity <em className="italic">Allocation</em>
          </h2>
          <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Proportional allocation by property equity</p>
          <div className="overflow-hidden rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
            <div className="flex h-8 overflow-hidden rounded-md">
              {allocations.map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ width: 0 }}
                  animate={{ width: `${a.pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="relative h-full"
                  style={{ backgroundColor: a.color }}
                  title={`${a.name}: ${a.pct.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {allocations.map((a) => (
                <div key={a.name} className="flex items-center gap-1.5 text-xs" style={{ color: MID }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: a.color }} />
                  <span>{a.name}</span>
                  <span className="tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{a.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Property Table */}
        <section className="mb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Property <em className="italic">Detail</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{PORTFOLIO.length} properties</p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-md border bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none"
              style={{ borderColor: 'rgba(17,17,17,0.2)', color: MID }}
            >
              <option value="irr">Sort: IRR</option>
              <option value="equity">Sort: Equity</option>
              <option value="value">Sort: Value</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left" style={{ borderColor: HAIRLINE }}>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Property</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Type</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Value</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Equity</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>NOI</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Cap Rate</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>IRR</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Alloc %</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => {
                  const alloc = (p.equity / totalEquity) * 100;
                  const irrColor = p.irr >= 15 ? GREEN : p.irr >= 10 ? INK : RED;
                  return (
                    <motion.tr
                      key={p.id}
                      whileHover={{ backgroundColor: '#FDF8E8' }}
                      className="border-b last:border-0 cursor-pointer"
                      style={{ borderColor: HAIRLINE }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs" style={{ color: DIM }}>{p.address} &middot; {p.units} units</div>
                      </td>
                      <td className="px-4 py-3" style={{ color: MID }}>{p.type}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.currentValue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.equity)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.noi)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtPct(p.capRate)}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: irrColor }}>{fmtPct(p.irr)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: DIM }}>{alloc.toFixed(1)}%</td>
                    </motion.tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t bg-neutral-50 font-medium" style={{ borderColor: HAIRLINE }}>
                  <td className="px-4 py-3">Totals</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(totalValue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(totalEquity)}</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(PORTFOLIO.reduce((s, p) => s + p.noi, 0))}</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>&mdash;</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: GREEN }}>{fmtPct(weightedIRR)}</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Geographic Concentration */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Geographic <em className="italic">Concentration</em>
          </h2>
          <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Equity by sub-market</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {geoList.map((g) => (
              <motion.div
                key={g.market}
                whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                className="rounded-lg border bg-white p-4"
                style={{ borderColor: HAIRLINE }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{g.market}</span>
                  <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: DIM }}>{g.count} {g.count === 1 ? 'property' : 'properties'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.06)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${g.pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: g.pct > 30 ? BUTTER : INK }}
                    />
                  </div>
                  <span className="text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{g.pct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 text-xs" style={{ color: DIM }}>{fmtMoney(g.equity)} equity</div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}
