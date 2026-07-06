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
type Verdict = 'strong_buy' | 'likely_bid' | 'watching' | 'unlikely';

type BuyerArchetype = {
  id: string;
  name: string;
  icon: string;
  interestScore: number;
  estimatedBid: number;
  verdict: Verdict;
  keyReason: string;
  description: string;
  typicalHoldPeriod: string;
  financingPreference: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const PROPERTY_VALUE = 3200000;

const BUYER_ARCHETYPES: BuyerArchetype[] = [
  {
    id: 'b1', name: 'Buy-and-Hold Investor', icon: '[ B&H ]',
    interestScore: 88, estimatedBid: 3150000, verdict: 'strong_buy',
    keyReason: 'Below-market rents offer immediate NOI upside with minimal CapEx.',
    description: 'Long-term cash flow investors seeking stable, rent-appreciating assets in growing neighborhoods.',
    typicalHoldPeriod: '7-15 years', financingPreference: 'Conventional 30yr fixed',
  },
  {
    id: 'b2', name: 'Value-Add Flipper', icon: '[ FLP ]',
    interestScore: 62, estimatedBid: 2900000, verdict: 'watching',
    keyReason: 'Renovation upside exists but 12-unit scale limits flip margin after carry costs.',
    description: 'Seeks distressed or under-renovated properties with 18-24 month turnaround windows.',
    typicalHoldPeriod: '12-24 months', financingPreference: 'Bridge / hard money',
  },
  {
    id: 'b3', name: 'First-Time Investor', icon: '[ 1st ]',
    interestScore: 35, estimatedBid: 3050000, verdict: 'unlikely',
    keyReason: 'Price point and unit count exceed typical first-time buyer comfort zone.',
    description: 'New investors looking for 2-4 unit house-hack opportunities with FHA financing.',
    typicalHoldPeriod: '5-10 years', financingPreference: 'FHA / low down-payment',
  },
  {
    id: 'b4', name: 'Developer', icon: '[ DEV ]',
    interestScore: 71, estimatedBid: 3400000, verdict: 'likely_bid',
    keyReason: 'ADU potential and zoning allow density increase. Land value supports teardown/rebuild economics.',
    description: 'Developers evaluating highest-and-best-use, including entitlement and ground-up construction.',
    typicalHoldPeriod: '2-5 years', financingPreference: 'Construction loan',
  },
  {
    id: 'b5', name: 'STR Investor', icon: '[ STR ]',
    interestScore: 44, estimatedBid: 3100000, verdict: 'watching',
    keyReason: 'San Diego STR regulations are restrictive. Only viable if ADU owner-occupancy loophole used.',
    description: 'Short-term rental operators seeking Airbnb/VRBO arbitrage in tourist-heavy markets.',
    typicalHoldPeriod: '3-7 years', financingPreference: 'DSCR loan',
  },
  {
    id: 'b6', name: '1031 Exchange Buyer', icon: '[ 1031 ]',
    interestScore: 82, estimatedBid: 3350000, verdict: 'strong_buy',
    keyReason: 'Motivated by 45-day identification deadline. Will pay premium for clean, stabilized asset.',
    description: 'Investors deploying deferred capital gains under IRS 1031 exchange timelines.',
    typicalHoldPeriod: '10+ years', financingPreference: 'All-cash or low LTV',
  },
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const verdictInfo: Record<Verdict, { label: string; bg: string; text: string }> = {
  strong_buy: { label: 'Strong buy', bg: '#F0FDF4', text: GREEN },
  likely_bid: { label: 'Likely bid', bg: '#FFFBEB', text: '#D97706' },
  watching:   { label: 'Watching',   bg: '#F5F5F5', text: MID },
  unlikely:   { label: 'Unlikely',   bg: '#FEF2F2', text: RED },
};

/* ── Page ──────────────────────────────────────────────────── */
export default function BuyerPoolPage() {
  const [sortBy, setSortBy] = useState<'interest' | 'bid' | 'name'>('interest');

  const sorted = [...BUYER_ARCHETYPES].sort((a, b) => {
    switch (sortBy) {
      case 'interest': return b.interestScore - a.interestScore;
      case 'bid':      return b.estimatedBid - a.estimatedBid;
      case 'name':     return a.name.localeCompare(b.name);
    }
  });

  const overallDemand = Math.round(BUYER_ARCHETYPES.reduce((s, b) => s + b.interestScore, 0) / BUYER_ARCHETYPES.length);
  const strongBuyers = BUYER_ARCHETYPES.filter((b) => b.verdict === 'strong_buy' || b.verdict === 'likely_bid').length;
  const avgBid = Math.round(BUYER_ARCHETYPES.reduce((s, b) => s + b.estimatedBid, 0) / BUYER_ARCHETYPES.length);
  const maxBid = Math.max(...BUYER_ARCHETYPES.map((b) => b.estimatedBid));

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Buyer Pool</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Buyer <em className="italic">Pool</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Who would buy this property and why. Six buyer archetypes analyzed against 4217 Park Blvd.
              </p>
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'interest' | 'bid' | 'name')} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
              <option value="interest">Sort: Interest</option>
              <option value="bid">Sort: Bid</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Overall demand" value={`${overallDemand}/100`} accent />
            <Kpi label="Interested archetypes" value={`${strongBuyers} of 6`} hint="Strong buy or likely bid" />
            <Kpi label="Average est. bid" value={fmtMoney(avgBid)} hint={`vs. ${fmtMoney(PROPERTY_VALUE)} current`} />
            <Kpi label="Highest potential bid" value={fmtMoney(maxBid)} hint="Developer archetype" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
          Buyer <em className="italic">archetypes</em>
        </h2>
        <p className="mb-6 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Interest score, estimated bid, and investment thesis</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((buyer) => {
            const v = verdictInfo[buyer.verdict];
            return (
              <motion.div
                key={buyer.id}
                whileHover={{ y: -3, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                className="flex flex-col rounded-lg border bg-white p-5"
                style={{ borderColor: HAIRLINE }}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{buyer.icon}</span>
                    <div className="mt-1 font-medium" style={{ color: INK }}>{buyer.name}</div>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: v.bg, color: v.text }}>{v.label}</span>
                </div>

                <div className="mt-2 text-xs" style={{ color: MID }}>{buyer.description}</div>

                {/* Interest bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: DIM }}>Interest score</span>
                    <span style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{buyer.interestScore}/100</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ backgroundColor: buyer.interestScore >= 70 ? GREEN : buyer.interestScore >= 50 ? '#D97706' : RED }}
                      initial={{ width: 0 }}
                      animate={{ width: `${buyer.interestScore}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>

                {/* Estimated bid */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: DIM }}>Est. bid</span>
                  <span className="text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{fmtMoney(buyer.estimatedBid)}</span>
                </div>

                {/* Key reason */}
                <div className="mt-3 rounded-md p-3" style={{ backgroundColor: CREAM }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Key reason</div>
                  <div className="text-xs" style={{ color: MID }}>{buyer.keyReason}</div>
                </div>

                {/* Footer details */}
                <div className="mt-auto pt-3 flex justify-between text-xs border-t" style={{ borderColor: HAIRLINE, color: DIM }}>
                  <span>Hold: {buyer.typicalHoldPeriod}</span>
                  <span>{buyer.financingPreference}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
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
