'use client';

import { useMemo, useState } from 'react';

type PaymentStatus = 'current' | 'late' | 'partial' | 'delinquent';
type Sentiment = 'positive' | 'neutral' | 'tense' | 'distressed';

type Tenant = {
  id: string;
  name: string;
  unit: string;
  property: string;
  rent: number;
  leaseStart: string;
  leaseEnd: string;
  paymentStatus: PaymentStatus;
  lastPaymentDate: string;
  riskScore: number;
  sentiment: Sentiment;
  email: string;
  phone: string;
  movedIn: string;
};

type CommLog = {
  id: string;
  tenantId: string;
  channel: 'email' | 'sms' | 'call' | 'in-person';
  date: string;
  summary: string;
};

type MaintenanceTicket = {
  id: string;
  tenantId: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  title: string;
};

const MOCK_TENANTS: Tenant[] = [
  { id: 't1',  name: 'Maya Hernandez',   unit: 'A-204', property: 'Villa Sonoma',     rent: 2850, leaseStart: '2024-06-01', leaseEnd: '2026-05-31', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 8,  sentiment: 'positive',  email: 'maya.h@example.com',   phone: '(619) 555-0181', movedIn: '2024-06-01' },
  { id: 't2',  name: 'James Okafor',      unit: 'B-112', property: 'Villa Sonoma',     rent: 3100, leaseStart: '2025-01-15', leaseEnd: '2026-07-14', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 14, sentiment: 'neutral',   email: 'jokafor@example.com',  phone: '(619) 555-0192', movedIn: '2025-01-15' },
  { id: 't3',  name: 'Priya Kapoor',      unit: 'C-301', property: 'Mission Bay Lofts', rent: 3650, leaseStart: '2024-09-01', leaseEnd: '2026-08-31', paymentStatus: 'partial',    lastPaymentDate: '2026-05-04', riskScore: 62, sentiment: 'tense',     email: 'priya.k@example.com',  phone: '(858) 555-0143', movedIn: '2024-09-01' },
  { id: 't4',  name: 'Marcus Reynolds',   unit: 'D-105', property: 'North Park Row',    rent: 2400, leaseStart: '2023-11-01', leaseEnd: '2026-06-30', paymentStatus: 'late',       lastPaymentDate: '2026-04-12', riskScore: 78, sentiment: 'distressed',email: 'mreynolds@example.com',phone: '(619) 555-0167', movedIn: '2023-11-01' },
  { id: 't5',  name: 'Sasha Mendoza',     unit: 'E-208', property: 'North Park Row',    rent: 2600, leaseStart: '2024-12-01', leaseEnd: '2026-11-30', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 22, sentiment: 'positive',  email: 'smendoza@example.com', phone: '(619) 555-0114', movedIn: '2024-12-01' },
  { id: 't6',  name: 'Daniel Park',       unit: 'F-410', property: 'Mission Bay Lofts', rent: 3950, leaseStart: '2024-03-15', leaseEnd: '2026-09-14', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 11, sentiment: 'positive',  email: 'dpark@example.com',    phone: '(858) 555-0102', movedIn: '2024-03-15' },
  { id: 't7',  name: 'Aaliyah Brooks',    unit: 'G-102', property: 'Villa Sonoma',     rent: 2750, leaseStart: '2024-08-01', leaseEnd: '2026-07-31', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 31, sentiment: 'neutral',   email: 'abrooks@example.com',  phone: '(619) 555-0177', movedIn: '2024-08-01' },
  { id: 't8',  name: "Liam O'Sullivan",   unit: 'H-307', property: 'North Park Row',    rent: 2550, leaseStart: '2024-05-01', leaseEnd: '2026-12-31', paymentStatus: 'delinquent', lastPaymentDate: '2026-03-15', riskScore: 91, sentiment: 'distressed',email: 'liam.os@example.com',  phone: '(619) 555-0188', movedIn: '2024-05-01' },
  { id: 't9',  name: 'Yuki Tanaka',       unit: 'I-201', property: 'Mission Bay Lofts', rent: 3400, leaseStart: '2025-02-01', leaseEnd: '2027-01-31', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 5,  sentiment: 'positive',  email: 'ytanaka@example.com',  phone: '(858) 555-0156', movedIn: '2025-02-01' },
  { id: 't10', name: 'Camille Dubois',    unit: 'J-115', property: 'Villa Sonoma',     rent: 2900, leaseStart: '2024-10-15', leaseEnd: '2026-10-14', paymentStatus: 'current',    lastPaymentDate: '2026-05-01', riskScore: 18, sentiment: 'neutral',   email: 'cdubois@example.com',  phone: '(619) 555-0123', movedIn: '2024-10-15' },
];

