'use client';

import { useMemo, useState } from 'react';
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
type ComplianceStatus = 'met' | 'warning' | 'breach';

type Covenant = {
  name: string;
  requirement: string;
  currentValue: string;
  status: ComplianceStatus;
};

type Loan = {
  id: string;
  borrower: string;
  property: string;
  loanAmount: number;
  maturityDate: string;
  covenants: Covenant[];
};

/* ── Mock data ─────────────────────────────────────────────────── */
const MOCK_LOANS: Loan[] = [
  {
    id: 'ln1',
    borrower: 'Citrus Heights Development LLC',
    property: '88 Citrus Blvd, Escondido',
    loanAmount: 12_400_000,
    maturityDate: '2028-06-01',
    covenants: [
      { name: 'Min DSCR', requirement: '>= 1.25x', currentValue: '1.08x', status: 'breach' },
      { name: 'Max LTV', requirement: '<= 75%', currentValue: '72%', status: 'met' },
      { name: 'Insurance', requirement: 'Current', currentValue: 'Current', status: 'met' },
      { name: 'Quarterly reporting', requirement: 'Within 45 days', currentValue: '38 days', status: 'met' },
    ],
  },
  {
    id: 'ln2',
    borrower: 'Pacific Ridge Capital',
    property: '2200 Camino del Rio, San Diego',
    loanAmount: 8_750_000,
    maturityDate: '2027-12-15',
    covenants: [
      { name: 'Min DSCR', requirement: '>= 1.20x', currentValue: '1.31x', status: 'met' },
      { name: 'Max LTV', requirement: '<= 70%', currentValue: '68%', status: 'met' },
      { name: 'Insurance', requirement: 'Current', currentValue: 'Current', status: 'met' },
      { name: 'Annual audit', requirement: 'By Mar 31', currentValue: 'Received', status: 'met' },
    ],
  },
  {
    id: 'ln3',
    borrower: 'Mesa Verde Holdings',
    property: '4500 University Ave, La Mesa',
    loanAmount: 5_200_000,
    maturityDate: '2026-09-30',
    covenants: [
      { name: 'Min DSCR', requirement: '>= 1.15x', currentValue: '1.18x', status: 'met' },
      { name: 'Max LTV', requirement: '<= 80%', currentValue: '78%', status: 'warning' },
      { name: 'Insurance', requirement: 'Current', currentValue: 'Expiring May 15', status: 'warning' },
      { name: 'Monthly reporting', requirement: 'Within 30 days', currentValue: '22 days', status: 'met' },
    ],
  },
  {
    id: 'ln4',
    borrower: 'Harbor Point Investors',
    property: '1100 Harbor Dr, Oceanside',
    loanAmount: 15_600_000,
    maturityDate: '2029-03-01',
    covenants: [
      { name: 'Min DSCR', requirement: '>= 1.30x', currentValue: '1.42x', status: 'met' },
      { name: 'Max LTV', requirement: '<= 65%', currentValue: '58%', status: 'met' },
      { name: 'Insurance', requirement: 'Current', currentValue: 'Current', status: 'met' },
      { name: 'Quarterly reporting', requirement: 'Within 45 days', currentValue: '41 days', status: 'met' },
    ],
  },
  {
    id: 'ln5',
    borrower: 'Rancho Vista LLC',
    property: '7800 El Camino Real, Carlsbad',
    loanAmount: 6_800_000,
    maturityDate: '2027-01-15',
    covenants: [
      { name: 'Min DSCR', requirement: '>= 1.20x', currentValue: '1.22x', status: 'met' },
      { name: 'Max LTV', requirement: '<= 75%', currentValue: '74%', status: 'warning' },
      { name: 'Insurance', requirement: 'Current', currentValue: 'Current', status: 'met' },
      { name: 'Annual audit', requirement: 'By Mar 31', currentValue: 'Pending', status: 'warning' },
    ],
  },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Page ──────────────────────────────────────────────────────── */
export default function CovenantMonitoringPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | ComplianceStatus>('all');

  const allCovenants = MOCK_LOANS.flatMap((l) => l.covenants);
  const metCount = allCovenants.filter((c) => c.status === 'met').length;
  const metPct = Math.round((metCount / allCovenants.length) * 100);
  const breachCount = allCovenants.filter((c) => c.status === 'breach').length;
  const upcomingMaturities = MOCK_LOANS.filter((l) => {
    const d = new Date(l.maturityDate).getTime() - new Date('2026-04-09').getTime();
    return d > 0 && d < 365 * 24 * 60 * 60 * 1000;
  }).length;

  const filteredLoans = useMemo(() => {
    if (statusFilter === 'all') return MOCK_LOANS;
    return MOCK_LOANS.filter((l) => l.covenants.some((c) => c.status === statusFilter));
  }, [statusFilter]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender &middot; Covenants</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Covenant <em className="italic">Monitoring</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Real-time compliance tracking across your loan portfolio. Breaches surface immediately so you can act before they escalate.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Loans monitored" value={String(MOCK_LOANS.length)} />
            <Kpi label="Covenants met" value={`${metPct}%`} hint={`${metCount} of ${allCovenants.length}`} />
            <Kpi label="Active breaches" value={String(breachCount)} accent={breachCount > 0} />
            <Kpi label="Upcoming maturities" value={String(upcomingMaturities)} hint="Within 12 months" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Breach alerts */}
        {breachCount > 0 && (
          <section className="mb-8">
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
              Breach <em className="italic">Alerts</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Immediate attention required</p>
            {MOCK_LOANS.filter((l) => l.covenants.some((c) => c.status === 'breach')).map((l) => (
              <motion.div key={l.id} whileHover={{ x: 2 }} className="mb-3 rounded-lg border bg-white p-5" style={{ borderColor: RED, borderLeftWidth: 4, borderLeftColor: RED }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium" style={{ color: INK }}>{l.property}</h3>
                    <p className="text-xs" style={{ color: DIM }}>{l.borrower} &middot; {fmtMoney(l.loanAmount)}</p>
                  </div>
                  <span className="rounded-full border px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '#FEF2F2', color: RED, borderColor: '#FECACA' }}>BREACH</span>
                </div>
                <div className="mt-3">
                  {l.covenants.filter((c) => c.status === 'breach').map((c) => (
                    <div key={c.name} className="text-sm" style={{ color: MID }}>
                      <strong style={{ color: RED }}>{c.name}</strong>: current {c.currentValue} vs required {c.requirement}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </section>
        )}

        {/* Filter */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Loan <em className="italic">Portfolio</em></h2>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{filteredLoans.length} loans</p>
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: HAIRLINE, color: MID }}>
            <option value="all">All statuses</option>
            <option value="met">Met</option>
            <option value="warning">Warning</option>
            <option value="breach">Breach</option>
          </select>
        </div>

        {/* Loan cards with covenant tables */}
        <div className="space-y-4">
          {filteredLoans.map((l) => (
            <motion.div key={l.id} whileHover={{ y: -1, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }} className="rounded-lg border bg-white overflow-hidden" style={{ borderColor: HAIRLINE }}>
              <div className="p-5" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium" style={{ color: INK }}>{l.property}</h3>
                    <p className="text-sm" style={{ color: DIM }}>{l.borrower}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(l.loanAmount)}</div>
                    <div className="text-xs" style={{ color: DIM }}>Matures {fmtDate(l.maturityDate)}</div>
                  </div>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                    <th className="px-5 py-2.5 font-medium">Covenant</th>
                    <th className="px-5 py-2.5 font-medium">Requirement</th>
                    <th className="px-5 py-2.5 font-medium">Current</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {l.covenants.map((c) => (
                    <tr key={c.name} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                      <td className="px-5 py-2.5 font-medium" style={{ color: INK }}>{c.name}</td>
                      <td className="px-5 py-2.5" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{c.requirement}</td>
                      <td className="px-5 py-2.5" style={{ fontFamily: 'var(--font-geist-mono)', color: c.status === 'breach' ? RED : c.status === 'warning' ? '#D97706' : INK }}>{c.currentValue}</td>
                      <td className="px-5 py-2.5"><CompliancePill status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Components ────────────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? RED : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: accent ? RED : INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function CompliancePill({ status }: { status: ComplianceStatus }) {
  const map: Record<ComplianceStatus, string> = {
    met: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    breach: 'bg-rose-50 text-rose-800 border-rose-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${map[status]}`}>{status}</span>;
}
