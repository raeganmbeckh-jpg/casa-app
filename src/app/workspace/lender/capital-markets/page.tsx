'use client';

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
type Trend = 'up' | 'down' | 'flat';

type RateCard = {
  name: string;
  value: string;
  change: string;
  trend: Trend;
};

type Deal = {
  id: string;
  issuer: string;
  type: 'CMBS' | 'Agency' | 'CLO';
  size: number;
  coupon: string;
  closeDate: string;
  rating: string;
};

type RateForecast = {
  label: string;
  current: string;
  threeMonth: string;
  sixMonth: string;
  twelveMonth: string;
};

/* ── Mock data ─────────────────────────────────────────────────── */
const RATE_CARDS: RateCard[] = [
  { name: '10Y Treasury', value: '4.32%', change: '-8 bps', trend: 'down' },
  { name: '30Y Fixed', value: '6.78%', change: '+3 bps', trend: 'up' },
  { name: 'SOFR', value: '4.83%', change: '-2 bps', trend: 'down' },
];

const RECENT_DEALS: Deal[] = [
  { id: 'd1', issuer: 'BMARK 2026-B42', type: 'CMBS', size: 1_280_000_000, coupon: '5.12%', closeDate: '2026-04-02', rating: 'AAA' },
  { id: 'd2', issuer: 'Freddie Mac K-163', type: 'Agency', size: 875_000_000, coupon: '4.65%', closeDate: '2026-03-28', rating: 'Agency' },
  { id: 'd3', issuer: 'GSMS 2026-GC58', type: 'CMBS', size: 962_000_000, coupon: '5.28%', closeDate: '2026-03-15', rating: 'AAA' },
  { id: 'd4', issuer: 'Fannie Mae ACES 2026-M12', type: 'Agency', size: 1_100_000_000, coupon: '4.58%', closeDate: '2026-03-08', rating: 'Agency' },
  { id: 'd5', issuer: 'JPMCC 2026-CBM1', type: 'CMBS', size: 780_000_000, coupon: '5.45%', closeDate: '2026-02-22', rating: 'AA' },
  { id: 'd6', issuer: 'ARBOR 2026-FL4', type: 'CLO', size: 650_000_000, coupon: 'SOFR+185', closeDate: '2026-02-14', rating: 'AAA' },
];

const RATE_FORECASTS: RateForecast[] = [
  { label: '10Y Treasury', current: '4.32%', threeMonth: '4.15%', sixMonth: '3.95%', twelveMonth: '3.80%' },
  { label: 'SOFR', current: '4.83%', threeMonth: '4.58%', sixMonth: '4.33%', twelveMonth: '4.08%' },
  { label: 'CRE Cap Rate (Multifamily)', current: '5.10%', threeMonth: '5.05%', sixMonth: '4.95%', twelveMonth: '4.85%' },
];

const fmtMoney = (n: number) => {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${(n / 1_000_000).toFixed(0)}M`;
};

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const trendArrow = (t: Trend) => {
  if (t === 'up') return '\u2191';
  if (t === 'down') return '\u2193';
  return '\u2192';
};

/* ── Page ──────────────────────────────────────────────────────── */
export default function CapitalMarketsPulsePage() {
  const benchmarkRate = RATE_CARDS[0];
  const spreadToTreasuries = '80 bps';
  const sentiment: 'risk-on' | 'risk-off' = 'risk-on';

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender &middot; Capital Markets</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Capital Markets <em className="italic">Pulse</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Live rate environment, secondary market activity, and forward rate projections for CRE lending.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Benchmark rate" value={benchmarkRate.value} hint="10Y Treasury" />
            <Kpi label="Spread to Treasuries" value={spreadToTreasuries} hint="CRE avg spread" />
            <Kpi label="Market sentiment" value={sentiment} badge={sentiment} />
            <Kpi label="Recent deals" value={String(RECENT_DEALS.length)} hint="Last 60 days" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Rate environment cards */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Rate <em className="italic">Environment</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Key benchmark rates &middot; as of today</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {RATE_CARDS.map((r) => (
              <motion.div key={r.name} whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }} className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{r.name}</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{r.value}</span>
                  <span className="flex items-center gap-1 text-sm font-medium" style={{ color: r.trend === 'down' ? GREEN : r.trend === 'up' ? RED : MID }}>
                    {trendArrow(r.trend)} {r.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Secondary market deals */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Secondary Market <em className="italic">Activity</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Recent CMBS, Agency &amp; CLO issuance</p>
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Issuer</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Coupon</th>
                  <th className="px-4 py-3 font-medium">Close date</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_DEALS.map((d) => (
                  <motion.tr key={d.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0 cursor-default" style={{ borderColor: HAIRLINE }}>
                    <td className="px-4 py-3 font-medium" style={{ color: INK }}>{d.issuer}</td>
                    <td className="px-4 py-3"><TypeBadge type={d.type} /></td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(d.size)}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{d.coupon}</td>
                    <td className="px-4 py-3" style={{ color: MID }}>{fmtDate(d.closeDate)}</td>
                    <td className="px-4 py-3"><span className="rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: HAIRLINE }}>{d.rating}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate forecast */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Rate <em className="italic">Forecast</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Consensus projections &middot; forward curve implied</p>
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">3 Mo</th>
                  <th className="px-4 py-3 font-medium">6 Mo</th>
                  <th className="px-4 py-3 font-medium">12 Mo</th>
                </tr>
              </thead>
              <tbody>
                {RATE_FORECASTS.map((f) => (
                  <tr key={f.label} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                    <td className="px-4 py-3 font-medium" style={{ color: INK }}>{f.label}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{f.current}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: GREEN }}>{f.threeMonth}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: GREEN }}>{f.sixMonth}</td>
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: GREEN }}>{f.twelveMonth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Components ────────────────────────────────────────────────── */
function Kpi({ label, value, hint, badge }: { label: string; value: string; hint?: string; badge?: 'risk-on' | 'risk-off' }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      {badge ? (
        <div className="mt-2">
          <span className="rounded-full border px-2.5 py-1 text-sm font-medium" style={{
            backgroundColor: badge === 'risk-on' ? '#F0FDF4' : '#FEF2F2',
            color: badge === 'risk-on' ? GREEN : RED,
            borderColor: badge === 'risk-on' ? '#BBF7D0' : '#FECACA',
          }}>
            {badge === 'risk-on' ? 'Risk-On' : 'Risk-Off'}
          </span>
        </div>
      ) : (
        <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      )}
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function TypeBadge({ type }: { type: 'CMBS' | 'Agency' | 'CLO' }) {
  const map = {
    CMBS: 'bg-blue-50 text-blue-800 border-blue-200',
    Agency: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    CLO: 'bg-purple-50 text-purple-800 border-purple-200',
  };
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${map[type]}`}>{type}</span>;
}
