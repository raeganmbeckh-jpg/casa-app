'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type BuyerStatus = 'active' | 'pre_approved' | 'searching' | 'under_contract' | 'closed' | 'paused';

type Buyer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  motivation: number;
  mustHaves: string[];
  dealBreakers: string[];
  status: BuyerStatus;
  preApproved: boolean;
  notes: string;
};

const MOCK_BUYERS: Buyer[] = [
  {
    id: 'b1', name: 'Sarah Chen', email: 'schen@example.com', phone: '(858) 555-0134',
    budgetMin: 800000, budgetMax: 1200000, timeline: '30 days', motivation: 9,
    mustHaves: ['3+ beds', 'Garage', 'Updated kitchen'], dealBreakers: ['HOA > $500', 'Busy street'],
    status: 'active', preApproved: true, notes: 'Relocating from SF. Very motivated.',
  },
  {
    id: 'b2', name: 'Marcus & Tanya Williams', email: 'mwilliams@example.com', phone: '(619) 555-0198',
    budgetMin: 600000, budgetMax: 850000, timeline: '60 days', motivation: 7,
    mustHaves: ['Yard', '2+ baths', 'Near schools'], dealBreakers: ['Flood zone', 'No parking'],
    status: 'searching', preApproved: true, notes: 'First-time buyers. Need hand-holding.',
  },
  {
    id: 'b3', name: 'David Nakamura', email: 'dnakamura@example.com', phone: '(858) 555-0177',
    budgetMin: 1500000, budgetMax: 2500000, timeline: '90 days', motivation: 5,
    mustHaves: ['Ocean view', '4+ beds', 'Pool'], dealBreakers: ['East of I-5', 'Fixer-upper'],
    status: 'active', preApproved: true, notes: 'Upgrade buyer. Will sell current home first.',
  },
  {
    id: 'b4', name: 'Olivia Park', email: 'opark@example.com', phone: '(619) 555-0145',
    budgetMin: 450000, budgetMax: 650000, timeline: '14 days', motivation: 10,
    mustHaves: ['1+ bed', 'In-unit laundry', 'Parking'], dealBreakers: ['Ground floor', 'No AC'],
    status: 'pre_approved', preApproved: true, notes: 'Condo buyer. Cash offer possible.',
  },
  {
    id: 'b5', name: 'James & Priya Patel', email: 'jpatel@example.com', phone: '(858) 555-0112',
    budgetMin: 1000000, budgetMax: 1400000, timeline: '45 days', motivation: 8,
    mustHaves: ['Open floor plan', 'Home office', 'Good schools'], dealBreakers: ['Shared walls', 'Steep lot'],
    status: 'under_contract', preApproved: true, notes: 'Under contract on 3245 Hawk St.',
  },
  {
    id: 'b6', name: 'Elena Rodriguez', email: 'erodriguez@example.com', phone: '(619) 555-0167',
    budgetMin: 350000, budgetMax: 500000, timeline: '6 months', motivation: 4,
    mustHaves: ['2+ beds', 'Pet-friendly'], dealBreakers: ['No washer hookup'],
    status: 'paused', preApproved: false, notes: 'Saving for down payment. Check back in 3 months.',
  },
];

