'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
type PaymentMethod = 'card' | 'ach';
type PaymentStatus = 'paid' | 'pending' | 'failed' | 'late';
type ConnectStatus = 'none' | 'pending' | 'complete';
type CollectionStatus = 'paid' | 'pending' | 'late';

type Payment = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl: string;
};

type UnitCard = {
  id: string;
  unit: string;
  tenant: string;
  property: string;
  rent: number;
  status: CollectionStatus;
};

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Mock data ──────────────────────────────────────────────────── */
const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1',  tenant: 'Maya Hernandez',   property: 'Villa Sonoma',      unit: 'A-204', amount: 2850, date: '2026-04-01', method: 'ach',  status: 'paid',    receiptUrl: '#' },
  { id: 'p2',  tenant: 'James Okafor',     property: 'Villa Sonoma',      unit: 'B-112', amount: 3100, date: '2026-04-01', method: 'card', status: 'paid',    receiptUrl: '#' },
  { id: 'p3',  tenant: 'Priya Kapoor',     property: 'Mission Bay Lofts', unit: 'C-301', amount: 3650, date: '2026-04-04', method: 'ach',  status: 'pending', receiptUrl: '#' },
  { id: 'p4',  tenant: 'Marcus Reynolds',  property: 'North Park Row',    unit: 'D-105', amount: 2400, date: '2026-03-28', method: 'card', status: 'late',    receiptUrl: '#' },
  { id: 'p5',  tenant: 'Sasha Mendoza',    property: 'North Park Row',    unit: 'E-208', amount: 2600, date: '2026-04-01', method: 'ach',  status: 'paid',    receiptUrl: '#' },
  { id: 'p6',  tenant: 'Daniel Park',      property: 'Mission Bay Lofts', unit: 'F-410', amount: 3950, date: '2026-04-02', method: 'ach',  status: 'paid',    receiptUrl: '#' },
  { id: 'p7',  tenant: 'Aaliyah Brooks',   property: 'Villa Sonoma',      unit: 'G-102', amount: 2750, date: '2026-04-01', method: 'card', status: 'paid',    receiptUrl: '#' },
  { id: 'p8',  tenant: "Liam O'Sullivan",  property: 'North Park Row',    unit: 'H-307', amount: 2550, date: '2026-03-15', method: 'ach',  status: 'failed',  receiptUrl: '#' },
  { id: 'p9',  tenant: 'Yuki Tanaka',      property: 'Mission Bay Lofts', unit: 'I-201', amount: 3400, date: '2026-04-01', method: 'ach',  status: 'paid',    receiptUrl: '#' },
  { id: 'p10', tenant: 'Camille Dubois',   property: 'Villa Sonoma',      unit: 'J-115', amount: 2900, date: '2026-04-01', method: 'card', status: 'paid',    receiptUrl: '#' },
  { id: 'p11', tenant: 'Ethan Morales',    property: 'North Park Row',    unit: 'K-203', amount: 2350, date: '2026-04-05', method: 'ach',  status: 'pending', receiptUrl: '#' },
  { id: 'p12', tenant: 'Nina Volkov',      property: 'Mission Bay Lofts', unit: 'L-108', amount: 3200, date: '2026-04-01', method: 'card', status: 'paid',    receiptUrl: '#' },
];

const MOCK_UNITS: UnitCard[] = [
  // Villa Sonoma
  { id: 'u1',  unit: 'A-204', tenant: 'Maya Hernandez',  property: 'Villa Sonoma',      rent: 2850, status: 'paid' },
  { id: 'u2',  unit: 'B-112', tenant: 'James Okafor',    property: 'Villa Sonoma',      rent: 3100, status: 'paid' },
  { id: 'u3',  unit: 'G-102', tenant: 'Aaliyah Brooks',  property: 'Villa Sonoma',      rent: 2750, status: 'paid' },
  { id: 'u4',  unit: 'J-115', tenant: 'Camille Dubois',  property: 'Villa Sonoma',      rent: 2900, status: 'paid' },
  { id: 'u5',  unit: 'M-310', tenant: 'Aiko Sato',       property: 'Villa Sonoma',      rent: 2700, status: 'pending' },
  { id: 'u6',  unit: 'N-401', tenant: 'Derek Kim',       property: 'Villa Sonoma',      rent: 3050, status: 'paid' },
  // Mission Bay Lofts
  { id: 'u7',  unit: 'C-301', tenant: 'Priya Kapoor',    property: 'Mission Bay Lofts', rent: 3650, status: 'pending' },
  { id: 'u8',  unit: 'F-410', tenant: 'Daniel Park',     property: 'Mission Bay Lofts', rent: 3950, status: 'paid' },
  { id: 'u9',  unit: 'I-201', tenant: 'Yuki Tanaka',     property: 'Mission Bay Lofts', rent: 3400, status: 'paid' },
  { id: 'u10', unit: 'L-108', tenant: 'Nina Volkov',     property: 'Mission Bay Lofts', rent: 3200, status: 'paid' },
  { id: 'u11', unit: 'O-205', tenant: 'Sam Reeves',      property: 'Mission Bay Lofts', rent: 3550, status: 'late' },
  { id: 'u12', unit: 'P-312', tenant: 'Layla Farouk',    property: 'Mission Bay Lofts', rent: 3800, status: 'paid' },
  // North Park Row
  { id: 'u13', unit: 'D-105', tenant: 'Marcus Reynolds', property: 'North Park Row',    rent: 2400, status: 'late' },
  { id: 'u14', unit: 'E-208', tenant: 'Sasha Mendoza',   property: 'North Park Row',    rent: 2600, status: 'paid' },
  { id: 'u15', unit: 'H-307', tenant: "Liam O'Sullivan", property: 'North Park Row',    rent: 2550, status: 'late' },
  { id: 'u16', unit: 'K-203', tenant: 'Ethan Morales',   property: 'North Park Row',    rent: 2350, status: 'pending' },
  { id: 'u17', unit: 'Q-104', tenant: 'Jade Thompson',   property: 'North Park Row',    rent: 2500, status: 'paid' },
  { id: 'u18', unit: 'R-209', tenant: 'Carlos Rivera',   property: 'North Park Row',    rent: 2450, status: 'paid' },
];

