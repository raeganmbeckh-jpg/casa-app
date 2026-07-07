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
type EsignStatus = 'draft' | 'sent' | 'signed';

type Lease = {
  id: string;
  tenant: string;
  email: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  lateFee: number;
  esignStatus: EsignStatus;
};

/* ── Mock data ─────────────────────────────────────────────── */
const MOCK_LEASES: Lease[] = [
  { id: 'LSE-001', tenant: 'Maya Hernandez',   email: 'maya.h@example.com',    property: 'Villa Sonoma',      unit: 'A-204', startDate: '2024-06-01', endDate: '2026-05-31', monthlyRent: 2850, deposit: 2850, lateFee: 75,  esignStatus: 'signed' },
  { id: 'LSE-002', tenant: 'James Okafor',     email: 'jokafor@example.com',   property: 'Villa Sonoma',      unit: 'B-112', startDate: '2025-01-15', endDate: '2026-07-14', monthlyRent: 3100, deposit: 3100, lateFee: 85,  esignStatus: 'signed' },
  { id: 'LSE-003', tenant: 'Priya Kapoor',     email: 'priya.k@example.com',   property: 'Mission Bay Lofts', unit: 'C-301', startDate: '2024-09-01', endDate: '2026-08-31', monthlyRent: 3650, deposit: 3650, lateFee: 100, esignStatus: 'signed' },
  { id: 'LSE-004', tenant: 'Marcus Reynolds',  email: 'mreynolds@example.com', property: 'North Park Row',    unit: 'D-105', startDate: '2023-11-01', endDate: '2026-06-30', monthlyRent: 2400, deposit: 2400, lateFee: 60,  esignStatus: 'signed' },
  { id: 'LSE-005', tenant: 'Sasha Mendoza',    email: 'smendoza@example.com',  property: 'North Park Row',    unit: 'E-208', startDate: '2024-12-01', endDate: '2026-11-30', monthlyRent: 2600, deposit: 2600, lateFee: 70,  esignStatus: 'signed' },
  { id: 'LSE-006', tenant: 'Daniel Park',      email: 'dpark@example.com',     property: 'Mission Bay Lofts', unit: 'F-410', startDate: '2024-03-15', endDate: '2026-09-14', monthlyRent: 3950, deposit: 3950, lateFee: 110, esignStatus: 'signed' },
  { id: 'LSE-007', tenant: 'Sofia Morales',    email: 'smorales@email.com',    property: 'Villa Sonoma',      unit: 'B-112', startDate: '2026-05-01', endDate: '2027-04-30', monthlyRent: 3100, deposit: 3100, lateFee: 85,  esignStatus: 'sent' },
  { id: 'LSE-008', tenant: 'Ethan Blackwell',  email: 'eblackwell@email.com',  property: 'Mission Bay Lofts', unit: 'F-410', startDate: '2026-05-15', endDate: '2027-05-14', monthlyRent: 3950, deposit: 3950, lateFee: 110, esignStatus: 'sent' },
  { id: 'LSE-009', tenant: 'Jordan Rivera',    email: 'jrivera@email.com',     property: 'Villa Sonoma',      unit: 'A-204', startDate: '2026-06-01', endDate: '2027-05-31', monthlyRent: 2950, deposit: 2950, lateFee: 80,  esignStatus: 'draft' },
  { id: 'LSE-010', tenant: 'Marcus Sterling',  email: 'msterling@email.com',   property: 'Villa Sonoma',      unit: 'G-102', startDate: '2026-05-01', endDate: '2027-04-30', monthlyRent: 2850, deposit: 2850, lateFee: 75,  esignStatus: 'draft' },
];

const ESIGN_STYLES: Record<EsignStatus, { bg: string; color: string; label: string }> = {
  draft:  { bg: `${BUTTER}25`, color: INK,   label: 'Draft' },
  sent:   { bg: '#3B82F618',   color: '#2563EB', label: 'Sent' },
  signed: { bg: `${GREEN}14`,  color: GREEN, label: 'Signed' },
};

function daysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date('2026-04-09');
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function LeasesPage() {
  const [leases, setLeases] = useState(MOCK_LEASES);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  /* ── New lease form state ─────────────────────────────────── */
  const [newLease, setNewLease] = useState({
    tenant: '', email: '', property: '', unit: '',
    startDate: '', endDate: '', monthlyRent: '', deposit: '', lateFee: '',
  });

  /* ── KPIs ────────────────────────────────────────────────── */
  const activeLeases = leases.filter((l) => l.esignStatus === 'signed').length;
  const expiringIn30 = leases.filter((l) => {
    const d = daysRemaining(l.endDate);
    return d > 0 && d <= 30 && l.esignStatus === 'signed';
  }).length;
  const unsigned = leases.filter((l) => l.esignStatus !== 'signed').length;
  const avgRent = Math.round(leases.reduce((s, l) => s + l.monthlyRent, 0) / leases.length);

  const kpis = [
    { label: 'Active Leases', value: activeLeases.toString() },
    { label: 'Expiring in 30 Days', value: expiringIn30.toString() },
    { label: 'Unsigned', value: unsigned.toString() },
    { label: 'Avg. Rent', value: `$${avgRent.toLocaleString()}` },
  ];

  /* ── SignWell configured? ────────────────────────────────── */
  const signWellConfigured = false; // In production: check env

  /* ── Send for signature ──────────────────────────────────── */
  async function handleSendForSignature(leaseId: string) {
    setSendingId(leaseId);
    try {
      const res = await fetch('/api/esign/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseId }),
      });
      const data = await res.json();
      if (data.signingUrl) {
        setLeases((prev) => prev.map((l) => (l.id === leaseId ? { ...l, esignStatus: 'sent' as EsignStatus } : l)));
      }
    } catch {
      // handle error silently
    } finally {
      setSendingId(null);
    }
  }

  /* ── Create lease ────────────────────────────────────────── */
  function handleCreateLease(e: React.FormEvent) {
    e.preventDefault();
    const id = `LSE-${String(leases.length + 1).padStart(3, '0')}`;
    const lease: Lease = {
      id,
      tenant: newLease.tenant,
      email: newLease.email,
      property: newLease.property,
      unit: newLease.unit,
      startDate: newLease.startDate,
      endDate: newLease.endDate,
      monthlyRent: parseFloat(newLease.monthlyRent) || 0,
      deposit: parseFloat(newLease.deposit) || 0,
      lateFee: parseFloat(newLease.lateFee) || 0,
      esignStatus: 'draft',
    };
    setLeases((prev) => [lease, ...prev]);
    setNewLease({ tenant: '', email: '', property: '', unit: '', startDate: '', endDate: '', monthlyRent: '', deposit: '', lateFee: '' });
    setShowCreateForm(false);
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: 14,
    color: INK,
    backgroundColor: '#fff',
    border: `1px solid ${HAIRLINE}`,
    borderRadius: 10,
    padding: '10px 14px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-inter)',
    fontSize: 12,
    fontWeight: 500,
    color: MID,
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-inter)', color: DIM, fontWeight: 600 }}>
              Manager
            </p>
            <h1 className="text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}>
              Leases
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-5 py-3 rounded-xl text-sm font-semibold"
            style={{
              fontFamily: 'var(--font-inter)',
              backgroundColor: BUTTER,
              color: INK,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create Lease'}
          </motion.button>
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

        {/* ── SignWell setup card ───────────────────────────── */}
        {!signWellConfigured && (
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
                  Connect SignWell for E-Signatures
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                  SignWell provides legally binding electronic signatures with audit trails. Connect your account to send leases
                  for signature directly from CASA and track signing status in real time.
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
                Connect SignWell
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Create lease form ─────────────────────────────── */}
        {showCreateForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleCreateLease}
            className="rounded-2xl border p-6 mb-8"
            style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}
          >
            <h3 className="text-lg mb-5" style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: INK }}>
              New Lease
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div>
                <label style={labelStyle}>Tenant Name</label>
                <input style={inputStyle} value={newLease.tenant} onChange={(e) => setNewLease({ ...newLease, tenant: e.target.value })} placeholder="Jane Smith" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={newLease.email} onChange={(e) => setNewLease({ ...newLease, email: e.target.value })} placeholder="jane@email.com" />
              </div>
              <div>
                <label style={labelStyle}>Property</label>
                <input style={inputStyle} value={newLease.property} onChange={(e) => setNewLease({ ...newLease, property: e.target.value })} placeholder="Villa Sonoma" />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <input style={inputStyle} value={newLease.unit} onChange={(e) => setNewLease({ ...newLease, unit: e.target.value })} placeholder="A-101" />
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" style={inputStyle} value={newLease.startDate} onChange={(e) => setNewLease({ ...newLease, startDate: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="date" style={inputStyle} value={newLease.endDate} onChange={(e) => setNewLease({ ...newLease, endDate: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Monthly Rent ($)</label>
                <input type="number" style={inputStyle} value={newLease.monthlyRent} onChange={(e) => setNewLease({ ...newLease, monthlyRent: e.target.value })} placeholder="2800" />
              </div>
              <div>
                <label style={labelStyle}>Deposit ($)</label>
                <input type="number" style={inputStyle} value={newLease.deposit} onChange={(e) => setNewLease({ ...newLease, deposit: e.target.value })} placeholder="2800" />
              </div>
              <div>
                <label style={labelStyle}>Late Fee ($)</label>
                <input type="number" style={inputStyle} value={newLease.lateFee} onChange={(e) => setNewLease({ ...newLease, lateFee: e.target.value })} placeholder="75" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ fontFamily: 'var(--font-inter)', backgroundColor: BUTTER, color: INK, border: 'none', cursor: 'pointer' }}
            >
              Create Lease
            </motion.button>
          </motion.form>
        )}

        {/* ── Table ─────────────────────────────────────────── */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: HAIRLINE, backgroundColor: '#fff' }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                  {['Tenant', 'Property', 'Start', 'End', 'Rent', 'Deposit', 'Late Fee', 'E-Sign', 'Days Left', 'Actions'].map((h) => (
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
                {leases.map((lease) => {
                  const es = ESIGN_STYLES[lease.esignStatus];
                  const days = daysRemaining(lease.endDate);
                  const daysColor = days <= 30 ? RED : days <= 90 ? BUTTER : GREEN;
                  return (
                    <tr
                      key={lease.id}
                      className="transition-colors"
                      style={{ borderBottom: `1px solid ${HAIRLINE}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CREAM)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium" style={{ fontFamily: 'var(--font-inter)', color: INK }}>
                          {lease.tenant}
                        </p>
                        <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-inter)', color: DIM }}>
                          {lease.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>{lease.property}</p>
                        <p className="text-xs" style={{ fontFamily: 'var(--font-geist-mono)', color: DIM }}>{lease.unit}</p>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                        {lease.startDate}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-inter)', color: MID }}>
                        {lease.endDate}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>
                        ${lease.monthlyRent.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>
                        ${lease.deposit.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ fontFamily: 'var(--font-geist-mono)', color: MID }}>
                        ${lease.lateFee}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: es.bg, color: es.color, fontFamily: 'var(--font-inter)' }}
                        >
                          {es.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-sm font-medium"
                          style={{ fontFamily: 'var(--font-geist-mono)', color: daysColor }}
                        >
                          {days > 0 ? days : 'Expired'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {(lease.esignStatus === 'draft' || lease.esignStatus === 'sent') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={sendingId === lease.id}
                            onClick={() => handleSendForSignature(lease.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              backgroundColor: lease.esignStatus === 'draft' ? `${BUTTER}30` : '#3B82F612',
                              color: lease.esignStatus === 'draft' ? INK : '#2563EB',
                              border: 'none',
                              cursor: sendingId === lease.id ? 'not-allowed' : 'pointer',
                              opacity: sendingId === lease.id ? 0.5 : 1,
                            }}
                          >
                            {sendingId === lease.id
                              ? 'Sending...'
                              : lease.esignStatus === 'draft'
                                ? 'Send for Signature'
                                : 'Resend'}
                          </motion.button>
                        )}
                        {lease.esignStatus === 'signed' && (
                          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: GREEN }}>
                            Signed
                          </span>
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
