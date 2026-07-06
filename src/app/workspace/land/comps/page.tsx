'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';

/* ── Types ─────────────────────────────────────────────────────── */
type LandSale = {
  id: string;
  apn: string;
  address: string;
  acres: number;
  zoning: string;
  salePrice: number;
  pricePerAcre: number;
  saleDate: string;
  buyerType: string;
};

/* ── Mock data — 8 San Diego land sales ───────────────────────── */
const MOCK_SALES: LandSale[] = [
  { id: 's1', apn: '362-041-12', address: '1840 E Valley Pkwy, Escondido', acres: 4.2, zoning: 'A70', salePrice: 1_890_000, pricePerAcre: 450_000, saleDate: '2026-01-15', buyerType: 'Developer' },
  { id: 's2', apn: '263-182-07', address: '9500 Miramar Rd, San Diego', acres: 2.8, zoning: 'IL-3-1', salePrice: 3_640_000, pricePerAcre: 1_300_000, saleDate: '2025-11-22', buyerType: 'Institutional' },
  { id: 's3', apn: '174-120-34', address: '3120 Sweetwater Springs Blvd', acres: 6.1, zoning: 'RS-1-7', salePrice: 2_745_000, pricePerAcre: 450_000, saleDate: '2025-09-10', buyerType: 'Builder' },
  { id: 's4', apn: '580-260-18', address: '14450 Lake Jennings Park Rd', acres: 10.3, zoning: 'RR', salePrice: 2_060_000, pricePerAcre: 200_000, saleDate: '2025-07-03', buyerType: 'Private' },
  { id: 's5', apn: '440-310-22', address: '2800 Main St, Chula Vista', acres: 1.5, zoning: 'MU-2', salePrice: 2_850_000, pricePerAcre: 1_900_000, saleDate: '2026-02-28', buyerType: 'Developer' },
  { id: 's6', apn: '211-060-45', address: '7770 Regents Rd, San Diego', acres: 0.9, zoning: 'CC-1-3', salePrice: 2_430_000, pricePerAcre: 2_700_000, saleDate: '2025-06-17', buyerType: 'REIT' },
  { id: 's7', apn: '310-091-11', address: '1690 Capalina Rd, San Marcos', acres: 3.4, zoning: 'R-3', salePrice: 2_380_000, pricePerAcre: 700_000, saleDate: '2026-03-05', buyerType: 'Builder' },
  { id: 's8', apn: '495-150-30', address: '4550 Otay Valley Rd, San Diego', acres: 8.7, zoning: 'IP-1-1', salePrice: 3_480_000, pricePerAcre: 400_000, saleDate: '2024-12-11', buyerType: 'Institutional' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Page ──────────────────────────────────────────────────────── */
export default function ComparableLandSalesPage() {
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'ppa' | 'acres'>('date');

  const rows = useMemo(() => {
    const r = [...MOCK_SALES];
    r.sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
        case 'price': return b.salePrice - a.salePrice;
        case 'ppa': return b.pricePerAcre - a.pricePerAcre;
        case 'acres': return b.acres - a.acres;
      }
    });
    return r;
  }, [sortBy]);

  const medianPPA = [...MOCK_SALES].sort((a, b) => a.pricePerAcre - b.pricePerAcre)[Math.floor(MOCK_SALES.length / 2)].pricePerAcre;
  const totalVolume = MOCK_SALES.reduce((s, c) => s + c.salePrice, 0);
  const avgAcres = MOCK_SALES.reduce((s, c) => s + c.acres, 0) / MOCK_SALES.length;
  const salesVelocity = '0.7 / mo';

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land &middot; Comps</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Comparable Land <em className="italic">Sales</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            {MOCK_SALES.length} verified land transactions in San Diego County over the last 24 months.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Median $/acre" value={fmtMoney(medianPPA)} />
            <Kpi label="Total volume" value={fmtMoney(totalVolume)} />
            <Kpi label="Avg parcel size" value={`${avgAcres.toFixed(1)} ac`} />
            <Kpi label="Sales velocity" value={salesVelocity} hint="Comps per month" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Sort control */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>Sales <em className="italic">table</em></h2>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{rows.length} transactions</p>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm" style={{ borderColor: HAIRLINE, color: MID }}>
            <option value="date">Sort: Date</option>
            <option value="price">Sort: Price</option>
            <option value="ppa">Sort: $/Acre</option>
            <option value="acres">Sort: Acreage</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                <th className="px-4 py-3 font-medium">APN</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Acres</th>
                <th className="px-4 py-3 font-medium">Zoning</th>
                <th className="px-4 py-3 font-medium">Sale price</th>
                <th className="px-4 py-3 font-medium">$/Acre</th>
                <th className="px-4 py-3 font-medium">Sale date</th>
                <th className="px-4 py-3 font-medium">Buyer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <motion.tr key={s.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0 cursor-default" style={{ borderColor: HAIRLINE }}>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{s.apn}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: INK }}>{s.address}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{s.acres.toFixed(1)}</td>
                  <td className="px-4 py-3"><span className="rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: HAIRLINE }}>{s.zoning}</span></td>
                  <td className="px-4 py-3 font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(s.salePrice)}</td>
                  <td className="px-4 py-3" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>{fmtMoney(s.pricePerAcre)}</td>
                  <td className="px-4 py-3" style={{ color: MID }}>{fmtDate(s.saleDate)}</td>
                  <td className="px-4 py-3" style={{ color: MID }}>{s.buyerType}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

/* ── Components ────────────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}
