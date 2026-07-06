'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type TransactionType = 'income' | 'expense';
type TransactionCategory = 'rent' | 'parking' | 'laundry' | 'late_fee' | 'maintenance' | 'insurance' | 'taxes' | 'utilities' | 'management' | 'mortgage' | 'capex';

type Transaction = {
  id: string;
  date: string;
  property: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
};

type MonthlyData = {
  month: string;
  label: string;
  income: number;
  expenses: number;
  noi: number;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  // Income
  { id: 'tx1',  date: '2026-04-01', property: '4821 Voltaire St',  type: 'income',  category: 'rent',        description: 'April rent — all units',         amount: 38400 },
  { id: 'tx2',  date: '2026-04-01', property: '1530 Front St',     type: 'income',  category: 'rent',        description: 'April rent — commercial suites', amount: 52000 },
  { id: 'tx3',  date: '2026-04-01', property: '3742 Park Blvd',    type: 'income',  category: 'rent',        description: 'April rent — 7 of 8 units',     amount: 21700 },
  { id: 'tx4',  date: '2026-04-01', property: '2280 Kettner Blvd', type: 'income',  category: 'rent',        description: 'April rent — all units',         amount: 62400 },
  { id: 'tx5',  date: '2026-04-01', property: '735 W Laurel St',   type: 'income',  category: 'rent',        description: 'April rent — all units',         amount: 19800 },
  { id: 'tx6',  date: '2026-04-01', property: '915 Turquoise St',  type: 'income',  category: 'rent',        description: 'April rent',                     amount: 4200 },
  { id: 'tx7',  date: '2026-04-01', property: '4490 30th St',      type: 'income',  category: 'rent',        description: 'April rent — 1 of 2 suites',    amount: 7000 },
  { id: 'tx8',  date: '2026-04-05', property: '2280 Kettner Blvd', type: 'income',  category: 'parking',     description: 'Parking revenue — 24 spaces',    amount: 4800 },
  { id: 'tx9',  date: '2026-04-05', property: '4821 Voltaire St',  type: 'income',  category: 'laundry',     description: 'Laundry coin collection',         amount: 680 },
  { id: 'tx10', date: '2026-04-08', property: '3742 Park Blvd',    type: 'income',  category: 'late_fee',    description: 'Late fee — unit C-301',          amount: 150 },
  // Expenses
  { id: 'tx11', date: '2026-04-02', property: '4821 Voltaire St',  type: 'expense', category: 'maintenance', description: 'Water heater emergency repair',   amount: 2800 },
  { id: 'tx12', date: '2026-04-02', property: '4821 Voltaire St',  type: 'expense', category: 'maintenance', description: 'Roof leak repair — unit B-112',  amount: 4500 },
  { id: 'tx13', date: '2026-04-03', property: '1530 Front St',     type: 'expense', category: 'maintenance', description: 'HVAC compressor service',         amount: 3200 },
  { id: 'tx14', date: '2026-04-01', property: '4821 Voltaire St',  type: 'expense', category: 'insurance',   description: 'Monthly property insurance',      amount: 1850 },
  { id: 'tx15', date: '2026-04-01', property: '1530 Front St',     type: 'expense', category: 'insurance',   description: 'Commercial property insurance',   amount: 2400 },
  { id: 'tx16', date: '2026-04-01', property: '2280 Kettner Blvd', type: 'expense', category: 'insurance',   description: 'Monthly property insurance',      amount: 2800 },
  { id: 'tx17', date: '2026-04-01', property: '4821 Voltaire St',  type: 'expense', category: 'taxes',       description: 'Property tax installment',        amount: 4050 },
  { id: 'tx18', date: '2026-04-01', property: '1530 Front St',     type: 'expense', category: 'taxes',       description: 'Property tax installment',        amount: 5170 },
  { id: 'tx19', date: '2026-04-05', property: '3742 Park Blvd',    type: 'expense', category: 'utilities',   description: 'Water & trash — common areas',   amount: 920 },
  { id: 'tx20', date: '2026-04-05', property: '2280 Kettner Blvd', type: 'expense', category: 'utilities',   description: 'Water, trash & electric — common', amount: 2100 },
  { id: 'tx21', date: '2026-04-01', property: 'Portfolio',         type: 'expense', category: 'management',  description: 'Property management fee — 8%',   amount: 16824 },
  { id: 'tx22', date: '2026-04-01', property: '2280 Kettner Blvd', type: 'expense', category: 'mortgage',    description: 'Mortgage payment',               amount: 28500 },
  { id: 'tx23', date: '2026-04-01', property: '4821 Voltaire St',  type: 'expense', category: 'mortgage',    description: 'Mortgage payment',               amount: 18200 },
  { id: 'tx24', date: '2026-04-08', property: '3742 Park Blvd',    type: 'expense', category: 'maintenance', description: 'Electrical outlet repair',        amount: 600 },
  { id: 'tx25', date: '2026-04-01', property: '2280 Kettner Blvd', type: 'expense', category: 'capex',       description: 'Pool pump motor replacement',     amount: 1400 },
];

