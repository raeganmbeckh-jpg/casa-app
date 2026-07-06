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
const AMBER = '#D97706';

/* ── mock data ── */
const PORTFOLIO = {
  totalBalance: 2207000,
  weightedDscr: 1.24,
  avgLtv: 73.3,
  loanCount: 5,
  watchlistCount: 2,
};

const LTV_BUCKETS = [
  { label: '<60%',   pct: 0,    color: '#15803D' },
  { label: '60-70%', pct: 20,   color: '#22C55E' },
  { label: '70-75%', pct: 40,   color: BUTTER },
  { label: '75-80%', pct: 25,   color: AMBER },
  { label: '>80%',   pct: 15,   color: RED },
];

const WATCHLIST = [
  { id: 'w1', borrower: 'Marcus Thompson', property: '2715 5th Ave, San Diego', dscr: 0.94, ltv: 82.1, flag: 'DSCR below 1.0', action: 'Initiate borrower review meeting; request updated financials' },
  { id: 'w2', borrower: 'James Whitfield', property: '330 Harbor Dr #12, Oceanside', dscr: 1.21, ltv: 76.7, flag: 'DSCR approaching covenant minimum', action: 'Monitor monthly; prepare modification terms if DSCR drops below 1.20' },
];

const RISK_TREND = [
  { month: 'May 25', score: 28 },
  { month: 'Jun 25', score: 30 },
  { month: 'Jul 25', score: 27 },
  { month: 'Aug 25', score: 32 },
  { month: 'Sep 25', score: 35 },
  { month: 'Oct 25', score: 33 },
  { month: 'Nov 25', score: 38 },
  { month: 'Dec 25', score: 41 },
  { month: 'Jan 26', score: 39 },
  { month: 'Feb 26', score: 42 },
  { month: 'Mar 26', score: 45 },
  { month: 'Apr 26', score: 44 },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function RiskDashboardPage() {
  const dscrColor = PORTFOLIO.weightedDscr >= 1.25 ? GREEN : PORTFOLIO.weightedDscr >= 1.0 ? AMBER : RED;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender · Property Risk</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Risk <em className="italic">Dashboard</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Portfolio-level risk metrics. Spot deterioration early, act before it compounds.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Portfolio balance" value={fmtMoney(PORTFOLIO.totalBalance)} />
            <Kpi label="Weighted avg DSCR" value={`${PORTFOLIO.weightedDscr.toFixed(2)}x`} />
            <Kpi label="Avg LTV" value={`${PORTFOLIO.avgLtv}%`} />
            <Kpi label="Watchlist" value={String(PORTFOLIO.watchlistCount)} accent />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── DSCR gauge ── */}
          <Card title="Weighted Avg DSCR">
            <div className="flex items-center gap-6">
              <DscrGauge value={PORTFOLIO.weightedDscr} />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: GREEN }} />
                  <span style={{ color: MID }}>Above 1.25x — healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
                  <span style={{ color: MID }}>1.0-1.25x — watch</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RED }} />
                  <span style={{ color: MID }}>Below 1.0x — distressed</span>
                </div>
              </div>
            </div>
          </Card>

          {/* ── LTV distribution ── */}
          <Card title="LTV Distribution">
            <div className="mb-4 flex h-8 w-full overflow-hidden rounded-full">
              {LTV_BUCKETS.filter(b => b.pct > 0).map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: `${b.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="flex items-center justify-center text-[10px] font-medium text-white"
                  style={{ backgroundColor: b.color }}
                  title={`${b.label}: ${b.pct}%`}
                >
                  {b.pct >= 15 ? `${b.pct}%` : ''}
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {LTV_BUCKETS.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: MID }}>
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{b.label}</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── risk trend sparkline ── */}
        <div className="mt-6">
          <Card title="Portfolio Risk Trend — 12 Months">
            <Sparkline data={RISK_TREND} />
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
              <span>{RISK_TREND[0].month}</span>
              <span>{RISK_TREND[RISK_TREND.length - 1].month}</span>
            </div>
          </Card>
        </div>

        {/* ── watchlist table ── */}
        <div className="mt-6">
          <Card title="Watchlist">
            {WATCHLIST.length === 0 ? (
              <div className="text-sm italic" style={{ fontFamily: 'var(--font-heading)', color: DIM }}>No flagged loans. Portfolio is clean.</div>
            ) : (
              <div className="space-y-3">
                {WATCHLIST.map((w) => (
                  <motion.div
                    key={w.id}
                    whileHover={{ y: -1 }}
                    className="rounded-lg border p-4"
                    style={{ borderColor: w.dscr < 1.0 ? RED : HAIRLINE, backgroundColor: w.dscr < 1.0 ? 'rgba(185,28,28,0.02)' : 'white' }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-medium" style={{ color: INK }}>{w.borrower}</div>
                        <div className="text-xs" style={{ color: MID }}>{w.property}</div>
                        <div className="mt-2 flex gap-3 text-xs" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                          <span style={{ color: w.dscr < 1.0 ? RED : AMBER }}>DSCR {w.dscr.toFixed(2)}x</span>
                          <span style={{ color: w.ltv > 80 ? RED : MID }}>LTV {w.ltv}%</span>
                        </div>
                      </div>
                      <span className="shrink-0 self-start rounded-full border px-2.5 py-0.5 text-[11px] font-medium" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.06)', color: RED }}>
                        {w.flag}
                      </span>
                    </div>
                    <div className="mt-3 rounded-md border p-3 text-xs" style={{ borderColor: HAIRLINE, backgroundColor: CREAM }}>
                      <div className="mb-1 text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Recommended Action</div>
                      <div style={{ color: INK }}>{w.action}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

/* ── components ── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
      <div className="mb-4 text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{title}</div>
      {children}
    </div>
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

function DscrGauge({ value }: { value: number }) {
  const color = value >= 1.25 ? GREEN : value >= 1.0 ? AMBER : RED;
  const circumference = 2 * Math.PI * 50;
  const pct = Math.min(value / 2, 1); // scale 0-2 to 0-1
  const offset = circumference - pct * circumference;

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r="50" fill="none" stroke={HAIRLINE} strokeWidth="10" />
      <motion.circle
        cx="65" cy="65" r="50" fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 65 65)"
      />
      <text x="65" y="60" textAnchor="middle" style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 500, fill: color }}>{value.toFixed(2)}</text>
      <text x="65" y="80" textAnchor="middle" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 9, fill: DIM, textTransform: 'uppercase', letterSpacing: '0.12em' }}>DSCR</text>
    </svg>
  );
}

function Sparkline({ data }: { data: { month: string; score: number }[] }) {
  const max = Math.max(...data.map((d) => d.score));
  const min = Math.min(...data.map((d) => d.score));
  const range = max - min || 1;
  const w = 800;
  const h = 100;
  const pad = 4;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.score - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L')}`;
  const areaD = `${pathD} L${w - pad},${h - pad} L${pad},${h - pad} Z`;

  const lastScore = data[data.length - 1].score;
  const trendColor = lastScore > data[data.length - 2].score ? RED : GREEN;

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-2xl font-medium" style={{ fontFamily: 'var(--font-heading)', color: INK }}>{lastScore}</span>
        <span className="text-xs" style={{ color: trendColor, fontFamily: 'var(--font-geist-mono)' }}>
          {lastScore > data[0].score ? `+${lastScore - data[0].score}` : `${lastScore - data[0].score}`} from 12mo ago
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AMBER} stopOpacity="0.15" />
            <stop offset="100%" stopColor={AMBER} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#sparkFill)" />
        <path d={pathD} fill="none" stroke={AMBER} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = pad + (i / (data.length - 1)) * (w - pad * 2);
          const y = h - pad - ((d.score - min) / range) * (h - pad * 2);
          return <circle key={i} cx={x} cy={y} r="3" fill={AMBER} />;
        })}
      </svg>
    </div>
  );
}
