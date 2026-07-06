'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ── Design tokens ── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ── */
type AppType = 'Site Plan' | 'CUP' | 'Variance' | 'Rezoning';
type AppStatus = 'Submitted' | 'Under Review' | 'Hearing Scheduled' | 'Approved' | 'Continued' | 'Denied';

type PermitApplication = {
  id: string;
  project: string;
  jurisdiction: string;
  type: AppType;
  submittedDate: string;
  nextHearingDate: string;
  status: AppStatus;
  plannerName: string;
};

/* ── Mock data ── */
const MOCK_APPLICATIONS: PermitApplication[] = [
  { id: 'a1', project: 'Mission Valley Mixed',   jurisdiction: 'City of San Diego',     type: 'Site Plan',  submittedDate: '2025-11-14', nextHearingDate: '2026-04-22', status: 'Hearing Scheduled', plannerName: 'Lisa Chen' },
  { id: 'a2', project: 'East Village Parcel 9',  jurisdiction: 'City of San Diego',     type: 'CUP',        submittedDate: '2026-01-08', nextHearingDate: '2026-05-15', status: 'Under Review',     plannerName: 'Robert Avila' },
  { id: 'a3', project: 'Barrio Logan Studios',   jurisdiction: 'City of San Diego',     type: 'Variance',   submittedDate: '2025-09-22', nextHearingDate: '2026-04-18', status: 'Hearing Scheduled', plannerName: 'Karen Nakamura' },
  { id: 'a4', project: 'Pacific Beach Flats',    jurisdiction: 'City of San Diego',     type: 'Site Plan',  submittedDate: '2025-08-03', nextHearingDate: '2026-04-10', status: 'Hearing Scheduled', plannerName: 'David Morales' },
  { id: 'a5', project: 'Cortez Hill Tower',      jurisdiction: 'CCDC / City of SD',     type: 'Site Plan',  submittedDate: '2024-06-15', nextHearingDate: '2025-03-10', status: 'Approved',         plannerName: 'James Wheeler' },
  { id: 'a6', project: 'North Park Row',         jurisdiction: 'City of San Diego',     type: 'CUP',        submittedDate: '2024-02-20', nextHearingDate: '2024-09-18', status: 'Approved',         plannerName: 'Patricia Lam' },
  { id: 'a7', project: 'Mission Valley Mixed',   jurisdiction: 'Caltrans District 11', type: 'Rezoning',   submittedDate: '2026-02-01', nextHearingDate: '2026-06-20', status: 'Submitted',        plannerName: 'Steven Ruiz' },
  { id: 'a8', project: 'East Village Parcel 9',  jurisdiction: 'City of San Diego',     type: 'Variance',   submittedDate: '2026-01-15', nextHearingDate: '2026-04-30', status: 'Continued',        plannerName: 'Monica Tran' },
];

const todayISO = '2026-04-09';

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime()) / 86400000);

const STATUS_STYLES: Record<AppStatus, { bg: string; text: string }> = {
  'Submitted':         { bg: '#F3F4F6', text: '#374151' },
  'Under Review':      { bg: '#FEF3C7', text: '#92400E' },
  'Hearing Scheduled': { bg: '#DBEAFE', text: '#1E40AF' },
  'Approved':          { bg: '#D1FAE5', text: '#065F46' },
  'Continued':         { bg: '#FEE2E2', text: '#991B1B' },
  'Denied':            { bg: '#FEE2E2', text: '#991B1B' },
};

const TYPE_STYLES: Record<AppType, { bg: string; text: string }> = {
  'Site Plan': { bg: '#EDE9FE', text: '#5B21B6' },
  'CUP':       { bg: '#FCE7F3', text: '#9D174D' },
  'Variance':  { bg: '#FEF3C7', text: '#92400E' },
  'Rezoning':  { bg: '#CCFBF1', text: '#115E59' },
};

