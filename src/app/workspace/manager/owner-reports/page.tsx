'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type OwnerProperty = {
  id: string;
  address: string;
  city: string;
  units: number;
  income: {
    rent: number;
    parking: number;
    laundry: number;
    lateFees: number;
    other: number;
  };
  expenses: {
    mortgage: number;
    insurance: number;
    taxes: number;
    maintenance: number;
    utilities: number;
    management: number;
    capex: number;
  };
};

type MonthSummary = {
  month: string;
  label: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
};

const MOCK_PROPERTIES: OwnerProperty[] = [
  {
    id: 'op1',
    address: '4821 Voltaire St',
    city: 'Ocean Beach',
    units: 12,
    income: { rent: 38400, parking: 0, laundry: 680, lateFees: 0, other: 0 },
    expenses: { mortgage: 18200, insurance: 1850, taxes: 4050, maintenance: 7300, utilities: 0, management: 3072, capex: 0 },
  },
  {
    id: 'op2',
    address: '1530 Front St',
    city: 'Downtown',
    units: 4,
    income: { rent: 52000, parking: 0, laundry: 0, lateFees: 0, other: 0 },
    expenses: { mortgage: 0, insurance: 2400, taxes: 5170, maintenance: 3200, utilities: 0, management: 4160, capex: 0 },
  },
  {
    id: 'op3',
    address: '3742 Park Blvd',
    city: 'North Park',
    units: 8,
    income: { rent: 21700, parking: 0, laundry: 0, lateFees: 150, other: 0 },
    expenses: { mortgage: 0, insurance: 0, taxes: 0, maintenance: 600, utilities: 920, management: 1736, capex: 0 },
  },
  {
    id: 'op4',
    address: '2280 Kettner Blvd',
    city: 'Little Italy',
    units: 16,
    income: { rent: 62400, parking: 4800, laundry: 0, lateFees: 0, other: 0 },
    expenses: { mortgage: 28500, insurance: 2800, taxes: 0, maintenance: 1400, utilities: 2100, management: 4992, capex: 1400 },
  },
  {
    id: 'op5',
    address: '735 W Laurel St',
    city: 'Bankers Hill',
    units: 6,
    income: { rent: 19800, parking: 0, laundry: 0, lateFees: 0, other: 0 },
    expenses: { mortgage: 0, insurance: 0, taxes: 0, maintenance: 1800, utilities: 0, management: 1584, capex: 0 },
  },
  {
    id: 'op6',
    address: '915 Turquoise St',
    city: 'Pacific Beach',
    units: 1,
    income: { rent: 4200, parking: 0, laundry: 0, lateFees: 0, other: 0 },
    expenses: { mortgage: 0, insurance: 0, taxes: 0, maintenance: 0, utilities: 0, management: 336, capex: 0 },
  },
  {
    id: 'op7',
    address: '4490 30th St',
    city: 'North Park',
    units: 2,
    income: { rent: 7000, parking: 0, laundry: 0, lateFees: 0, other: 0 },
    expenses: { mortgage: 0, insurance: 0, taxes: 0, maintenance: 0, utilities: 0, management: 560, capex: 0 },
  },
];

