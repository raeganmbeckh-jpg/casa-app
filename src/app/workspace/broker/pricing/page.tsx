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
const GREEN = '#15803D';
const RED = '#B91C1C';

/* ── Mock output data ──────────────────────────────────────────── */
const RECOMMENDED_PRICE = 1_125_000;
const CONFIDENCE_LOW = 1_080_000;
const CONFIDENCE_HIGH = 1_165_000;
const COMP_ADJUSTED = 1_118_000;

type PriceTier = {
  label: string;
  pctOfRec: number;
  price: number;
  estDOM: number;
  barWidth: number;
};

const PRICE_TIERS: PriceTier[] = [
  { label: '95% of rec.', pctOfRec: 95, price: 1_068_750, estDOM: 14, barWidth: 28 },
  { label: '100% (recommended)', pctOfRec: 100, price: 1_125_000, estDOM: 28, barWidth: 56 },
  { label: '105% of rec.', pctOfRec: 105, price: 1_181_250, estDOM: 52, barWidth: 100 },
];

const MARKET_POSITION = {
  medianListPrice: 1_095_000,
  avgPricePSF: 612,
  subjectPricePSF: 625,
  percentile: 62,
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ── Page ──────────────────────────────────────────────────────── */
export default function PricingStrategyPage() {
  const [address, setAddress] = useState('4217 Panorama Dr, La Mesa, CA 91941');
  const [beds, setBeds] = useState('4');
  const [baths, setBaths] = useState('3');
  const [sqft, setSqft] = useState('1,800');
  const [condition, setCondition] = useState('Updated');

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Broker &middot; Pricing</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Pricing <em className="italic">Strategy</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Data-driven list price recommendation with comp-adjusted valuation, confidence range, and DOM projections at multiple price points.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Input section */}
        <section className="mb-10 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
          <h2 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Property <em className="italic">details</em></h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Beds</label>
              <input value={beds} onChange={(e) => setBeds(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Baths</label>
              <input value={baths} onChange={(e) => setBaths(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Sqft</label>
              <input value={sqft} onChange={(e) => setSqft(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
          </div>
          <div className="mt-4 flex items-end gap-4">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }}>
                <option>Updated</option>
                <option>Original</option>
                <option>Gut Rehab</option>
                <option>New Construction</option>
              </select>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="rounded-md px-4 py-2 text-sm font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
              Run pricing analysis
            </motion.button>
          </div>
        </section>

        {/* Recommended price */}
        <section className="mb-8 rounded-lg border bg-white p-6" style={{ borderColor: BUTTER, borderWidth: 2 }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Recommended list price</div>
              <div className="mt-1 text-4xl sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{fmtMoney(RECOMMENDED_PRICE)}</div>
              <div className="mt-1 text-sm" style={{ color: MID }}>
                Confidence range: {fmtMoney(CONFIDENCE_LOW)} &ndash; {fmtMoney(CONFIDENCE_HIGH)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Comp-adjusted value</div>
              <div className="mt-1 text-2xl" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(COMP_ADJUSTED)}</div>
              <div className="mt-1 text-xs" style={{ color: GREEN }}>Within 1% of recommended</div>
            </div>
          </div>
        </section>

        {/* DOM at price points */}
        <section className="mb-8">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Days to <em className="italic">sell</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Estimated DOM at different price points</p>
          <div className="space-y-4">
            {PRICE_TIERS.map((t) => (
              <motion.div key={t.label} whileHover={{ x: 2 }} className="rounded-lg border bg-white p-4" style={{ borderColor: t.pctOfRec === 100 ? BUTTER : HAIRLINE }}>
                <div className="mb-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-medium" style={{ color: INK }}>{t.label}</span>
                    <span className="ml-2 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtMoney(t.price)}</span>
                  </div>
                  <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: t.estDOM <= 21 ? GREEN : t.estDOM <= 40 ? INK : RED }}>{t.estDOM} days</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.barWidth}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: t.pctOfRec === 100 ? BUTTER : t.estDOM <= 21 ? GREEN : MID }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Market position */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Market <em className="italic">Position</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>How this listing compares to the submarket</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Median list price" value={fmtMoney(MARKET_POSITION.medianListPrice)} hint="La Mesa submarket" />
            <Kpi label="Avg $/SF (market)" value={`$${MARKET_POSITION.avgPricePSF}`} />
            <Kpi label="Subject $/SF" value={`$${MARKET_POSITION.subjectPricePSF}`} hint="2% above market avg" />
            <Kpi label="Price percentile" value={`${MARKET_POSITION.percentile}nd`} hint="Among active listings" accent />
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
