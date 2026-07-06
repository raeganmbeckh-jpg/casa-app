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
type Phase = 'Entitlement' | 'Design' | 'Construction' | 'Closeout';

type Project = {
  id: string;
  name: string;
  address: string;
  phase: Phase;
  pctComplete: number;
  budget: number;
  sqft: number;
  nextMilestone: string;
  nextMilestoneDate: string;
};

/* ── Mock data ── */
const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Cortez Hill Tower',      address: '1455 2nd Ave, San Diego',      phase: 'Construction',  pctComplete: 62, budget: 48_500_000, sqft: 185_000, nextMilestone: 'Structural top-out',     nextMilestoneDate: '2026-06-15' },
  { id: 'p2', name: 'Mission Valley Mixed',   address: '790 Camino de la Reina, SD',   phase: 'Entitlement',   pctComplete: 18, budget: 72_000_000, sqft: 310_000, nextMilestone: 'Planning Commission',    nextMilestoneDate: '2026-05-02' },
  { id: 'p3', name: 'Barrio Logan Studios',   address: '2100 Newton Ave, San Diego',   phase: 'Design',        pctComplete: 35, budget: 14_200_000, sqft: 42_000,  nextMilestone: 'DD submittal',           nextMilestoneDate: '2026-05-20' },
  { id: 'p4', name: 'North Park Row',         address: '3880 30th St, San Diego',      phase: 'Closeout',      pctComplete: 94, budget: 22_800_000, sqft: 68_000,  nextMilestone: 'Final CO',               nextMilestoneDate: '2026-04-28' },
  { id: 'p5', name: 'Pacific Beach Flats',    address: '1225 Garnet Ave, San Diego',   phase: 'Construction',  pctComplete: 41, budget: 31_600_000, sqft: 96_000,  nextMilestone: 'Podium pour',            nextMilestoneDate: '2026-05-10' },
  { id: 'p6', name: 'East Village Parcel 9',  address: '1345 F St, San Diego',         phase: 'Design',        pctComplete: 22, budget: 56_000_000, sqft: 220_000, nextMilestone: 'SD package review',      nextMilestoneDate: '2026-06-01' },
];

const todayISO = '2026-04-09';

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtNumber = (n: number) => n.toLocaleString('en-US');

const daysUntil = (iso: string) =>
  Math.max(0, Math.round((new Date(iso + 'T00:00:00').getTime() - new Date(todayISO + 'T00:00:00').getTime()) / 86400000));

const PHASE_COLORS: Record<Phase, { bg: string; text: string }> = {
  Entitlement:  { bg: '#FEF3C7', text: '#92400E' },
  Design:       { bg: '#DBEAFE', text: '#1E40AF' },
  Construction: { bg: '#D1FAE5', text: '#065F46' },
  Closeout:     { bg: '#F3E8FF', text: '#6B21A8' },
};

