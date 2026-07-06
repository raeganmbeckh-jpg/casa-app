'use client';

import { useMemo } from 'react';
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
type PhaseStatus = 'complete' | 'in_progress' | 'upcoming' | 'delayed';

type Phase = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  status: PhaseStatus;
  budget: number;
  spent: number;
  notes: string;
};

/* ── Mock data ─────────────────────────────────────────────── */
const PROJECT = {
  name: 'The Villas at Del Mar Heights',
  address: '13300 Del Mar Heights Rd, San Diego, CA 92130',
  type: '24-Unit Luxury Townhome Development',
  totalBudget: 12800000,
};

const PHASES: Phase[] = [
  { id: 'ph1', name: 'Site Preparation',   startDate: '2025-09-01', endDate: '2025-11-15', percentComplete: 100, status: 'complete',    budget: 680000,   spent: 645000,   notes: 'Grading and utilities stubbed.' },
  { id: 'ph2', name: 'Foundation',          startDate: '2025-11-16', endDate: '2026-02-28', percentComplete: 100, status: 'complete',    budget: 1450000,  spent: 1520000,  notes: 'Post-tension slab. Ran $70K over due to soil remediation.' },
  { id: 'ph3', name: 'Framing',             startDate: '2026-03-01', endDate: '2026-06-15', percentComplete: 72,  status: 'in_progress', budget: 2100000,  spent: 1490000,  notes: 'Buildings A-C framed. Building D starts next week.' },
  { id: 'ph4', name: 'MEP Rough-in',        startDate: '2026-04-15', endDate: '2026-08-30', percentComplete: 35,  status: 'in_progress', budget: 2400000,  spent: 810000,   notes: 'Electrical and plumbing rough-in concurrent with framing.' },
  { id: 'ph5', name: 'Drywall & Insulation',startDate: '2026-07-01', endDate: '2026-09-30', percentComplete: 0,   status: 'upcoming',    budget: 1200000,  spent: 0,        notes: 'Scheduled to begin after MEP inspection sign-off.' },
  { id: 'ph6', name: 'Finishes',            startDate: '2026-09-15', endDate: '2026-12-31', percentComplete: 0,   status: 'upcoming',    budget: 2800000,  spent: 0,        notes: 'Tile, cabinetry, countertops, paint, fixtures.' },
  { id: 'ph7', name: 'Landscaping',         startDate: '2026-11-01', endDate: '2027-01-31', percentComplete: 0,   status: 'upcoming',    budget: 950000,   spent: 0,        notes: 'Drought-tolerant native planting per HOA spec.' },
  { id: 'ph8', name: 'Punch List & CO',     startDate: '2027-01-15', endDate: '2027-03-15', percentComplete: 0,   status: 'upcoming',    budget: 220000,   spent: 0,        notes: 'Final inspections and certificate of occupancy.' },
];

const TODAY = '2026-04-09';

