'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';

type ZoningData = {
  code: string;
  name: string;
  description: string;
  maxUnits: string;
  heightLimit: string;
  frontSetback: string;
  sideSetback: string;
  rearSetback: string;
  far: string;
  canBeBuilt: string[];
  highestBestUse: string;
  hbuRationale: string;
};

const ZONING_DB: ZoningData[] = [
  {
    code: 'R1',
    name: 'Residential - Single Unit',
    description: 'Low-density residential zone permitting single-family dwellings on individual lots. ADUs allowed per state law.',
    maxUnits: '1 primary + 1 ADU per lot',
    heightLimit: '30 ft / 2 stories',
    frontSetback: '15 ft',
    sideSetback: '5 ft',
    rearSetback: '15 ft',
    far: '0.60',
    canBeBuilt: ['Single-family home', 'Accessory dwelling unit (ADU)', 'Home office', 'Community care facility (6 or fewer)'],
    highestBestUse: 'SFR + ADU Build-to-Rent',
    hbuRationale: 'Maximum value extraction through a quality SFR with a detached ADU. Rent both units for $5,200-$6,400/mo combined in SD metro. Hold cost basis low, achieve 6-7% cap rate on build cost.',
  },
  {
    code: 'RR',
    name: 'Rural Residential',
    description: 'Large-lot residential zone for semi-rural areas. Allows agriculture, animal keeping, and single-family residential uses.',
    maxUnits: '1 per parcel (minimum 1 acre)',
    heightLimit: '35 ft / 2 stories',
    frontSetback: '25 ft',
    sideSetback: '15 ft',
    rearSetback: '25 ft',
    far: '0.25',
    canBeBuilt: ['Single-family home', 'Agricultural uses', 'Equestrian facilities', 'ADU', 'Guest quarters'],
    highestBestUse: 'Equestrian Estate or Agritourism',
    hbuRationale: 'Rural residential land in San Diego commands premium pricing when positioned for equestrian or small-farm lifestyle buyers. Target $1.2M-$2.5M buyer segment seeking hobby-farm living within metro proximity.',
  },
  {
    code: 'A70',
    name: 'Agricultural - General',
    description: 'General agricultural zone for farming, orchards, and related uses. Limited residential permitted.',
    maxUnits: '1 dwelling per 8+ acres',
    heightLimit: '35 ft',
    frontSetback: '60 ft',
    sideSetback: '35 ft',
    rearSetback: '25 ft',
    far: '0.10',
    canBeBuilt: ['Farm dwelling', 'Agricultural processing', 'Greenhouse/nursery', 'Farm stand (retail)', 'Renewable energy installation'],
    highestBestUse: 'Solar Lease or Agricultural Subdivision',
    hbuRationale: 'Large ag-zoned parcels near urban edges are ideal for solar farm leases ($800-$1,200/acre/yr) or long-term hold for future rezoning. Subdivision to minimum lot size may unlock 3-5x basis.',
  },
  {
    code: 'C1',
    name: 'Commercial - Neighborhood',
    description: 'Neighborhood-scale commercial zone for retail, services, and office uses serving surrounding residential areas.',
    maxUnits: '1 unit per 1,500 sq ft of lot area (if mixed-use)',
    heightLimit: '45 ft / 3 stories',
    frontSetback: '0 ft (build to line)',
    sideSetback: '0 ft (interior), 10 ft (street side)',
    rearSetback: '10 ft',
    far: '1.50',
    canBeBuilt: ['Retail shops', 'Restaurants/cafes', 'Professional offices', 'Mixed-use residential above', 'Personal services', 'Medical/dental offices'],
    highestBestUse: 'Mixed-Use Vertical (Retail + Residential)',
    hbuRationale: 'Ground-floor retail with 2 stories of residential above. C1 zoning with 1.5 FAR allows density that pencils at $350-$425/sq ft construction cost. NNN retail lease on ground floor covers 40% of debt service.',
  },
  {
    code: 'MU',
    name: 'Mixed-Use',
    description: 'Encourages a mix of residential, commercial, and civic uses in a pedestrian-oriented urban environment. Transit-priority area.',
    maxUnits: '1 unit per 800 sq ft of lot area',
    heightLimit: '65 ft / 5 stories',
    frontSetback: '0 ft',
    sideSetback: '0 ft',
    rearSetback: '10 ft',
    far: '3.00',
    canBeBuilt: ['Multi-family residential', 'Ground-floor retail/restaurant', 'Office space', 'Live/work units', 'Civic/community uses', 'Hotels/short-term rentals'],
    highestBestUse: 'Transit-Oriented Mixed-Use Development',
    hbuRationale: 'Maximum density at 3.0 FAR near transit. 4-over-1 podium construction with 40-60 units achieves best unit economics. Ground-floor retail stabilizes at $3.50-$4.50/sq ft NNN. Target 18-22% IRR on a 3-year development timeline.',
  },
];

