'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Design tokens ──────────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ──────────────────────────────────────────────────────── */
type DepositStatus = 'held' | 'partially_refunded' | 'refunded';

type Deposit = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  dateCollected: string;
  status: DepositStatus;
  refundedAmount: number;
};

type Deduction = {
  label: string;
  amount: number;
};

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtMoneyExact = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Mock data ──────────────────────────────────────────────────── */
const MOCK_DEPOSITS: Deposit[] = [
  { id: 'd1', tenant: 'Maya Hernandez',   property: 'Villa Sonoma',      unit: 'A-204', amount: 2850, dateCollected: '2024-06-01', status: 'held',               refundedAmount: 0 },
  { id: 'd2', tenant: 'James Okafor',     property: 'Villa Sonoma',      unit: 'B-112', amount: 3100, dateCollected: '2025-01-15', status: 'held',               refundedAmount: 0 },
  { id: 'd3', tenant: 'Priya Kapoor',     property: 'Mission Bay Lofts', unit: 'C-301', amount: 3650, dateCollected: '2024-09-01', status: 'held',               refundedAmount: 0 },
  { id: 'd4', tenant: 'Marcus Reynolds',  property: 'North Park Row',    unit: 'D-105', amount: 2400, dateCollected: '2023-11-01', status: 'partially_refunded', refundedAmount: 1800 },
  { id: 'd5', tenant: 'Daniel Park',      property: 'Mission Bay Lofts', unit: 'F-410', amount: 3950, dateCollected: '2024-03-15', status: 'held',               refundedAmount: 0 },
  { id: 'd6', tenant: 'Aaliyah Brooks',   property: 'Villa Sonoma',      unit: 'G-102', amount: 2750, dateCollected: '2024-08-01', status: 'refunded',           refundedAmount: 2750 },
  { id: 'd7', tenant: "Liam O'Sullivan",  property: 'North Park Row',    unit: 'H-307', amount: 2550, dateCollected: '2024-05-01', status: 'held',               refundedAmount: 0 },
  { id: 'd8', tenant: 'Yuki Tanaka',      property: 'Mission Bay Lofts', unit: 'I-201', amount: 3400, dateCollected: '2025-02-01', status: 'refunded',           refundedAmount: 3150 },
];

/* ── KPIs ───────────────────────────────────────────────────────── */
const totalHeld = MOCK_DEPOSITS.filter((d) => d.status === 'held').reduce((s, d) => s + d.amount, 0);
const pendingRefunds = MOCK_DEPOSITS.filter((d) => d.status === 'partially_refunded').length;
const avgDeposit = Math.round(MOCK_DEPOSITS.reduce((s, d) => s + d.amount, 0) / MOCK_DEPOSITS.length);
const refundsYTD = MOCK_DEPOSITS.filter((d) => d.status === 'refunded' || d.status === 'partially_refunded').length;

/* ── Status badge ───────────────────────────────────────────────── */
const depositStatusPill = (status: DepositStatus) => {
  const map: Record<DepositStatus, { label: string; bg: string; text: string }> = {
    held:                { label: 'Held',               bg: 'rgba(21,128,61,0.08)',  text: GREEN },
    partially_refunded:  { label: 'Partial Refund',     bg: 'rgba(217,119,6,0.08)',  text: '#D97706' },
    refunded:            { label: 'Refunded',           bg: 'rgba(17,17,17,0.05)',   text: MID },
  };
  const m = map[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: m.bg, color: m.text }}>
      {m.label}
    </span>
  );
};

