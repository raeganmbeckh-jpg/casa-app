'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';

/* ── Types ─────────────────────────────────────────────────── */
type Vendor = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  activeJobs: number;
  totalSpend: number;
  licenseNumber: string;
  since: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const VENDORS: Vendor[] = [
  { id: 'v1', name: 'Martinez Concrete & Grading',   specialty: 'Foundation / Concrete',  phone: '(619) 555-0234', email: 'info@martinezconcrete.com',  rating: 4.8, activeJobs: 2, totalSpend: 1520000, licenseNumber: 'CA-827341', since: '2019-03-15' },
  { id: 'v2', name: 'Pacific Coast Framing',         specialty: 'Framing / Carpentry',    phone: '(858) 555-0189', email: 'bids@pcframing.com',         rating: 4.6, activeJobs: 1, totalSpend: 2100000, licenseNumber: 'CA-651289', since: '2020-07-01' },
  { id: 'v3', name: 'SoCal Electrical Services',     specialty: 'Electrical',             phone: '(619) 555-0312', email: 'dispatch@socalelectric.com', rating: 4.9, activeJobs: 3, totalSpend: 890000,  licenseNumber: 'CA-443892', since: '2018-11-20' },
  { id: 'v4', name: 'Reliable Plumbing Co.',         specialty: 'Plumbing',               phone: '(760) 555-0145', email: 'jobs@reliableplumbing.com',  rating: 4.3, activeJobs: 2, totalSpend: 675000,  licenseNumber: 'CA-559034', since: '2021-02-10' },
  { id: 'v5', name: 'San Diego HVAC Pros',           specialty: 'HVAC / Mechanical',      phone: '(619) 555-0278', email: 'service@sdhvacpros.com',     rating: 4.5, activeJobs: 1, totalSpend: 480000,  licenseNumber: 'CA-782156', since: '2022-06-01' },
  { id: 'v6', name: 'Coastal Drywall & Finishing',   specialty: 'Drywall / Paint',        phone: '(858) 555-0367', email: 'quotes@coastaldrywall.com',  rating: 4.7, activeJobs: 0, totalSpend: 1150000, licenseNumber: 'CA-334578', since: '2019-09-15' },
  { id: 'v7', name: 'Del Mar Landscaping',           specialty: 'Landscaping / Hardscape',phone: '(858) 555-0423', email: 'design@delmarlandscape.com', rating: 4.4, activeJobs: 0, totalSpend: 320000,  licenseNumber: 'CA-890123', since: '2023-01-20' },
  { id: 'v8', name: 'Apex Roofing San Diego',        specialty: 'Roofing',                phone: '(619) 555-0156', email: 'bids@apexroofingsd.com',     rating: 4.2, activeJobs: 1, totalSpend: 545000,  licenseNumber: 'CA-667845', since: '2020-04-10' },
];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* ── Page ──────────────────────────────────────────────────── */
export default function VendorManagementPage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'spend' | 'name' | 'jobs'>('rating');
  const [showForm, setShowForm] = useState(false);

  const rows = useMemo(() => {
    let r = [...VENDORS];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((v) => v.name.toLowerCase().includes(q) || v.specialty.toLowerCase().includes(q));
    }
    r.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'spend':  return b.totalSpend - a.totalSpend;
        case 'name':   return a.name.localeCompare(b.name);
        case 'jobs':   return b.activeJobs - a.activeJobs;
      }
    });
    return r;
  }, [search, sortBy]);

  const totalVendors = VENDORS.length;
  const avgRating = (VENDORS.reduce((s, v) => s + v.rating, 0) / VENDORS.length).toFixed(1);
  const monthlySpend = Math.round(VENDORS.reduce((s, v) => s + v.totalSpend, 0) / 24);
  const activeContracts = VENDORS.reduce((s, v) => s + v.activeJobs, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Vendors</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Vendor <em className="italic">Management</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                San Diego contractors and subcontractors. Track ratings, spend, and active jobs.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setShowForm(!showForm)}
              className="rounded-md border border-transparent px-4 py-2 text-xs font-medium"
              style={{ backgroundColor: BUTTER, color: INK }}
            >
              {showForm ? 'Cancel' : '+ Add Vendor'}
            </motion.button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total vendors" value={String(totalVendors)} />
            <Kpi label="Avg rating" value={`${avgRating} / 5.0`} accent />
            <Kpi label="Est. monthly spend" value={fmtMoney(monthlySpend)} hint="Avg over 24 months" />
            <Kpi label="Active contracts" value={String(activeContracts)} hint={`Across ${VENDORS.filter((v) => v.activeJobs > 0).length} vendors`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Add vendor form */}
        {showForm && (
          <motion.section
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-lg border bg-white p-6"
            style={{ borderColor: BUTTER }}
          >
            <h3 className="mb-4 text-lg" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
              Add <em className="italic">vendor</em>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Company name" placeholder="e.g. Pacific Coast Framing" />
              <FormField label="Specialty" placeholder="e.g. Framing / Carpentry" />
              <FormField label="Phone" placeholder="(619) 555-0000" />
              <FormField label="Email" placeholder="contact@company.com" />
              <FormField label="License number" placeholder="CA-000000" />
              <div className="flex items-end">
                <motion.button whileHover={{ scale: 1.03 }} className="w-full rounded-md border border-transparent px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
                  Save Vendor
                </motion.button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Vendor table */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
              Vendor <em className="italic">directory</em>
            </h2>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{rows.length} contractors</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors..."
              className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none sm:w-56"
              style={{ borderColor: HAIRLINE }}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'rating' | 'spend' | 'name' | 'jobs')} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
              <option value="rating">Sort: Rating</option>
              <option value="spend">Sort: Total spend</option>
              <option value="jobs">Sort: Active jobs</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border bg-white lg:block" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Specialty</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Active jobs</th>
                <th className="px-4 py-3 font-medium">Total spend</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <motion.tr key={v.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                  <td className="px-4 py-3">
                    <div className="font-medium" style={{ color: INK }}>{v.name}</div>
                    <div className="text-xs" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Lic. {v.licenseNumber}</div>
                  </td>
                  <td className="px-4 py-3" style={{ color: MID }}>{v.specialty}</td>
                  <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{v.phone}</td>
                  <td className="px-4 py-3" style={{ color: MID }}>{v.email}</td>
                  <td className="px-4 py-3"><StarRating rating={v.rating} /></td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{
                      backgroundColor: v.activeJobs > 0 ? '#F0FDF4' : '#F5F5F5',
                      color: v.activeJobs > 0 ? '#15803D' : DIM,
                    }}>
                      {v.activeJobs}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(v.totalSpend)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 lg:hidden">
          {rows.map((v) => (
            <motion.div key={v.id} whileHover={{ y: -1 }} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium" style={{ color: INK }}>{v.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: MID }}>{v.specialty}</div>
                </div>
                <StarRating rating={v.rating} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: DIM }}>
                <div style={{ fontFamily: 'var(--font-geist-mono)' }}>{v.phone}</div>
                <div>{v.email}</div>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs" style={{ borderColor: HAIRLINE, color: DIM }}>
                <span>{v.activeJobs} active job{v.activeJobs !== 1 ? 's' : ''}</span>
                <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(v.totalSpend)} total</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </motion.div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-sm" style={{ color: i < full ? BUTTER : (i === full && half) ? BUTTER : '#D4D4D4' }}>
            {i < full ? '\u2605' : (i === full && half) ? '\u2605' : '\u2606'}
          </span>
        ))}
      </div>
      <span className="text-xs font-medium tabular-nums" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{rating}</span>
    </div>
  );
}

function FormField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <input
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none"
        style={{ borderColor: HAIRLINE }}
      />
    </div>
  );
}
