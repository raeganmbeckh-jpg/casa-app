'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

type Stage = 'evaluating' | 'under_contract' | 'due_diligence' | 'closed';

type Deal = {
  id: string;
  address: string;
  city: string;
  price: number;
  capRate: number;
  truthScore: number;
  stage: Stage;
  units: number;
  type: string;
  addedDate: string;
};

const STAGE_LABELS: Record<Stage, string> = {
  evaluating: 'Evaluating',
  under_contract: 'Under Contract',
  due_diligence: 'Due Diligence',
  closed: 'Closed',
};

const STAGE_ORDER: Stage[] = ['evaluating', 'under_contract', 'due_diligence', 'closed'];

const INITIAL_DEALS: Deal[] = [
  { id: 'd1', address: '4821 El Cajon Blvd', city: 'San Diego, CA', price: 2450000, capRate: 5.8, truthScore: 87, stage: 'evaluating', units: 8, type: 'Multifamily', addedDate: '2026-03-12' },
  { id: 'd2', address: '1930 30th St', city: 'San Diego, CA', price: 1875000, capRate: 5.2, truthScore: 72, stage: 'evaluating', units: 4, type: 'Multifamily', addedDate: '2026-03-28' },
  { id: 'd3', address: '7744 Herschel Ave', city: 'La Jolla, CA', price: 3200000, capRate: 4.9, truthScore: 91, stage: 'under_contract', units: 6, type: 'Multifamily', addedDate: '2026-02-15' },
  { id: 'd4', address: '3055 Rosecrans St', city: 'San Diego, CA', price: 1650000, capRate: 6.1, truthScore: 68, stage: 'under_contract', units: 1, type: 'Retail', addedDate: '2026-02-22' },
  { id: 'd5', address: '940 Garnet Ave', city: 'Pacific Beach, CA', price: 2100000, capRate: 5.5, truthScore: 83, stage: 'due_diligence', units: 5, type: 'Mixed Use', addedDate: '2026-01-18' },
  { id: 'd6', address: '1122 University Ave', city: 'San Diego, CA', price: 1980000, capRate: 6.3, truthScore: 76, stage: 'due_diligence', units: 6, type: 'Multifamily', addedDate: '2026-01-30' },
  { id: 'd7', address: '555 Laurel St', city: 'San Diego, CA', price: 2750000, capRate: 5.1, truthScore: 94, stage: 'closed', units: 10, type: 'Multifamily', addedDate: '2025-11-05' },
  { id: 'd8', address: '2280 Kettner Blvd', city: 'San Diego, CA', price: 4100000, capRate: 4.7, truthScore: 89, stage: 'closed', units: 12, type: 'Mixed Use', addedDate: '2025-10-12' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

export default function DealPipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ address: '', city: '', price: '', capRate: '', truthScore: '', units: '', type: 'Multifamily' });

  const activeDeals = deals.filter((d) => d.stage !== 'closed').length;
  const pipelineValue = deals.filter((d) => d.stage !== 'closed').reduce((s, d) => s + d.price, 0);
  const avgCapRate = deals.length > 0 ? deals.reduce((s, d) => s + d.capRate, 0) / deals.length : 0;
  const closedYTD = deals.filter((d) => d.stage === 'closed' && d.addedDate >= '2026-01-01').length;

  const columns = useMemo(() => {
    const map: Record<Stage, Deal[]> = { evaluating: [], under_contract: [], due_diligence: [], closed: [] };
    deals.forEach((d) => map[d.stage].push(d));
    return map;
  }, [deals]);

  const handleAdd = () => {
    if (!formData.address || !formData.price) return;
    const newDeal: Deal = {
      id: `d${Date.now()}`,
      address: formData.address,
      city: formData.city || 'San Diego, CA',
      price: Number(formData.price),
      capRate: Number(formData.capRate) || 5.0,
      truthScore: Number(formData.truthScore) || 50,
      units: Number(formData.units) || 1,
      type: formData.type,
      stage: 'evaluating',
      addedDate: new Date().toISOString().slice(0, 10),
    };
    setDeals([...deals, newDeal]);
    setFormData({ address: '', city: '', price: '', capRate: '', truthScore: '', units: '', type: 'Multifamily' });
    setShowForm(false);
  };

  const moveStage = (dealId: string, direction: 'forward' | 'back') => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d;
        const idx = STAGE_ORDER.indexOf(d.stage);
        const next = direction === 'forward' ? idx + 1 : idx - 1;
        if (next < 0 || next >= STAGE_ORDER.length) return d;
        return { ...d, stage: STAGE_ORDER[next] };
      }),
    );
  };

  return (
    <div className="min-h-screen text-[var(--color-ink)]" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Pipeline</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Deal <em className="italic">Pipeline</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Track every acquisition from first look to close. Drag deals forward or back as they progress.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-neutral-900" style={{ borderColor: 'rgba(17,17,17,0.2)', color: MID }}>Export</button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowForm(!showForm)}
                className="rounded-md border border-transparent px-3 py-2 text-xs font-medium"
                style={{ backgroundColor: BUTTER, color: INK }}
              >
                + Add Deal
              </motion.button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Active deals" value={String(activeDeals)} />
            <Kpi label="Pipeline value" value={fmtMoney(pipelineValue)} />
            <Kpi label="Avg cap rate" value={fmtPct(avgCapRate)} />
            <Kpi label="Closed YTD" value={String(closedYTD)} accent />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border bg-white p-6"
            style={{ borderColor: HAIRLINE }}
          >
            <h3 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
              New <em className="italic">Deal</em>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Address" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City, State" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <input value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Purchase price" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <input value={formData.capRate} onChange={(e) => setFormData({ ...formData, capRate: e.target.value })} placeholder="Cap rate %" type="number" step="0.1" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <input value={formData.truthScore} onChange={(e) => setFormData({ ...formData, truthScore: e.target.value })} placeholder="Truth score (0-100)" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <input value={formData.units} onChange={(e) => setFormData({ ...formData, units: e.target.value })} placeholder="Units" type="number" className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }} />
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="rounded-md border px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.2)' }}>
                <option>Multifamily</option>
                <option>Mixed Use</option>
                <option>Retail</option>
                <option>Office</option>
                <option>Industrial</option>
              </select>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} className="flex-1 rounded-md px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Add</motion.button>
                <button onClick={() => setShowForm(false)} className="rounded-md border px-3 py-2 text-xs font-medium" style={{ borderColor: 'rgba(17,17,17,0.2)', color: MID }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid gap-4 lg:grid-cols-4">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="flex flex-col rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: HAIRLINE }}>
                <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{STAGE_LABELS[stage]}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium" style={{ backgroundColor: stage === 'closed' ? '#ECFDF5' : 'rgba(17,17,17,0.05)', color: stage === 'closed' ? GREEN : MID }}>
                  {columns[stage].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {columns[stage].length === 0 && (
                  <p className="py-6 text-center text-sm italic" style={{ color: DIM, fontFamily: 'var(--font-heading)' }}>No deals yet.</p>
                )}
                {columns[stage].map((deal) => (
                  <DealCard key={deal.id} deal={deal} onMove={moveStage} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function DealCard({ deal, onMove }: { deal: Deal; onMove: (id: string, dir: 'forward' | 'back') => void }) {
  const stageIdx = STAGE_ORDER.indexOf(deal.stage);
  const canBack = stageIdx > 0;
  const canForward = stageIdx < STAGE_ORDER.length - 1;
  const scoreColor = deal.truthScore >= 80 ? GREEN : deal.truthScore >= 60 ? '#D97706' : RED;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
      className="rounded-md border p-3"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="mb-1 text-sm font-medium" style={{ color: INK }}>{deal.address}</div>
      <div className="mb-2 text-xs" style={{ color: DIM }}>{deal.city} &middot; {deal.type} &middot; {deal.units} units</div>
      <div className="mb-2 grid grid-cols-2 gap-x-3 gap-y-1">
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Price</div>
          <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(deal.price)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Cap Rate</div>
          <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtPct(deal.capRate)}</div>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Truth</div>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(17,17,17,0.06)' }}>
          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${deal.truthScore}%`, backgroundColor: scoreColor }} />
        </div>
        <span className="text-xs font-medium tabular-nums" style={{ color: scoreColor, fontFamily: 'var(--font-geist-mono)' }}>{deal.truthScore}</span>
      </div>
      <div className="flex gap-1">
        {canBack && (
          <button onClick={() => onMove(deal.id, 'back')} className="flex-1 rounded border px-2 py-1 text-[10px] font-medium transition-colors hover:border-neutral-900" style={{ borderColor: 'rgba(17,17,17,0.15)', color: MID }}>
            &larr; Back
          </button>
        )}
        {canForward && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onMove(deal.id, 'forward')}
            className="flex-1 rounded border border-transparent px-2 py-1 text-[10px] font-medium"
            style={{ backgroundColor: BUTTER, color: INK }}
          >
            Advance &rarr;
          </motion.button>
        )}
      </div>
    </motion.div>
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
