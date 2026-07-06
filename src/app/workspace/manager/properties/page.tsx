'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type PropertyStatus = 'active' | 'vacant' | 'renovation' | 'listed';
type PropertyType = 'multifamily' | 'single_family' | 'condo' | 'commercial';

type Property = {
  id: string;
  address: string;
  city: string;
  type: PropertyType;
  units: number;
  value: number;
  monthlyRent: number;
  occupancy: number;
  capRate: number;
  status: PropertyStatus;
  yearBuilt: number;
  sqft: number;
};

const MOCK_PROPERTIES: Property[] = [
  { id: 'p1', address: '4821 Voltaire St', city: 'Ocean Beach', type: 'multifamily', units: 12, value: 4850000, monthlyRent: 38400, occupancy: 92, capRate: 5.8, status: 'active', yearBuilt: 1978, sqft: 14200 },
  { id: 'p2', address: '1530 Front St', city: 'Downtown', type: 'commercial', units: 4, value: 6200000, monthlyRent: 52000, occupancy: 100, capRate: 6.2, status: 'active', yearBuilt: 2005, sqft: 22000 },
  { id: 'p3', address: '3742 Park Blvd', city: 'North Park', type: 'multifamily', units: 8, value: 3100000, monthlyRent: 24800, occupancy: 88, capRate: 5.4, status: 'active', yearBuilt: 1965, sqft: 9600 },
  { id: 'p4', address: '915 Turquoise St', city: 'Pacific Beach', type: 'condo', units: 1, value: 875000, monthlyRent: 4200, occupancy: 100, capRate: 4.1, status: 'active', yearBuilt: 2018, sqft: 1450 },
  { id: 'p5', address: '2280 Kettner Blvd', city: 'Little Italy', type: 'multifamily', units: 16, value: 7400000, monthlyRent: 62400, occupancy: 94, capRate: 6.5, status: 'active', yearBuilt: 2012, sqft: 19200 },
  { id: 'p6', address: '6634 El Cajon Blvd', city: 'College Area', type: 'single_family', units: 1, value: 620000, monthlyRent: 2800, occupancy: 0, capRate: 0, status: 'vacant', yearBuilt: 1958, sqft: 1280 },
  { id: 'p7', address: '1025 Island Ave', city: 'East Village', type: 'condo', units: 1, value: 780000, monthlyRent: 3600, occupancy: 0, capRate: 0, status: 'renovation', yearBuilt: 2002, sqft: 1100 },
  { id: 'p8', address: '4490 30th St', city: 'North Park', type: 'commercial', units: 2, value: 1950000, monthlyRent: 14000, occupancy: 50, capRate: 4.3, status: 'active', yearBuilt: 1972, sqft: 5200 },
  { id: 'p9', address: '735 W Laurel St', city: 'Bankers Hill', type: 'multifamily', units: 6, value: 2800000, monthlyRent: 19800, occupancy: 100, capRate: 5.9, status: 'active', yearBuilt: 1988, sqft: 7200 },
  { id: 'p10', address: '1842 Garnet Ave', city: 'Pacific Beach', type: 'single_family', units: 1, value: 1050000, monthlyRent: 4800, occupancy: 100, capRate: 4.6, status: 'listed', yearBuilt: 1990, sqft: 1680 },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtValue = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return fmtMoney(n);
};