/* ── Page ───────────────────────────────────────────────────────── */
export default function DepositsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deductions, setDeductions] = useState<Record<string, Deduction[]>>({});

  const getDeductions = (id: string): Deduction[] =>
    deductions[id] ?? [
      { label: 'Cleaning', amount: 0 },
      { label: 'Damages', amount: 0 },
      { label: 'Unpaid rent', amount: 0 },
    ];

  const updateDeduction = (depositId: string, index: number, amount: number) => {
    const current = getDeductions(depositId);
    const updated = current.map((d, i) => (i === index ? { ...d, amount } : d));
    setDeductions({ ...deductions, [depositId]: updated });
  };

  const totalDeductions = (id: string) =>
    getDeductions(id).reduce((s, d) => s + (d.amount || 0), 0);

  const netRefund = (deposit: Deposit) =>
    Math.max(0, deposit.amount - deposit.refundedAmount - totalDeductions(deposit.id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
            Manager &middot; Deposits
          </p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Security <em className="italic">deposits</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Track deposits held, process refunds with itemized deductions, and maintain a clear audit trail.
          </p>

          {/* ── KPIs ─────────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total held" value={fmtMoney(totalHeld)} />
            <Kpi label="Pending refunds" value={String(pendingRefunds)} accent={pendingRefunds > 0} />
            <Kpi label="Avg deposit" value={fmtMoney(avgDeposit)} />
            <Kpi label="Refunds processed YTD" value={String(refundsYTD)} />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
          Deposit <em className="italic">ledger</em>
        </h2>
        <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{MOCK_DEPOSITS.length} deposits on file</p>

        {/* ── Table (desktop) ────────────────────────────────── */}
        <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Date Collected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEPOSITS.map((d) => (
                <>
                  <motion.tr
                    key={d.id}
                    whileHover={{ backgroundColor: 'rgba(249,217,106,0.06)' }}
                    className="border-b last:border-0 transition-colors cursor-default"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: INK }}>{d.tenant}</div>
                      <div className="text-xs" style={{ color: DIM }}>{d.unit}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: MID }}>{d.property}</td>
                    <td className="px-4 py-3 font-medium tabular-nums" style={{ color: INK }}>{fmtMoney(d.amount)}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: MID }}>{fmtDate(d.dateCollected)}</td>
                    <td className="px-4 py-3">{depositStatusPill(d.status)}</td>
                    <td className="px-4 py-3">
                      {d.status !== 'refunded' && (
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{ borderColor: expandedId === d.id ? INK : HAIRLINE, color: INK }}
                        >
                          {expandedId === d.id ? 'Cancel' : 'Process Refund'}
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>

                  {/* ── Expanded refund form ──────────────────── */}
                  <AnimatePresence>
                    {expandedId === d.id && (
                      <motion.tr
                        key={`${d.id}-form`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan={6} className="px-4 py-5" style={{ backgroundColor: 'rgba(249,217,106,0.04)' }}>
                          <div className="mx-auto max-w-xl">
                            <p className="mb-4 text-sm font-medium" style={{ color: INK }}>Itemized deductions for {d.tenant}</p>
                            <div className="space-y-3">
                              {getDeductions(d.id).map((ded, i) => (
                                <div key={ded.label} className="flex items-center gap-4">
                                  <label className="w-28 text-xs uppercase tracking-[0.14em]" style={{ color: DIM }}>{ded.label}</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: DIM }}>$</span>
                                    <input
                                      type="number"
                                      min={0}
                                      value={ded.amount || ''}
                                      onChange={(e) => updateDeduction(d.id, i, parseFloat(e.target.value) || 0)}
                                      placeholder="0.00"
                                      className="w-32 rounded-md border bg-white py-2 pl-7 pr-3 text-sm tabular-nums focus:outline-none"
                                      style={{ borderColor: HAIRLINE, color: INK }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-md border p-4" style={{ borderColor: HAIRLINE, backgroundColor: 'white' }}>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Total deductions</div>
                                <div className="text-sm font-medium tabular-nums" style={{ color: totalDeductions(d.id) > 0 ? RED : MID }}>
                                  {fmtMoneyExact(totalDeductions(d.id))}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Net refund</div>
                                <div className="text-lg font-medium tabular-nums" style={{ fontFamily: 'var(--font-heading)', color: GREEN }}>
                                  {fmtMoneyExact(netRefund(d))}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="rounded-md px-5 py-2 text-sm font-medium"
                                style={{ backgroundColor: INK, color: CREAM }}
                              >
                                Submit Refund
                              </motion.button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Cards (mobile) ─────────────────────────────────── */}
        <div className="grid gap-3 md:hidden">
          {MOCK_DEPOSITS.map((d) => (
            <div key={d.id} className="rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium" style={{ color: INK }}>{d.tenant}</div>
                    <div className="truncate text-xs" style={{ color: DIM }}>{d.unit} &middot; {d.property}</div>
                  </div>
                  {depositStatusPill(d.status)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium tabular-nums" style={{ color: INK }}>{fmtMoney(d.amount)}</span>
                  <span style={{ color: DIM }}>{fmtDate(d.dateCollected)}</span>
                </div>
                {d.status !== 'refunded' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                    className="mt-3 w-full rounded-md border px-3 py-2 text-xs font-medium"
                    style={{ borderColor: HAIRLINE, color: INK }}
                  >
                    {expandedId === d.id ? 'Cancel' : 'Process Refund'}
                  </motion.button>
                )}
              </div>

              <AnimatePresence>
                {expandedId === d.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border-t px-4 py-4"
                    style={{ borderColor: HAIRLINE, backgroundColor: 'rgba(249,217,106,0.04)' }}
                  >
                    <div className="space-y-3">
                      {getDeductions(d.id).map((ded, i) => (
                        <div key={ded.label} className="flex items-center gap-3">
                          <label className="w-24 text-xs uppercase tracking-[0.14em]" style={{ color: DIM }}>{ded.label}</label>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: DIM }}>$</span>
                            <input
                              type="number"
                              min={0}
                              value={ded.amount || ''}
                              onChange={(e) => updateDeduction(d.id, i, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full rounded-md border bg-white py-2 pl-7 pr-3 text-sm tabular-nums focus:outline-none"
                              style={{ borderColor: HAIRLINE, color: INK }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-md border bg-white p-3" style={{ borderColor: HAIRLINE }}>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM }}>Deductions</div>
                        <div className="text-xs font-medium tabular-nums" style={{ color: totalDeductions(d.id) > 0 ? RED : MID }}>
                          {fmtMoneyExact(totalDeductions(d.id))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM }}>Net refund</div>
                        <div className="text-base font-medium tabular-nums" style={{ fontFamily: 'var(--font-heading)', color: GREEN }}>
                          {fmtMoneyExact(netRefund(d))}
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 w-full rounded-md px-4 py-2 text-sm font-medium"
                      style={{ backgroundColor: INK, color: CREAM }}
                    >
                      Submit Refund
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Components ─────────────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}
