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
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────── */
type AppStatus = 'submitted' | 'screening' | 'approved' | 'denied';

type Application = {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  property: string;
  unit: string;
  monthlyIncome: number;
  rent: number;
  moveInDate: string;
  status: AppStatus;
  submittedAt: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_APPS: Application[] = [
  { id: 'APP-001', applicantName: 'Jordan Rivera',    email: 'jrivera@email.com',   phone: '(619) 555-0201', property: 'Villa Sonoma',      unit: 'A-204', monthlyIncome: 7200,  rent: 2850, moveInDate: '2026-05-01', status: 'submitted',  submittedAt: '2026-04-08' },
  { id: 'APP-002', applicantName: 'Natasha Kim',      email: 'nkim@email.com',      phone: '(858) 555-0302', property: 'Mission Bay Lofts', unit: 'C-301', monthlyIncome: 9500,  rent: 3650, moveInDate: '2026-05-15', status: 'screening',  submittedAt: '2026-04-07' },
  { id: 'APP-003', applicantName: 'Derek Okonkwo',    email: 'dokonkwo@email.com',  phone: '(619) 555-0415', property: 'North Park Row',    unit: 'D-105', monthlyIncome: 5800,  rent: 2400, moveInDate: '2026-06-01', status: 'submitted',  submittedAt: '2026-04-06' },
  { id: 'APP-004', applicantName: 'Sofia Morales',    email: 'smorales@email.com',  phone: '(619) 555-0518', property: 'Villa Sonoma',      unit: 'B-112', monthlyIncome: 8100,  rent: 3100, moveInDate: '2026-05-01', status: 'approved',   submittedAt: '2026-04-02' },
  { id: 'APP-005', applicantName: 'Ethan Blackwell',  email: 'eblackwell@email.com',phone: '(858) 555-0623', property: 'Mission Bay Lofts', unit: 'F-410', monthlyIncome: 11200, rent: 3950, moveInDate: '2026-05-15', status: 'approved',   submittedAt: '2026-03-28' },
  { id: 'APP-006', applicantName: 'Chloe Tran',       email: 'ctran@email.com',     phone: '(619) 555-0730', property: 'North Park Row',    unit: 'E-208', monthlyIncome: 4200,  rent: 2600, moveInDate: '2026-06-01', status: 'denied',     submittedAt: '2026-03-25' },
  { id: 'APP-007', applicantName: 'Marcus Sterling',  email: 'msterling@email.com', phone: '(619) 555-0842', property: 'Villa Sonoma',      unit: 'G-102', monthlyIncome: 6900,  rent: 2750, moveInDate: '2026-05-01', status: 'submitted',  submittedAt: '2026-04-09' },
  { id: 'APP-008', applicantName: 'Ava Johansson',    email: 'ajohansson@email.com',phone: '(858) 555-0955', property: 'Mission Bay Lofts', unit: 'I-201', monthlyIncome: 10400, rent: 3400, moveInDate: '2026-06-15', status: 'screening',  submittedAt: '2026-04-05' },
];

const STATUS_STYLES: Record<AppStatus, { bg: string; color: string; label: string }> = {
  submitted: { bg: `${BUTTER}25`, color: INK,   label: 'Submitted' },
  screening: { bg: '#3B82F618',   color: '#2563EB', label: 'Screening' },
  approved:  { bg: `${GREEN}14`,  color: GREEN, label: 'Approved' },
  denied:    { bg: `${RED}10`,    color: RED,   label: 'Denied' },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState(MOCK_APPS);
  const [filter, setFilter] = useState<AppStatus | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  );

  /* ── KPIs ────────────────────────────────────────────────── */
  const totalApps = apps.length;
  const pendingReview = apps.filter((a) => a.status === 'submitted' || a.status === 'screening').length;
  const approvedThisMonth = apps.filter((a) => a.status === 'approved' && a.submittedAt >= '2026-04-01').length;
  const avgIncome = Math.round(apps.reduce((s, a) => s + a.monthlyIncome, 0) / apps.length);

  const kpis = [
    { label: 'Total Applications', value: totalApps.toString() },
    { label: 'Pending Review', value: pendingReview.toString() },
    { label: 'Approved This Month', value: approvedThisMonth.toString() },
    { label: 'Avg. Income', value: `$${avgIncome.toLocaleString()}` },
  ];

  /* ── SmartMove configured? ───────────────────────────────── */
  const smartMoveConfigured = false; // In production: check env

  /* ── Actions ─────────────────────────────────────────────── */
  function updateStatus(id: string, status: AppStatus) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const filterTabs: { key: AppStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'screening', label: 'Screening' },
    { key: 'approved', label: 'Approved' },
    { key: 'denied', label: 'Denied' },
  ];

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}>
            Manager
          </p>
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}>
            Applications
          </h1>
        </div>

        {/* ── KPI cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => (
            <motion.div
              key={k.label}
              whileHover={{ y: -2 }}
              className="rounded-2xl border p-5"
              style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}
            >
              <p className="text-xs uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}>
                {k.label}
              </p>
              <p className="text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}>
                {k.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ── SmartMove setup card ──────────────────────────── */}
        {!smartMoveConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 mb-8"
            style={{
              backgroundColor: '#fff',
              border: `2px solid ${BUTTER}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-inter)', color: INK }}>
                  Connect SmartMove for Tenant Screening
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                  SmartMove by TransUnion provides instant credit checks, criminal background reports, and eviction history for applicants.
                  Connect your SmartMove account to automatically screen tenants when applications are submitted.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold"
                style={{
                  fontFamily: 'var(--font-inter)',
                  backgroundColor: BUTTER,
                  color: INK,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Connect SmartMove
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Filter tabs ──────────────────────────────────── */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-inter)',
                backgroundColor: filter === tab.key ? INK : '#fff',
                color: filter === tab.key ? '#fff' : MID,
                border: `1px solid ${filter === tab.key ? INK : HAIRLINE}`,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Applicant', 'Property', 'Unit', 'Income', 'Rent', 'Status', 'Submitted', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-4 text-xs uppercase tracking-widest"
                      style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => {
                  const st = STATUS_STYLES[app.status];
                  const incomeRatio = (app.monthlyIncome / app.rent).toFixed(1);
                  return (
                    <tr
                      key={app.id}
                      className="transition-colors"
                      style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CREAM)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-inter)', color: INK }}>
                          {app.applicantName}
                        </p>
                        <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-inter)', color: DIM }}>
                          {app.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                        {app.property}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>
                        {app.unit}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>
                          ${app.monthlyIncome.toLocaleString()}
                        </span>
                        <span className="text-xs ml-1.5" style={{ fontFamily: 'var(--font-inter)', color: parseFloat(incomeRatio) >= 3 ? GREEN : parseFloat(incomeRatio) >= 2 ? DIM : RED }}>
                          {incomeRatio}x
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>
                        ${app.rent.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.color, fontFamily: 'var(--font-inter)' }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                        {app.submittedAt}
                      </td>
                      <td className="px-5 py-4">
                        {(app.status === 'submitted' || app.status === 'screening') && (
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(app.id, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                backgroundColor: `${GREEN}14`,
                                color: GREEN,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(app.id, 'denied')}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                backgroundColor: `${RED}0C`,
                                color: RED,
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              Deny
                            </motion.button>
                          </div>
                        )}
                        {app.status === 'approved' && (
                          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: GREEN }}>Approved</span>
                        )}
                        {app.status === 'denied' && (
                          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: RED }}>Denied</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
