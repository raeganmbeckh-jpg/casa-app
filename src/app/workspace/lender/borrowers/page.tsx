'use client';

import { motion } from 'framer-motion';

/* ── design tokens ── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── types ── */
type PaymentStatus = 'current' | 'late' | 'default';

type ActiveLoan = {
  id: string;
  borrower: string;
  property: string;
  balance: number;
  rate: number;
  ltvCurrent: number;
  dscrCurrent: number;
  paymentStatus: PaymentStatus;
  covenantFlag: string | null;
};

const MOCK_LOANS: ActiveLoan[] = [
  { id: 'bl1', borrower: 'Elena Vasquez',   property: '1842 Olive St, San Diego, CA',     balance: 412000,  rate: 6.50,  ltvCurrent: 71.2, dscrCurrent: 1.38, paymentStatus: 'current', covenantFlag: null },
  { id: 'bl2', borrower: 'James Whitfield', property: '330 Harbor Dr #12, Oceanside, CA',  balance: 598000,  rate: 6.875, ltvCurrent: 76.7, dscrCurrent: 1.21, paymentStatus: 'current', covenantFlag: 'DSCR approaching 1.20 min' },
  { id: 'bl3', borrower: 'Priya Sharma',    property: '9100 Mira Mesa Blvd, SD, CA',      balance: 325000,  rate: 7.00,  ltvCurrent: 66.3, dscrCurrent: 1.45, paymentStatus: 'current', covenantFlag: null },
  { id: 'bl4', borrower: 'Marcus Thompson', property: '2715 5th Ave, San Diego, CA',      balance: 510000,  rate: 6.875, ltvCurrent: 82.1, dscrCurrent: 0.94, paymentStatus: 'late',    covenantFlag: 'DSCR below 1.0 — watchlist' },
  { id: 'bl5', borrower: 'Sarah Chen',      property: '4480 Clairemont Dr, SD, CA',       balance: 362000,  rate: 6.25,  ltvCurrent: 70.0, dscrCurrent: 1.52, paymentStatus: 'current', covenantFlag: null },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function PortfolioMonitorPage() {
  const totalPortfolio = MOCK_LOANS.reduce((s, l) => s + l.balance, 0);
  const weightedDscr = MOCK_LOANS.reduce((s, l) => s + l.dscrCurrent * l.balance, 0) / totalPortfolio;
  const avgLtv = MOCK_LOANS.reduce((s, l) => s + l.ltvCurrent, 0) / MOCK_LOANS.length;
  const watchlist = MOCK_LOANS.filter((l) => l.dscrCurrent < 1.0 || l.paymentStatus !== 'current').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender · Borrowers</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Portfolio <em className="italic">Monitor</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Active loans at a glance. Red rows mean DSCR is below 1.0 — those borrowers need attention now.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total portfolio" value={fmtMoney(totalPortfolio)} />
            <Kpi label="Weighted avg DSCR" value={`${weightedDscr.toFixed(2)}x`} />
            <Kpi label="Avg LTV" value={`${avgLtv.toFixed(1)}%`} />
            <Kpi label="Watchlist" value={String(watchlist)} accent />
          </div>
        </div>
      </header>

      {/* ── table ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* desktop table */}
        <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                <th className="px-4 py-3 font-medium">Borrower</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Rate</th>
                <th className="px-4 py-3 font-medium">LTV</th>
                <th className="px-4 py-3 font-medium">DSCR</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Covenant</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOANS.map((loan) => {
                const isAlert = loan.dscrCurrent < 1.0;
                return (
                  <motion.tr
                    key={loan.id}
                    whileHover={{ backgroundColor: 'rgba(249,217,106,0.1)' }}
                    className="border-b last:border-0"
                    style={{
                      borderColor: HAIRLINE,
                      backgroundColor: isAlert ? 'rgba(185,28,28,0.04)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: INK }}>{loan.borrower}</td>
                    <td className="px-4 py-3" style={{ color: MID }}>{loan.property}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(loan.balance)}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{loan.rate}%</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: loan.ltvCurrent > 80 ? RED : INK }}>{loan.ltvCurrent}%</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: loan.dscrCurrent < 1.0 ? RED : loan.dscrCurrent < 1.25 ? '#D97706' : GREEN }}>{loan.dscrCurrent.toFixed(2)}x</td>
                    <td className="px-4 py-3"><PaymentBadge status={loan.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      {loan.covenantFlag ? (
                        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.06)', color: RED }}>
                          {loan.covenantFlag}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: DIM }}>—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* mobile cards */}
        <div className="grid gap-3 md:hidden">
          {MOCK_LOANS.map((loan) => {
            const isAlert = loan.dscrCurrent < 1.0;
            return (
              <motion.div
                key={loan.id}
                whileHover={{ y: -2 }}
                className="rounded-lg border bg-white p-4"
                style={{ borderColor: isAlert ? RED : HAIRLINE, backgroundColor: isAlert ? 'rgba(185,28,28,0.02)' : 'white' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium" style={{ color: INK }}>{loan.borrower}</div>
                    <div className="text-xs" style={{ color: MID }}>{loan.property}</div>
                  </div>
                  <PaymentBadge status={loan.paymentStatus} />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Balance</div>
                    <div className="mt-0.5 font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(loan.balance)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Rate</div>
                    <div className="mt-0.5 font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{loan.rate}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>LTV</div>
                    <div className="mt-0.5 font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: loan.ltvCurrent > 80 ? RED : INK }}>{loan.ltvCurrent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>DSCR</div>
                    <div className="mt-0.5 font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: loan.dscrCurrent < 1.0 ? RED : GREEN }}>{loan.dscrCurrent.toFixed(2)}x</div>
                  </div>
                </div>
                {loan.covenantFlag && (
                  <div className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.04)', color: RED }}>
                    {loan.covenantFlag}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ── components ── */

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; bg: string; fg: string; border: string }> = {
    current: { label: 'Current', bg: 'rgba(21,128,61,0.06)', fg: GREEN, border: 'rgba(21,128,61,0.2)' },
    late:    { label: 'Late',    bg: 'rgba(217,119,6,0.06)',  fg: '#D97706', border: 'rgba(217,119,6,0.2)' },
    default: { label: 'Default', bg: 'rgba(185,28,28,0.06)',  fg: RED,   border: 'rgba(185,28,28,0.2)' },
  };
  const m = map[status];
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: m.bg, color: m.fg, borderColor: m.border }}>
      {m.label}
    </span>
  );
}