export default function ProjectPipelinePage() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [formData, setFormData] = useState({ name: '', address: '', phase: 'Entitlement' as Phase, budget: '', sqft: '', nextMilestone: '', nextMilestoneDate: '' });

  /* KPIs */
  const activeProjects = projects.length;
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const underConstructionSqft = projects.filter(p => p.phase === 'Construction').reduce((s, p) => s + p.sqft, 0);
  const avgCompletion = Math.round(projects.reduce((s, p) => s + p.pctComplete, 0) / projects.length);

  const handleAdd = () => {
    if (!formData.name || !formData.address) return;
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: formData.name,
      address: formData.address,
      phase: formData.phase,
      pctComplete: 0,
      budget: Number(formData.budget) || 0,
      sqft: Number(formData.sqft) || 0,
      nextMilestone: formData.nextMilestone,
      nextMilestoneDate: formData.nextMilestoneDate || todayISO,
    };
    setProjects(prev => [...prev, newProject]);
    setFormData({ name: '', address: '', phase: 'Entitlement', budget: '', sqft: '', nextMilestone: '', nextMilestoneDate: '' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen text-[var(--color-ink)]" style={{ backgroundColor: CREAM, fontFamily: 'var(--font-inter)' }}>
      {/* ── Header ── */}
      <header className="border-b bg-white" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Developer &middot; Projects</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
                Project <em className="italic">Pipeline</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
                {activeProjects} active developments across San Diego. Track every phase from entitlement through closeout.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-neutral-900" style={{ borderColor: HAIRLINE, color: MID }}>Export</button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(!showForm)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>+ Add Project</motion.button>
            </div>
          </div>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Active projects" value={String(activeProjects)} />
            <Kpi label="Total budget" value={fmtMoney(totalBudget)} />
            <Kpi label="Under construction" value={`${fmtNumber(underConstructionSqft)} sf`} />
            <Kpi label="Avg completion" value={`${avgCompletion}%`} accent />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* ── Add Form ── */}
        {showForm && (
          <section className="mb-8 rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <h2 className="mb-4 text-xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>New <em className="italic">Project</em></h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Input label="Project name" value={formData.name} onChange={v => setFormData(d => ({ ...d, name: v }))} />
              <Input label="Address" value={formData.address} onChange={v => setFormData(d => ({ ...d, address: v }))} />
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Phase</label>
                <select value={formData.phase} onChange={e => setFormData(d => ({ ...d, phase: e.target.value as Phase }))} className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none" style={{ borderColor: HAIRLINE }}>
                  {(['Entitlement', 'Design', 'Construction', 'Closeout'] as Phase[]).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input label="Budget ($)" value={formData.budget} onChange={v => setFormData(d => ({ ...d, budget: v }))} />
              <Input label="Square footage" value={formData.sqft} onChange={v => setFormData(d => ({ ...d, sqft: v }))} />
              <Input label="Next milestone" value={formData.nextMilestone} onChange={v => setFormData(d => ({ ...d, nextMilestone: v }))} />
              <Input label="Milestone date" value={formData.nextMilestoneDate} onChange={v => setFormData(d => ({ ...d, nextMilestoneDate: v }))} placeholder="YYYY-MM-DD" />
            </div>
            <div className="mt-5 flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} className="rounded-md px-4 py-2 text-xs font-medium" style={{ backgroundColor: BUTTER, color: INK }}>Add Project</motion.button>
              <button onClick={() => setShowForm(false)} className="rounded-md border px-4 py-2 text-xs font-medium" style={{ borderColor: HAIRLINE, color: MID }}>Cancel</button>
            </div>
          </section>
        )}

        {/* ── Project cards ── */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Active <em className="italic">developments</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{projects.length} projects &middot; sorted by completion</p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...projects].sort((a, b) => b.pctComplete - a.pctComplete).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Components ── */

function ProjectCard({ project }: { project: Project }) {
  const pc = PHASE_COLORS[project.phase];
  const days = daysUntil(project.nextMilestoneDate);
  const barColor = project.pctComplete >= 75 ? GREEN : project.pctComplete >= 40 ? '#D97706' : INK;

  return (
    <motion.div whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }} className="flex flex-col rounded-lg border bg-white p-5" style={{ borderColor: HAIRLINE }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{project.name}</h3>
          <p className="mt-0.5 truncate text-xs" style={{ color: DIM }}>{project.address}</p>
        </div>
        <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: pc.bg, color: pc.text }}>{project.phase}</span>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Completion</span>
          <span className="text-sm font-medium tabular-nums" style={{ color: INK, fontFamily: 'var(--font-geist-mono)' }}>{project.pctComplete}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${project.pctComplete}%`, backgroundColor: barColor }} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4" style={{ borderColor: HAIRLINE }}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Budget</div>
          <div className="mt-0.5 text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtMoney(project.budget)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Area</div>
          <div className="mt-0.5 text-sm font-medium tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtNumber(project.sqft)} sf</div>
        </div>
      </div>

      {/* Next milestone */}
      <div className="mt-3 rounded-md p-3" style={{ backgroundColor: CREAM }}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: MID }}>{project.nextMilestone}</span>
          <span className="text-xs font-medium tabular-nums" style={{ color: days <= 14 ? RED : INK, fontFamily: 'var(--font-geist-mono)' }}>{days}d</span>
        </div>
      </div>
    </motion.div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none" style={{ borderColor: HAIRLINE }} />
    </div>
  );
}