/* ── Helpers ───────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime()) / 86400000);

const statusColors: Record<PhaseStatus, { bg: string; text: string; bar: string }> = {
  complete:    { bg: '#F0FDF4', text: GREEN,    bar: GREEN },
  in_progress: { bg: '#FFFBEB', text: '#D97706', bar: BUTTER },
  upcoming:    { bg: '#F5F5F5', text: DIM,       bar: '#D4D4D4' },
  delayed:     { bg: '#FEF2F2', text: RED,       bar: RED },
};

/* ── Page ──────────────────────────────────────────────────── */
export default function ConstructionSchedulePage() {
  const overallPct = useMemo(() => {
    const totalWeight = PHASES.reduce((s, p) => s + p.budget, 0);
    const weightedPct = PHASES.reduce((s, p) => s + (p.percentComplete / 100) * p.budget, 0);
    return Math.round((weightedPct / totalWeight) * 100);
  }, []);

  const totalSpent = PHASES.reduce((s, p) => s + p.spent, 0);
  const activePhases = PHASES.filter((p) => p.status === 'in_progress').length;
  const lastPhaseEnd = PHASES[PHASES.length - 1].endDate;
  const daysRemaining = daysBetween(lastPhaseEnd, TODAY);

  // Calculate timeline bounds for Gantt
  const timelineStart = PHASES[0].startDate;
  const timelineEnd = lastPhaseEnd;
  const totalDays = daysBetween(timelineEnd, timelineStart);

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Construction</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Construction <em className="italic">Schedule</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                {PROJECT.name} &mdash; {PROJECT.type}. {PROJECT.address}.
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Export Schedule</motion.button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Overall complete" value={`${overallPct}%`} accent />
            <Kpi label="Days remaining" value={String(daysRemaining)} hint={`Target: ${fmtDate(lastPhaseEnd)}, 2027`} />
            <Kpi label="Budget spent" value={fmtMoney(totalSpent)} hint={`of ${fmtMoney(PROJECT.totalBudget)} (${Math.round((totalSpent / PROJECT.totalBudget) * 100)}%)`} />
            <Kpi label="Active phases" value={String(activePhases)} hint={`of ${PHASES.length} total`} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Gantt-style timeline */}
        <section className="mb-12">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Project <em className="italic">timeline</em>
          </h2>
          <p className="mb-6 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Gantt view &middot; {fmtDate(timelineStart)} 2025 &ndash; {fmtDate(timelineEnd)} 2027</p>

          <div className="space-y-3">
            {PHASES.map((phase) => {
              const sc = statusColors[phase.status];
              const phaseStart = daysBetween(phase.startDate, timelineStart);
              const phaseDuration = daysBetween(phase.endDate, phase.startDate);
              const leftPct = (phaseStart / totalDays) * 100;
              const widthPct = (phaseDuration / totalDays) * 100;

              return (
                <motion.div
                  key={phase.id}
                  whileHover={{ y: -1, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                  className="rounded-lg border bg-white p-4"
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 sm:w-48 shrink-0">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {phase.status.replace('_', ' ')}
                      </span>
                      <span className="font-medium text-sm" style={{ color: INK }}>{phase.name}</span>
                    </div>

                    {/* Gantt bar */}
                    <div className="flex-1 min-w-0">
                      <div className="relative h-6 w-full rounded-full bg-neutral-50 overflow-hidden">
                        {/* Phase bar */}
                        <div
                          className="absolute top-0 h-full rounded-full flex items-center justify-center"
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            backgroundColor: sc.bar,
                            opacity: phase.status === 'upcoming' ? 0.3 : 0.8,
                          }}
                        >
                          {widthPct > 8 && (
                            <span className="text-[10px] font-medium" style={{ color: phase.status === 'upcoming' ? DIM : 'white' }}>
                              {phase.percentComplete}%
                            </span>
                          )}
                        </div>
                        {/* Progress overlay */}
                        {phase.percentComplete > 0 && phase.percentComplete < 100 && (
                          <div
                            className="absolute top-0 h-full rounded-l-full"
                            style={{
                              left: `${leftPct}%`,
                              width: `${(widthPct * phase.percentComplete) / 100}%`,
                              backgroundColor: sc.bar,
                              opacity: 1,
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-xs" style={{ color: DIM }}>
                      <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(phase.startDate)} &ndash; {fmtDate(phase.endDate)}</span>
                      <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(phase.spent)}/{fmtMoney(phase.budget)}</span>
                    </div>
                  </div>

                  {phase.notes && (
                    <div className="mt-2 text-xs" style={{ color: MID }}>{phase.notes}</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Budget breakdown */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Budget <em className="italic">breakdown</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>Spent vs. budgeted by phase</p>

          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: HAIRLINE }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: HAIRLINE, color: DIM, backgroundColor: CREAM }}>
                  <th className="px-4 py-3 font-medium">Phase</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Spent</th>
                  <th className="px-4 py-3 font-medium">Variance</th>
                  <th className="px-4 py-3 font-medium">% Complete</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {PHASES.map((p) => {
                  const variance = p.budget - p.spent;
                  const sc = statusColors[p.status];
                  return (
                    <motion.tr key={p.id} whileHover={{ backgroundColor: '#FDF8E8' }} className="border-b last:border-0" style={{ borderColor: HAIRLINE }}>
                      <td className="px-4 py-3 font-medium" style={{ color: INK }}>{p.name}</td>
                      <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.budget)}</td>
                      <td className="px-4 py-3" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(p.spent)}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: variance >= 0 ? GREEN : RED, fontFamily: 'var(--font-geist-mono)' }}>
                        {variance >= 0 ? '+' : ''}{fmtMoney(variance)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p.percentComplete}%`, backgroundColor: sc.bar }} />
                          </div>
                          <span className="text-xs" style={{ color: MID, fontFamily: 'var(--font-geist-mono)' }}>{p.percentComplete}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
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