export default function EntitlementTrackerPage() {
  const [showForm, setShowForm] = useState(false);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppStatus>('all');

  const [formData, setFormData] = useState({
    project: '', jurisdiction: '', type: 'Site Plan' as AppType,
    submittedDate: '', nextHearingDate: '', plannerName: '',
  });

  const pending = applications.filter(a => !['Approved', 'Denied'].includes(a.status)).length;
  const hearingSoon = applications.filter(a => {
    const d = daysBetween(a.nextHearingDate, todayISO);
    return d >= 0 && d <= 30 && !['Approved', 'Denied'].includes(a.status);
  }).length;
  const approved = applications.filter(a => a.status === 'Approved').length;

  const rows = useMemo(() => {
    let r = [...applications];
    if (statusFilter !== 'all') r = r.filter(a => a.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(a => a.project.toLowerCase().includes(q) || a.jurisdiction.toLowerCase().includes(q) || a.plannerName.toLowerCase().includes(q));
    }
    r.sort((a, b) => new Date(a.nextHearingDate).getTime() - new Date(b.nextHearingDate).getTime());
    return r;
  }, [applications, search, statusFilter]);

  const handleAdd = () => {
    if (!formData.project || !formData.jurisdiction) return;
    setApplications(prev => [...prev, {
      id: `a${Date.now()}`,
      project: formData.project,
      jurisdiction: formData.jurisdiction,
      type: formData.type,
      submittedDate: formData.submittedDate || todayISO,
      nextHearingDate: formData.nextHearingDate || todayISO,
      status: 'Submitted' as AppStatus,
      plannerName: formData.plannerName,
    }]);
    setFormData({ project: '', jurisdiction: '', type: 'Site Plan', submittedDate: '', nextHearingDate: '', plannerName: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)', color: INK }}>
      {/* ── Header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Permits</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Entitlement <em className="italic">Tracker</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                Monitor every land-use application from submittal to approval. Never miss a hearing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-neutral-900" style={{ borderColor: HAIRLINE, color: MID }}>Export</button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(!showForm)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>+ Add Application</motion.button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Total applications" value={String(applications.length)} />
            <Kpi label="Pending" value={String(pending)} />
            <Kpi label="Hearings in 30 days" value={String(hearingSoon)} accent />
            <Kpi label="Approved" value={String(approved)} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ── Add Form ── */}
        {showForm && (
          <section className="mb-8 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <h2 className="mb-4 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>New <em className="italic">Application</em></h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TextInput label="Project" value={formData.project} onChange={v => setFormData(d => ({ ...d, project: v }))} />
              <TextInput label="Jurisdiction" value={formData.jurisdiction} onChange={v => setFormData(d => ({ ...d, jurisdiction: v }))} />
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Type</label>
                <select value={formData.type} onChange={e => setFormData(d => ({ ...d, type: e.target.value as AppType }))} className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE }}>
                  {(['Site Plan', 'CUP', 'Variance', 'Rezoning'] as AppType[]).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <TextInput label="Submitted date" value={formData.submittedDate} onChange={v => setFormData(d => ({ ...d, submittedDate: v }))} placeholder="YYYY-MM-DD" />
              <TextInput label="Next hearing date" value={formData.nextHearingDate} onChange={v => setFormData(d => ({ ...d, nextHearingDate: v }))} placeholder="YYYY-MM-DD" />
              <TextInput label="Planner name" value={formData.plannerName} onChange={v => setFormData(d => ({ ...d, plannerName: v }))} />
            </div>
            <div className="mt-5 flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} className="rounded-md px-4 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Add Application</motion.button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-xs font-medium" style={{ borderColor: HAIRLINE, color: MID }}>Cancel</button>
            </div>
          </section>
        )}

        {/* ── Table ── */}
        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Application <em className="italic">Log</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{rows.length} applications &middot; sorted by next hearing</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project, jurisdiction..." className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none sm:w-64" style={{ borderColor: HAIRLINE }} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE, color: MID }}>
                <option value="all">All statuses</option>
                {(['Submitted', 'Under Review', 'Hearing Scheduled', 'Approved', 'Continued', 'Denied'] as AppStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Jurisdiction</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Next Hearing</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Planner</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(app => {
                  const daysToHearing = daysBetween(app.nextHearingDate, todayISO);
                  const isUrgent = daysToHearing >= 0 && daysToHearing <= 30 && !['Approved', 'Denied'].includes(app.status);
                  const ss = STATUS_STYLES[app.status];
                  const ts = TYPE_STYLES[app.type];

                  return (
                    <motion.tr key={app.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                      <td className="px-4 py-3 font-medium" style={{ color: INK }}>{app.project}</td>
                      <td className="px-4 py-3" style={{ color: MID }}>{app.jurisdiction}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ts.bg, color: ts.text }}>{app.type}</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(app.submittedDate)}</td>
                      <td className="px-4 py-3">
                        <div className="tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: INK }}>{fmtDate(app.nextHearingDate)}</div>
                        <div className="text-xs tabular-nums" style={{ color: daysToHearing <= 7 ? RED : DIM, fontFamily: 'var(--font-geist-mono)' }}>{daysToHearing >= 0 ? `${daysToHearing}d away` : `${Math.abs(daysToHearing)}d ago`}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ss.bg, color: ss.text }}>{app.status}</span>
                          {isUrgent && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: '#FEE2E2', color: RED }}>Urgent</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ color: MID }}>{app.plannerName}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {rows.map(app => {
              const daysToHearing = daysBetween(app.nextHearingDate, todayISO);
              const isUrgent = daysToHearing >= 0 && daysToHearing <= 30 && !['Approved', 'Denied'].includes(app.status);
              const ss = STATUS_STYLES[app.status];
              const ts = TYPE_STYLES[app.type];

              return (
                <div key={app.id} className="rounded-lg border bg-white p-4" style={{ borderColor: isUrgent ? RED : HAIRLINE }}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium" style={{ color: INK }}>{app.project}</div>
                      <div className="text-xs" style={{ color: DIM }}>{app.jurisdiction}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ts.bg, color: ts.text }}>{app.type}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span style={{ color: MID }}>Hearing: {fmtDate(app.nextHearingDate)}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: ss.bg, color: ss.text }}>{app.status}</span>
                      {isUrgent && <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ backgroundColor: '#FEE2E2', color: RED }}>Urgent</span>}
                    </div>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: DIM }}>Planner: {app.plannerName}</div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none" style={{ borderColor: HAIRLINE }} />
    </div>
  );
}
