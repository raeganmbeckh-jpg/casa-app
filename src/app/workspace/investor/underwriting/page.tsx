'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

type Inputs = {
  purchasePrice: number;
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent: number;
  annualExpenses: number;
  vacancyPct: number;
  holdYears: number;
  rentGrowth: number;
  expenseGrowth: number;
};

const DEFAULT_INPUTS: Inputs = {
  purchasePrice: 2000000,
  downPaymentPct: 25,
  interestRate: 6.5,
  loanTermYears: 30,
  monthlyRent: 14000,
  annualExpenses: 48000,
  vacancyPct: 5,
  holdYears: 7,
  rentGrowth: 3,
  expenseGrowth: 2,
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

function calcMonthlyPayment(principal: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcIRR(cashflows: number[], guess = 0.1): number {
  let rate = guess;
  for (let iter = 0; iter < 100; iter++) {
    let npv = 0;
    let dnpv = 0;
    for (let i = 0; i < cashflows.length; i++) {
      npv += cashflows[i] / Math.pow(1 + rate, i);
      dnpv -= (i * cashflows[i]) / Math.pow(1 + rate, i + 1);
    }
    if (Math.abs(npv) < 0.01) break;
    rate -= npv / dnpv;
  }
  return rate;
}

function runUnderwriting(inputs: Inputs) {
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.purchasePrice - downPayment;
  const monthlyPayment = calcMonthlyPayment(loanAmount, inputs.interestRate, inputs.loanTermYears);
  const annualDebtService = monthlyPayment * 12;

  const grossRent = inputs.monthlyRent * 12;
  const vacancy = grossRent * (inputs.vacancyPct / 100);
  const effectiveGross = grossRent - vacancy;
  const noi = effectiveGross - inputs.annualExpenses;
  const capRate = (noi / inputs.purchasePrice) * 100;
  const cashFlow = noi - annualDebtService;
  const cashOnCash = (cashFlow / downPayment) * 100;
  const dscr = noi / annualDebtService;

  // IRR calculation with hold period
  const cashflows: number[] = [-downPayment];
  for (let y = 1; y <= inputs.holdYears; y++) {
    const rentY = grossRent * Math.pow(1 + inputs.rentGrowth / 100, y - 1);
    const vacY = rentY * (inputs.vacancyPct / 100);
    const expY = inputs.annualExpenses * Math.pow(1 + inputs.expenseGrowth / 100, y - 1);
    const noiY = rentY - vacY - expY;
    const cfY = noiY - annualDebtService;
    cashflows.push(cfY);
  }
  // Exit proceeds at hold end (assume same cap rate exit)
  const exitNOI = (grossRent * Math.pow(1 + inputs.rentGrowth / 100, inputs.holdYears)) * (1 - inputs.vacancyPct / 100) - inputs.annualExpenses * Math.pow(1 + inputs.expenseGrowth / 100, inputs.holdYears);
  const exitValue = exitNOI / (capRate / 100);
  // Remaining loan balance approximation
  const r = inputs.interestRate / 100 / 12;
  const totalPayments = inputs.loanTermYears * 12;
  const paidPayments = inputs.holdYears * 12;
  const remainingBalance = r > 0
    ? loanAmount * (Math.pow(1 + r, totalPayments) - Math.pow(1 + r, paidPayments)) / (Math.pow(1 + r, totalPayments) - 1)
    : loanAmount * (1 - paidPayments / totalPayments);
  const exitProceeds = exitValue - remainingBalance;
  cashflows[cashflows.length - 1] += exitProceeds;

  const irr = calcIRR(cashflows) * 100;

  return { downPayment, loanAmount, monthlyPayment, annualDebtService, grossRent, vacancy, effectiveGross, noi, capRate, cashFlow, cashOnCash, dscr, irr, exitValue };
}

function sensitivityIRR(inputs: Inputs, exitCapRate: number, rentAdjPct: number): number {
  const adjInputs = { ...inputs, monthlyRent: inputs.monthlyRent * (1 + rentAdjPct / 100) };
  const r = runUnderwriting(adjInputs);
  const grossRent = adjInputs.monthlyRent * 12;
  const exitNOI = (grossRent * Math.pow(1 + adjInputs.rentGrowth / 100, adjInputs.holdYears)) * (1 - adjInputs.vacancyPct / 100) - adjInputs.annualExpenses * Math.pow(1 + adjInputs.expenseGrowth / 100, adjInputs.holdYears);
  const exitValue = exitNOI / (exitCapRate / 100);
  const rate = adjInputs.interestRate / 100 / 12;
  const totalP = adjInputs.loanTermYears * 12;
  const paidP = adjInputs.holdYears * 12;
  const loanAmt = adjInputs.purchasePrice * (1 - adjInputs.downPaymentPct / 100);
  const remBal = rate > 0
    ? loanAmt * (Math.pow(1 + rate, totalP) - Math.pow(1 + rate, paidP)) / (Math.pow(1 + rate, totalP) - 1)
    : loanAmt * (1 - paidP / totalP);
  const dp = adjInputs.purchasePrice * (adjInputs.downPaymentPct / 100);
  const annualDS = calcMonthlyPayment(loanAmt, adjInputs.interestRate, adjInputs.loanTermYears) * 12;

  const cfs: number[] = [-dp];
  for (let y = 1; y <= adjInputs.holdYears; y++) {
    const rentY = adjInputs.monthlyRent * 12 * Math.pow(1 + adjInputs.rentGrowth / 100, y - 1);
    const vacY = rentY * (adjInputs.vacancyPct / 100);
    const expY = adjInputs.annualExpenses * Math.pow(1 + adjInputs.expenseGrowth / 100, y - 1);
    const noiY = rentY - vacY - expY;
    cfs.push(noiY - annualDS);
  }
  cfs[cfs.length - 1] += exitValue - remBal;
  return calcIRR(cfs) * 100;
}

export default function UnderwritingPage() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);

  const results = useMemo(() => runUnderwriting(inputs), [inputs]);

  const exitCaps = [4.5, 5.0, 5.5, 6.0, 6.5];
  const rentScenarios = [{ label: '-10%', adj: -10 }, { label: 'Base', adj: 0 }, { label: '+10%', adj: 10 }];

  const sensitivityData = useMemo(() => {
    return exitCaps.map((ec) => ({
      exitCap: ec,
      values: rentScenarios.map((rs) => sensitivityIRR(inputs, ec, rs.adj)),
    }));
  }, [inputs]);

  const update = (field: keyof Inputs, val: string) => {
    setInputs((prev) => ({ ...prev, [field]: Number(val) || 0 }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Underwriting</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Underwriting <em className="italic">Engine</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Model any deal in real time. Adjust assumptions and watch returns recalculate instantly.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Inputs */}
          <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <h2 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
              Deal <em className="italic">Assumptions</em>
            </h2>
            <div className="space-y-4">
              <InputField label="Purchase Price" value={inputs.purchasePrice} onChange={(v) => update('purchasePrice', v)} prefix="$" />
              <InputField label="Down Payment" value={inputs.downPaymentPct} onChange={(v) => update('downPaymentPct', v)} suffix="%" />
              <InputField label="Interest Rate" value={inputs.interestRate} onChange={(v) => update('interestRate', v)} suffix="%" step="0.25" />
              <InputField label="Loan Term" value={inputs.loanTermYears} onChange={(v) => update('loanTermYears', v)} suffix="yrs" />
              <div className="border-t pt-4" style={{ borderColor: HAIRLINE }}>
                <div className="text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Income &amp; Expenses</div>
              </div>
              <InputField label="Monthly Gross Rent" value={inputs.monthlyRent} onChange={(v) => update('monthlyRent', v)} prefix="$" />
              <InputField label="Annual Expenses" value={inputs.annualExpenses} onChange={(v) => update('annualExpenses', v)} prefix="$" />
              <InputField label="Vacancy Rate" value={inputs.vacancyPct} onChange={(v) => update('vacancyPct', v)} suffix="%" />
              <div className="border-t pt-4" style={{ borderColor: HAIRLINE }}>
                <div className="text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Growth &amp; Hold</div>
              </div>
              <InputField label="Hold Period" value={inputs.holdYears} onChange={(v) => update('holdYears', v)} suffix="yrs" />
              <InputField label="Annual Rent Growth" value={inputs.rentGrowth} onChange={(v) => update('rentGrowth', v)} suffix="%" step="0.5" />
              <InputField label="Annual Expense Growth" value={inputs.expenseGrowth} onChange={(v) => update('expenseGrowth', v)} suffix="%" step="0.5" />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-4">
              <ResultKpi label="NOI" value={fmtMoney(results.noi)} />
              <ResultKpi label="Cap Rate" value={fmtPct(results.capRate)} good={results.capRate >= 5} />
              <ResultKpi label="Cash-on-Cash" value={fmtPct(results.cashOnCash)} good={results.cashOnCash >= 8} />
              <ResultKpi label="DSCR" value={results.dscr.toFixed(2) + 'x'} good={results.dscr >= 1.25} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Income Breakdown</h3>
                <div className="space-y-3">
                  <LineItem label="Gross Rent (annual)" value={fmtMoney(results.grossRent)} />
                  <LineItem label="Less: Vacancy" value={`(${fmtMoney(results.vacancy)})`} dim />
                  <LineItem label="Effective Gross Income" value={fmtMoney(results.effectiveGross)} />
                  <LineItem label="Less: Expenses" value={`(${fmtMoney(inputs.annualExpenses)})`} dim />
                  <div className="border-t pt-2" style={{ borderColor: HAIRLINE }}>
                    <LineItem label="Net Operating Income" value={fmtMoney(results.noi)} bold />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                <h3 className="mb-4 text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Financing &amp; Returns</h3>
                <div className="space-y-3">
                  <LineItem label="Down Payment" value={fmtMoney(results.downPayment)} />
                  <LineItem label="Loan Amount" value={fmtMoney(results.loanAmount)} />
                  <LineItem label="Monthly Payment" value={fmtMoney(results.monthlyPayment)} />
                  <LineItem label="Annual Debt Service" value={fmtMoney(results.annualDebtService)} />
                  <div className="border-t pt-2" style={{ borderColor: HAIRLINE }}>
                    <LineItem label="Annual Cash Flow" value={fmtMoney(results.cashFlow)} bold />
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-white p-6"
              style={{ borderColor: BUTTER }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                  IRR <em className="italic">Estimate</em>
                </h3>
                <div className="text-3xl font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: results.irr >= 12 ? GREEN : results.irr >= 8 ? '#D97706' : RED }}>
                  {isFinite(results.irr) ? fmtPct(results.irr) : 'N/A'}
                </div>
              </div>
              <p className="text-xs" style={{ color: DIM }}>
                Projected over {inputs.holdYears}-year hold with {inputs.rentGrowth}% annual rent growth. Exit at {fmtMoney(results.exitValue)} ({fmtPct(results.capRate)} exit cap).
              </p>
            </motion.div>

            {/* Sensitivity Table */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
              <h3 className="mb-1 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Sensitivity <em className="italic">Matrix</em>
              </h3>
              <p className="mb-4 text-xs" style={{ color: DIM }}>IRR at different exit caps and rent scenarios</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: HAIRLINE }}>
                      <th className="px-3 py-2 text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Exit Cap</th>
                      {rentScenarios.map((rs) => (
                        <th key={rs.label} className="px-3 py-2 text-center text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Rent {rs.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityData.map((row) => (
                      <tr key={row.exitCap} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                        <td className="px-3 py-2 font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{row.exitCap.toFixed(1)}%</td>
                        {row.values.map((val, i) => {
                          const color = val >= 12 ? GREEN : val >= 8 ? '#D97706' : RED;
                          const isBase = i === 1 && row.exitCap === 5.5;
                          return (
                            <td key={i} className="px-3 py-2 text-center font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color, backgroundColor: isBase ? 'rgba(249,217,106,0.15)' : undefined }}>
                              {isFinite(val) ? fmtPct(val) : 'N/A'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField({ label, value, onChange, prefix, suffix, step }: { label: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string; step?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm" style={{ color: DIM }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step || '1'}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm tabular-nums focus:border-neutral-900 focus:outline-none"
          style={{ borderColor: 'rgba(17,17,17,0.15)', fontFamily: 'var(--font-geist-mono)' }}
        />
        {suffix && <span className="text-sm" style={{ color: DIM }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultKpi({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-lg border bg-white p-4"
      style={{ borderColor: good ? GREEN : HAIRLINE }}
    >
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
    </motion.div>
  );
}

function LineItem({ label, value, dim, bold }: { label: string; value: string; dim?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? 'font-medium' : ''}`} style={{ color: dim ? DIM : INK }}>{label}</span>
      <span className={`text-sm tabular-nums ${bold ? 'font-medium' : ''}`} style={{ fontFamily: 'var(--font-geist-mono)', color: dim ? DIM : INK }}>{value}</span>
    </div>
  );
}
