'use client';

import { useMemo, useState } from 'react';
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
type ComplianceStatus = 'compliant' | 'review_needed' | 'non_compliant';

type ChecklistItem = {
  id: string;
  category: string;
  item: string;
  status: ComplianceStatus;
  lastChecked: string;
  notes: string;
};

type LeaseCompliance = {
  id: string;
  property: string;
  totalUnits: number;
  compliant: number;
  needsReview: number;
  nonCompliant: number;
};

type OrdinanceAlert = {
  id: string;
  title: string;
  jurisdiction: string;
  effectiveDate: string;
  impact: 'high' | 'medium' | 'low';
  summary: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const CHECKLIST: ChecklistItem[] = [
  { id: 'c1',  category: 'Fair Housing',         item: 'Non-discriminatory advertising language',       status: 'compliant',      lastChecked: '2026-03-15', notes: 'All listings reviewed and updated.' },
  { id: 'c2',  category: 'Fair Housing',         item: 'Reasonable accommodation policy posted',        status: 'compliant',      lastChecked: '2026-03-15', notes: 'Posted in all leasing offices.' },
  { id: 'c3',  category: 'Fair Housing',         item: 'Consistent screening criteria documented',      status: 'review_needed',  lastChecked: '2026-02-20', notes: 'Income threshold varies by property; standardize.' },
  { id: 'c4',  category: 'Fair Housing',         item: 'Equal access to amenities policy',              status: 'compliant',      lastChecked: '2026-03-15', notes: 'All amenities open equally.' },
  { id: 'c5',  category: 'Fair Housing',         item: 'Service animal documentation procedures',       status: 'non_compliant',  lastChecked: '2026-01-10', notes: 'Staff requesting breed information -- needs retraining.' },
  { id: 'c6',  category: 'Safety & Habitability',item: 'Smoke detector inspection log',                 status: 'compliant',      lastChecked: '2026-04-01', notes: 'All units inspected Q1 2026.' },
  { id: 'c7',  category: 'Safety & Habitability',item: 'Lead paint disclosure (pre-1978 units)',        status: 'review_needed',  lastChecked: '2026-02-28', notes: 'Villa Sonoma Bldg A needs updated disclosure forms.' },
  { id: 'c8',  category: 'Safety & Habitability',item: 'Fire extinguisher expiration checks',           status: 'compliant',      lastChecked: '2026-03-20', notes: 'All units current through Dec 2026.' },
  { id: 'c9',  category: 'Lease & Disclosure',   item: 'Security deposit limit compliance (CA)',         status: 'compliant',      lastChecked: '2026-04-01', notes: 'All deposits within CA statutory limits.' },
  { id: 'c10', category: 'Lease & Disclosure',   item: 'Rent increase notice timing (60 days, > 10%)',  status: 'review_needed',  lastChecked: '2026-03-01', notes: 'One notice sent at 45 days for North Park Row unit D-105.' },
  { id: 'c11', category: 'Lease & Disclosure',   item: 'Mold disclosure provided at lease signing',     status: 'compliant',      lastChecked: '2026-03-15', notes: 'Included in all new lease packets.' },
  { id: 'c12', category: 'Data & Privacy',       item: 'Tenant PII stored per CCPA requirements',      status: 'compliant',      lastChecked: '2026-04-05', notes: 'Encrypted at rest and in transit.' },
  { id: 'c13', category: 'Data & Privacy',       item: 'Data retention & deletion policy',              status: 'non_compliant',  lastChecked: '2026-01-20', notes: 'No automated deletion for former-tenant records > 3 years.' },
];

const LEASE_COMPLIANCE: LeaseCompliance[] = [
  { id: 'lc1', property: 'Villa Sonoma',      totalUnits: 48, compliant: 44, needsReview: 3, nonCompliant: 1 },
  { id: 'lc2', property: 'Mission Bay Lofts', totalUnits: 36, compliant: 34, needsReview: 2, nonCompliant: 0 },
  { id: 'lc3', property: 'North Park Row',    totalUnits: 24, compliant: 20, needsReview: 3, nonCompliant: 1 },
];

const ORDINANCE_ALERTS: OrdinanceAlert[] = [
  { id: 'oa1', title: 'San Diego Tenant Protection Ordinance Update', jurisdiction: 'City of San Diego', effectiveDate: '2026-07-01', impact: 'high',   summary: 'Expanded just-cause eviction protections to units built after 1995. Review all lease termination procedures.' },
  { id: 'oa2', title: 'CA AB-1482 Rent Cap Adjustment',              jurisdiction: 'State of California', effectiveDate: '2026-08-01', impact: 'medium', summary: 'Annual rent cap adjusted to 5% + CPI (currently 3.2%). Maximum allowable increase: 8.2% for covered units.' },
  { id: 'oa3', title: 'Short-Term Rental Registration Deadline',     jurisdiction: 'City of San Diego', effectiveDate: '2026-06-15', impact: 'low',    summary: 'All STR units must be registered by this date. Non-compliance results in $1,000/day fine.' },
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Page ──────────────────────────────────────────────────── */
export default function CompliancePage() {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplianceStatus>('all');

  const categories = useMemo(() => Array.from(new Set(CHECKLIST.map((c) => c.category))), []);

  const filteredItems = useMemo(() => {
    let items = [...CHECKLIST];
    if (categoryFilter !== 'all') items = items.filter((i) => i.category === categoryFilter);
    if (statusFilter !== 'all') items = items.filter((i) => i.status === statusFilter);
    return items;
  }, [categoryFilter, statusFilter]);

  const totalItems = CHECKLIST.length;
  const compliantCount = CHECKLIST.filter((i) => i.status === 'compliant').length;
  const reviewCount = CHECKLIST.filter((i) => i.status === 'review_needed').length;
  const nonCompliantCount = CHECKLIST.filter((i) => i.status === 'non_compliant').length;
  const complianceScore = Math.round((compliantCount / totalItems) * 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Manager &middot; Compliance</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Compliance <em className="italic">Center</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Fair housing, safety, lease, and data-privacy compliance across all managed properties.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Download Audit Report</motion.button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Compliance score" value={`${complianceScore}%`} accent />
            <Kpi label="Items needing review" value={String(reviewCount)} hint={`${nonCompliantCount} non-compliant`} />
            <Kpi label="Last audit date" value="Mar 15, 2026" />
            <Kpi label="Next audit due" value="Jun 15, 2026" hint="67 days" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* ── Fair Housing Checklist ─────────────────────────── */}
        <section className="mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Compliance <em className="italic">checklist</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{filteredItems.length} items</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ComplianceStatus)} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
                <option value="all">All statuses</option>
                <option value="compliant">Compliant</option>
                <option value="review_needed">Review needed</option>
                <option value="non_compliant">Non-compliant</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                className="flex flex-col gap-2 rounded-lg border bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: HAIRLINE }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <StatusIndicator status={item.status} />
                    <span className="font-medium text-sm" style={{ color: INK }}>{item.item}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: DIM }}>
                    <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{item.category}</span>
                    <span>&middot;</span>
                    <span>Checked {fmtDate(item.lastChecked)}</span>
                  </div>
                  {item.notes && <div className="mt-1 text-xs" style={{ color: MID }}>{item.notes}</div>}
                </div>
                <StatusPill status={item.status} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Lease Compliance by Property ────────────────────── */}
        <section className="mb-12">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Lease <em className="italic">compliance</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>By property</p>

          <div className="grid gap-3 sm:grid-cols-3">
            {LEASE_COMPLIANCE.map((lc) => {
              const pct = Math.round((lc.compliant / lc.totalUnits) * 100);
              return (
                <motion.div key={lc.id} whileHover={{ y: -2 }} className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                  <div className="text-sm font-medium" style={{ color: INK }}>{lc.property}</div>
                  <div className="mt-3 text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{pct}%</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? GREEN : pct >= 75 ? '#D97706' : RED }} />
                  </div>
                  <div className="mt-3 flex justify-between text-xs" style={{ color: DIM }}>
                    <span>{lc.compliant} compliant</span>
                    <span>{lc.needsReview} review</span>
                    <span>{lc.nonCompliant} non-compliant</span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: DIM }}>{lc.totalUnits} total units</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Ordinance Alerts ────────────────────────────────── */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Ordinance <em className="italic">alerts</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Local and state regulatory changes</p>

          <div className="space-y-3">
            {ORDINANCE_ALERTS.map((alert) => (
              <motion.div
                key={alert.id}
                whileHover={{ y: -1 }}
                className="rounded-lg border bg-white p-5"
                style={{ borderColor: HAIRLINE, borderLeftWidth: 3, borderLeftColor: alert.impact === 'high' ? RED : alert.impact === 'medium' ? '#D97706' : DIM }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" style={{ color: INK }}>{alert.title}</span>
                      <ImpactBadge impact={alert.impact} />
                    </div>
                    <div className="mt-1 text-xs" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                      {alert.jurisdiction} &middot; Effective {fmtDate(alert.effectiveDate)}
                    </div>
                    <div className="mt-2 text-sm" style={{ color: MID }}>{alert.summary}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
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

function StatusIndicator({ status }: { status: ComplianceStatus }) {
  const color = status === 'compliant' ? GREEN : status === 'review_needed' ? '#D97706' : RED;
  return <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

function StatusPill({ status }: { status: ComplianceStatus }) {
  const map: Record<ComplianceStatus, { label: string; bg: string; text: string }> = {
    compliant:      { label: 'Compliant',      bg: '#F0FDF4', text: GREEN },
    review_needed:  { label: 'Review needed',  bg: '#FFFBEB', text: '#D97706' },
    non_compliant:  { label: 'Non-compliant',  bg: '#FEF2F2', text: RED },
  };
  const m = map[status];
  return <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: m.bg, color: m.text }}>{m.label}</span>;
}

function ImpactBadge({ impact }: { impact: 'high' | 'medium' | 'low' }) {
  const map = {
    high:   { label: 'High impact',   bg: '#FEF2F2', text: RED },
    medium: { label: 'Medium',        bg: '#FFFBEB', text: '#D97706' },
    low:    { label: 'Low',           bg: '#F5F5F5', text: DIM },
  };
  const m = map[impact];
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: m.bg, color: m.text }}>{m.label}</span>;
}