/* ── KPIs (derived) ─────────────────────────────────────────────── */
const collectedThisMonth = MOCK_PAYMENTS.filter((p) => p.status === 'paid' && p.date.startsWith('2026-04')).reduce((s, p) => s + p.amount, 0);
const outstandingBalance = MOCK_PAYMENTS.filter((p) => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);
const autopayPct = 72;
const lateCount = MOCK_UNITS.filter((u) => u.status === 'late').length;

/* ── Stripe Connect mock ────────────────────────────────────────── */
const MOCK_CONNECT: ConnectStatus = 'complete';
const MOCK_STRIPE_ACCOUNT_ID = 'acct_1R3xJk2eZvKYl0';

/* ── Page ───────────────────────────────────────────────────────── */
export default function PaymentsPage() {
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>(MOCK_CONNECT);
  const [connectLoading, setConnectLoading] = useState(false);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordForm, setRecordForm] = useState({ tenant: '', amount: '', method: 'ach' as PaymentMethod, date: '' });

  const properties = Array.from(new Set(MOCK_UNITS.map((u) => u.property)));

  const handleOnboard = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/stripe/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current' }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      console.error('Onboarding failed');
    } finally {
      setConnectLoading(false);
    }
  };

  const statusPill = (status: PaymentStatus) => {
    const map: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
      paid:    { label: 'Paid',    bg: 'rgba(21,128,61,0.08)', text: GREEN },
      pending: { label: 'Pending', bg: 'rgba(217,119,6,0.08)', text: '#D97706' },
      failed:  { label: 'Failed',  bg: 'rgba(185,28,28,0.08)', text: RED },
      late:    { label: 'Late',    bg: 'rgba(185,28,28,0.08)', text: RED },
    };
    const m = map[status];
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: m.bg, color: m.text }}>
        {m.label}
      </span>
    );
  };

  const methodBadge = (method: PaymentMethod) => (
    <span className="inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ borderColor: HAIRLINE, color: MID }}>
      {method === 'card' ? 'Card' : 'ACH'}
    </span>
  );

  const collectionColor = (status: CollectionStatus) => {
    if (status === 'paid') return { border: GREEN, bg: 'rgba(21,128,61,0.04)', dot: GREEN };
    if (status === 'pending') return { border: '#D97706', bg: 'rgba(217,119,6,0.04)', dot: '#D97706' };
    return { border: RED, bg: 'rgba(185,28,28,0.04)', dot: RED };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
            Manager &middot; Payments
          </p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Rent <em className="italic">collection</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Track every dollar across your portfolio. Stripe-powered payments, automatic late fees, and real-time collection status.
          </p>

          {/* ── Connect onboarding card ──────────────────────── */}
          <div className="mt-6 rounded-lg border bg-white p-5" style={{ borderColor: connectStatus === 'none' ? BUTTER : HAIRLINE }}>
            {connectStatus === 'none' && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: INK }}>Start collecting rent online</p>
                  <p className="mt-0.5 text-xs" style={{ color: DIM }}>Connect a Stripe account to accept card and ACH payments from tenants.</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOnboard}
                  disabled={connectLoading}
                  className="shrink-0 rounded-md px-5 py-2.5 text-sm font-medium transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: BUTTER, color: INK }}
                >
                  {connectLoading ? 'Redirecting...' : 'Enable Rent Collection'}
                </motion.button>
              </div>
            )}
            {connectStatus === 'pending' && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(249,217,106,0.2)', color: '#92700C' }}>
                  Onboarding in progress
                </span>
                <span className="text-xs" style={{ color: DIM }}>Complete your Stripe verification to start receiving payouts.</span>
              </div>
            )}
            {connectStatus === 'complete' && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: 'rgba(21,128,61,0.08)', color: GREEN }}>
                  Payouts enabled
                </span>
                <span className="font-mono text-xs" style={{ color: DIM }}>{MOCK_STRIPE_ACCOUNT_ID}</span>
              </div>
            )}
          </div>

          {/* ── KPIs ─────────────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Collected this month" value={fmtMoney(collectedThisMonth)} />
            <Kpi label="Outstanding balance" value={fmtMoney(outstandingBalance)} accent />
            <Kpi label="Autopay enrolled" value={`${autopayPct}%`} hint="13 of 18 tenants" />
            <Kpi label="Late payments" value={String(lateCount)} hint="Past grace period" accent={lateCount > 0} />
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* ── Payment History ────────────────────────────────── */}
        <section className="mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Payment <em className="italic">history</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{MOCK_PAYMENTS.length} transactions this cycle</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRecordForm(!showRecordForm)}
              className="shrink-0 rounded-md px-4 py-2 text-xs font-medium"
              style={{ backgroundColor: BUTTER, color: INK }}
            >
              {showRecordForm ? 'Cancel' : '+ Record Payment'}
            </motion.button>
          </div>

          {/* ── Record Payment form ──────────────────────────── */}
          {showRecordForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden rounded-lg border bg-white p-5"
              style={{ borderColor: HAIRLINE }}
            >
              <p className="mb-4 text-sm font-medium" style={{ color: INK }}>Record a manual payment</p>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Tenant</label>
                  <select
                    value={recordForm.tenant}
                    onChange={(e) => setRecordForm({ ...recordForm, tenant: e.target.value })}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: HAIRLINE, color: INK }}
                  >
                    <option value="">Select tenant...</option>
                    {MOCK_UNITS.map((u) => (
                      <option key={u.id} value={u.tenant}>{u.tenant} ({u.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Amount</label>
                  <input
                    type="number"
                    value={recordForm.amount}
                    onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: HAIRLINE, color: INK }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Method</label>
                  <select
                    value={recordForm.method}
                    onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value as PaymentMethod })}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: HAIRLINE, color: INK }}
                  >
                    <option value="ach">ACH</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Date</label>
                  <input
                    type="date"
                    value={recordForm.date}
                    onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                    className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ borderColor: HAIRLINE, color: INK }}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-md px-5 py-2 text-sm font-medium"
                  style={{ backgroundColor: INK, color: CREAM }}
                >
                  Save Payment
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Table (desktop) ──────────────────────────────── */}
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAYMENTS.map((p) => (
                  <motion.tr
                    key={p.id}
                    whileHover={{ backgroundColor: 'rgba(249,217,106,0.06)' }}
                    className="border-b last:border-0 transition-colors cursor-default"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: INK }}>{p.tenant}</div>
                      <div className="text-xs" style={{ color: DIM }}>{p.unit}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: MID }}>{p.property}</td>
                    <td className="px-4 py-3 font-medium tabular-nums" style={{ color: INK }}>{fmtMoney(p.amount)}</td>
                    <td className="px-4 py-3 tabular-nums" style={{ color: MID }}>{fmtDate(p.date)}</td>
                    <td className="px-4 py-3">{methodBadge(p.method)}</td>
                    <td className="px-4 py-3">{statusPill(p.status)}</td>
                    <td className="px-4 py-3">
                      <a href={p.receiptUrl} className="text-xs underline underline-offset-2 transition-colors hover:opacity-70" style={{ color: MID }}>View</a>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Cards (mobile) ───────────────────────────────── */}
          <div className="grid gap-3 md:hidden">
            {MOCK_PAYMENTS.map((p) => (
              <div key={p.id} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium" style={{ color: INK }}>{p.tenant}</div>
                    <div className="truncate text-xs" style={{ color: DIM }}>{p.unit} &middot; {p.property}</div>
                  </div>
                  {statusPill(p.status)}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium tabular-nums" style={{ color: INK }}>{fmtMoney(p.amount)}</span>
                  <span style={{ color: DIM }}>{fmtDate(p.date)}</span>
                  {methodBadge(p.method)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Collection Status Board ────────────────────────── */}
        <section>
          <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Collection <em className="italic">status</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>
            {MOCK_UNITS.length} units across {properties.length} properties
          </p>

          {properties.map((property) => {
            const units = MOCK_UNITS.filter((u) => u.property === property);
            return (
              <div key={property} className="mb-8">
                <h3 className="mb-3 text-sm font-medium" style={{ color: INK }}>{property}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {units.map((u) => {
                    const c = collectionColor(u.status);
                    return (
                      <motion.div
                        key={u.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-lg border bg-white p-3 transition-shadow hover:shadow-md"
                        style={{ borderColor: HAIRLINE, borderLeftWidth: 3, borderLeftColor: c.border, backgroundColor: c.bg }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{u.unit}</span>
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.dot }} />
                        </div>
                        <div className="mt-1.5 truncate text-xs" style={{ color: MID }}>{u.tenant}</div>
                        <div className="mt-1 text-sm font-medium tabular-nums" style={{ color: INK }}>{fmtMoney(u.rent)}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: c.border }}>{u.status}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
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
