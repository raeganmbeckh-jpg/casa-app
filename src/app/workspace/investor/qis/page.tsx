'use client';

import { useState } from 'react';
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
type Signal = {
  id: string;
  type: 'constructive' | 'destructive';
  label: string;
  strength: number;
  description: string;
};

type Discovery = {
  id: string;
  title: string;
  probability: number;
  potentialValue: number;
  description: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const QIS_SCORE = 82;
const PROPERTY = {
  address: '4217 Park Blvd, San Diego, CA 92103',
  type: 'Multifamily (12 units)',
  yearBuilt: 1987,
  sqft: 14400,
  currentValue: 3200000,
};

const VALUATIONS = {
  mostLikely: 3450000,
  optimistic: 3875000,
  pessimistic: 2980000,
  confidence: 0.78,
};

const SIGNALS: Signal[] = [
  { id: 's1', type: 'constructive', label: 'Neighborhood appreciation',   strength: 92, description: 'Hillcrest/North Park corridor up 14% YoY. Strong demand from young professionals.' },
  { id: 's2', type: 'constructive', label: 'Below-market rents',          strength: 85, description: 'Current rents avg $2,180. Market median $2,680. Immediate upside of $6,000/mo on turnover.' },
  { id: 's3', type: 'constructive', label: 'Transit-oriented location',    strength: 78, description: 'Within 0.3 mi of planned Mid-Coast Trolley extension stop (2027 opening).' },
  { id: 's4', type: 'constructive', label: 'Low deferred maintenance',     strength: 71, description: 'Roof replaced 2022, HVAC 2024. Estimated CapEx need: $45K over 5 years.' },
  { id: 's5', type: 'destructive',  label: 'Rent control exposure',       strength: 65, description: 'Subject to CA AB-1482. Max annual increase capped at 8.2% (5% + CPI).' },
  { id: 's6', type: 'destructive',  label: 'Insurance cost trajectory',   strength: 58, description: 'Premiums increased 22% in 2025. Projected further 15% increase in 2026.' },
  { id: 's7', type: 'destructive',  label: 'Parking limitations',         strength: 42, description: 'Only 8 spaces for 12 units. Street parking increasingly competitive.' },
];

const DISCOVERIES: Discovery[] = [
  { id: 'd1', title: 'ADU conversion potential',         probability: 72, potentialValue: 280000, description: 'Detached garage + laundry building could convert to 2 ADUs under SB-9. Est. $140K each in added value.' },
  { id: 'd2', title: 'Solar + storage arbitrage',        probability: 61, potentialValue: 95000,  description: 'SDGE NEM 3.0 makes battery storage highly favorable. 8-year payback, $95K NPV.' },
  { id: 'd3', title: 'Short-term rental carve-out',      probability: 38, potentialValue: 180000, description: 'Two street-facing units could qualify for STR permit if owner-occupied unit added via ADU.' },
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ── Page ──────────────────────────────────────────────────── */
export default function QISDashboardPage() {
  const [activeTab, setActiveTab] = useState<'signals' | 'discoveries'>('signals');

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; QIS</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Quantum <em className="italic">Intelligence</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Multi-dimensional property analysis. Superposition valuation models with signal interference mapping.
              </p>
            </div>
          </div>

          {/* QIS Score + Property info */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* Score gauge */}
            <motion.div whileHover={{ y: -2 }} className="flex flex-col items-center rounded-lg border bg-white p-6" style={{ borderColor: BUTTER }}>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>QIS Score</div>
              <div className="relative mt-4">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  {/* Background ring */}
                  <circle cx="90" cy="90" r="76" fill="none" stroke="#E5E5E5" strokeWidth="8" />
                  {/* Score ring */}
                  <motion.circle
                    cx="90" cy="90" r="76"
                    fill="none"
                    stroke={BUTTER}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(QIS_SCORE / 100) * 2 * Math.PI * 76} ${2 * Math.PI * 76}`}
                    transform="rotate(-90 90 90)"
                    initial={{ strokeDasharray: `0 ${2 * Math.PI * 76}` }}
                    animate={{ strokeDasharray: `${(QIS_SCORE / 100) * 2 * Math.PI * 76} ${2 * Math.PI * 76}` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl"
                    style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {QIS_SCORE}
                  </motion.div>
                  <div className="text-xs" style={{ color: DIM }}>of 100</div>
                </div>
              </div>
              <div className="mt-3 text-center text-sm font-medium" style={{ color: GREEN }}>Strong Buy Signal</div>
            </motion.div>

            {/* Property + Superposition */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Property</div>
                <div className="mt-2 text-lg font-medium" style={{ color: INK }}>{PROPERTY.address}</div>
                <div className="mt-2 space-y-1 text-xs" style={{ color: MID }}>
                  <div>{PROPERTY.type}</div>
                  <div>Built {PROPERTY.yearBuilt} &middot; {PROPERTY.sqft.toLocaleString()} sqft</div>
                  <div>Current value: {fmtMoney(PROPERTY.currentValue)}</div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Superposition valuation</div>
                <div className="mt-3 space-y-3">
                  <ValuationRow label="Most likely" value={VALUATIONS.mostLikely} highlight />
                  <ValuationRow label="Optimistic" value={VALUATIONS.optimistic} />
                  <ValuationRow label="Pessimistic" value={VALUATIONS.pessimistic} />
                </div>
                <div className="mt-3 text-xs" style={{ color: DIM }}>
                  Confidence: <span style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{(VALUATIONS.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Tab toggle */}
        <div className="mb-6 flex gap-1 rounded-lg border bg-white p-1" style={{ borderColor: HAIRLINE, width: 'fit-content' }}>
          {(['signals', 'discoveries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="rounded-md px-4 py-2 text-xs font-medium capitalize transition-colors"
              style={{
                backgroundColor: activeTab === tab ? BUTTER : 'transparent',
                color: activeTab === tab ? INK : DIM,
              }}
            >
              {tab === 'signals' ? 'Interference signals' : 'Tunneling discoveries'}
            </button>
          ))}
        </div>

        {activeTab === 'signals' && (
          <section>
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
              Signal <em className="italic">interference</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>
              Constructive signals amplify value. Destructive signals dampen it.
            </p>

            <div className="space-y-3">
              {SIGNALS.map((signal) => (
                <motion.div
                  key={signal.id}
                  whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  className="rounded-lg border bg-white p-5"
                  style={{
                    borderColor: HAIRLINE,
                    borderLeftWidth: 3,
                    borderLeftColor: signal.type === 'constructive' ? GREEN : RED,
                  }}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: signal.type === 'constructive' ? GREEN : RED, fontFamily: 'var(--font-geist-mono)' }}>
                          {signal.type === 'constructive' ? '+ Constructive' : '- Destructive'}
                        </span>
                      </div>
                      <div className="mt-1 font-medium text-sm" style={{ color: INK }}>{signal.label}</div>
                      <div className="mt-1 text-xs" style={{ color: MID }}>{signal.description}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ backgroundColor: signal.type === 'constructive' ? GREEN : RED }}
                          initial={{ width: 0 }}
                          animate={{ width: `${signal.strength}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums w-6 text-right" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{signal.strength}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'discoveries' && (
          <section>
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
              Tunneling <em className="italic">discoveries</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>
              Hidden opportunities that conventional analysis misses
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {DISCOVERIES.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ y: -3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  className="rounded-lg border bg-white p-5"
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Discovery</div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: d.probability >= 60 ? '#F0FDF4' : '#FFFBEB', color: d.probability >= 60 ? GREEN : '#D97706' }}>
                      {d.probability}% prob.
                    </span>
                  </div>
                  <div className="mt-3 font-medium" style={{ color: INK }}>{d.title}</div>
                  <div className="mt-2 text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: GREEN }}>
                    +{fmtMoney(d.potentialValue)}
                  </div>
                  <div className="mt-2 text-xs" style={{ color: MID }}>{d.description}</div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */
function ValuationRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: DIM }}>{label}</span>
      <span className="font-medium" style={{ color: highlight ? INK : MID, fontFamily: 'var(--font-geist-mono)', fontSize: highlight ? '1.125rem' : '0.875rem' }}>
        {fmtMoney(value)}
      </span>
    </div>
  );
}
