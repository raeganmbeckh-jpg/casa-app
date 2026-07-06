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
type DocType = 'appraisal' | 'inspection' | 'title' | 'lease' | 'financials';

type Document = {
  id: string;
  name: string;
  type: DocType;
  property: string;
  uploadedDate: string;
  size: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const DOCUMENTS: Document[] = [
  { id: 'd1',  name: 'Appraisal Report - Villa Sonoma',         type: 'appraisal',   property: 'Villa Sonoma',      uploadedDate: '2026-03-15', size: '2.4 MB' },
  { id: 'd2',  name: 'Phase I Environmental Report',            type: 'inspection',  property: 'Villa Sonoma',      uploadedDate: '2026-03-10', size: '8.1 MB' },
  { id: 'd3',  name: 'Title Commitment - Mission Bay',          type: 'title',       property: 'Mission Bay Lofts', uploadedDate: '2026-02-28', size: '1.2 MB' },
  { id: 'd4',  name: 'Master Lease Agreement',                  type: 'lease',       property: 'North Park Row',    uploadedDate: '2026-02-20', size: '340 KB' },
  { id: 'd5',  name: '2025 Operating Statement',                type: 'financials',  property: 'Villa Sonoma',      uploadedDate: '2026-01-15', size: '520 KB' },
  { id: 'd6',  name: 'Roof Inspection Report',                  type: 'inspection',  property: 'North Park Row',    uploadedDate: '2026-01-08', size: '4.7 MB' },
  { id: 'd7',  name: 'Preliminary Title Report',                type: 'title',       property: 'Villa Sonoma',      uploadedDate: '2025-12-20', size: '890 KB' },
  { id: 'd8',  name: 'Tenant Lease - Unit A-204',               type: 'lease',       property: 'Villa Sonoma',      uploadedDate: '2025-12-10', size: '280 KB' },
  { id: 'd9',  name: 'Pro Forma 5-Year Projection',             type: 'financials',  property: 'Mission Bay Lofts', uploadedDate: '2025-11-30', size: '410 KB' },
  { id: 'd10', name: 'Appraisal Report - North Park',           type: 'appraisal',   property: 'North Park Row',    uploadedDate: '2025-11-15', size: '3.1 MB' },
  { id: 'd11', name: 'HVAC Inspection Summary',                 type: 'inspection',  property: 'Mission Bay Lofts', uploadedDate: '2025-11-01', size: '1.8 MB' },
  { id: 'd12', name: 'Rent Roll Snapshot Q3 2025',              type: 'financials',  property: 'Villa Sonoma',      uploadedDate: '2025-10-01', size: '180 KB' },
  { id: 'd13', name: 'Lease Amendment - Unit C-301',            type: 'lease',       property: 'Mission Bay Lofts', uploadedDate: '2025-09-15', size: '120 KB' },
  { id: 'd14', name: 'Title Insurance Policy',                  type: 'title',       property: 'North Park Row',    uploadedDate: '2025-09-01', size: '950 KB' },
  { id: 'd15', name: 'Plumbing Inspection Report',              type: 'inspection',  property: 'Villa Sonoma',      uploadedDate: '2025-08-20', size: '2.2 MB' },
];

const DOC_TYPE_LABELS: Record<DocType, string> = {
  appraisal: 'Appraisal',
  inspection: 'Inspection',
  title: 'Title',
  lease: 'Lease',
  financials: 'Financials',
};

const DOC_TYPE_COLORS: Record<DocType, { bg: string; text: string }> = {
  appraisal:  { bg: '#EFF6FF', text: '#1D4ED8' },
  inspection: { bg: '#FEF3C7', text: '#B45309' },
  title:      { bg: '#F0FDF4', text: '#15803D' },
  lease:      { bg: '#F5F3FF', text: '#7C3AED' },
  financials: { bg: '#FEF2F2', text: '#B91C1C' },
};

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Page ──────────────────────────────────────────────────── */
export default function DocumentVaultPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | DocType>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let docs = [...DOCUMENTS];
    if (typeFilter !== 'all') docs = docs.filter((d) => d.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.name.toLowerCase().includes(q) || d.property.toLowerCase().includes(q));
    }
    return docs;
  }, [typeFilter, search]);

  const totalDocs = DOCUMENTS.length;
  const typeCounts = (Object.keys(DOC_TYPE_LABELS) as DocType[]).reduce((acc, t) => {
    acc[t] = DOCUMENTS.filter((d) => d.type === t).length;
    return acc;
  }, {} as Record<DocType, number>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Investor &middot; Documents</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Document <em className="italic">Vault</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                All property documents in one place. Appraisals, inspections, title reports, leases, and financials.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="rounded-md border border-transparent px-4 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>
              Upload Document
            </motion.button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 sm:gap-4">
            <Kpi label="Total documents" value={String(totalDocs)} />
            {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((t) => (
              <Kpi key={t} label={DOC_TYPE_LABELS[t]} value={String(typeCounts[t])} />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
              All <em className="italic">documents</em>
            </h2>
            <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>{filtered.length} files</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none sm:w-56"
              style={{ borderColor: HAIRLINE }}
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | DocType)} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
              <option value="all">All types</option>
              {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((t) => (
                <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                <th className="px-4 py-3 font-medium">Document</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const tc = DOC_TYPE_COLORS[doc.type];
                return (
                  <motion.tr
                    key={doc.id}
                    whileHover={{ backgroundColor: '#FDF8E8' }}
                    className="border-b last:border-0"
                    style={{ borderColor: HAIRLINE }}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: INK }}>{doc.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: tc.bg, color: tc.text }}>
                        {DOC_TYPE_LABELS[doc.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: MID }}>{doc.property}</td>
                    <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(doc.uploadedDate)}</td>
                    <td className="px-4 py-3" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{doc.size}</td>
                    <td className="px-4 py-3">
                      <motion.button whileHover={{ scale: 1.05 }} className="rounded-md border px-2 py-1 text-[11px] font-medium" style={{ borderColor: HAIRLINE, color: MID }}>View</motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="grid gap-3 md:hidden">
          {filtered.map((doc) => {
            const tc = DOC_TYPE_COLORS[doc.type];
            return (
              <motion.div key={doc.id} whileHover={{ y: -1 }} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-sm" style={{ color: INK }}>{doc.name}</div>
                    <div className="mt-1 text-xs" style={{ color: DIM }}>{doc.property}</div>
                  </div>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: tc.bg, color: tc.text }}>
                    {DOC_TYPE_LABELS[doc.type]}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs" style={{ color: DIM }}>
                  <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(doc.uploadedDate)}</span>
                  <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{doc.size}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────── */
function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-lg border bg-white p-4" style={{ borderColor: HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
    </motion.div>
  );
}
