'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/* ── design tokens ── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';

/* ── types ── */
type LoanStatus = 'Lead' | 'Application' | 'Processing' | 'Underwriting' | 'Conditional' | 'CTC' | 'Funded';

type LoanApp = {
  id: string;
  borrower: string;
  property: string;
  loanAmount: number;
  propertyValue: number;
  ltv: number;
  status: LoanStatus;
  daysInStage: number;
  enteredStage: string;
};

const STATUSES: LoanStatus[] = ['Lead', 'Application', 'Processing', 'Underwriting', 'Conditional', 'CTC', 'Funded'];

const MOCK_APPS: LoanApp[] = [
  { id: 'l1', borrower: 'Elena Vasquez',    property: '1842 Olive St, San Diego, CA',    loanAmount: 425000,  propertyValue: 560000,  ltv: 75.9, status: 'Lead',          daysInStage: 2,  enteredStage: '2026-04-07' },
  { id: 'l2', borrower: 'James Whitfield',  property: '330 Harbor Dr #12, Oceanside, CA', loanAmount: 615000,  propertyValue: 780000,  ltv: 78.8, status: 'Application',   daysInStage: 5,  enteredStage: '2026-04-04' },
  { id: 'l3', borrower: 'Priya Sharma',     property: '9100 Mira Mesa Blvd, SD, CA',     loanAmount: 340000,  propertyValue: 490000,  ltv: 69.4, status: 'Processing',    daysInStage: 8,  enteredStage: '2026-04-01' },
  { id: 'l4', borrower: 'Marcus Thompson',  property: '2715 5th Ave, San Diego, CA',     loanAmount: 520000,  propertyValue: 640000,  ltv: 81.3, status: 'Underwriting',  daysInStage: 12, enteredStage: '2026-03-28' },
  { id: 'l5', borrower: 'Sarah Chen',       property: '4480 Clairemont Dr, SD, CA',      loanAmount: 375000,  propertyValue: 510000,  ltv: 73.5, status: 'Conditional',   daysInStage: 3,  enteredStage: '2026-04-06' },
  { id: 'l6', borrower: 'David Okafor',     property: '1120 Pacific Hwy, SD, CA',        loanAmount: 890000,  propertyValue: 1150000, ltv: 77.4, status: 'CTC',           daysInStage: 1,  enteredStage: '2026-04-08' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function LoanPipelinePage() {
  const [apps, setApps] = useState<LoanApp[]>(MOCK_APPS);

  const advanceStatus = (id: string) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const idx = STATUSES.indexOf(a.status);
        if (idx >= STATUSES.length - 1) return a;
        return { ...a, status: STATUSES[idx + 1], daysInStage: 0 };
      }),
    );
  };

  const activeApps = apps.filter((a) => a.status !== 'Funded').length;
  const pipelineVolume = apps.filter((a) => a.status !== 'Funded').reduce((s, a) => s + a.loanAmount, 0);
  const avgLtv = apps.length > 0 ? apps.reduce((s, a) => s + a.ltv, 0) / apps.length : 0;
  const fundedYTD = apps.filter((a) => a.status === 'Funded').reduce((s, a) => s + a.loanAmount, 0) + 2340000; // include prior funded

  return (
    <div className="min-h-screen text-[var(--color-ink)]" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)' }}>
      {/* ── header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender · Pipeline</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Loan <em className="italic">Pipeline</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Track every application from first inquiry to funded. Click a card to advance it to the next stage.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Active applications" value={String(activeApps)} />
            <Kpi label="Pipeline volume" value={fmtMoney(pipelineVolume)} />
            <Kpi label="Avg LTV" value={`${avgLtv.toFixed(1)}%`} />
            <Kpi label="Funded YTD" value={fmtMoney(fundedYTD)} accent />
          </div>
        </div>
      </header>

      {/* ── kanban columns ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const col = apps.filter((a) => a.status === status);
            return (
              <div key={status} className="w-64 shrink-0">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{status}</span>
                  <span className="text-xs" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{col.length}</span>
                </div>
                <div className="space-y-3">
                  {col.length === 0 && (
                    <div className="rounded-lg border bg-white p-4 text-sm italic" style={{ borderColor: HAIRLINE, fontFamily: 'var(--font-heading)', color: DIM }}>
                      No applications.
                    </div>
                  )}
                  {col.map((app) => (
                    <PipelineCard key={app.id} app={app} onAdvance={advanceStatus} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ── components ── */

function PipelineCard({ app, onAdvance }: { app: LoanApp; onAdvance: (id: string) => void }) {
  const ltvColor = app.ltv > 80 ? '#B91C1C' : app.ltv > 75 ? '#D97706' : '#15803D';
  const isFunded = app.status === 'Funded';
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
      onClick={() => onAdvance(app.id)}
      disabled={isFunded}
      className="w-full rounded-lg border bg-white p-4 text-left transition-colors"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="font-medium" style={{ color: INK, fontSize: 14 }}>{app.borrower}</div>
      <div className="mt-0.5 text-xs" style={{ color: MID }}>{app.property}</div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Loan</div>
          <div className="mt-0.5 font-medium" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(app.loanAmount)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>LTV</div>
          <div className="mt-0.5 font-medium" style={{ color: ltvColor, fontFamily: 'var(--font-geist-mono)' }}>{app.ltv.toFixed(1)}%</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-2" style={{ borderColor: HAIRLINE }}>
        <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
          {app.daysInStage}d in stage
        </span>
        {!isFunded && (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
            Advance →
          </span>
        )}
      </div>
    </motion.button>
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
