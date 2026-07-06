'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

type TaxStatus = 'current' | 'delinquent';

type Parcel = {
  id: string;
  apn: string;
  address: string;
  city: string;
  acres: number;
  zoning: string;
  owner: string;
  assessedValue: number;
  taxStatus: TaxStatus;
  motivation: number;
  opportunity: number;
  distress: number;
  inPipeline: boolean;
};

const MOCK_PARCELS: Parcel[] = [
  { id: 'p1', apn: '362-041-02', address: '4520 El Cajon Blvd', city: 'San Diego', acres: 0.34, zoning: 'MU-1', owner: 'Delgado Family Trust', assessedValue: 485000, taxStatus: 'current', motivation: 7, opportunity: 8, distress: 3, inPipeline: false },
  { id: 'p2', apn: '445-210-18', address: '1892 Rosecrans St', city: 'San Diego', acres: 0.51, zoning: 'C1', owner: 'Pacific Vista LLC', assessedValue: 920000, taxStatus: 'delinquent', motivation: 9, opportunity: 7, distress: 8, inPipeline: false },
  { id: 'p3', apn: '531-082-05', address: '7741 Convoy Ct', city: 'San Diego', acres: 1.12, zoning: 'MU-2', owner: 'Lin Holdings Inc', assessedValue: 1350000, taxStatus: 'current', motivation: 4, opportunity: 9, distress: 2, inPipeline: true },
  { id: 'p4', apn: '218-370-11', address: '3310 Fairmount Ave', city: 'San Diego', acres: 0.22, zoning: 'R1', owner: 'James & Margaret Noll', assessedValue: 310000, taxStatus: 'delinquent', motivation: 8, opportunity: 5, distress: 9, inPipeline: false },
  { id: 'p5', apn: '660-501-33', address: '10420 Clairemont Mesa Blvd', city: 'San Diego', acres: 2.4, zoning: 'A70', owner: 'County of San Diego', assessedValue: 2100000, taxStatus: 'current', motivation: 2, opportunity: 6, distress: 1, inPipeline: false },
  { id: 'p6', apn: '774-192-07', address: '855 W Washington St', city: 'San Diego', acres: 0.18, zoning: 'RR', owner: 'Martha J. Solis', assessedValue: 275000, taxStatus: 'current', motivation: 6, opportunity: 7, distress: 4, inPipeline: true },
  { id: 'p7', apn: '338-060-22', address: '2945 Imperial Ave', city: 'San Diego', acres: 0.75, zoning: 'MU-1', owner: 'SE Community Partners', assessedValue: 680000, taxStatus: 'delinquent', motivation: 9, opportunity: 8, distress: 7, inPipeline: false },
  { id: 'p8', apn: '412-285-14', address: '6230 Lake Murray Blvd', city: 'La Mesa', acres: 1.65, zoning: 'R1', owner: 'Brennan Family LP', assessedValue: 890000, taxStatus: 'current', motivation: 5, opportunity: 6, distress: 3, inPipeline: false },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function ParcelSearchPage() {
  const [search, setSearch] = useState('');
  const [parcels, setParcels] = useState(MOCK_PARCELS);

  const rows = useMemo(() => {
    if (!search.trim()) return parcels;
    const q = search.toLowerCase();
    return parcels.filter(
      (p) =>
        p.apn.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.zoning.toLowerCase().includes(q),
    );
  }, [search, parcels]);

  const totalAcreage = MOCK_PARCELS.reduce((s, p) => s + p.acres, 0);
  const underContract = MOCK_PARCELS.filter((p) => p.inPipeline).length;
  const avgOpportunity = (MOCK_PARCELS.reduce((s, p) => s + p.opportunity, 0) / MOCK_PARCELS.length).toFixed(1);

  const addToPipeline = (id: string) => {
    setParcels((prev) => prev.map((p) => (p.id === id ? { ...p, inPipeline: true } : p)));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land . Parcels</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Parcel <em className="italic">Search</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Search and analyze land parcels across San Diego County. Score motivation, opportunity, and distress to find your next acquisition.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Parcels tracked" value={String(MOCK_PARCELS.length)} />
            <Kpi label="Under contract" value={String(underContract)} />
            <Kpi label="Avg opportunity" value={avgOpportunity} hint="Score out of 10" accent />
            <Kpi label="Total acreage" value={totalAcreage.toFixed(2)} hint="Across all parcels" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by APN, address, city, owner, or zoning..."
            className="w-full rounded-md border bg-white px-4 py-3 text-sm focus:outline-none"
            style={{ borderColor: HAIRLINE, fontFamily: 'var(--font-inter)' }}
          />
        </div>

        <p className="mb-4 text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
          {rows.length} parcels found
        </p>

        <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: HAIRLINE }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">APN</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Acres</th>
                  <th className="px-4 py-3 font-medium">Zoning</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Assessed</th>
                  <th className="px-4 py-3 font-medium">Tax</th>
                  <th className="px-4 py-3 font-medium">Gauges</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <motion.tr
                    key={p.id}
                    whileHover={{ backgroundColor: '#FDF8E8' }}
                    className="border-b last:border-0 cursor-pointer"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <td className="px-4 py-3 whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{p.apn}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium" style={{ color: INK }}>{p.address}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: MID }}>{p.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{p.acres.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded border px-1.5 py-0.5 text-[11px] font-medium" style={{ borderColor: HAIRLINE, color: MID, fontFamily: 'var(--font-geist-mono)' }}>{p.zoning}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: MID }}>{p.owner}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtMoney(p.assessedValue)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TaxBadge status={p.taxStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <GaugeSet motivation={p.motivation} opportunity={p.opportunity} distress={p.distress} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {p.inPipeline ? (
                        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: GREEN }}>In Pipeline</span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => addToPipeline(p.id)}
                          className="rounded-md border border-transparent px-3 py-1.5 text-xs font-medium transition-colors"
                          style={{ backgroundColor: BUTTER, color: INK }}
                        >
                          + Pipeline
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mt-4 grid gap-3 md:hidden">
          {rows.map((p) => (
            <div key={p.id} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium" style={{ color: INK }}>{p.address}</div>
                  <div className="text-xs" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{p.apn} . {p.city}</div>
                </div>
                <TaxBadge status={p.taxStatus} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs" style={{ color: MID }}>
                <div><span className="block text-[10px] uppercase tracking-wider" style={{ color: DIM }}>Acres</span>{p.acres}</div>
                <div><span className="block text-[10px] uppercase tracking-wider" style={{ color: DIM }}>Zoning</span>{p.zoning}</div>
                <div><span className="block text-[10px] uppercase tracking-wider" style={{ color: DIM }}>Assessed</span>{fmtMoney(p.assessedValue)}</div>
              </div>
              <div className="mt-3 text-xs" style={{ color: MID }}>Owner: {p.owner}</div>
              <div className="mt-3">
                <GaugeSet motivation={p.motivation} opportunity={p.opportunity} distress={p.distress} />
              </div>
              <div className="mt-3 border-t pt-3" style={{ borderColor: HAIRLINE }}>
                {p.inPipeline ? (
                  <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: GREEN }}>In Pipeline</span>
                ) : (
                  <button onClick={() => addToPipeline(p.id)} className="rounded-md px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>+ Add to Pipeline</button>
                )}
              </div>
            </div>
          ))}
        </div>
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

function TaxBadge({ status }: { status: TaxStatus }) {
  if (status === 'delinquent') {
    return (
      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '#FEF2F2', color: RED, borderColor: '#FECACA' }}>
        Delinquent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: '#F0FDF4', color: GREEN, borderColor: '#BBF7D0' }}>
      Current
    </span>
  );
}

function GaugeSet({ motivation, opportunity, distress }: { motivation: number; opportunity: number; distress: number }) {
  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <GaugeBar label="MOT" value={motivation} color={BUTTER} />
      <GaugeBar label="OPP" value={opportunity} color={GREEN} />
      <GaugeBar label="DIS" value={distress} color={RED} />
    </div>
  );
}

function GaugeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 text-[9px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</span>
      <div className="relative h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{value}</span>
    </div>
  );
}
