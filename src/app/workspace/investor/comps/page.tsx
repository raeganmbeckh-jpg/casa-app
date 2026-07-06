'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const GREEN = '#15803D';

type Comp = {
  id: string;
  address: string;
  city: string;
  salePrice: number;
  saleDate: string;
  sqft: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  distance: number;
  yearBuilt: number;
  type: string;
};

const MOCK_COMPS: Comp[] = [
  { id: 'c1',  address: '3742 Park Blvd',       city: 'San Diego, CA 92103', salePrice: 1250000, saleDate: '2026-03-15', sqft: 1840, pricePerSqft: 679, beds: 3, baths: 2, distance: 0.3, yearBuilt: 1965, type: 'SFR' },
  { id: 'c2',  address: '4115 Hamilton St',      city: 'San Diego, CA 92104', salePrice: 985000,  saleDate: '2026-02-28', sqft: 1520, pricePerSqft: 648, beds: 2, baths: 2, distance: 0.5, yearBuilt: 1958, type: 'Condo' },
  { id: 'c3',  address: '2830 Reynard Way',      city: 'San Diego, CA 92103', salePrice: 1475000, saleDate: '2026-03-02', sqft: 2100, pricePerSqft: 702, beds: 4, baths: 3, distance: 0.7, yearBuilt: 1972, type: 'SFR' },
  { id: 'c4',  address: '1922 Felton St',        city: 'San Diego, CA 92102', salePrice: 875000,  saleDate: '2026-01-18', sqft: 1280, pricePerSqft: 684, beds: 2, baths: 1, distance: 0.9, yearBuilt: 1948, type: 'SFR' },
  { id: 'c5',  address: '3360 Idaho St',         city: 'San Diego, CA 92104', salePrice: 1125000, saleDate: '2026-02-10', sqft: 1650, pricePerSqft: 682, beds: 3, baths: 2, distance: 0.4, yearBuilt: 1960, type: 'SFR' },
  { id: 'c6',  address: '4508 Texas St Unit 3',  city: 'San Diego, CA 92116', salePrice: 725000,  saleDate: '2026-03-22', sqft: 1100, pricePerSqft: 659, beds: 2, baths: 1, distance: 1.1, yearBuilt: 1975, type: 'Condo' },
  { id: 'c7',  address: '2614 Meade Ave',        city: 'San Diego, CA 92116', salePrice: 1050000, saleDate: '2026-01-05', sqft: 1480, pricePerSqft: 709, beds: 3, baths: 2, distance: 1.3, yearBuilt: 1952, type: 'SFR' },
  { id: 'c8',  address: '3955 Oregon St',        city: 'San Diego, CA 92104', salePrice: 1395000, saleDate: '2026-02-20', sqft: 1950, pricePerSqft: 715, beds: 4, baths: 2, distance: 0.6, yearBuilt: 1967, type: 'SFR' },
  { id: 'c9',  address: '1740 Upas St',          city: 'San Diego, CA 92103', salePrice: 1580000, saleDate: '2026-03-08', sqft: 2250, pricePerSqft: 702, beds: 4, baths: 3, distance: 0.8, yearBuilt: 1970, type: 'SFR' },
  { id: 'c10', address: '4220 Cleveland Ave',    city: 'San Diego, CA 92103', salePrice: 1180000, saleDate: '2026-01-25', sqft: 1720, pricePerSqft: 686, beds: 3, baths: 2, distance: 0.2, yearBuilt: 1963, type: 'SFR' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function CompEnginePage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'ppsf' | 'distance'>('distance');
  const [typeFilter, setTypeFilter] = useState<'all' | 'SFR' | 'Condo'>('all');

  const filtered = useMemo(() => {
    let rows = [...MOCK_COMPS];
    if (typeFilter !== 'all') rows = rows.filter((c) => c.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((c) => c.address.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'date': rows.sort((a, b) => b.saleDate.localeCompare(a.saleDate)); break;
      case 'price': rows.sort((a, b) => b.salePrice - a.salePrice); break;
      case 'ppsf': rows.sort((a, b) => b.pricePerSqft - a.pricePerSqft); break;
      case 'distance': rows.sort((a, b) => a.distance - b.distance); break;
    }
    return rows;
  }, [search, sortBy, typeFilter]);

  // Summary stats
  const prices = filtered.map((c) => c.salePrice).sort((a, b) => a - b);
  const medianPrice = prices.length > 0
    ? prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)]
    : 0;
  const avgPpsf = filtered.length > 0
    ? filtered.reduce((s, c) => s + c.pricePerSqft, 0) / filtered.length
    : 0;

  // Velocity: sales per month across date range
  const dates = filtered.map((c) => new Date(c.saleDate + 'T00:00:00').getTime());
  const monthSpan = dates.length >= 2
    ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24 * 30.44)
    : 1;
  const velocity = filtered.length / Math.max(monthSpan, 1);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Comps</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Comp <em className="italic">Engine</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Recent comparable sales in the San Diego market. Search, filter, and analyze to validate your underwriting.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Median price" value={fmtMoney(medianPrice)} />
            <Kpi label="Avg $/sqft" value={`$${Math.round(avgPpsf)}`} />
            <Kpi label="Velocity" value={`${velocity.toFixed(1)} / mo`} hint="Sales per month" accent />
            <Kpi label="Comps found" value={String(filtered.length)} hint={`of ${MOCK_COMPS.length} total`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address or city..."
              className="w-full rounded-md border bg-white px-4 py-2.5 text-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={{ borderColor: 'rgba(17,17,17,0.2)' }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="rounded-md border bg-white px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
            style={{ borderColor: 'rgba(17,17,17,0.2)', color: MID }}
          >
            <option value="all">All types</option>
            <option value="SFR">SFR</option>
            <option value="Condo">Condo</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border bg-white px-3 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
            style={{ borderColor: 'rgba(17,17,17,0.2)', color: MID }}
          >
            <option value="distance">Sort: Distance</option>
            <option value="date">Sort: Date</option>
            <option value="price">Sort: Price</option>
            <option value="ppsf">Sort: $/sqft</option>
          </select>
        </div>

        {/* Results Table */}
        <div className="hidden overflow-x-auto rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50 text-left" style={{ borderColor: HAIRLINE }}>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Address</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Sale Price</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-center" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Date</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Sqft</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>$/Sqft</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-center" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Beds/Baths</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-center" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Type</th>
                <th className="px-4 py-3 text-[10px] uppercase tracking-[0.14em] font-medium text-right" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Distance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <motion.tr
                  key={c.id}
                  whileHover={{ backgroundColor: '#FDF8E8' }}
                  className="border-b last:border-0 cursor-pointer"
                  style={{ borderColor: HAIRLINE }}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.address}</div>
                    <div className="text-xs" style={{ color: DIM }}>{c.city} &middot; Built {c.yearBuilt}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(c.salePrice)}</td>
                  <td className="px-4 py-3 text-center" style={{ color: MID }}>{fmtDate(c.saleDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{c.sqft.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ fontFamily: 'var(--font-geist-mono)' }}>${c.pricePerSqft}</td>
                  <td className="px-4 py-3 text-center" style={{ color: MID }}>{c.beds}bd / {c.baths}ba</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: HAIRLINE, color: MID }}>{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: c.distance <= 0.5 ? GREEN : MID }}>{c.distance.toFixed(1)} mi</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm italic" style={{ color: DIM, fontFamily: 'var(--font-heading)' }}>
                    No comps match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid gap-3 md:hidden">
          {filtered.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className="rounded-lg border bg-white p-4"
              style={{ borderColor: HAIRLINE }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{c.address}</div>
                  <div className="text-xs" style={{ color: DIM }}>{c.city}</div>
                </div>
                <span className="text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(c.salePrice)}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: MID }}>
                <span>{c.sqft.toLocaleString()} sqft</span>
                <span>${c.pricePerSqft}/sqft</span>
                <span>{c.beds}bd/{c.baths}ba</span>
                <span>{c.distance.toFixed(1)} mi</span>
                <span>{fmtDate(c.saleDate)}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <section className="mt-8">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Market <em className="italic">Summary</em>
          </h2>
          <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Derived from {filtered.length} filtered comps</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Price Range</div>
              <div className="mt-2 text-xl font-medium" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                {fmtMoney(Math.min(...filtered.map((c) => c.salePrice)))} &mdash; {fmtMoney(Math.max(...filtered.map((c) => c.salePrice)))}
              </div>
              <div className="mt-1 text-xs" style={{ color: DIM }}>Median: {fmtMoney(medianPrice)}</div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>$/Sqft Range</div>
              <div className="mt-2 text-xl font-medium" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                ${Math.min(...filtered.map((c) => c.pricePerSqft))} &mdash; ${Math.max(...filtered.map((c) => c.pricePerSqft))}
              </div>
              <div className="mt-1 text-xs" style={{ color: DIM }}>Average: ${Math.round(avgPpsf)}/sqft</div>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-5" style={{ borderColor: BUTTER }}>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Avg Distance</div>
              <div className="mt-2 text-xl font-medium" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                {(filtered.reduce((s, c) => s + c.distance, 0) / filtered.length).toFixed(2)} mi
              </div>
              <div className="mt-1 text-xs" style={{ color: DIM }}>Closest: {Math.min(...filtered.map((c) => c.distance)).toFixed(1)} mi</div>
            </motion.div>
          </div>
        </section>
      </main>
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
