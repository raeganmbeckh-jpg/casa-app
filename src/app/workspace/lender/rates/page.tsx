'use client';

import { useState, useMemo } from 'react';
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

/* ── helpers ── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function calcMonthlyPI(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcMetrics(loanAmount: number, propertyValue: number, rate: number, termYears: number, monthlyRent: number) {
  const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
  const monthlyPI = calcMonthlyPI(loanAmount, rate, termYears);
  const monthlyTaxIns = propertyValue * 0.015 / 12; // ~1.5% annual for tax+insurance estimate
  const piti = monthlyPI + monthlyTaxIns;
  const dscr = piti > 0 ? monthlyRent / piti : 0;
  const annualDebtService = piti * 12;
  return { ltv, monthlyPI, piti, dscr, annualDebtService };
}

export default function DealAnalyzerPage() {
  const [loanAmount, setLoanAmount] = useState(520000);
  const [propertyValue, setPropertyValue] = useState(640000);
  const [rate, setRate] = useState(6.875);
  const [termYears, setTermYears] = useState(30);
  const [monthlyRent, setMonthlyRent] = useState(3800);

  const base = useMemo(() => calcMetrics(loanAmount, propertyValue, rate, termYears, monthlyRent), [loanAmount, propertyValue, rate, termYears, monthlyRent]);
  const stress1 = useMemo(() => calcMetrics(loanAmount, propertyValue, rate + 1, termYears, monthlyRent), [loanAmount, propertyValue, rate, termYears, monthlyRent]);
  const stress2 = useMemo(() => calcMetrics(loanAmount, propertyValue, rate + 2, termYears, monthlyRent), [loanAmount, propertyValue, rate, termYears, monthlyRent]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lender · Rates</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Deal <em className="italic">Analyzer</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Punch in the numbers, see live calculations. The stress test panel shows what happens when rates climb.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── input form ── */}
          <div className="lg:col-span-2">
            <Card title="Deal Inputs">
              <div className="space-y-4">
                <InputField label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
                <InputField label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="$" />
                <InputField label="Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.125} />
                <InputField label="Term (years)" value={termYears} onChange={setTermYears} />
                <InputField label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
              </div>
            </Card>
          </div>

          {/* ── results ── */}
          <div className="space-y-4 lg:col-span-3">
            <Card title="Base Scenario">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Metric label="LTV" value={`${base.ltv.toFixed(1)}%`} color={base.ltv > 80 ? RED : base.ltv > 75 ? '#D97706' : GREEN} />
                <Metric label="Monthly P&I" value={fmtMoney(base.monthlyPI)} />
                <Metric label="PITI Estimate" value={fmtMoney(base.piti)} />
                <Metric label="DSCR" value={`${base.dscr.toFixed(2)}x`} color={base.dscr < 1.0 ? RED : base.dscr < 1.25 ? '#D97706' : GREEN} />
                <Metric label="Annual Debt Service" value={fmtMoney(base.annualDebtService)} />
                <Metric label="Rate" value={`${rate.toFixed(3)}%`} />
              </div>
            </Card>

            {/* ── stress tests ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StressCard label={`Rate +1% (${(rate + 1).toFixed(3)}%)`} metrics={stress1} basePI={base.monthlyPI} />
              <StressCard label={`Rate +2% (${(rate + 2).toFixed(3)}%)`} metrics={stress2} basePI={base.monthlyPI} />
            </div>
          </div>
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

function InputField({ label, value, onChange, prefix, suffix, step }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <div className="flex items-center rounded-md border bg-white" style={{ borderColor: HAIRLINE }}>
        {prefix && <span className="pl-3 text-sm" style={{ color: DIM }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step || 1}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent px-3 py-2.5 text-sm focus:outline-none"
          style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}
        />
        {suffix && <span className="pr-3 text-sm" style={{ color: DIM }}>{suffix}</span>}
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-1 text-xl font-medium" style={{ fontFamily: 'var(--font-heading)', color: color || INK }}>{value}</div>
    </div>
  );
}

function StressCard({ label, metrics, basePI }: {
  label: string;
  metrics: ReturnType<typeof calcMetrics>;
  basePI: number;
}) {
  const piDelta = metrics.monthlyPI - basePI;
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: HAIRLINE }}
    >
      <div className="mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Stress Test</div>
      <div className="mb-3 text-sm font-medium" style={{ color: INK }}>{label}</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span style={{ color: MID }}>Monthly P&I</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(metrics.monthlyPI)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: MID }}>P&I increase</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', color: RED }}>+{fmtMoney(piDelta)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: MID }}>PITI</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(metrics.piti)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: MID }}>DSCR</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', color: metrics.dscr < 1.0 ? RED : metrics.dscr < 1.25 ? '#D97706' : GREEN }}>
            {metrics.dscr.toFixed(2)}x
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: MID }}>Annual Debt Service</span>
          <span style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(metrics.annualDebtService)}</span>
        </div>
      </div>
    </motion.div>
  );
}
