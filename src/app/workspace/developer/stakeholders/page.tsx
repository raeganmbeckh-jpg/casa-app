'use client';

import { useState, useMemo } from 'react';
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
type RecipientType = 'investor' | 'lender' | 'owner';
type MessageType = 'monthly report' | 'draw request' | 'milestone update';
type MessageStatus = 'sent' | 'read' | 'responded';

type Message = {
  id: string;
  recipient: string;
  recipientType: RecipientType;
  subject: string;
  type: MessageType;
  dateSent: string;
  status: MessageStatus;
};

/* ── Mock data ─────────────────────────────────────────────────── */
const MOCK_MESSAGES: Message[] = [
  { id: 'm1', recipient: 'Greystone Capital Partners', recipientType: 'investor', subject: 'Q1 2026 Quarterly Performance Report — Citrus Heights', type: 'monthly report', dateSent: '2026-04-01', status: 'responded' },
  { id: 'm2', recipient: 'Pacific Western Bank', recipientType: 'lender', subject: 'Draw Request #7 — Vertical Construction Phase 2', type: 'draw request', dateSent: '2026-04-03', status: 'read' },
  { id: 'm3', recipient: 'Harborview Trust LLC', recipientType: 'investor', subject: 'Foundation Completion — Milestone Achieved', type: 'milestone update', dateSent: '2026-04-05', status: 'sent' },
  { id: 'm4', recipient: 'Linda Marchetti', recipientType: 'owner', subject: 'March 2026 Monthly Construction Update', type: 'monthly report', dateSent: '2026-03-31', status: 'responded' },
  { id: 'm5', recipient: 'Apex Equity Fund II', recipientType: 'investor', subject: 'Draw Request #6 — Framing & Rough MEP', type: 'draw request', dateSent: '2026-03-18', status: 'responded' },
  { id: 'm6', recipient: 'First Republic CRE', recipientType: 'lender', subject: 'February Monthly Report — Vista del Mar', type: 'monthly report', dateSent: '2026-03-02', status: 'read' },
  { id: 'm7', recipient: 'Summit Ridge Holdings', recipientType: 'investor', subject: 'Entitlement Approval — Milestone Update', type: 'milestone update', dateSent: '2026-03-10', status: 'responded' },
  { id: 'm8', recipient: 'Pacific Western Bank', recipientType: 'lender', subject: 'Draw Request #5 — Site Work & Utilities', type: 'draw request', dateSent: '2026-02-20', status: 'responded' },
  { id: 'm9', recipient: 'Greystone Capital Partners', recipientType: 'investor', subject: 'February 2026 Investor Letter', type: 'monthly report', dateSent: '2026-02-28', status: 'read' },
  { id: 'm10', recipient: 'Linda Marchetti', recipientType: 'owner', subject: 'Topping-Out Ceremony — Milestone Reached', type: 'milestone update', dateSent: '2026-04-07', status: 'sent' },
];

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Page ──────────────────────────────────────────────────────── */
export default function StakeholderCommunicationsPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | MessageType>('all');
  const [showCompose, setShowCompose] = useState(false);

  const rows = useMemo(() => {
    let r = [...MOCK_MESSAGES];
    if (typeFilter !== 'all') r = r.filter((m) => m.type === typeFilter);
    r.sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime());
    return r;
  }, [typeFilter]);

  const sentThisMonth = MOCK_MESSAGES.filter((m) => m.dateSent >= '2026-04-01').length;
  const pendingDraws = MOCK_MESSAGES.filter((m) => m.type === 'draw request' && m.status !== 'responded').length;
  const investorCount = new Set(MOCK_MESSAGES.filter((m) => m.recipientType === 'investor').map((m) => m.recipient)).size;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Stakeholders</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Stakeholder <em className="italic">Communications</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Centralized log of investor, lender, and owner communications. Every draw request, report, and milestone in one view.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.03 }} className="rounded-md border px-3 py-2 text-xs font-medium transition-colors" style={{ borderColor: HAIRLINE, color: MID }}>Export</motion.button>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => setShowCompose(!showCompose)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>+ Compose</motion.button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Sent this month" value={String(sentThisMonth)} />
            <Kpi label="Avg response time" value="1.4 days" hint="Across all recipients" />
            <Kpi label="Pending draws" value={String(pendingDraws)} accent={pendingDraws > 0} />
            <Kpi label="Investor count" value={String(investorCount)} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Compose form */}
        {showCompose && (
          <section className="mb-8 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <h2 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>New <em className="italic">message</em></h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Recipient</label>
                <input className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} placeholder="Greystone Capital Partners" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Recipient type</label>
                <select className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }}>
                  <option>Investor</option>
                  <option>Lender</option>
                  <option>Owner</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Subject</label>
                <input className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }} placeholder="Q1 2026 Performance Report" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>Type</label>
                <select className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: HAIRLINE }}>
                  <option>Monthly Report</option>
                  <option>Draw Request</option>
                  <option>Milestone Update</option>
                </select>
              </div>
              <div className="flex items-end">
                <motion.button whileHover={{ scale: 1.03 }} className="rounded-md px-4 py-2 text-sm font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Send message</motion.button>
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: HAIRLINE, color: MID }}>
            <option value="all">All types</option>
            <option value="monthly report">Monthly Report</option>
            <option value="draw request">Draw Request</option>
            <option value="milestone update">Milestone Update</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date sent</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <motion.tr key={m.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0 cursor-default" style={{ borderColor: HAIRLINE }}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: INK }}>{m.recipient}</div>
                    <div className="text-xs capitalize" style={{ color: DIM }}>{m.recipientType}</div>
                  </td>
                  <td className="px-4 py-3" style={{ color: MID }}>{m.subject}</td>
                  <td className="px-4 py-3"><TypePill type={m.type} /></td>
                  <td className="px-4 py-3" style={{ color: MID }}>{fmtDate(m.dateSent)}</td>
                  <td className="px-4 py-3"><StatusPill status={m.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
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

function TypePill({ type }: { type: MessageType }) {
  const map: Record<MessageType, string> = {
    'monthly report': 'bg-blue-50 text-blue-800 border-blue-200',
    'draw request': 'bg-amber-50 text-amber-800 border-amber-200',
    'milestone update': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[type]}`}>{type}</span>;
}

function StatusPill({ status }: { status: MessageStatus }) {
  const map: Record<MessageStatus, { cls: string }> = {
    sent: { cls: 'bg-neutral-50 text-neutral-700 border-neutral-200' },
    read: { cls: 'bg-blue-50 text-blue-800 border-blue-200' },
    responded: { cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[status].cls}`}>{status}</span>;
}
