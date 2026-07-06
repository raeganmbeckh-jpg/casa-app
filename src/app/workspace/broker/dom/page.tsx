'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────────── */
type PropertyType = 'SFR' | 'Condo' | 'Townhome' | 'Multi-family';

type HistoricalDOM = {
  type: PropertyType;
  avgDOM: number;
  barWidth: number;
};

type ActiveListing = {
  id: string;
  address: string;
  type: PropertyType;
  listPrice: number;
  currentDOM: number;
  status: 'active' | 'price reduced' | 'stale';
  reductions: number;
};

/* ── Mock data ─────────────────────────────────────────────────── */
const HISTORICAL_DOM: HistoricalDOM[] = [
  { type: 'SFR', avgDOM: 26, barWidth: 43 },
  { type: 'Condo', avgDOM: 34, barWidth: 57 },
  { type: 'Townhome', avgDOM: 22, barWidth: 37 },
  { type: 'Multi-family', avgDOM: 48, barWidth: 80 },
];

const ACTIVE_LISTINGS: ActiveListing[] = [
  { id: 'l1', address: '4217 Panorama Dr, La Mesa', type: 'SFR', listPrice: 1_125_000, currentDOM: 12, status: 'active', reductions: 0 },
  { id: 'l2', address: '3890 Murray Hill Rd, La Mesa', type: 'SFR', listPrice: 985_000, currentDOM: 34, status: 'active', reductions: 0 },
  { id: 'l3', address: '7622 El Cajon Blvd #4, La Mesa', type: 'Condo', listPrice: 520_000, currentDOM: 67, status: 'stale', reductions: 2 },
  { id: 'l4', address: '5100 Garfield St, La Mesa', type: 'SFR', listPrice: 1_350_000, currentDOM: 45, status: 'price reduced', reductions: 1 },
  { id: 'l5', address: '4900 Vista Dr, La Mesa', type: 'Townhome', listPrice: 685_000, currentDOM: 8, status: 'active', reductions: 0 },
  { id: 'l6', address: '8330 La Mesa Blvd, La Mesa', type: 'Condo', listPrice: 475_000, currentDOM: 91, status: 'stale', reductions: 3 },
  { id: 'l7', address: '9410 Spring Park Ct, La Mesa', type: 'SFR', listPrice: 1_075_000, currentDOM: 19, status: 'active', reductions: 0 },
  { id: 'l8', address: '7250 University Ave, La Mesa', type: 'Multi-family', listPrice: 1_680_000, currentDOM: 55, status: 'price reduced', reductions: 1 },
];

const PREDICTION = { dom: 24, low: 18, high: 34 };

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ── Page ──────────────────────────────────────────────────────── */
export default function DOMForecasterPage() {
  const [address, setAddress] = useState('4217 Panorama Dr, La Mesa, CA 91941');
  const [propType, setPropType] = useState<PropertyType>('SFR');
  const [price, setPrice] = useState('1,125,000');

  const avgDOMMarket = Math.round(ACTIVE_LISTINGS.reduce((s, l) => s + l.currentDOM, 0) / ACTIVE_LISTINGS.length);
  const myListings = ACTIVE_LISTINGS.filter((l) => l.id === 'l1' || l.id === 'l5' || l.id === 'l7');
  const myAvgDOM = Math.round(myListings.reduce((s, l) => s + l.currentDOM, 0) / myListings.length);
  const staleCount = ACTIVE_LISTINGS.filter((l) => l.currentDOM > 60).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Broker &middot; DOM</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Days-on-Market <em className="italic">Forecaster</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Predict how long a listing will take to sell based on property characteristics, pricing, and current market conditions.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Avg DOM (market)" value={`${avgDOMMarket} days`} />
            <Kpi label="Your listings avg" value={`${myAvgDOM} days`} hint="3 active listings" />
            <Kpi label="Stale listings" value={String(staleCount)} hint="> 60 days on market" accent={staleCount > 0} />
            <Kpi label="Active inventory" value={String(ACTIVE_LISTINGS.length)} hint="La Mesa submarket" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Input section */}
        <section className="mb-10 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
          <h2 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Predict <em className="italic">DOM</em></h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Property type</label>
              <select value={propType} onChange={(e) => setPropType(e.target.value as PropertyType)} className="w-full rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }}>
                <option>SFR</option>
                <option>Condo</option>
                <option>Townhome</option>
                <option>Multi-family</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>List price</label>
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} placeholder="$1,125,000" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} className="mt-4 rounded-md px-4 py-2 text-sm font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
            Forecast DOM
          </motion.button>
        </section>

        {/* Prediction result */}
        <section className="mb-10 rounded-lg border bg-white p-6" style={{ borderColor: BUTTER, borderWidth: 2 }}>
          <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>DOM prediction</div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{PREDICTION.dom}</span>
            <span className="text-lg" style={{ color: MID }}>days</span>
          </div>
          <div className="mt-2 text-sm" style={{ color: MID }}>
            90% confidence interval: {PREDICTION.low} &ndash; {PREDICTION.high} days
          </div>
          <div className="mt-4 relative h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
            <div className="absolute inset-y-0 rounded-full" style={{ left: `${(PREDICTION.low / 60) * 100}%`, width: `${((PREDICTION.high - PREDICTION.low) / 60) * 100}%`, backgroundColor: BUTTER, opacity: 0.5 }} />
            <div className="absolute inset-y-0 w-1 rounded-full" style={{ left: `${(PREDICTION.dom / 60) * 100}%`, backgroundColor: INK }} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM }}>
            <span>0 days</span>
            <span>30 days</span>
            <span>60 days</span>
          </div>
        </section>

        {/* Historical DOM by type */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Historical DOM by <em className="italic">type</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>La Mesa &middot; last 12 months</p>
          <div className="space-y-3">
            {HISTORICAL_DOM.map((h) => (
              <motion.div key={h.type} whileHover={{ x: 2 }} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium" style={{ color: INK }}>{h.type}</span>
                  <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: h.avgDOM > 40 ? RED : h.avgDOM > 30 ? MID : GREEN }}>{h.avgDOM} days</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${h.barWidth}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: h.avgDOM > 40 ? RED : h.avgDOM > 30 ? MID : GREEN }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Active inventory table */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Active <em className="italic">Inventory</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{ACTIVE_LISTINGS.length} listings in submarket</p>
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">List price</th>
                  <th className="px-4 py-3 font-medium">DOM</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reductions</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_LISTINGS.map((l) => (
                  <motion.tr key={l.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0 cursor-default" style={{ borderColor: HAIRLINE }}>
                    <td className="px-4 py-3 font-medium" style={{ color: INK }}>{l.address}</td>
                    <td className="px-4 py-3" style={{ color: MID }}>{l.type}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(l.listPrice)}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: l.currentDOM > 60 ? RED : l.currentDOM > 30 ? MID : GREEN }}>{l.currentDOM}</span>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: l.reductions > 0 ? RED : DIM }}>{l.reductions}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Components ────────────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function StatusPill({ status }: { status: 'active' | 'price reduced' | 'stale' }) {
  const map = {
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'price reduced': 'bg-amber-50 text-amber-800 border-amber-200',
    stale: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[status]}`}>{status}</span>;
}
