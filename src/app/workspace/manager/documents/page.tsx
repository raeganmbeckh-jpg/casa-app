'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────── */
type DocType = 'lease' | 'inspection' | 'financial' | 'insurance' | 'correspondence';

type Document = {
  id: string;
  fileName: string;
  type: DocType;
  property: string;
  uploadedDate: string;
  size: string;
  sizeBytes: number;
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1',  fileName: 'Lease_Hernandez_A204.pdf',            type: 'lease',          property: 'Villa Sonoma',      uploadedDate: '2024-06-01', size: '2.4 MB',  sizeBytes: 2516582 },
  { id: 'd2',  fileName: 'Lease_Okafor_B112.pdf',              type: 'lease',          property: 'Villa Sonoma',      uploadedDate: '2025-01-15', size: '2.1 MB',  sizeBytes: 2202009 },
  { id: 'd3',  fileName: 'Lease_Kapoor_C301.pdf',              type: 'lease',          property: 'Mission Bay Lofts', uploadedDate: '2024-09-01', size: '2.3 MB',  sizeBytes: 2411724 },
  { id: 'd4',  fileName: 'MoveIn_Inspection_A204.pdf',         type: 'inspection',     property: 'Villa Sonoma',      uploadedDate: '2024-06-01', size: '4.8 MB',  sizeBytes: 5033164 },
  { id: 'd5',  fileName: 'Routine_Inspection_NorthPark_Q1.pdf',type: 'inspection',     property: 'North Park Row',    uploadedDate: '2026-03-15', size: '3.2 MB',  sizeBytes: 3355443 },
  { id: 'd6',  fileName: 'Q1_2026_PnL_VillaSonoma.xlsx',       type: 'financial',      property: 'Villa Sonoma',      uploadedDate: '2026-04-02', size: '856 KB',  sizeBytes: 876544 },
  { id: 'd7',  fileName: 'Q1_2026_PnL_MissionBay.xlsx',        type: 'financial',      property: 'Mission Bay Lofts', uploadedDate: '2026-04-02', size: '912 KB',  sizeBytes: 933888 },
  { id: 'd8',  fileName: 'Insurance_VillaSonoma_2026.pdf',     type: 'insurance',      property: 'Villa Sonoma',      uploadedDate: '2026-01-10', size: '1.8 MB',  sizeBytes: 1887436 },
  { id: 'd9',  fileName: 'Insurance_NorthPark_2026.pdf',       type: 'insurance',      property: 'North Park Row',    uploadedDate: '2026-01-12', size: '1.6 MB',  sizeBytes: 1677721 },
  { id: 'd10', fileName: 'LateNotice_Reynolds_Mar2026.pdf',    type: 'correspondence', property: 'North Park Row',    uploadedDate: '2026-03-20', size: '245 KB',  sizeBytes: 250880 },
  { id: 'd11', fileName: 'LeaseRenewal_Brooks_G102.pdf',       type: 'correspondence', property: 'Villa Sonoma',      uploadedDate: '2026-03-22', size: '310 KB',  sizeBytes: 317440 },
  { id: 'd12', fileName: 'MoveOut_Inspection_H307.pdf',        type: 'inspection',     property: 'North Park Row',    uploadedDate: '2026-02-15', size: '5.1 MB',  sizeBytes: 5347737 },
];

const PROPERTIES = Array.from(new Set(MOCK_DOCUMENTS.map((d) => d.property)));

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const typeConfig: Record<DocType, { label: string; cls: string }> = {
  lease:          { label: 'Lease',          cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  inspection:     { label: 'Inspection',     cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  financial:      { label: 'Financial',      cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  insurance:      { label: 'Insurance',      cls: 'bg-purple-50 text-purple-800 border-purple-200' },
  correspondence: { label: 'Correspondence', cls: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
};

/* ── KPIs ──────────────────────────────────────────────────── */
const totalFiles = MOCK_DOCUMENTS.length;
const typeCounts: Record<DocType, number> = {
  lease: MOCK_DOCUMENTS.filter((d) => d.type === 'lease').length,
  inspection: MOCK_DOCUMENTS.filter((d) => d.type === 'inspection').length,
  financial: MOCK_DOCUMENTS.filter((d) => d.type === 'financial').length,
  insurance: MOCK_DOCUMENTS.filter((d) => d.type === 'insurance').length,
  correspondence: MOCK_DOCUMENTS.filter((d) => d.type === 'correspondence').length,
};
const totalBytes = MOCK_DOCUMENTS.reduce((s, d) => s + d.sizeBytes, 0);
const storageUsed = (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';

/* ── Page ──────────────────────────────────────────────────── */
export default function DocumentsPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | DocType>('all');
  const [propertyFilter, setPropertyFilter] = useState<'all' | string>('all');

  const rows = useMemo(() => {
    let list = [...MOCK_DOCUMENTS];
    if (typeFilter !== 'all') list = list.filter((d) => d.type === typeFilter);
    if (propertyFilter !== 'all') list = list.filter((d) => d.property === propertyFilter);
    return list.sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate));
  }, [typeFilter, propertyFilter]);

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: 0 }}>
            Documents
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: DIM, marginTop: 4 }}>
            Secure document vault for leases, inspections, financials, and more
          </p>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginTop: 28 }}>
          {[
            { label: 'Total files', value: String(totalFiles) },
            { label: 'Leases', value: String(typeCounts.lease) },
            { label: 'Inspections', value: String(typeCounts.inspection) },
            { label: 'Financial', value: String(typeCounts.financial) },
            { label: 'Insurance', value: String(typeCounts.insurance) },
            { label: 'Storage used', value: storageUsed },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: '18px 20px' }}
            >
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, color: DIM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, color: INK, margin: '4px 0 0' }}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | DocType)}
              style={{ fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 14px', background: '#fff', color: INK, outline: 'none' }}
            >
              <option value="all">All types</option>
              {(Object.keys(typeConfig) as DocType[]).map((t) => (
                <option key={t} value={t}>{typeConfig[t].label}</option>
              ))}
            </select>
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              style={{ fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 14px', background: '#fff', color: INK, outline: 'none' }}
            >
              <option value="all">All properties</option>
              {PROPERTIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
          >
            Upload Document
          </button>
        </div>

        {/* Document Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, marginTop: 20, overflow: 'hidden' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['File Name', 'Type', 'Property', 'Uploaded', 'Size'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: DIM, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                    <td style={{ padding: '12px 16px', color: INK, fontWeight: 500, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>
                      {d.fileName}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={typeConfig[d.type].cls} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block' }}>
                        {typeConfig[d.type].label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: MID }}>{d.property}</td>
                    <td style={{ padding: '12px 16px', color: DIM, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{fmtDate(d.uploadedDate)}</td>
                    <td style={{ padding: '12px 16px', color: DIM, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{d.size}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: DIM }}>
                      No documents match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
