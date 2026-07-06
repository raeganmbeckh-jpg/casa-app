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

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;

type Scenario = {
  name: string;
  label: string;
  multiplier: number;
  color: string;
};

const SCENARIOS: Scenario[] = [
  { name: 'conservative', label: 'Conservative', multiplier: 0.85, color: RED },
  { name: 'base', label: 'Base Case', multiplier: 1.0, color: BUTTER },
  { name: 'aggressive', label: 'Aggressive', multiplier: 1.2, color: GREEN },
];

export default function AcquisitionModelerPage() {
  const [purchasePrice, setPurchasePrice] = useState(450000);
  const [holdingCostMo, setHoldingCostMo] = useState(2500);
  const [exitStrategy, setExitStrategy] = useState<'flip' | 'develop' | 'hold'>('flip');
  const [holdPeriod, setHoldPeriod] = useState(12);
  const [targetIRR, setTargetIRR] = useState(0.20);

  const calcs = useMemo(() => {
    const totalHoldCost = holdingCostMo * holdPeriod;
    const totalBasis = purchasePrice + totalHoldCost;
    const breakevenPrice = totalBasis;
    const targetSalePrice = totalBasis * (1 + targetIRR * (holdPeriod / 12));
    const projectedProfit = targetSalePrice - totalBasis;
    const irr = projectedProfit / purchasePrice / (holdPeriod / 12);

    return { totalHoldCost, totalBasis, breakevenPrice, targetSalePrice, projectedProfit, irr };
  }, [purchasePrice, holdingCostMo, holdPeriod, targetIRR]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land . Acquisition</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Acquisition <em className="italic">Modeler</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Model land acquisitions with hold cost analysis, exit scenarios, and IRR projections. Know your numbers before you write the offer.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Input form */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
              <div className="text-[10px] uppercase tracking-[0.16em] mb-5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Deal Inputs</div>

              <div className="space-y-5">
                <InputField label="Purchase Price" prefix="$" value={purchasePrice} onChange={setPurchasePrice} />
                <InputField label="Holding Costs / Month" prefix="$" value={holdingCostMo} onChange={setHoldingCostMo} />

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Exit Strategy</label>
                  <div className="flex gap-2">
                    {(['flip', 'develop', 'hold'] as const).map((s) => (
                      <motion.button
                        key={s}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setExitStrategy(s)}
                        className="rounded-md border px-3 py-2 text-xs font-medium capitalize"
                        style={{
                          borderColor: exitStrategy === s ? INK : HAIRLINE,
                          backgroundColor: exitStrategy === s ? INK : 'white',
                          color: exitStrategy === s ? CREAM : MID,
                        }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <InputField label="Hold Period (Months)" value={holdPeriod} onChange={setHoldPeriod} />

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Target IRR</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0.05}
                      max={0.50}
                      step={0.01}
                      value={targetIRR}
                      onChange={(e) => setTargetIRR(parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtPct(targetIRR)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MetricCard label="Total Hold Cost" value={fmtMoney(calcs.totalHoldCost)} />
              <MetricCard label="Breakeven Price" value={fmtMoney(calcs.breakevenPrice)} />
              <MetricCard label="Target Sale Price" value={fmtMoney(calcs.targetSalePrice)} accent />
              <MetricCard label="Projected Profit" value={fmtMoney(calcs.projectedProfit)} positive={calcs.projectedProfit > 0} />
              <MetricCard label="Projected IRR" value={fmtPct(calcs.irr)} positive={calcs.irr >= targetIRR} />
              <MetricCard label="Total Basis" value={fmtMoney(calcs.totalBasis)} />
            </div>

            {/* Scenario cards */}
            <div>
              <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Exit <em className="italic">Scenarios</em>
              </h2>
              <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                Three views of your deal based on market conditions
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                {SCENARIOS.map((sc) => {
                  const salePrice = calcs.targetSalePrice * sc.multiplier;
                  const profit = salePrice - calcs.totalBasis;
                  const roi = profit / purchasePrice;
                  const irr = roi / (holdPeriod / 12);

                  return (
                    <motion.div
                      key={sc.name}
                      whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      className="rounded-lg border bg-white p-5"
                      style={{ borderColor: HAIRLINE, borderTopColor: sc.color, borderTopWidth: 3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc.color }} />
                        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{sc.label}</span>
                      </div>

                      <div className="space-y-3">
                        <ScenarioRow label="Sale Price" value={fmtMoney(salePrice)} />
                        <ScenarioRow label="Profit" value={fmtMoney(profit)} positive={profit > 0} />
                        <ScenarioRow label="ROI" value={fmtPct(roi)} positive={roi > 0} />
                        <ScenarioRow label="Annualized IRR" value={fmtPct(irr)} positive={irr > 0} />
                      </div>

                      <div className="mt-4 pt-3 border-t" style={{ borderColor: HAIRLINE }}>
                        <div className="text-xs italic" style={{ fontFamily: 'var(--font-heading)', color: MID }}>
                          {profit > 0 ? `${fmtMoney(profit)} above breakeven` : `${fmtMoney(Math.abs(profit))} shortfall`}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Casa Intelligence */}
            <div className="rounded-lg border p-5" style={{ borderColor: BUTTER, backgroundColor: '#FEF9E1' }}>
              <div className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Casa Intelligence</div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-heading)', color: INK }}>
                {calcs.irr >= targetIRR ? (
                  <>This deal meets your <em className="italic">{fmtPct(targetIRR)} target IRR</em> under base-case assumptions. Conservative scenario should be your floor for negotiation. Consider tightening hold period to improve returns.</>
                ) : (
                  <>This deal <em className="italic">does not meet</em> your {fmtPct(targetIRR)} target IRR under current assumptions. Negotiate purchase price down to {fmtMoney(purchasePrice * 0.85)} or reduce hold period to improve the spread.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function InputField({ label, prefix, value, onChange }: { label: string; prefix?: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.14em] mb-1.5" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <div className="flex items-center rounded-md border bg-white overflow-hidden" style={{ borderColor: HAIRLINE }}>
        {prefix && <span className="px-3 text-sm" style={{ color: DIM }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2.5 text-sm focus:outline-none"
          style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent, positive }: { label: string; value: string; accent?: boolean; positive?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div
        className="mt-2 text-xl sm:text-2xl tabular-nums"
        style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: positive !== undefined ? (positive ? GREEN : RED) : INK }}
      >
        {value}
      </div>
    </div>
  );
}

function ScenarioRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: DIM }}>{label}</span>
      <span
        className="text-sm font-medium tabular-nums"
        style={{ fontFamily: 'var(--font-geist-mono)', color: positive !== undefined ? (positive ? GREEN : RED) : INK }}
      >
        {value}
      </span>
    </div>
  );
}