export default function ZoningAnalyzerPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ZoningData | null>(null);

  const results = search.trim()
    ? ZONING_DB.filter(
        (z) =>
          z.code.toLowerCase().includes(search.toLowerCase()) ||
          z.name.toLowerCase().includes(search.toLowerCase()),
      )
    : ZONING_DB;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land . Zoning</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Zoning <em className="italic">Analyzer</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Look up any San Diego zoning code to understand what you can build, density limits, and our highest-and-best-use recommendation.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="mb-8">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            placeholder="Search zoning code (e.g. R1, MU, C1, A70)..."
            className="w-full rounded-md border bg-white px-4 py-3 text-sm focus:outline-none sm:max-w-md"
            style={{ borderColor: HAIRLINE, fontFamily: 'var(--font-inter)' }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((z) => (
            <motion.button
              key={z.code}
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              onClick={() => setSelected(z)}
              className="rounded-lg border bg-white p-5 text-left transition-colors"
              style={{ borderColor: selected?.code === z.code ? BUTTER : HAIRLINE }}
            >
              <div className="flex items-center gap-2">
                <span className="rounded border px-2 py-0.5 text-xs font-semibold" style={{ borderColor: BUTTER, backgroundColor: '#FEF9E1', color: INK, fontFamily: 'var(--font-geist-mono)' }}>{z.code}</span>
                <span className="text-sm font-medium" style={{ color: INK }}>{z.name}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: MID }}>{z.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MiniStat label="Max units" value={z.maxUnits.split(' ')[0]} />
                <MiniStat label="Height" value={z.heightLimit.split(' / ')[0]} />
                <MiniStat label="FAR" value={z.far} />
              </div>
            </motion.button>
          ))}
        </div>

        {results.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-sm italic" style={{ fontFamily: 'var(--font-heading)', color: DIM }}>No zoning codes match your search.</p>
          </div>
        )}

        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-10"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Detail card */}
              <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="rounded border px-2.5 py-1 text-sm font-bold" style={{ borderColor: BUTTER, backgroundColor: '#FEF9E1', fontFamily: 'var(--font-geist-mono)' }}>{selected.code}</span>
                  <div>
                    <div className="font-medium" style={{ color: INK }}>{selected.name}</div>
                    <div className="text-xs" style={{ color: DIM }}>San Diego Municipal Code</div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-6" style={{ color: MID }}>{selected.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Max units" value={selected.maxUnits} />
                  <DetailField label="Height limit" value={selected.heightLimit} />
                  <DetailField label="Front setback" value={selected.frontSetback} />
                  <DetailField label="Side setback" value={selected.sideSetback} />
                  <DetailField label="Rear setback" value={selected.rearSetback} />
                  <DetailField label="Floor area ratio" value={selected.far} />
                </div>

                <div className="mt-6 border-t pt-4" style={{ borderColor: HAIRLINE }}>
                  <div className="text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>What can be built</div>
                  <ul className="space-y-1">
                    {selected.canBeBuilt.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm" style={{ color: MID }}>
                        <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: BUTTER }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* HBU recommendation card */}
              <div className="rounded-lg border p-6" style={{ borderColor: BUTTER, backgroundColor: '#FEF9E1' }}>
                <div className="text-[10px] uppercase tracking-[0.16em] mb-1" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Casa Intelligence</div>
                <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                  Highest & Best <em className="italic">Use</em>
                </h3>
                <div className="mb-4 rounded-md border bg-white/60 px-3 py-2 text-sm font-medium" style={{ borderColor: HAIRLINE, color: INK }}>
                  {selected.highestBestUse}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MID }}>{selected.hbuRationale}</p>

                <div className="mt-6 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-md px-4 py-2 text-xs font-medium"
                    style={{ backgroundColor: INK, color: CREAM }}
                  >
                    Run Feasibility
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-md border px-4 py-2 text-xs font-medium"
                    style={{ borderColor: INK, color: INK }}
                  >
                    Find Parcels
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border px-2 py-1" style={{ borderColor: HAIRLINE }}>
      <span className="text-[9px] uppercase tracking-wider" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label} </span>
      <span className="text-xs font-medium" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{value}</span>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-0.5 text-sm" style={{ color: INK }}>{value}</div>
    </div>
  );
}
