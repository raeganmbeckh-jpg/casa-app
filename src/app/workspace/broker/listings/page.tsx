'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type ListingStatus = 'coming_soon' | 'active' | 'pending' | 'under_contract' | 'sold';

type Listing = {
  id: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: ListingStatus;
  listedDate: string;
  showings: number;
  offers: number;
  photo?: string;
};

const TODAY = '2026-04-09';

const MOCK_LISTINGS: Listing[] = [
  { id: 'l1', address: '3245 Hawk St, North Park',        price: 1125000, beds: 3, baths: 2, sqft: 1680, status: 'active',         listedDate: '2026-03-12', showings: 14, offers: 2 },
  { id: 'l2', address: '1820 Sunset Cliffs Blvd, OB',     price: 2350000, beds: 4, baths: 3, sqft: 2410, status: 'active',         listedDate: '2026-02-20', showings: 22, offers: 4 },
  { id: 'l3', address: '4510 Bayard St, Pacific Beach',   price: 975000,  beds: 2, baths: 2, sqft: 1220, status: 'pending',        listedDate: '2026-01-15', showings: 31, offers: 6 },
  { id: 'l4', address: '2901 University Ave, North Park', price: 849000,  beds: 2, baths: 1, sqft: 1050, status: 'coming_soon',    listedDate: '2026-04-05', showings: 0,  offers: 0 },
  { id: 'l5', address: '7622 Girard Ave, La Jolla',       price: 4200000, beds: 5, baths: 4, sqft: 3850, status: 'under_contract', listedDate: '2025-12-01', showings: 45, offers: 8 },
  { id: 'l6', address: '1340 Holly Ave, Imperial Beach',  price: 685000,  beds: 3, baths: 2, sqft: 1340, status: 'sold',           listedDate: '2025-11-10', showings: 18, offers: 3 },
  { id: 'l7', address: '5580 La Jolla Blvd, Bird Rock',   price: 1875000, beds: 3, baths: 3, sqft: 2100, status: 'active',         listedDate: '2026-03-28', showings: 6,  offers: 1 },
  { id: 'l8', address: '920 W Laurel St, Bankers Hill',   price: 1450000, beds: 4, baths: 3, sqft: 2250, status: 'pending',        listedDate: '2026-02-10', showings: 27, offers: 5 },
];

const STATUS_ORDER: ListingStatus[] = ['coming_soon', 'active', 'pending', 'under_contract', 'sold'];

const STATUS_LABELS: Record<ListingStatus, string> = {
  coming_soon: 'Coming Soon',
  active: 'Active',
  pending: 'Pending',
  under_contract: 'Under Contract',
  sold: 'Sold',
};

const STATUS_COLORS: Record<ListingStatus, { bg: string; text: string; border: string }> = {
  coming_soon:    { bg: 'bg-blue-50',    text: 'text-blue-800',    border: 'border-blue-200' },
  active:         { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  pending:        { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200' },
  under_contract: { bg: 'bg-purple-50',  text: 'text-purple-800',  border: 'border-purple-200' },
  sold:           { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-300' },
};

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const dom = (listedDate: string) =>
  Math.max(0, Math.round((new Date(TODAY + 'T00:00:00').getTime() - new Date(listedDate + 'T00:00:00').getTime()) / 86400000));

export default function ListingPipelinePage() {
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return MOCK_LISTINGS;
    return MOCK_LISTINGS.filter((l) => l.status === statusFilter);
  }, [statusFilter]);

  const grouped = useMemo(() => {
    const map: Record<ListingStatus, Listing[]> = { coming_soon: [], active: [], pending: [], under_contract: [], sold: [] };
    filtered.forEach((l) => map[l.status].push(l));
    return map;
  }, [filtered]);

  const activeCount = MOCK_LISTINGS.filter((l) => l.status === 'active').length;
  const pipelineValue = MOCK_LISTINGS.filter((l) => l.status !== 'sold').reduce((s, l) => s + l.price, 0);
  const activeDom = MOCK_LISTINGS.filter((l) => l.status === 'active');
  const avgDom = activeDom.length ? Math.round(activeDom.reduce((s, l) => s + dom(l.listedDate), 0) / activeDom.length) : 0;
  const pendingCount = MOCK_LISTINGS.filter((l) => l.status === 'pending' || l.status === 'under_contract').length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Broker · Listings</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
                Listing <em className="italic">Pipeline</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                {MOCK_LISTINGS.length} listings across the pipeline. Track status, showings, and offers in one view.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border bg-white px-3 py-2 text-xs font-medium focus:outline-none"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: '#111111' }}
              >
                <option value="all">All statuses</option>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <button
                onClick={() => setShowForm(!showForm)}
                className="rounded-md border border-transparent px-3 py-2 text-xs font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: '#F9D96A', color: '#111111' }}
              >
                + Add Listing
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Active listings" value={String(activeCount)} />
            <Kpi label="Pipeline value" value={fmtMoney(pipelineValue)} />
            <Kpi label="Avg DOM" value={`${avgDom} days`} />
            <Kpi label="Pending / UC" value={String(pendingCount)} accent />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {showForm && <AddListingForm onClose={() => setShowForm(false)} />}

        {STATUS_ORDER.map((status) => {
          const items = grouped[status];
          if (items.length === 0) return null;
          return (
            <section key={status} className="mb-10">
              <div className="mb-4 flex items-baseline gap-3">
                <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
                  {STATUS_LABELS[status]}
                </h2>
                <span className="text-xs" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{items.length} listing{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const sc = STATUS_COLORS[listing.status];
  const days = dom(listing.listedDate);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: 'rgba(17,17,17,0.08)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium" style={{ color: '#111111' }}>{listing.address}</div>
          <div className="mt-1 text-xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
            {fmtMoney(listing.price)}
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.bg} ${sc.text} ${sc.border}`}>
          {STATUS_LABELS[listing.status]}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs" style={{ color: 'rgba(17,17,17,0.65)' }}>
        <span>{listing.beds} bd</span>
        <span style={{ color: 'rgba(17,17,17,0.08)' }}>|</span>
        <span>{listing.baths} ba</span>
        <span style={{ color: 'rgba(17,17,17,0.08)' }}>|</span>
        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)' }}>{listing.sqft.toLocaleString()} sqft</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="flex items-center gap-4">
          <Stat label="DOM" value={String(days)} />
          <Stat label="Showings" value={String(listing.showings)} />
          <Stat label="Offers" value={String(listing.offers)} />
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>{value}</div>
      <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)' }}>{label}</div>
    </div>
  );
}

function AddListingForm({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-lg border bg-white p-6"
      style={{ borderColor: '#F9D96A' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500 }}>
          New <em className="italic">Listing</em>
        </h3>
        <button onClick={onClose} className="text-xs font-medium" style={{ color: 'rgba(17,17,17,0.45)' }}>Cancel</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Address" placeholder="123 Main St, San Diego" />
        <Input label="Price" placeholder="$1,250,000" />
        <Input label="Beds" placeholder="3" />
        <Input label="Baths" placeholder="2" />
        <Input label="Sqft" placeholder="1,800" />
        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Status</label>
          <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="rounded-md px-4 py-2 text-xs font-medium transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A', color: '#111111' }}>
          Add Listing
        </button>
      </div>
    </motion.div>
  );
}

function Input({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</label>
      <input
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none"
        style={{ borderColor: 'rgba(17,17,17,0.08)' }}
      />
    </div>
  );
}