const STATUS_MAP: Record<BuyerStatus, { label: string; cls: string }> = {
  active:         { label: 'Active',         cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  pre_approved:   { label: 'Pre-Approved',   cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  searching:      { label: 'Searching',      cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  under_contract: { label: 'Under Contract', cls: 'bg-purple-50 text-purple-800 border-purple-200' },
  closed:         { label: 'Closed',         cls: 'bg-neutral-100 text-neutral-600 border-neutral-300' },
  paused:         { label: 'Paused',         cls: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function BuyerBookPage() {
  const [showForm, setShowForm] = useState(false);

  const activeBuyers = MOCK_BUYERS.filter((b) => b.status === 'active' || b.status === 'searching' || b.status === 'pre_approved');
  const avgBudget = activeBuyers.length
    ? Math.round(activeBuyers.reduce((s, b) => s + (b.budgetMin + b.budgetMax) / 2, 0) / activeBuyers.length)
    : 0;
  const hotLeads = MOCK_BUYERS.filter((b) => b.motivation >= 8).length;
  const matchesPending = MOCK_BUYERS.filter((b) => b.status === 'active' || b.status === 'searching').length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Broker · Buyers</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
                Buyer <em className="italic">Book</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                {MOCK_BUYERS.length} buyers in your book. {hotLeads} hot lead{hotLeads !== 1 ? 's' : ''} ready to move.
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-md border border-transparent px-3 py-2 text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#F9D96A', color: '#111111' }}
            >
              + Add Buyer
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Active buyers" value={String(activeBuyers.length)} />
            <Kpi label="Avg budget" value={fmtMoney(avgBudget)} />
            <Kpi label="Hot leads" value={String(hotLeads)} hint="Motivation >= 8" accent />
            <Kpi label="Matches pending" value={String(matchesPending)} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {showForm && <AddBuyerForm onClose={() => setShowForm(false)} />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_BUYERS.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}

function BuyerCard({ buyer }: { buyer: Buyer }) {
  const sm = STATUS_MAP[buyer.status];
  const budgetRange = buyer.budgetMax - buyer.budgetMin;
  const budgetMid = (buyer.budgetMin + buyer.budgetMax) / 2;
  const maxBudget = 3000000;
  const barLeft = (buyer.budgetMin / maxBudget) * 100;
  const barWidth = Math.min((budgetRange / maxBudget) * 100, 100 - barLeft);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: 'rgba(17,17,17,0.08)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium" style={{ color: '#111111' }}>{buyer.name}</div>
          <div className="mt-0.5 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{buyer.email}</div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sm.cls}`}>
          {sm.label}
        </span>
      </div>

      {/* Budget range bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Budget</span>
          <span className="text-xs" style={{ color: 'rgba(17,17,17,0.65)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            {fmtMoney(buyer.budgetMin)} – {fmtMoney(buyer.budgetMax)}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="absolute inset-y-0 rounded-full"
            style={{ left: `${barLeft}%`, width: `${barWidth}%`, backgroundColor: '#F9D96A' }}
          />
        </div>
      </div>

      {/* Timeline + Motivation */}
      <div className="mt-4 flex items-center justify-between">
        <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>
          {buyer.timeline}
        </span>
        <MotivationGauge score={buyer.motivation} />
      </div>

      {/* Must-haves + Deal-breakers */}
      <div className="mt-4 border-t pt-3" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="flex flex-wrap gap-1.5">
          {buyer.mustHaves.map((mh) => (
            <span key={mh} className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'rgba(21,128,61,0.06)', color: '#15803D', borderColor: 'rgba(21,128,61,0.2)' }}>
              {mh}
            </span>
          ))}
          {buyer.dealBreakers.map((db) => (
            <span key={db} className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'rgba(185,28,28,0.06)', color: '#B91C1C', borderColor: 'rgba(185,28,28,0.2)' }}>
              {db}
            </span>
          ))}
        </div>
      </div>

      {buyer.notes && (
        <div className="mt-3 text-xs italic" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontSize: '13px' }}>
          {buyer.notes}
        </div>
      )}
    </motion.div>
  );
}

function MotivationGauge({ score }: { score: number }) {
  const color = score >= 8 ? '#15803D' : score >= 5 ? '#D97706' : '#B91C1C';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)' }}>Motivation</span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="h-3 w-1 rounded-full"
            style={{ backgroundColor: i < score ? color : 'rgba(17,17,17,0.08)' }}
          />
        ))}
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color }}>{score}</span>
    </div>
  );
}

function AddBuyerForm({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-lg border bg-white p-6"
      style={{ borderColor: '#F9D96A' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
          New <em className="italic">Buyer</em>
        </h3>
        <button onClick={onClose} className="text-xs font-medium" style={{ color: 'rgba(17,17,17,0.45)' }}>Cancel</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormInput label="Name" placeholder="Sarah Chen" />
        <FormInput label="Email" placeholder="schen@example.com" />
        <FormInput label="Phone" placeholder="(858) 555-0134" />
        <FormInput label="Budget min" placeholder="$800,000" />
        <FormInput label="Budget max" placeholder="$1,200,000" />
        <FormInput label="Timeline" placeholder="30 days" />
        <FormInput label="Motivation (1-10)" placeholder="8" />
        <FormInput label="Must-haves" placeholder="3+ beds, Garage" />
        <FormInput label="Deal-breakers" placeholder="HOA > $500" />
      </div>
      <div className="mt-4 flex justify-end">
        <button className="rounded-md px-4 py-2 text-xs font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A', color: '#111111' }}>
          Add Buyer
        </button>
      </div>
    </motion.div>
  );
}

function FormInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</label>
      <input
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none"
        style={{ borderColor: 'rgba(17,17,17,0.08)' }}
      />
    </div>
  );
}