const MONTH_SUMMARIES: MonthSummary[] = [
  { month: '2025-11', label: 'November 2025', totalIncome: 198400, totalExpenses: 89200, netIncome: 109200 },
  { month: '2025-12', label: 'December 2025', totalIncome: 201300, totalExpenses: 94800, netIncome: 106500 },
  { month: '2026-01', label: 'January 2026',  totalIncome: 205800, totalExpenses: 88100, netIncome: 117700 },
  { month: '2026-02', label: 'February 2026', totalIncome: 203600, totalExpenses: 91400, netIncome: 112200 },
  { month: '2026-03', label: 'March 2026',    totalIncome: 209200, totalExpenses: 86500, netIncome: 122700 },
  { month: '2026-04', label: 'April 2026',    totalIncome: 211130, totalExpenses: 95314, netIncome: 115816 },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const sumIncome = (p: OwnerProperty) =>
  p.income.rent + p.income.parking + p.income.laundry + p.income.lateFees + p.income.other;

const sumExpenses = (p: OwnerProperty) =>
  p.expenses.mortgage + p.expenses.insurance + p.expenses.taxes + p.expenses.maintenance +
  p.expenses.utilities + p.expenses.management + p.expenses.capex;

export default function OwnerReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-04');

  const currentSummary = MONTH_SUMMARIES.find((m) => m.month === selectedMonth) ?? MONTH_SUMMARIES[MONTH_SUMMARIES.length - 1];

  const portfolioIncome = MOCK_PROPERTIES.reduce((s, p) => s + sumIncome(p), 0);
  const portfolioExpenses = MOCK_PROPERTIES.reduce((s, p) => s + sumExpenses(p), 0);
  const portfolioNet = portfolioIncome - portfolioExpenses;
  const totalUnits = MOCK_PROPERTIES.reduce((s, p) => s + p.units, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Manager &middot; Owner Reports</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Owner <em className="italic">Statement</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                {currentSummary.label} statement. {MOCK_PROPERTIES.length} properties, {totalUnits} total units under management.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}
              >
                {MONTH_SUMMARIES.map((m) => (
                  <option key={m.month} value={m.month}>{m.label}</option>
                ))}
              </select>
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Export PDF</button>
              <button onClick={() => window.print()} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>Print</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Gross income" value={fmtMoney(portfolioIncome)} hint={`${MOCK_PROPERTIES.length} properties`} />
            <Kpi label="Total expenses" value={fmtMoney(portfolioExpenses)} />
            <Kpi label="Net to owner" value={fmtMoney(portfolioNet)} hint={`${Math.round((portfolioNet / portfolioIncome) * 100)}% margin`} accent />
            <Kpi label="Per unit avg" value={fmtMoney(Math.round(portfolioNet / totalUnits))} hint={`${totalUnits} total units`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Monthly Summary Cards */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Monthly <em className="italic">Summary</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>6-month rolling view</p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {MONTH_SUMMARIES.map((m) => {
              const isSelected = m.month === selectedMonth;
              const prevIdx = MONTH_SUMMARIES.findIndex((s) => s.month === m.month) - 1;
              const prevNet = prevIdx >= 0 ? MONTH_SUMMARIES[prevIdx].netIncome : m.netIncome;
              const change = ((m.netIncome - prevNet) / prevNet * 100).toFixed(1);
              const isUp = m.netIncome >= prevNet;
              return (
                <motion.button
                  key={m.month}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSelectedMonth(m.month)}
                  className="rounded-lg border bg-white p-4 text-left transition-colors"
                  style={{ borderColor: isSelected ? '#F9D96A' : 'rgba(17,17,17,0.08)', backgroundColor: isSelected ? '#FEFCE8' : 'white' }}
                >
                  <div className="text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>
                    {m.label.split(' ')[0].slice(0, 3)} &apos;{m.label.split(' ')[1].slice(2)}
                  </div>
                  <div className="mt-1 text-lg font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
                    {fmtMoney(m.netIncome)}
                  </div>
                  {prevIdx >= 0 && (
                    <div className="mt-0.5 text-[10px] font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: isUp ? '#15803D' : '#B91C1C' }}>
                      {isUp ? '+' : ''}{change}%
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Per-Property Breakdowns */}
        <section className="print:break-inside-avoid">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Property <em className="italic">Breakdown</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Per-property income, expenses &amp; net</p>

          <div className="space-y-4">
            {MOCK_PROPERTIES.map((p) => {
              const inc = sumIncome(p);
              const exp = sumExpenses(p);
              const net = inc - exp;
              const incomeItems = [
                { label: 'Rent', value: p.income.rent },
                { label: 'Parking', value: p.income.parking },
                { label: 'Laundry', value: p.income.laundry },
                { label: 'Late Fees', value: p.income.lateFees },
                { label: 'Other', value: p.income.other },
              ].filter((i) => i.value > 0);
              const expenseItems = [
                { label: 'Mortgage', value: p.expenses.mortgage },
                { label: 'Insurance', value: p.expenses.insurance },
                { label: 'Taxes', value: p.expenses.taxes },
                { label: 'Maintenance', value: p.expenses.maintenance },
                { label: 'Utilities', value: p.expenses.utilities },
                { label: 'Management', value: p.expenses.management },
                { label: 'CapEx', value: p.expenses.capex },
              ].filter((i) => i.value > 0);

              return (
                <div key={p.id} className="rounded-lg border bg-white print:break-inside-avoid print:border-neutral-300" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                  {/* Property Header */}
                  <div className="border-b px-6 py-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-[#111111]">{p.address}</div>
                        <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{p.city}, San Diego &middot; {p.units} unit{p.units > 1 ? 's' : ''}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium" style={{ fontFamily: 'var(--font-heading)', color: net >= 0 ? '#15803D' : '#B91C1C' }}>
                          {fmtMoney(net)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Net</div>
                      </div>
                    </div>
                  </div>

                  {/* Income & Expenses Grid */}
                  <div className="grid sm:grid-cols-2">
                    {/* Income */}
                    <div className="border-b px-6 py-4 sm:border-b-0 sm:border-r" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                      <div className="mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Income</div>
                      <div className="space-y-2">
                        {incomeItems.map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-sm">
                            <span style={{ color: 'rgba(17,17,17,0.65)' }}>{item.label}</span>
                            <span style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(item.value)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t pt-2 text-sm font-medium" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                          <span>Total Income</span>
                          <span style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(inc)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="px-6 py-4">
                      <div className="mb-3 text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Expenses</div>
                      <div className="space-y-2">
                        {expenseItems.map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-sm">
                            <span style={{ color: 'rgba(17,17,17,0.65)' }}>{item.label}</span>
                            <span style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(item.value)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between border-t pt-2 text-sm font-medium" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                          <span>Total Expenses</span>
                          <span style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(exp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Portfolio Total */}
        <section className="mt-8 print:break-inside-avoid">
          <div className="rounded-lg border-2 bg-white p-6" style={{ borderColor: '#F9D96A' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Portfolio Total &middot; {currentSummary.label}</div>
                <h3 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                  {fmtMoney(portfolioNet)} <span className="text-lg" style={{ color: 'rgba(17,17,17,0.45)' }}>net to owner</span>
                </h3>
              </div>
              <div className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: '#F9D96A', fontFamily: 'var(--font-geist-mono)' }}>
                {Math.round((portfolioNet / portfolioIncome) * 100)}% margin
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4 border-t pt-5" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Gross Income</div>
                <div className="mt-1 text-xl font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(portfolioIncome)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Total Expenses</div>
                <div className="mt-1 text-xl font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(portfolioExpenses)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Properties</div>
                <div className="mt-1 text-xl font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{MOCK_PROPERTIES.length}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Print Footer */}
        <div className="mt-8 hidden border-t pt-4 print:block" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>
            <span>CASA Property Management &middot; Owner Statement</span>
            <span>{currentSummary.label}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}
