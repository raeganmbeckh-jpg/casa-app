'use client';

import { useState, useMemo } from 'react';
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

/* ── Helpers ── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function ProFormaPage() {
  /* ── Inputs ── */
  const [productType, setProductType] = useState('Multifamily');
  const [units, setUnits] = useState(120);
  const [avgUnitSize, setAvgUnitSize] = useState(850);
  const [targetRent, setTargetRent] = useState(2800);
  const [landCostPerSqft, setLandCostPerSqft] = useState(95);

  /* ── Calculations ── */
  const calc = useMemo(() => {
    const totalSqft = units * avgUnitSize;
    const landCost = totalSqft * landCostPerSqft;
    const hardCosts = totalSqft * 175;
    const softCosts = hardCosts * 0.25;
    const totalHardSoft = landCost + hardCosts + softCosts;
    const financing = totalHardSoft * 0.06;
    const tdc = totalHardSoft + financing;

    const grossRent = units * targetRent * 12;
    const vacancy = grossRent * 0.05;
    const effectiveGross = grossRent - vacancy;
    const opex = effectiveGross * 0.35;
    const noi = effectiveGross - opex;

    const devYield = (noi / tdc) * 100;
    const equityRequired = tdc * 0.30;

    // IRR estimate: simplified (dev yield + assumed 2% annual growth spread)
    const irrEstimate = devYield + 2;

    return { totalSqft, landCost, hardCosts, softCosts, financing, tdc, grossRent, vacancy, effectiveGross, opex, noi, devYield, equityRequired, irrEstimate };
  }, [units, avgUnitSize, targetRent, landCostPerSqft]);

  /* ── Sensitivity: 3 exit caps x 3 rent scenarios ── */
  const exitCaps = [4.5, 5.0, 5.5];
  const rentDeltas = [-5, 0, 5]; // % change from target
  const sensitivity = useMemo(() => {
    return exitCaps.map(cap => {
      return rentDeltas.map(delta => {
        const adjRent = targetRent * (1 + delta / 100);
        const gross = units * adjRent * 12;
        const egi = gross * 0.95;
        const opx = egi * 0.35;
        const adjNoi = egi - opx;
        const exitValue = adjNoi / (cap / 100);
        const profit = exitValue - calc.tdc;
        const equity = calc.tdc * 0.30;
        // Simplified 3-year IRR proxy
        const irr = ((profit / equity) / 3) * 100 + calc.devYield;
        return { cap, delta, irr: Math.max(0, irr) };
      });
    });
  }, [targetRent, units, calc.tdc, calc.devYield]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── Header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Pro Forma</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Pro Forma <em className="italic">Engine</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Model your next deal in seconds. Adjust inputs and watch the returns update in real time.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* ── Inputs Card ── */}
          <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <h2 className="mb-4 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Deal <em className="italic">Inputs</em></h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Product type</label>
                <select value={productType} onChange={e => setProductType(e.target.value)} className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE }}>
                  {['Multifamily', 'Mixed-Use', 'Condos', 'Townhomes', 'Student Housing'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <NumInput label="Units" value={units} onChange={setUnits} />
              <NumInput label="Avg unit size (sf)" value={avgUnitSize} onChange={setAvgUnitSize} />
              <NumInput label="Target rent ($/mo)" value={targetRent} onChange={setTargetRent} />
              <NumInput label="Land cost ($/sf)" value={landCostPerSqft} onChange={setLandCostPerSqft} />
            </div>
          </div>

          {/* ── Results ── */}
          <div className="space-y-6">
            {/* Cost stack */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
              <h2 className="mb-4 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Development <em className="italic">Costs</em></h2>
              <div className="space-y-3">
                <LineItem label="Land cost" sublabel={`${calc.totalSqft.toLocaleString()} sf @ $${landCostPerSqft}/sf`} value={fmtMoney(calc.landCost)} />
                <LineItem label="Hard costs" sublabel={`${calc.totalSqft.toLocaleString()} sf @ $175/sf`} value={fmtMoney(calc.hardCosts)} />
                <LineItem label="Soft costs" sublabel="25% of hard costs" value={fmtMoney(calc.softCosts)} />
                <LineItem label="Financing" sublabel="6% of hard + soft + land" value={fmtMoney(calc.financing)} />
                <div className="border-t pt-3" style={{ borderColor: HAIRLINE }}>
                  <LineItem label="Total development cost" value={fmtMoney(calc.tdc)} bold />
                </div>
              </div>
            </div>

            {/* Income */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
              <h2 className="mb-4 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Operating <em className="italic">Income</em></h2>
              <div className="space-y-3">
                <LineItem label="Gross potential rent" sublabel={`${units} units @ ${fmtMoney(targetRent)}/mo`} value={fmtMoney(calc.grossRent)} />
                <LineItem label="Vacancy" sublabel="5%" value={`(${fmtMoney(calc.vacancy)})`} negative />
                <LineItem label="Effective gross income" value={fmtMoney(calc.effectiveGross)} />
                <LineItem label="Operating expenses" sublabel="35% of EGI" value={`(${fmtMoney(calc.opex)})`} negative />
                <div className="border-t pt-3" style={{ borderColor: HAIRLINE }}>
                  <LineItem label="Net operating income" value={fmtMoney(calc.noi)} bold />
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="grid gap-4 sm:grid-cols-4">
              <ReturnKpi label="Dev yield" value={fmtPct(calc.devYield)} good={calc.devYield >= 5.5} />
              <ReturnKpi label="Equity required" value={fmtMoney(calc.equityRequired)} />
              <ReturnKpi label="Est. IRR" value={fmtPct(calc.irrEstimate)} good={calc.irrEstimate >= 12} />
              <ReturnKpi label="NOI" value={fmtMoney(calc.noi)} good={calc.noi > 0} />
            </div>

            {/* Sensitivity table */}
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
              <h2 className="mb-1 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Sensitivity <em className="italic">Matrix</em></h2>
              <p className="mb-4 text-xs" style={{ color: DIM }}>Estimated IRR across exit cap rates and rent scenarios</p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                      <th className="px-4 py-3 font-medium">Exit Cap</th>
                      {rentDeltas.map(d => (
                        <th key={d} className="px-4 py-3 text-center font-medium">Rent {d >= 0 ? '+' : ''}{d}%</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivity.map((row, ri) => (
                      <tr key={ri} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                        <td className="px-4 py-3 font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{exitCaps[ri].toFixed(1)}%</td>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 text-center tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: cell.irr >= 15 ? GREEN : cell.irr < 8 ? RED : INK }}>
                            {cell.irr.toFixed(1)}%
                          </td>
                        ))}
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

/* ── Sub-components ── */

function LineItem({ label, sublabel, value, bold, negative }: { label: string; sublabel?: string; value: string; bold?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div>
        <div className={`text-sm ${bold ? 'font-semibold' : ''}`} style={{ color: INK }}>{label}</div>
        {sublabel && <div className="text-xs" style={{ color: DIM }}>{sublabel}</div>}
      </div>
      <div className={`shrink-0 text-sm tabular-nums ${bold ? 'font-semibold' : 'font-medium'}`} style={{ fontFamily: 'var(--font-geist-mono)', color: negative ? RED : INK }}>{value}</div>
    </div>
  );
}

function ReturnKpi({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <motion.div whileHover={{ y: -1 }} className="rounded-lg border bg-white p-4" style={{ borderColor: good ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: good ? GREEN : INK }}>{value}</div>
    </motion.div>
  );
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value) || 0)} className="w-full rounded-md border bg-white px-3 py-2 text-sm tabular-nums focus:outline-none" style={{ borderColor: HAIRLINE, fontFamily: 'var(--font-geist-mono)' }} />
    </div>
  );
}
