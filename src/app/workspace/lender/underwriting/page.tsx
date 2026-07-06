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
const RED = '#B91C1C';
const GREEN = '#15803D';
const AMBER = '#D97706';

/* ── mock application ── */
const APP = {
  id: 'uw-1',
  borrower: 'Marcus Thompson',
  email: 'mthompson@example.com',
  phone: '(619) 555-0234',
  employer: 'Meridian Engineering Group',
  annualIncome: 142000,
  yearsEmployed: 6,
  property: '2715 5th Ave, San Diego, CA 92103',
  propertyType: 'Single Family',
  yearBuilt: 1998,
  sqft: 1840,
  appraisedValue: 640000,
  purchasePrice: 645000,
  loanAmount: 520000,
  loanType: '30-Year Fixed',
  rate: 6.875,
  ltv: 81.3,
  dscr: 1.12,
  creditScore: 738,
  riskScore: 64,
  monthlyRent: 3800,
  monthlyPITI: 3982,
  debtToIncome: 34.2,
  reserves: 42000,
  riskFactors: [
    'LTV exceeds 80% — PMI required',
    'DTI at 34.2% — approaching threshold',
    'Appraisal came in below purchase price',
    'Single income household',
  ],
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function UnderwritingDeskPage() {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'denied' | 'conditioned'>('pending');

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender · Underwriting</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Underwriting <em className="italic">Desk</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Full application detail with risk gauges. Review, then approve, deny, or condition.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ── borrower + property info ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card title="Borrower">
            <Field label="Name" value={APP.borrower} />
            <Field label="Email" value={APP.email} />
            <Field label="Phone" value={APP.phone} />
            <Field label="Employer" value={APP.employer} />
            <Field label="Annual income" value={fmtMoney(APP.annualIncome)} />
            <Field label="Years employed" value={String(APP.yearsEmployed)} />
            <Field label="Reserves" value={fmtMoney(APP.reserves)} />
          </Card>
          <Card title="Property">
            <Field label="Address" value={APP.property} />
            <Field label="Type" value={APP.propertyType} />
            <Field label="Year built" value={String(APP.yearBuilt)} />
            <Field label="Size" value={`${APP.sqft.toLocaleString()} sqft`} />
            <Field label="Appraised value" value={fmtMoney(APP.appraisedValue)} />
            <Field label="Purchase price" value={fmtMoney(APP.purchasePrice)} />
          </Card>
        </div>

        {/* ── loan details ── */}
        <div className="mt-4">
          <Card title="Loan Details">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <Field label="Loan amount" value={fmtMoney(APP.loanAmount)} />
              <Field label="Loan type" value={APP.loanType} />
              <Field label="Rate" value={`${APP.rate}%`} />
              <Field label="DTI" value={`${APP.debtToIncome}%`} />
              <Field label="Monthly PITI" value={fmtMoney(APP.monthlyPITI)} />
              <Field label="Monthly rent" value={fmtMoney(APP.monthlyRent)} />
            </div>
          </Card>
        </div>

        {/* ── gauges ── */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* LTV gauge */}
          <Card title="LTV">
            <HorizontalGauge
              value={APP.ltv}
              max={100}
              thresholds={[
                { limit: 75, color: GREEN },
                { limit: 80, color: AMBER },
                { limit: 100, color: RED },
              ]}
              suffix="%"
            />
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
              <span>0%</span><span>75%</span><span>80%</span><span>100%</span>
            </div>
          </Card>

          {/* DSCR gauge */}
          <Card title="DSCR">
            <HorizontalGauge
              value={APP.dscr}
              max={2}
              thresholds={[
                { limit: 1.0, color: RED },
                { limit: 1.25, color: AMBER },
                { limit: 2.0, color: GREEN },
              ]}
              suffix="x"
            />
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
              <span>0</span><span>1.0</span><span>1.25</span><span>2.0</span>
            </div>
          </Card>

          {/* Credit score */}
          <Card title="Credit Score">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-medium" style={{ fontFamily: 'var(--font-heading)', color: APP.creditScore >= 740 ? GREEN : APP.creditScore >= 680 ? AMBER : RED }}>
                {APP.creditScore}
              </div>
              <div className="text-xs" style={{ color: MID }}>
                {APP.creditScore >= 740 ? 'Excellent' : APP.creditScore >= 680 ? 'Good' : 'Fair'}
              </div>
            </div>
          </Card>

          {/* Risk score ring */}
          <Card title="Risk Score">
            <RiskRing score={APP.riskScore} />
          </Card>
        </div>

        {/* ── risk factors ── */}
        <div className="mt-6">
          <Card title="Risk Factors">
            <div className="flex flex-wrap gap-2">
              {APP.riskFactors.map((f, i) => (
                <span key={i} className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: 'rgba(185,28,28,0.2)', backgroundColor: 'rgba(185,28,28,0.06)', color: RED }}>
                  {f}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* ── decision buttons ── */}
        <div className="mt-8 flex flex-col items-center gap-4">
          {decision === 'pending' ? (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDecision('approved')}
                className="rounded-lg px-6 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: GREEN }}
              >
                Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDecision('conditioned')}
                className="rounded-lg border px-6 py-3 text-sm font-medium"
                style={{ borderColor: AMBER, color: AMBER }}
              >
                Condition
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setDecision('denied')}
                className="rounded-lg px-6 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: RED }}
              >
                Deny
              </motion.button>
            </div>
          ) : (
            <div className="rounded-lg border bg-white px-8 py-4 text-center" style={{ borderColor: HAIRLINE }}>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Decision</div>
              <div className="mt-1 text-2xl font-medium capitalize" style={{
                fontFamily: 'var(--font-heading)',
                color: decision === 'approved' ? GREEN : decision === 'denied' ? RED : AMBER,
              }}>
                {decision}
              </div>
              <button onClick={() => setDecision('pending')} className="mt-2 text-xs underline" style={{ color: MID }}>Reset</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── shared components ── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
      <div className="mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-0.5 text-sm" style={{ color: INK }}>{value}</div>
    </div>
  );
}

function HorizontalGauge({ value, max, thresholds, suffix }: {
  value: number;
  max: number;
  thresholds: { limit: number; color: string }[];
  suffix: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  let color = thresholds[thresholds.length - 1].color;
  for (const t of thresholds) {
    if (value <= t.limit) { color = t.color; break; }
  }
  return (
    <div>
      <div className="mb-2 text-3xl font-medium" style={{ fontFamily: 'var(--font-heading)', color }}>
        {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}{suffix}
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function RiskRing({ score }: { score: number }) {
  const color = score >= 70 ? RED : score >= 40 ? AMBER : GREEN;
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex items-center justify-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke={HAIRLINE} strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" textAnchor="middle" style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 500, fill: color }}>{score}</text>
        <text x="50" y="62" textAnchor="middle" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 8, fill: DIM, textTransform: 'uppercase', letterSpacing: '0.1em' }}>RISK</text>
      </svg>
    </div>
  );
}