const MONTHLY_DATA: MonthlyData[] = [
  { month: '2025-11', label: 'Nov',  income: 198400, expenses: 89200, noi: 109200 },
  { month: '2025-12', label: 'Dec',  income: 201300, expenses: 94800, noi: 106500 },
  { month: '2026-01', label: 'Jan',  income: 205800, expenses: 88100, noi: 117700 },
  { month: '2026-02', label: 'Feb',  income: 203600, expenses: 91400, noi: 112200 },
  { month: '2026-03', label: 'Mar',  income: 209200, expenses: 86500, noi: 122700 },
  { month: '2026-04', label: 'Apr',  income: 211130, expenses: 95314, noi: 115816 },
];

const categoryLabels: Record<TransactionCategory, string> = {
  rent: 'Rent', parking: 'Parking', laundry: 'Laundry', late_fee: 'Late Fee',
  maintenance: 'Maintenance', insurance: 'Insurance', taxes: 'Taxes',
  utilities: 'Utilities', management: 'Management', mortgage: 'Mortgage', capex: 'CapEx',
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function FinancialsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [showForm, setShowForm] = useState(false);

  const totalIncome = MOCK_TRANSACTIONS.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = MOCK_TRANSACTIONS.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netNOI = totalIncome - totalExpenses;
  const collectionRate = Math.round((totalIncome / 211130) * 100);

  const rows = useMemo(() => {
    let r = [...MOCK_TRANSACTIONS];
    if (typeFilter !== 'all') r = r.filter((t) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.property.toLowerCase().includes(q) ||
          categoryLabels[t.category].toLowerCase().includes(q),
      );
    }
    r.sort((a, b) => b.date.localeCompare(a.date));
    return r;
  }, [search, typeFilter]);

  // P&L by property
  const propertyPL = useMemo(() => {
    const map: Record<string, { income: number; expenses: number }> = {};
    MOCK_TRANSACTIONS.forEach((t) => {
      if (t.property === 'Portfolio') return;
      if (!map[t.property]) map[t.property] = { income: 0, expenses: 0 };
      if (t.type === 'income') map[t.property].income += t.amount;
      else map[t.property].expenses += t.amount;
    });
    return Object.entries(map)
      .map(([property, data]) => ({ property, ...data, noi: data.income - data.expenses }))
      .sort((a, b) => b.noi - a.noi);
  }, []);

  // Sparkline chart
  const maxNOI = Math.max(...MONTHLY_DATA.map((m) => m.noi));
  const sparkHeight = 80;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Manager &middot; Financials</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Profit &amp; <em className="italic">Loss</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                April 2026 financial summary. Track income, expenses, and NOI across your entire portfolio.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Export</button>
              <button onClick={() => setShowForm(!showForm)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>+ Add Transaction</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total income" value={fmtMoney(totalIncome)} hint="This month" />
            <Kpi label="Total expenses" value={fmtMoney(totalExpenses)} hint="This month" />
            <Kpi label="Net NOI" value={fmtMoney(netNOI)} hint={netNOI >= 0 ? 'Positive cash flow' : 'Negative cash flow'} accent />
            <Kpi label="Collection rate" value={`${collectionRate}%`} hint="Of expected income" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* NOI Trend */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            NOI <em className="italic">Trend</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>6-month net operating income</p>
          <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            <div className="flex items-end justify-between gap-2" style={{ height: sparkHeight + 32 }}>
              {MONTHLY_DATA.map((m, i) => {
                const barH = (m.noi / maxNOI) * sparkHeight;
                const prevNOI = i > 0 ? MONTHLY_DATA[i - 1].noi : m.noi;
                const change = ((m.noi - prevNOI) / prevNOI * 100).toFixed(1);
                const isUp = m.noi >= prevNOI;
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="text-[10px] font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: isUp ? '#15803D' : '#B91C1C' }}>
                      {i > 0 ? `${isUp ? '+' : ''}${change}%` : ''}
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: barH }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="w-full max-w-[48px] rounded-t"
                      style={{ backgroundColor: i === MONTHLY_DATA.length - 1 ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}
                    />
                    <div className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{m.label}</div>
                    <div className="text-[11px] font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{(m.noi / 1000).toFixed(0)}K</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-6 border-t pt-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              {MONTHLY_DATA.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgba(17,17,17,0.08)' }} />
                    <span className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>Previous months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: '#F9D96A' }} />
                    <span className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>Current month</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* P&L by Property */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Property <em className="italic">P&amp;L</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Income vs expenses by property</p>
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium text-right">Income</th>
                  <th className="px-4 py-3 font-medium text-right">Expenses</th>
                  <th className="px-4 py-3 font-medium text-right">NOI</th>
                  <th className="px-4 py-3 font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {propertyPL.map((p) => {
                  const margin = p.income > 0 ? Math.round((p.noi / p.income) * 100) : 0;
                  return (
                    <tr key={p.property} className="border-b last:border-0" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                      <td className="px-4 py-3 font-medium text-[#111111]">{p.property}</td>
                      <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(p.income)}</td>
                      <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(p.expenses)}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: p.noi >= 0 ? '#15803D' : '#B91C1C' }}>{fmtMoney(p.noi)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-neutral-200">
                            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(0, margin)}%`, backgroundColor: margin >= 50 ? '#15803D' : margin >= 20 ? '#D97706' : '#B91C1C' }} />
                          </div>
                          <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.65)' }}>{margin}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 bg-neutral-50 font-medium" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                  <td className="px-4 py-3 text-[#111111]">Total</td>
                  <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(totalIncome)}</td>
                  <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(totalExpenses)}</td>
                  <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)', color: netNOI >= 0 ? '#15803D' : '#B91C1C' }}>{fmtMoney(netNOI)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.65)' }}>{Math.round((netNOI / totalIncome) * 100)}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {propertyPL.map((p) => (
              <div key={p.property} className="rounded-lg border bg-white p-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                <div className="font-medium text-[#111111]">{p.property}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Income</div>
                    <div style={{ fontFamily: 'var(--font-geist-mono)', color: '#15803D' }}>{fmtMoney(p.income)}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Expenses</div>
                    <div style={{ fontFamily: 'var(--font-geist-mono)', color: '#B91C1C' }}>{fmtMoney(p.expenses)}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>NOI</div>
                    <div className="font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: p.noi >= 0 ? '#15803D' : '#B91C1C' }}>{fmtMoney(p.noi)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Transaction Form */}
        {showForm && (
          <section className="mb-8">
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                New <em className="italic">Transaction</em>
              </h2>
              <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Record income or expense</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Type</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Property</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option>4821 Voltaire St</option>
                    <option>1530 Front St</option>
                    <option>3742 Park Blvd</option>
                    <option>2280 Kettner Blvd</option>
                    <option>735 W Laurel St</option>
                    <option>915 Turquoise St</option>
                    <option>4490 30th St</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Category</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option value="rent">Rent</option>
                    <option value="parking">Parking</option>
                    <option value="laundry">Laundry</option>
                    <option value="late_fee">Late Fee</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="insurance">Insurance</option>
                    <option value="taxes">Taxes</option>
                    <option value="utilities">Utilities</option>
                    <option value="management">Management</option>
                    <option value="mortgage">Mortgage</option>
                    <option value="capex">CapEx</option>
                  </select>
                </div>
                <FormField label="Amount ($)" placeholder="5,000" type="number" />
                <FormField label="Date" placeholder="" type="date" />
                <FormField label="Description" placeholder="April rent payment" />
              </div>
              <div className="mt-5 flex gap-2">
                <button className="rounded-md border border-transparent px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>Save Transaction</button>
                <button onClick={() => setShowForm(false)} className="rounded-md border bg-white px-4 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Cancel</button>
              </div>
            </div>
          </section>
        )}

        {/* Transaction Ledger */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Transaction <em className="italic">Ledger</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{rows.length} transactions</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, property..."
                className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none sm:w-64"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <motion.tr
                    key={t.id}
                    whileHover={{ backgroundColor: '#FDF8E8' }}
                    className="border-b last:border-0"
                    style={{ borderColor: 'rgba(17,17,17,0.08)' }}
                  >
                    <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.65)' }}>{fmtDate(t.date)}</td>
                    <td className="px-4 py-3 font-medium text-[#111111]">{t.description}</td>
                    <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{t.property}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>{categoryLabels[t.category]}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: t.type === 'income' ? '#15803D' : '#B91C1C' }}>
                      {t.type === 'income' ? '+' : '-'}{fmtMoney(t.amount)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((t) => (
              <div key={t.id} className="rounded-lg border bg-white p-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-[#111111]">{t.description}</div>
                    <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{t.property}</div>
                  </div>
                  <div className="shrink-0 text-right font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: t.type === 'income' ? '#15803D' : '#B91C1C' }}>
                    {t.type === 'income' ? '+' : '-'}{fmtMoney(t.amount)}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>
                  <span>{categoryLabels[t.category]}</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(t.date)}</span>
                </div>
              </div>
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
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}

function FormField({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none"
        style={{ borderColor: 'rgba(17,17,17,0.08)' }}
      />
    </div>
  );
}