const statusConfig: Record<PropertyStatus, { label: string; cls: string }> = {
  active:     { label: 'Active',     cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  vacant:     { label: 'Vacant',     cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  renovation: { label: 'Renovation', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  listed:     { label: 'Listed',     cls: 'bg-blue-50 text-blue-800 border-blue-200' },
};

const typeLabels: Record<PropertyType, string> = {
  multifamily: 'Multifamily',
  single_family: 'Single Family',
  condo: 'Condo',
  commercial: 'Commercial',
};

export default function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | PropertyType>('all');
  const [showForm, setShowForm] = useState(false);

  const totalProperties = MOCK_PROPERTIES.length;
  const totalValue = MOCK_PROPERTIES.reduce((s, p) => s + p.value, 0);
  const activeProps = MOCK_PROPERTIES.filter((p) => p.occupancy > 0);
  const avgOccupancy = activeProps.length > 0
    ? Math.round(activeProps.reduce((s, p) => s + p.occupancy, 0) / activeProps.length)
    : 0;
  const propsWithCap = MOCK_PROPERTIES.filter((p) => p.capRate > 0);
  const avgCapRate = propsWithCap.length > 0
    ? (propsWithCap.reduce((s, p) => s + p.capRate, 0) / propsWithCap.length).toFixed(1)
    : '0';

  const filtered = useMemo(() => {
    let r = [...MOCK_PROPERTIES];
    if (typeFilter !== 'all') r = r.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      );
    }
    return r;
  }, [search, typeFilter]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Manager &middot; Properties</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Portfolio <em className="italic">Overview</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                {totalProperties} properties across San Diego. {fmtValue(totalValue)} total assessed value with {avgOccupancy}% average occupancy.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Export</button>
              <button onClick={() => setShowForm(!showForm)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>+ Add Property</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total properties" value={String(totalProperties)} hint={`${new Set(MOCK_PROPERTIES.map((p) => p.city)).size} neighborhoods`} />
            <Kpi label="Total value" value={fmtValue(totalValue)} hint={`${fmtMoney(MOCK_PROPERTIES.reduce((s, p) => s + p.monthlyRent, 0))} monthly rent`} />
            <Kpi label="Avg occupancy" value={`${avgOccupancy}%`} hint={`${MOCK_PROPERTIES.filter((p) => p.occupancy === 100).length} fully occupied`} accent />
            <Kpi label="Avg cap rate" value={`${avgCapRate}%`} hint="Active properties" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {showForm && (
          <section className="mb-8">
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                New <em className="italic">Property</em>
              </h2>
              <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Add a property to your portfolio</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Address" placeholder="1234 Main St" />
                <FormField label="City / Neighborhood" placeholder="North Park" />
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Type</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option value="multifamily">Multifamily</option>
                    <option value="single_family">Single Family</option>
                    <option value="condo">Condo</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <FormField label="Units" placeholder="8" type="number" />
                <FormField label="Value ($)" placeholder="2,500,000" type="number" />
                <FormField label="Monthly Rent ($)" placeholder="18,000" type="number" />
                <FormField label="Sqft" placeholder="9,600" type="number" />
                <FormField label="Year Built" placeholder="1985" type="number" />
              </div>
              <div className="mt-5 flex gap-2">
                <button className="rounded-md border border-transparent px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>Save Property</button>
                <button onClick={() => setShowForm(false)} className="rounded-md border bg-white px-4 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Cancel</button>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Property <em className="italic">Grid</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{filtered.length} properties</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search address, neighborhood..."
                className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none sm:w-64"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}
              >
                <option value="all">All types</option>
                <option value="multifamily">Multifamily</option>
                <option value="single_family">Single Family</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PropertyCard({ property: p }: { property: Property }) {
  const sc = statusConfig[p.status];
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: 'rgba(17,17,17,0.08)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-medium text-[#111111]">{p.address}</div>
          <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{p.city}, San Diego</div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.cls}`}>{sc.label}</span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{fmtValue(p.value)}</div>
        <div className="text-xs" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{typeLabels[p.type]}</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <StatCell label="Units" value={String(p.units)} />
        <StatCell label="Rent / mo" value={fmtMoney(p.monthlyRent)} />
        <StatCell label="Occupancy" value={`${p.occupancy}%`} color={p.occupancy >= 90 ? '#15803D' : p.occupancy >= 50 ? '#D97706' : '#B91C1C'} />
        <StatCell label="Cap Rate" value={p.capRate > 0 ? `${p.capRate}%` : '--'} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{p.sqft.toLocaleString()} sqft</span>
        <span style={{ fontFamily: 'var(--font-geist-mono)' }}>Built {p.yearBuilt}</span>
      </div>
    </motion.div>
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

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</div>
      <div className="mt-0.5 text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: color || '#111111' }}>{value}</div>
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