const MOCK_COMMS: CommLog[] = [
  { id: 'c1', tenantId: 't4', channel: 'email',     date: '2026-05-08', summary: 'Requested 7-day extension on May rent; cited car repair.' },
  { id: 'c2', tenantId: 't4', channel: 'call',      date: '2026-04-28', summary: 'Discussed late fee policy; tenant frustrated.' },
  { id: 'c3', tenantId: 't4', channel: 'sms',       date: '2026-04-10', summary: 'Auto-reminder sent for April rent.' },
  { id: 'c4', tenantId: 't8', channel: 'email',     date: '2026-04-30', summary: 'Final notice issued before legal proceedings.' },
  { id: 'c5', tenantId: 't8', channel: 'in-person', date: '2026-04-20', summary: 'Tenant did not show for scheduled meeting.' },
  { id: 'c6', tenantId: 't3', channel: 'sms',       date: '2026-05-05', summary: 'Confirmed partial payment received; balance of $1,200 due 5/15.' },
  { id: 'c7', tenantId: 't1', channel: 'email',     date: '2026-04-22', summary: 'Renewal discussion — interested at current rate.' },
];

const MOCK_TICKETS: MaintenanceTicket[] = [
  { id: 'm1', tenantId: 't4', status: 'open',        date: '2026-05-06', title: 'Garbage disposal jammed' },
  { id: 'm2', tenantId: 't3', status: 'in_progress', date: '2026-05-02', title: 'Bedroom outlet sparking' },
  { id: 'm3', tenantId: 't1', status: 'resolved',    date: '2026-04-18', title: 'Replaced bathroom fan' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(a + 'T00:00:00').getTime() - new Date(b + 'T00:00:00').getTime()) / 86400000);

const todayISO = '2026-05-11';

