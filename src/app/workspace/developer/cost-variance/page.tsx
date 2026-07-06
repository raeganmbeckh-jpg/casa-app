'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ── */
type CostCategory = 'Hard Costs' | 'Soft Costs' | 'Financing';

type LineItem = {
  id: string;
  category: CostCategory;
  description: string;
  budgeted: number;
  committed: number;
  actual: number;
};

/* ── Mock data: 12 line items ── */
const MOCK_LINE_ITEMS: LineItem[] = [
  // Hard Costs
  { id: 'li1',  category: 'Hard Costs', description: 'Structural concrete',       budgeted: 4_200_000, committed: 4_350_000, actual: 4_180_000 },
  { id: 'li2',  category: 'Hard Costs', description: 'Structural steel',          budgeted: 2_800_000, committed: 2_950_000, actual: 2_720_000 },
  { id: 'li3',  category: 'Hard Costs', description: 'MEP rough-in',              budgeted: 3_100_000, committed: 3_100_000, actual: 2_450_000 },
  { id: 'li4',  category: 'Hard Costs', description: 'Exterior envelope',         budgeted: 2_400_000, committed: 2_600_000, actual: 1_900_000 },
  { id: 'li5',  category: 'Hard Costs', description: 'Interior finishes',         budgeted: 1_800_000, committed: 1_750_000, actual: 620_000 },
  { id: 'li6',  category: 'Hard Costs', description: 'Site work & grading',       budgeted: 1_500_000, committed: 1_480_000, actual: 1_510_000 },
  { id: 'li7',  category: 'Hard Costs', description: 'Fire protection',           budgeted: 950_000,   committed: 980_000,   actual: 410_000 },
  // Soft Costs
  { id: 'li8',  category: 'Soft Costs', description: 'Architecture & engineering', budgeted: 1_200_000, committed: 1_200_000, actual: 1_080_000 },
  { id: 'li9',  category: 'Soft Costs', description: 'Permits & fees',            budgeted: 680_000,   committed: 720_000,   actual: 720_000 },
  { id: 'li10', category: 'Soft Costs', description: 'Legal & insurance',         budgeted: 450_000,   committed: 430_000,   actual: 380_000 },
  // Financing
  { id: 'li11', category: 'Financing',  description: 'Construction loan interest', budgeted: 1_800_000, committed: 1_800_000, actual: 1_250_000 },
  { id: 'li12', category: 'Financing',  description: 'Loan fees & closing',       budgeted: 340_000,   committed: 340_000,   actual: 340_000 },
];

const CONTINGENCY_BUDGET = 1_200_000;

