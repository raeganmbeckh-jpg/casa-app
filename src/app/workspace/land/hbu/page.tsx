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

/* ── Types ─────────────────────────────────────────────────────── */
type Scenario = {
  name: string;
  estimatedUnits: string;
  developmentCost: number;
  projectedValue: number;
  roi: number;
  feasibilityScore: number;
  recommended: boolean;
  notes: string;
};

/* ── Mock scenarios for 4.2 ac A70 parcel in Escondido ─────────── */
const MOCK_SCENARIOS: Scenario[] = [
  {
    name: 'SFR Subdivision',
    estimatedUnits: '14 lots',
    developmentCost: 4_800_000,
    projectedValue: 8_400_000,
    roi: 75,
    feasibilityScore: 82,
    recommended: false,
    notes: 'Standard lot splits under A70. Moderate grading costs. Strong SFR demand in north Escondido.',
  },
  {
    name: 'Multifamily',
    estimatedUnits: '48 units',
    developmentCost: 11_200_000,
    projectedValue: 19_600_000,
    roi: 75,
    feasibilityScore: 68,
    recommended: false,
    notes: 'Requires zone change to R-3 or density bonus. City pre-app suggests possible approval. 18-month entitlement timeline.',
  },
  {
    name: 'Mixed-Use',
    estimatedUnits: '32 residential + 6,000 SF retail',
    developmentCost: 13_500_000,
    projectedValue: 24_200_000,
    roi: 79,
    feasibilityScore: 91,
    recommended: true,
    notes: 'Aligns with Escondido General Plan update. Transit-adjacent location qualifies for SB 35 streamlining. Highest risk-adjusted return.',
  },
  {
    name: 'Commercial',
    estimatedUnits: '38,000 SF',
    developmentCost: 7_600_000,
    projectedValue: 11_400_000,
    roi: 50,
    feasibilityScore: 55,
    recommended: false,
    notes: 'Retail vacancy in submarket at 9.2%. Office demand softening. Viable only with pre-lease anchor tenant.',
  },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ── Page ──────────────────────────────────────────────────────── */
export default function HBUCalculatorPage() {
  const [acreage, setAcreage] = useState('4.2');
  const [zoning, setZoning] = useState('A70');
  const [location, setLocation] = useState('Escondido, CA');

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land &middot; HBU</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Highest &amp; Best <em className="italic">Use</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Model development scenarios against zoning, market conditions, and feasibility to determine the optimal use for any parcel.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Input section */}
        <section className="mb-10 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
          <h2 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Parcel <em className="italic">inputs</em></h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Acreage</label>
              <input value={acreage} onChange={(e) => setAcreage(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Zoning</label>
              <input value={zoning} onChange={(e) => setZoning(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.03 }} className="mt-4 rounded-md px-4 py-2 text-sm font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
            Analyze parcel
          </motion.button>
        </section>

        {/* Results header */}
        <div className="mb-6">
          <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Development <em className="italic">scenarios</em></h2>
          <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{acreage} acres &middot; {zoning} &middot; {location}</p>
        </div>

        {/* Scenario cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {MOCK_SCENARIOS.map((s) => (
            <motion.div
              key={s.name}
              whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              className="rounded-lg border bg-white p-6"
              style={{ borderColor: s.recommended ? BUTTER : HAIRLINE, borderWidth: s.recommended ? 2 : 1 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{s.name}</h3>
                  <p className="text-xs" style={{ color: DIM }}>{s.estimatedUnits}</p>
                </div>
                {s.recommended && (
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Recommended</span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Development cost</div>
                  <div className="mt-1 text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(s.developmentCost)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Projected value</div>
                  <div className="mt-1 text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(s.projectedValue)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>ROI</div>
                  <div className="mt-1 text-lg font-medium" style={{ color: s.roi >= 70 ? GREEN : INK, fontFamily: 'var(--font-geist-mono)' }}>{s.roi}%</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Feasibility score</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="relative h-1.5 w-20 overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.feasibilityScore}%`, backgroundColor: s.feasibilityScore >= 80 ? GREEN : s.feasibilityScore >= 60 ? BUTTER : '#B91C1C' }} />
                    </div>
                    <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{s.feasibilityScore}</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm" style={{ color: MID }}>{s.notes}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
