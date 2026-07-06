'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type Comparable = {
  id: string;
  address: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  adjustments: number;
  adjustedPrice: number;
};

type SubjectProperty = {
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  lotSize: string;
  type: string;
};

const SUBJECT: SubjectProperty = {
  address: '3245 Hawk St, North Park, San Diego 92104',
  beds: 3,
  baths: 2,
  sqft: 1680,
  yearBuilt: 1952,
  lotSize: '5,200 sqft',
  type: 'Single Family',
};

const COMPS: Comparable[] = [
  { id: 'c1', address: '3310 Utah St, North Park',       salePrice: 1095000, saleDate: '2026-02-14', sqft: 1620, pricePerSqft: 676, beds: 3, baths: 2, adjustments: 15000,  adjustedPrice: 1110000 },
  { id: 'c2', address: '3028 Grape St, South Park',      salePrice: 1150000, saleDate: '2026-01-22', sqft: 1740, pricePerSqft: 661, beds: 3, baths: 2, adjustments: -10000, adjustedPrice: 1140000 },
  { id: 'c3', address: '2945 Dale St, North Park',       salePrice: 1025000, saleDate: '2025-12-08', sqft: 1550, pricePerSqft: 661, beds: 3, baths: 1, adjustments: 35000,  adjustedPrice: 1060000 },
  { id: 'c4', address: '3480 Herman Ave, North Park',    salePrice: 1185000, saleDate: '2026-03-01', sqft: 1810, pricePerSqft: 655, beds: 4, baths: 2, adjustments: -25000, adjustedPrice: 1160000 },
  { id: 'c5', address: '3122 Boundary St, North Park',   salePrice: 1075000, saleDate: '2025-11-15', sqft: 1590, pricePerSqft: 676, beds: 3, baths: 2, adjustments: 20000,  adjustedPrice: 1095000 },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function CmaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(true);

  const adjustedPrices = COMPS.map((c) => c.adjustedPrice).sort((a, b) => a - b);
  const medianIdx = Math.floor(adjustedPrices.length / 2);
  const medianValue = adjustedPrices.length % 2 === 0
    ? Math.round((adjustedPrices[medianIdx - 1] + adjustedPrices[medianIdx]) / 2)
    : adjustedPrices[medianIdx];

  const suggestedLow = Math.round(medianValue * 0.97);
  const suggestedHigh = Math.round(medianValue * 1.03);
  const confidence = 87;

  const handleSearch = () => {
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <header className="border-b bg-white print:border-neutral-300" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Broker · CMA</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
                Comparative Market <em className="italic">Analysis</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                Generate a data-driven CMA with adjusted comparable sales and a suggested list price range.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-[#111111] print:hidden"
              style={{ borderColor: 'rgba(17,17,17,0.08)', color: '#111111' }}
            >
              Print / PDF
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 flex gap-2 print:hidden">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter property address..."
              className="flex-1 rounded-md border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none"
              style={{ borderColor: 'rgba(17,17,17,0.08)' }}
            />
            <button
              onClick={handleSearch}
              className="rounded-md px-5 py-3 text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#F9D96A', color: '#111111' }}
            >
              Generate CMA
            </button>
          </div>
        </div>
      </header>

      {showResults && (
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          {/* Subject Property */}
          <section className="mb-10">
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
              Subject <em className="italic">Property</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>The property being valued</p>

            <div className="rounded-lg border bg-white p-6" style={{ borderColor: '#F9D96A' }}>
              <div className="text-lg font-medium" style={{ color: '#111111' }}>{SUBJECT.address}</div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <Detail label="Type" value={SUBJECT.type} />
                <Detail label="Beds" value={String(SUBJECT.beds)} />
                <Detail label="Baths" value={String(SUBJECT.baths)} />
                <Detail label="Sqft" value={SUBJECT.sqft.toLocaleString()} />
                <Detail label="Year built" value={String(SUBJECT.yearBuilt)} />
                <Detail label="Lot size" value={SUBJECT.lotSize} />
              </div>
            </div>
          </section>

          {/* Comparable Sales */}
          <section className="mb-10">
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
              Comparable <em className="italic">Sales</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{COMPS.length} recent sales within 0.5 mi</p>

            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)', backgroundColor: '#FAFAF7' }}>
                      <th className="px-4 py-3 font-medium">Address</th>
                      <th className="px-4 py-3 font-medium">Sale Price</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Sqft</th>
                      <th className="px-4 py-3 font-medium">$/Sqft</th>
                      <th className="px-4 py-3 font-medium">Bd/Ba</th>
                      <th className="px-4 py-3 font-medium">Adjustments</th>
                      <th className="px-4 py-3 font-medium">Adjusted Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPS.map((comp) => (
                      <tr key={comp.id} className="border-b last:border-0 transition-colors hover:bg-[#FDF8E8]" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                        <td className="px-4 py-3 font-medium" style={{ color: '#111111' }}>{comp.address}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{fmtMoney(comp.salePrice)}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{fmtDate(comp.saleDate)}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>{comp.sqft.toLocaleString()}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'rgba(17,17,17,0.65)' }}>${comp.pricePerSqft}</td>
                        <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{comp.beds}/{comp.baths}</td>
                        <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: comp.adjustments >= 0 ? '#15803D' : '#B91C1C' }}>
                          {comp.adjustments >= 0 ? '+' : ''}{fmtMoney(comp.adjustments)}
                        </td>
                        <td className="px-4 py-3 font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>{fmtMoney(comp.adjustedPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
              Valuation <em className="italic">Summary</em>
            </h2>
            <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Based on adjusted comparable sales</p>

            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border bg-white p-6"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              >
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Adjusted median value</div>
                <div className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>{fmtMoney(medianValue)}</div>
                <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>
                  {fmtMoney(Math.round(medianValue / SUBJECT.sqft))}/sqft
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border bg-white p-6"
                style={{ borderColor: '#F9D96A' }}
              >
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Suggested list price</div>
                <div className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
                  {fmtMoney(suggestedLow)} – {fmtMoney(suggestedHigh)}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>
                  +/- 3% of adjusted median
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border bg-white p-6"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              >
                <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Confidence score</div>
                <div className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#15803D' }}>{confidence}%</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full" style={{ width: `${confidence}%`, backgroundColor: '#15803D' }} />
                </div>
                <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>
                  High — strong comp set
                </div>
              </motion.div>
            </div>

            {/* Casa Intelligence */}
            <div className="mt-6 rounded-md border p-5" style={{ borderColor: '#F9D96A', backgroundColor: '#FEF9E1' }}>
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.65)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Casa Intelligence</div>
              <div className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', color: '#111111', fontSize: '15px' }}>
                North Park remains a <em className="italic">seller&apos;s market</em> with 22 days median DOM. The subject property&apos;s updated kitchen and proximity to 30th Street adds an estimated 3-5% premium over the adjusted median. Consider listing at <strong>{fmtMoney(suggestedHigh)}</strong> with room to negotiate.
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-0.5 text-sm font-medium" style={{ color: '#111111' }}>{value}</div>
    </div>
  );
}