export default function TenantManagementPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'rent' | 'leaseEnd' | 'name'>('risk');

  const selectedTenant = MOCK_TENANTS.find((t) => t.id === selectedId) ?? null;

  const totalRent = MOCK_TENANTS.reduce((s, t) => s + t.rent, 0);
  const collected = MOCK_TENANTS.filter((t) => t.paymentStatus === 'current').reduce((s, t) => s + t.rent, 0);
  const atRisk = MOCK_TENANTS.filter((t) => t.riskScore >= 60).length;
  const expiringSoon = MOCK_TENANTS.filter((t) => {
    const d = daysBetween(t.leaseEnd, todayISO);
    return d >= 0 && d <= 90;
  }).length;

  const buckets = useMemo(() => {
    const b30: Tenant[] = [];
    const b60: Tenant[] = [];
    const b90: Tenant[] = [];
    MOCK_TENANTS.forEach((t) => {
      const d = daysBetween(t.leaseEnd, todayISO);
      if (d >= 0 && d <= 30) b30.push(t);
      else if (d <= 60) b60.push(t);
      else if (d <= 90) b90.push(t);
    });
    return { b30, b60, b90 };
  }, []);

  const rows = useMemo(() => {
    let r = [...MOCK_TENANTS];
    if (statusFilter !== 'all') r = r.filter((t) => t.paymentStatus === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.unit.toLowerCase().includes(q) ||
          t.property.toLowerCase().includes(q),
      );
    }
    r.sort((a, b) => {
      switch (sortBy) {
        case 'risk':     return b.riskScore - a.riskScore;
        case 'rent':     return b.rent - a.rent;
        case 'leaseEnd': return new Date(a.leaseEnd).getTime() - new Date(b.leaseEnd).getTime();
        case 'name':     return a.name.localeCompare(b.name);
      }
    });
    return r;
  }, [search, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-neutral-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">Management · Tenants</p>
              <h1 className="text-4xl tracking-tight text-neutral-900 sm:text-5xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>
                Tenant <em className="italic">Roll</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                {MOCK_TENANTS.length} active tenants across {new Set(MOCK_TENANTS.map((t) => t.property)).size} properties.
                Sorted by AI risk score so the people who need you most are at the top.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">Export</button>
              <button className="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-neutral-900 transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>+ Add Tenant</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Monthly billed"    value={fmtMoney(totalRent)} />
            <Kpi label="On-time collected" value={fmtMoney(collected)} hint={`${Math.round((collected / totalRent) * 100)}% of billed`} />
            <Kpi label="At-risk tenants"   value={String(atRisk)} hint="Risk score >= 60" accent />
            <Kpi label="Leases expiring"   value={String(expiringSoon)} hint="Next 90 days" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <section className="mb-12">
          <h2 className="mb-1 text-2xl tracking-tight text-neutral-900" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>
            Lease <em className="italic">pipeline</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em] text-neutral-500">What&apos;s coming up. Renew now — don&apos;t scramble later.</p>
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            <PipelineBucket title="In 30 days" tenants={buckets.b30} urgency="high" onSelect={setSelectedId} />
            <PipelineBucket title="In 60 days" tenants={buckets.b60} urgency="med"  onSelect={setSelectedId} />
            <PipelineBucket title="In 90 days" tenants={buckets.b90} urgency="low"  onSelect={setSelectedId} />
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight text-neutral-900" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>
                Rent <em className="italic">roll</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">{rows.length} tenants · click any row for full detail</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, unit, property..." className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none sm:w-64" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none">
                <option value="all">All payments</option>
                <option value="current">Current</option>
                <option value="partial">Partial</option>
                <option value="late">Late</option>
                <option value="delinquent">Delinquent</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 focus:border-neutral-900 focus:outline-none">
                <option value="risk">Sort: Risk</option>
                <option value="rent">Sort: Rent</option>
                <option value="leaseEnd">Sort: Lease end</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  <th className="px-4 py-3 font-medium">Tenant</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Rent</th>
                  <th className="px-4 py-3 font-medium">Lease ends</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} onClick={() => setSelectedId(t.id)} className="cursor-pointer border-b border-neutral-100 transition-colors last:border-0 hover:bg-[#FDF8E8]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{t.name}</div>
                      <div className="text-xs text-neutral-500">{t.property}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{t.unit}</td>
                    <td className="px-4 py-3 text-neutral-700">{fmtMoney(t.rent)}</td>
                    <td className="px-4 py-3 text-neutral-700">
                      {fmtDate(t.leaseEnd)}
                      <div className="text-xs text-neutral-500">{daysBetween(t.leaseEnd, todayISO)} days</div>
                    </td>
                    <td className="px-4 py-3"><PaymentPill status={t.paymentStatus} /></td>
                    <td className="px-4 py-3"><RiskBar score={t.riskScore} /></td>
                    <td className="px-4 py-3"><SentimentDot sentiment={t.sentiment} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((t) => (
              <button key={t.id} onClick={() => setSelectedId(t.id)} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 text-left transition-colors active:bg-[#FDF8E8]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-neutral-900">{t.name}</div>
                    <div className="truncate text-xs text-neutral-500">{t.unit} · {t.property}</div>
                  </div>
                  <PaymentPill status={t.paymentStatus} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-neutral-600">{fmtMoney(t.rent)} / mo · ends {fmtDate(t.leaseEnd)}</div>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500">Risk</span>
                    <RiskBar score={t.riskScore} />
                  </div>
                  <SentimentDot sentiment={t.sentiment} />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {selectedTenant && (
        <TenantDrawer tenant={selectedTenant} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : '#E5E5E5' }}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl text-neutral-900 sm:text-3xl" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </div>
  );
}

function PipelineBucket({ title, tenants, urgency, onSelect }: { title: string; tenants: Tenant[]; urgency: 'high' | 'med' | 'low'; onSelect: (id: string) => void; }) {
  const ring = urgency === 'high' ? 'border-l-2 border-l-[#F9D96A]' : urgency === 'med' ? 'border-l-2 border-l-neutral-400' : 'border-l-2 border-l-neutral-200';
  return (
    <div className={`rounded-lg border border-neutral-200 bg-white p-4 ${ring}`}>
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">{title}</div>
        <div className="text-xs text-neutral-400">{tenants.length}</div>
      </div>
      <div className="mt-3 space-y-2">
        {tenants.length === 0 && (
          <div className="text-sm italic text-neutral-400" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Nothing here. Quiet is good.</div>
        )}
        {tenants.map((t) => (
          <button key={t.id} onClick={() => onSelect(t.id)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-[#FDF8E8]">
            <span className="truncate font-medium text-neutral-900">{t.name}</span>
            <span className="ml-2 shrink-0 text-xs text-neutral-500">{t.unit}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; cls: string }> = {
    current:    { label: 'Current',    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    partial:    { label: 'Partial',    cls: 'bg-amber-50 text-amber-800 border-amber-200' },
    late:       { label: 'Late',       cls: 'bg-orange-50 text-orange-800 border-orange-200' },
    delinquent: { label: 'Delinquent', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  };
  const m = map[status];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>{m.label}</span>;
}

function RiskBar({ score }: { score: number }) {
  const color = score >= 70 ? '#B91C1C' : score >= 40 ? '#D97706' : '#15803D';
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-neutral-700">{score}</span>
    </div>
  );
}

function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const map: Record<Sentiment, { label: string; color: string }> = {
    positive:   { label: 'Positive',   color: '#15803D' },
    neutral:    { label: 'Neutral',    color: '#737373' },
    tense:      { label: 'Tense',      color: '#D97706' },
    distressed: { label: 'Distressed', color: '#B91C1C' },
  };
  const m = map[sentiment];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-neutral-700">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

function TenantDrawer({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const comms = MOCK_COMMS.filter((c) => c.tenantId === tenant.id);
  const tickets = MOCK_TICKETS.filter((m) => m.tenantId === tenant.id);

  return (
    <div className="fixed inset-0 z-50 flex" aria-modal role="dialog">
      <div className="flex-1 bg-neutral-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} aria-label="Close panel" />
      <aside className="flex h-full w-full flex-col overflow-y-auto bg-white shadow-2xl sm:w-[480px]">
        <div className="border-b border-neutral-200 bg-[#FAFAF7] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">Tenant</div>
              <h3 className="mt-1 text-3xl text-neutral-900" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>{tenant.name}</h3>
              <div className="mt-1 text-sm text-neutral-600">{tenant.unit} · {tenant.property}</div>
            </div>
            <button onClick={onClose} className="rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:border-neutral-900" aria-label="Close">Close</button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <DrawerField label="Rent"          value={`${fmtMoney(tenant.rent)} / mo`} />
            <DrawerField label="Payment"       value={<PaymentPill status={tenant.paymentStatus} />} />
            <DrawerField label="Moved in"      value={fmtDate(tenant.movedIn)} />
            <DrawerField label="Lease ends"    value={`${fmtDate(tenant.leaseEnd)} (${daysBetween(tenant.leaseEnd, todayISO)} days)`} />
            <DrawerField label="Email"         value={<a href={`mailto:${tenant.email}`} className="text-neutral-900 underline-offset-2 hover:underline">{tenant.email}</a>} />
            <DrawerField label="Phone"         value={tenant.phone} />
          </div>

          <div className="mt-5 rounded-md border p-4" style={{ borderColor: '#F9D96A', backgroundColor: '#FEF9E1' }}>
            <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-neutral-700">Casa Intelligence</div>
            <div className="text-sm text-neutral-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {tenant.riskScore >= 70 && (<>High churn risk. Last 3 communications trended <em className="italic">{tenant.sentiment}</em>. Recommend a direct phone call this week, not email.</>)}
              {tenant.riskScore >= 40 && tenant.riskScore < 70 && (<>Moderate risk. Watch lease end at {fmtDate(tenant.leaseEnd)}. A renewal offer 60 days out usually retains this profile.</>)}
              {tenant.riskScore < 40 && (<>Low risk. Long-term retain. Worth pre-emptive renewal 90 days out at current rate.</>)}
            </div>
          </div>
        </div>

        <div className="border-b border-neutral-200 p-6">
          <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Quick actions</div>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction>Send rent reminder</QuickAction>
            <QuickAction>Log a payment</QuickAction>
            <QuickAction>Send notice</QuickAction>
            <QuickAction>Schedule renewal call</QuickAction>
          </div>
        </div>

        <div className="border-b border-neutral-200 p-6">
          <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Communication log</div>
          {comms.length === 0 ? (
            <div className="text-sm italic text-neutral-400" style={{ fontFamily: 'Cormorant Garamond, serif' }}>No recent communication.</div>
          ) : (
            <ul className="space-y-3">
              {comms.map((c) => (
                <li key={c.id} className="flex gap-3 text-sm">
                  <div className="flex w-16 shrink-0 flex-col items-start">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{c.channel}</span>
                    <span className="text-xs text-neutral-700">{fmtDate(c.date)}</span>
                  </div>
                  <div className="flex-1 text-neutral-700">{c.summary}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6">
          <div className="mb-3 text-[10px] uppercase tracking-[0.18em] text-neutral-500">Maintenance history</div>
          {tickets.length === 0 ? (
            <div className="text-sm italic text-neutral-400" style={{ fontFamily: 'Cormorant Garamond, serif' }}>No tickets.</div>
          ) : (
            <ul className="space-y-2">
              {tickets.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium text-neutral-900">{m.title}</div>
                    <div className="text-xs text-neutral-500">{fmtDate(m.date)}</div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${m.status === 'open' ? 'bg-rose-50 text-rose-800' : m.status === 'in_progress' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function DrawerField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">{label}</div>
      <div className="mt-0.5 text-neutral-900">{value}</div>
    </div>
  );
}

function QuickAction({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900">
      {children}
    </button>
  );
}