/* ── Helpers ── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n.toFixed(1)}%`;

const categories: CostCategory[] = ['Hard Costs', 'Soft Costs', 'Financing'];

export default function CostVariancePage() {
  const items = MOCK_LINE_ITEMS;

  /* ── Computed ── */
  const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
  const totalCommitted = items.reduce((s, i) => s + i.committed, 0);
  const totalActual = items.reduce((s, i) => s + i.actual, 0);
  const totalVariance = totalBudgeted - totalCommitted;
  const contingencyUsed = Math.max(0, totalCommitted - totalBudgeted);
  const contingencyRemaining = CONTINGENCY_BUDGET - contingencyUsed;

  /* ── Category rollups ── */
  const rollups = useMemo(() => {
    return categories.map(cat => {
      const catItems = items.filter(i => i.category === cat);
      const budgeted = catItems.reduce((s, i) => s + i.budgeted, 0);
      const committed = catItems.reduce((s, i) => s + i.committed, 0);
      const actual = catItems.reduce((s, i) => s + i.actual, 0);
      const variance = budgeted - committed;
      return { category: cat, budgeted, committed, actual, variance, pctSpent: budgeted > 0 ? (actual / budgeted) * 100 : 0 };
    });
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── Header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Cost Variance</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Cost <em className="italic">Variance</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Budget vs. actuals at a glance. Red means over, green means under. No surprises.
              </p>
            </div>
            <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-neutral-900" style={{ borderColor: HAIRLINE, color: MID }}>Export Report</button>
          </div>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total budget" value={fmtMoney(totalBudgeted + CONTINGENCY_BUDGET)} />
            <Kpi label="Total spent" value={fmtMoney(totalActual)} hint={fmtPct((totalActual / totalBudgeted) * 100) + ' of budget'} />
            <Kpi label="Budget variance" value={fmtMoney(totalVariance)} positive={totalVariance >= 0} />
            <Kpi label="Contingency left" value={fmtMoney(contingencyRemaining)} hint={fmtPct((contingencyRemaining / CONTINGENCY_BUDGET) * 100) + ' remaining'} accent />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ── Category rollup cards ── */}
        <section className="mb-8">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Category <em className="italic">Summary</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Rollup by cost category</p>

          <div className="grid gap-4 sm:grid-cols-3">
            {rollups.map(r => (
              <motion.div key={r.category} whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }} className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{r.category}</h3>
                  <span className="text-xs font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: r.variance >= 0 ? GREEN : RED }}>
                    {r.variance >= 0 ? '+' : ''}{fmtMoney(r.variance)}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs" style={{ color: MID }}>
                  <div className="flex justify-between"><span>Budgeted</span><span className="tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(r.budgeted)}</span></div>
                  <div className="flex justify-between"><span>Committed</span><span className="tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(r.committed)}</span></div>
                  <div className="flex justify-between"><span>Actual to date</span><span className="tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(r.actual)}</span></div>
                </div>
                {/* % spent bar */}
                <div className="mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Spent</span>
                    <span className="text-[11px] tabular-nums font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtPct(r.pctSpent)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, r.pctSpent)}%`, backgroundColor: r.pctSpent > 100 ? RED : r.pctSpent > 75 ? '#D97706' : GREEN }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Line items table ── */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Budget <em className="italic">Detail</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{items.length} line items across {categories.length} categories</p>

          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Budgeted</th>
                  <th className="px-4 py-3 text-right font-medium">Committed</th>
                  <th className="px-4 py-3 text-right font-medium">Actual</th>
                  <th className="px-4 py-3 text-right font-medium">Variance</th>
                  <th className="px-4 py-3 font-medium">% Spent</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const variance = item.budgeted - item.committed;
                  const pctSpent = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0;
                  const barColor = pctSpent > 100 ? RED : pctSpent > 75 ? '#D97706' : GREEN;

                  return (
                    <motion.tr key={item.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                      <td className="px-4 py-3">
                        <span className="text-[11px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{item.category}</span>
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: INK }}>{item.description}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtMoney(item.budgeted)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtMoney(item.committed)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(item.actual)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: variance >= 0 ? GREEN : RED }}>
                        {variance >= 0 ? '+' : ''}{fmtMoney(variance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctSpent)}%`, backgroundColor: barColor }} />
                          </div>
                          <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtPct(pctSpent)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 bg-neutral-50" style={{ borderColor: HAIRLINE }}>
                  <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)' }}>Total</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(totalBudgeted)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(totalCommitted)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(totalActual)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: totalVariance >= 0 ? GREEN : RED }}>
                    {totalVariance >= 0 ? '+' : ''}{fmtMoney(totalVariance)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalActual / totalBudgeted) * 100)}%`, backgroundColor: (totalActual / totalBudgeted) * 100 > 100 ? RED : GREEN }} />
                      </div>
                      <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtPct((totalActual / totalBudgeted) * 100)}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {items.map(item => {
              const variance = item.budgeted - item.committed;
              const pctSpent = item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0;
              const barColor = pctSpent > 100 ? RED : pctSpent > 75 ? '#D97706' : GREEN;

              return (
                <div key={item.id} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium" style={{ color: INK }}>{item.description}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{item.category}</div>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: variance >= 0 ? GREEN : RED }}>
                      {variance >= 0 ? '+' : ''}{fmtMoney(variance)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs" style={{ color: MID }}>
                    <div><div className="text-[10px] uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>Budget</div><div className="tabular-nums" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(item.budgeted)}</div></div>
                    <div><div className="text-[10px] uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>Committed</div><div className="tabular-nums" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(item.committed)}</div></div>
                    <div><div className="text-[10px] uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>Actual</div><div className="tabular-nums" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(item.actual)}</div></div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctSpent)}%`, backgroundColor: barColor }} />
                    </div>
                    <span className="text-xs tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtPct(pctSpent)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function Kpi({ label, value, hint, accent, positive }: { label: string; value: string; hint?: string; accent?: boolean; positive?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: positive === undefined ? INK : positive ? GREEN : RED }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}
