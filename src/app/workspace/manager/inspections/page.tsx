'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
type InspectionType = 'move_in' | 'move_out' | 'routine';
type Condition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
type InspectionStatus = 'complete' | 'in_progress' | 'scheduled';

type ChecklistItem = {
  area: string;
  condition: Condition;
  notes: string;
};

type Inspection = {
  id: string;
  property: string;
  unit: string;
  type: InspectionType;
  date: string;
  completedBy: string;
  status: InspectionStatus;
  items: ChecklistItem[];
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_INSPECTIONS: Inspection[] = [
  {
    id: 'ins1', property: 'Villa Sonoma', unit: 'A-204', type: 'move_in', date: '2024-06-01', completedBy: 'Sarah Chen', status: 'complete',
    items: [
      { area: 'Kitchen', condition: 'excellent', notes: 'All appliances new, countertops pristine' },
      { area: 'Bathroom', condition: 'excellent', notes: 'Fixtures polished, grout clean' },
      { area: 'Bedroom', condition: 'good', notes: 'Minor scuff on closet door' },
      { area: 'Living Room', condition: 'excellent', notes: 'Fresh paint, hardwood in great shape' },
      { area: 'Exterior', condition: 'good', notes: 'Patio swept, railing secure' },
    ],
  },
  {
    id: 'ins2', property: 'North Park Row', unit: 'H-307', type: 'move_out', date: '2026-02-15', completedBy: 'Sarah Chen', status: 'complete',
    items: [
      { area: 'Kitchen', condition: 'fair', notes: 'Grease buildup on range hood, scratched countertop' },
      { area: 'Bathroom', condition: 'poor', notes: 'Mold in shower caulk, cracked tile' },
      { area: 'Bedroom', condition: 'fair', notes: 'Carpet stains, two nail holes in wall' },
      { area: 'Living Room', condition: 'fair', notes: 'Scuffed baseboards, window blinds bent' },
      { area: 'Exterior', condition: 'good', notes: 'Balcony clean, no damage' },
    ],
  },
  {
    id: 'ins3', property: 'North Park Row', unit: 'D-105', type: 'routine', date: '2026-03-15', completedBy: 'Mike Torres', status: 'complete',
    items: [
      { area: 'Kitchen', condition: 'good', notes: 'Functioning well, filter needs replacing' },
      { area: 'Bathroom', condition: 'good', notes: 'No leaks, caulk intact' },
      { area: 'Bedroom', condition: 'good', notes: 'Smoke detector working' },
      { area: 'Living Room', condition: 'good', notes: 'HVAC filter dusty' },
      { area: 'Exterior', condition: 'fair', notes: 'Gutter needs cleaning' },
    ],
  },
  {
    id: 'ins4', property: 'Mission Bay Lofts', unit: 'C-301', type: 'routine', date: '2026-01-20', completedBy: 'Mike Torres', status: 'complete',
    items: [
      { area: 'Kitchen', condition: 'excellent', notes: 'Well maintained' },
      { area: 'Bathroom', condition: 'good', notes: 'Exhaust fan slightly noisy' },
      { area: 'Bedroom', condition: 'excellent', notes: 'No issues' },
      { area: 'Living Room', condition: 'excellent', notes: 'No issues' },
      { area: 'Exterior', condition: 'good', notes: 'Window screen has small tear' },
    ],
  },
  {
    id: 'ins5', property: 'Villa Sonoma', unit: 'G-102', type: 'routine', date: '2026-04-10', completedBy: 'Sarah Chen', status: 'scheduled',
    items: [
      { area: 'Kitchen', condition: 'good', notes: '' },
      { area: 'Bathroom', condition: 'good', notes: '' },
      { area: 'Bedroom', condition: 'good', notes: '' },
      { area: 'Living Room', condition: 'good', notes: '' },
      { area: 'Exterior', condition: 'good', notes: '' },
    ],
  },
  {
    id: 'ins6', property: 'Mission Bay Lofts', unit: 'F-410', type: 'move_in', date: '2024-03-15', completedBy: 'Mike Torres', status: 'complete',
    items: [
      { area: 'Kitchen', condition: 'excellent', notes: 'Brand new appliances installed' },
      { area: 'Bathroom', condition: 'excellent', notes: 'Recently renovated' },
      { area: 'Bedroom', condition: 'excellent', notes: 'New carpet' },
      { area: 'Living Room', condition: 'excellent', notes: 'Open floor plan, great condition' },
      { area: 'Exterior', condition: 'excellent', notes: 'Balcony freshly stained' },
    ],
  },
];

const PROPERTIES = ['Villa Sonoma', 'Mission Bay Lofts', 'North Park Row'];
const AREAS = ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Exterior'];
const CONDITIONS: Condition[] = ['excellent', 'good', 'fair', 'poor', 'damaged'];

/* ── Helpers ───────────────────────────────────────────────── */
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const typeConfig: Record<InspectionType, { label: string; cls: string }> = {
  move_in:  { label: 'Move-In',  cls: 'bg-blue-50 text-blue-800 border-blue-200' },
  move_out: { label: 'Move-Out', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  routine:  { label: 'Routine',  cls: 'bg-amber-50 text-amber-800 border-amber-200' },
};

const statusConfig: Record<InspectionStatus, { label: string; cls: string }> = {
  complete:    { label: 'Complete',    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  scheduled:   { label: 'Scheduled',   cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' },
};

const conditionColors: Record<Condition, string> = {
  excellent: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  good:      'bg-blue-50 text-blue-800 border-blue-200',
  fair:      'bg-amber-50 text-amber-800 border-amber-200',
  poor:      'bg-orange-50 text-orange-800 border-orange-200',
  damaged:   'bg-rose-50 text-rose-800 border-rose-200',
};

/* ── Page ──────────────────────────────────────────────────── */
export default function InspectionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    property: PROPERTIES[0],
    unit: '',
    type: 'routine' as InspectionType,
    notes: '',
    items: AREAS.map((a) => ({ area: a, condition: 'good' as Condition, notes: '' })),
  });

  const selectedInspection = MOCK_INSPECTIONS.find((i) => i.id === selectedId) ?? null;

  const totalInspections = MOCK_INSPECTIONS.length;
  const completedCount = MOCK_INSPECTIONS.filter((i) => i.status === 'complete').length;
  const scheduledCount = MOCK_INSPECTIONS.filter((i) => i.status === 'scheduled').length;

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: 0 }}>
            Inspections
          </h1>
          <p style={{ fontFamily: 'var(--font-inter)', fontSize: 14, color: DIM, marginTop: 4 }}>
            Property inspection checklists and condition tracking
          </p>
        </motion.div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginTop: 28 }}>
          {[
            { label: 'Total inspections', value: String(totalInspections) },
            { label: 'Completed', value: String(completedCount) },
            { label: 'Scheduled', value: String(scheduledCount) },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: '20px 24px' }}
            >
              <p style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {kpi.label}
              </p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, color: INK, margin: '4px 0 0' }}>
                {kpi.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, gap: 12 }}>
          <button
            onClick={() => { setShowForm(!showForm); setSelectedId(null); }}
            style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : 'New Inspection'}
          </button>
        </div>

        {/* New Inspection Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24, marginTop: 16, overflow: 'hidden' }}
            >
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 600, color: INK, margin: '0 0 16px' }}>
                New Inspection
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Property</label>
                  <select
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                  >
                    {PROPERTIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Unit</label>
                  <input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. A-101"
                    style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', color: INK, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as InspectionType })}
                    style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', background: '#fff', color: INK, outline: 'none' }}
                  >
                    <option value="move_in">Move-In</option>
                    <option value="move_out">Move-Out</option>
                    <option value="routine">Routine</option>
                  </select>
                </div>
              </div>

              {/* Checklist Items */}
              <div style={{ marginTop: 20 }}>
                <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 12px' }}>Checklist</p>
                {formData.items.map((item, idx) => (
                  <div key={item.area} style={{ display: 'grid', gridTemplateColumns: '120px 160px 1fr', gap: 12, marginBottom: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: MID }}>{item.area}</span>
                    <select
                      value={item.condition}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx] = { ...item, condition: e.target.value as Condition };
                        setFormData({ ...formData, items: updated });
                      }}
                      style={{ fontFamily: 'var(--font-inter)', fontSize: 12, border: `1px solid ${HAIRLINE}`, borderRadius: 6, padding: '6px 10px', background: '#fff', color: INK, outline: 'none' }}
                    >
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                    <input
                      value={item.notes}
                      onChange={(e) => {
                        const updated = [...formData.items];
                        updated[idx] = { ...item, notes: e.target.value };
                        setFormData({ ...formData, items: updated });
                      }}
                      placeholder="Notes..."
                      style={{ fontFamily: 'var(--font-inter)', fontSize: 12, border: `1px solid ${HAIRLINE}`, borderRadius: 6, padding: '6px 10px', color: INK, outline: 'none' }}
                    />
                  </div>
                ))}
              </div>

              {/* Notes + photo */}
              <div style={{ marginTop: 12 }}>
                <label style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, display: 'block', marginBottom: 4 }}>General Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                  style={{ width: '100%', fontFamily: 'var(--font-inter)', fontSize: 13, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 12px', color: INK, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center' }}>
                <button
                  style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 600, background: INK, color: CREAM, border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer' }}
                >
                  Save Inspection
                </button>
                <button
                  style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500, background: 'transparent', color: MID, border: `1px solid ${HAIRLINE}`, borderRadius: 8, padding: '8px 20px', cursor: 'pointer' }}
                >
                  Upload Photos
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inspection Table */}
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
                  {['Property', 'Unit', 'Type', 'Date', 'Completed By', 'Items', 'Status', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: DIM, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_INSPECTIONS.map((ins) => {
                  const checkedCount = ins.items.filter((i) => i.condition !== 'good' || i.notes).length;
                  return (
                    <tr key={ins.id} style={{ borderBottom: `1px solid ${HAIRLINE}`, cursor: 'pointer', background: selectedId === ins.id ? 'rgba(17,17,17,0.02)' : 'transparent' }} onClick={() => setSelectedId(selectedId === ins.id ? null : ins.id)}>
                      <td style={{ padding: '12px 16px', color: INK, fontWeight: 500 }}>{ins.property}</td>
                      <td style={{ padding: '12px 16px', color: MID, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{ins.unit}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={typeConfig[ins.type].cls} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block' }}>
                          {typeConfig[ins.type].label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: DIM, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{fmtDate(ins.date)}</td>
                      <td style={{ padding: '12px 16px', color: MID }}>{ins.completedBy}</td>
                      <td style={{ padding: '12px 16px', color: MID, fontFamily: 'var(--font-geist-mono)', fontSize: 12 }}>{ins.items.length}/{ins.items.length}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={statusConfig[ins.status].cls} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block' }}>
                          {statusConfig[ins.status].label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: DIM, fontSize: 12 }}>
                        {selectedId === ins.id ? 'Hide' : 'View'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Detail View */}
        <AnimatePresence>
          {selectedInspection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: '#fff', border: `1px solid ${HAIRLINE}`, borderRadius: 12, padding: 24, marginTop: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600, color: INK, margin: 0 }}>
                    {selectedInspection.property} -- {selectedInspection.unit}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-inter)', fontSize: 13, color: DIM, marginTop: 4 }}>
                    {typeConfig[selectedInspection.type].label} inspection on {fmtDate(selectedInspection.date)} by {selectedInspection.completedBy}
                  </p>
                </div>
                <button onClick={() => setSelectedId(null)} style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Close
                </button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                {selectedInspection.items.map((item) => (
                  <div key={item.area} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', border: `1px solid ${HAIRLINE}`, borderRadius: 8 }}>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 13, fontWeight: 500, color: INK, minWidth: 100 }}>
                      {item.area}
                    </span>
                    <span className={conditionColors[item.condition]} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid', display: 'inline-block', textTransform: 'capitalize' }}>
                      {item.condition}
                    </span>
                    <span style={{ fontFamily: 'var(--font-inter)', fontSize: 12, color: DIM, flex: 1 }}>
                      {item.notes || '--'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
