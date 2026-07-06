'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type CommissionStatus = 'pending' | 'closed';

type Commission = {
  id: string;
  address: string;
  salePrice: number;
  commissionPct: number;
  grossCommission: number;
  splitPct: number;
  netCommission: number;
  status: CommissionStatus;
  closeDate: string;
  side: 'listing' | 'buyer';
};

const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 'cm1', address: '1340 Holly Ave, Imperial Beach', salePrice: 685000, commissionPct: 2.5, grossCommission: 17125,
    splitPct: 70, netCommission: 11988, status: 'closed', closeDate: '2026-01-22', side: 'listing',
  },
  {
    id: 'cm2', address: '3245 Hawk St, North Park', salePrice: 1125000, commissionPct: 2.5, grossCommission: 28125,
    splitPct: 70, netCommission: 19688, status: 'pending', closeDate: '2026-05-15', side: 'listing',
  },
  {
    id: 'cm3', address: '4510 Bayard St, Pacific Beach', salePrice: 975000, commissionPct: 2.5, grossCommission: 24375,
    splitPct: 70, netCommission: 17063, status: 'pending', closeDate: '2026-04-28', side: 'buyer',
  },
  {
    id: 'cm4', address: '920 W Laurel St, Bankers Hill', salePrice: 1450000, commissionPct: 2.5, grossCommission: 36250,
    splitPct: 70, netCommission: 25375, status: 'pending', closeDate: '2026-05-01', side: 'listing',
  },
  {
    id: 'cm5', address: '7622 Girard Ave, La Jolla', salePrice: 4200000, commissionPct: 2.0, grossCommission: 84000,
    splitPct: 75, netCommission: 63000, status: 'pending', closeDate: '2026-06-10', side: 'buyer',
  },
  {
    id: 'cm6', address: '2901 University Ave, North Park', salePrice: 849000, commissionPct: 2.5, grossCommission: 21225,
    splitPct: 70, netCommission: 14858, status: 'pending', closeDate: '2026-07-01', side: 'listing',
  },
  {
    id: 'cm7', address: '1820 Sunset Cliffs Blvd, OB', salePrice: 2350000, commissionPct: 2.0, grossCommission: 47000,
    splitPct: 75, netCommission: 35250, status: 'pending', closeDate: '2026-05-20', side: 'listing',
  },
  {
    id: 'cm8', address: '5580 La Jolla Blvd, Bird Rock', salePrice: 1875000, commissionPct: 2.5, grossCommission: 46875,
    splitPct: 70, netCommission: 32813, status: 'closed', closeDate: '2026-02-14', side: 'buyer',
  },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function CommissionTrackerPage() {
  const [sortBy, setSortBy] = useState<'date' | 'net' | 'price'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | CommissionStatus>('all');

  const sorted = useMemo(() => {
    let rows = [...MOCK_COMMISSIONS];
    if (filterStatus !== 'all') rows = rows.filter((c) => c.status === filterStatus);
    rows.sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime();
        case 'net': return b.netCommission - a.netCommission;
        case 'price': return b.salePrice - a.salePrice;
      }
    });
    return rows;
  }, [sortBy, filterStatus]);

  const closedDeals = MOCK_COMMISSIONS.filter((c) => c.status === 'closed');
  const pendingDeals = MOCK_COMMISSIONS.filter((c) => c.status === 'pending');
  const ytdEarned = closedDeals.reduce((s, c) => s + c.netCommission, 0);
  const pipelineValue = pendingDeals.reduce((s, c) => s + c.netCommission, 0);
  const avgCommission = MOCK_COMMISSIONS.length
    ? Math.round(MOCK_COMMISSIONS.reduce((s, c) => s + c.netCommission, 0) / MOCK_COMMISSIONS.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Broker · Commission</p>
            <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
              Commission <em className="italic">Tracker</em>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
              {MOCK_COMMISSIONS.length} transactions tracked. {closedDeals.length} closed, {pendingDeals.length} pending.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="YTD earned" value={fmtMoney(ytdEarned)} accent />
            <Kpi label="Pipeline value" value={fmtMoney(pipelineValue)} hint={`${pendingDeals.length} pending deals`} />
            <Kpi label="Avg commission" value={fmtMoney(avgCommission)} hint="net per deal" />
            <Kpi label="Deals closed" value={String(closedDeals.length)} hint={`of ${MOCK_COMMISSIONS.length} total`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Summary cards */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
            Earnings <em className="italic">Breakdown</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>YTD performance summary</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Total gross"
              value={fmtMoney(MOCK_COMMISSIONS.reduce((s, c) => s + c.grossCommission, 0))}
              sub="before split"
            />
            <SummaryCard
              label="Total net"
              value={fmtMoney(MOCK_COMMISSIONS.reduce((s, c) => s + c.netCommission, 0))}
              sub="after split"
              highlight
            />
            <SummaryCard
              label="Total volume"
              value={fmtMoney(MOCK_COMMISSIONS.reduce((s, c) => s + c.salePrice, 0))}
              sub={`${MOCK_COMMISSIONS.length} transactions`}
            />
          </div>
        </section>

        {/* Table */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
                Transaction <em className="italic">Log</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{sorted.length} transactions</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: '#111111' }}
              >
                <option value="all">All status</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: '#111111' }}
              >
                <option value="date">Sort: Date</option>
                <option value="net">Sort: Net</option>
                <option value="price">Sort: Sale price</option>
              </select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)', backgroundColor: '#FAFAF7' }}>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Sale Price</th>
                  <th className="px-4 py-3 font-medium">Comm %</th>
                  <th className="px-4 py-3 font-medium">Gross</th>
                  <th className="px-4 py-3 font-medium">Split %</th>
                  <th className="px-4 py-3 font-medium">Net</th>
                  <th className="px-4 py-3 font-medium">Side</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Close Date</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <motion.tr
                    key={c.id}
                    whileHover={{ backgroundColor: '#FDF8E8' }}
                    className="border-b last:border-0 cursor-default"
                    style={{ borderColor: 'rgba(17,17,17,0.08)' }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#111111' }}>{c.address}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{fmtMoney(c.salePrice)}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{c.commissionPct}%</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{fmtMoney(c.grossCommission)}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{c.splitPct}%</td>
                    <td className="px-4 py-3 font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>{fmtMoney(c.netCommission)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>
                        {c.side}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.status === 'closed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        {c.status === 'closed' ? 'Closed' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{fmtDate(c.closeDate)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {sorted.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border bg-white p-4"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium" style={{ color: '#111111' }}>{c.address}</div>
                    <div className="mt-0.5 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{fmtDate(c.closeDate)} · {c.side} side</div>
                  </div>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${c.status === 'closed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                    {c.status === 'closed' ? 'Closed' : 'Pending'}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)' }}>Sale</div>
                    <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>{fmtMoney(c.salePrice)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)' }}>Gross</div>
                    <div className="text-sm" style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>{fmtMoney(c.grossCommission)}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)' }}>Net</div>
                    <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#15803D' }}>{fmtMoney(c.netCommission)}</div>
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

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}

function SummaryCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border bg-white p-6"
      style={{ borderColor: highlight ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}
    >
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: highlight ? '#15803D' : '#111111' }}>{value}</div>
      <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{sub}</div>
    </motion.div>
  );
}
