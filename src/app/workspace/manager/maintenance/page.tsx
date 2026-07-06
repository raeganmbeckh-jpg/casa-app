'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Priority = 'emergency' | 'high' | 'medium' | 'low';
type TicketStatus = 'open' | 'in_progress' | 'resolved';

type WorkOrder = {
  id: string;
  title: string;
  property: string;
  unit: string;
  priority: Priority;
  status: TicketStatus;
  vendor: string;
  cost: number;
  dateCreated: string;
  dateResolved: string | null;
  description: string;
};

const MOCK_ORDERS: WorkOrder[] = [
  { id: 'wo1',  title: 'Water heater failure',        property: '4821 Voltaire St',  unit: 'A-204', priority: 'emergency', status: 'open',        vendor: 'SD Plumbing Pros',      cost: 2800,  dateCreated: '2026-04-07', dateResolved: null,         description: 'No hot water in building. Tank unit leaking from bottom.' },
  { id: 'wo2',  title: 'Roof leak — unit B-112',      property: '4821 Voltaire St',  unit: 'B-112', priority: 'high',      status: 'in_progress', vendor: 'Pacific Roofing Co.',    cost: 4500,  dateCreated: '2026-04-02', dateResolved: null,         description: 'Water intrusion during rain. Ceiling stain growing.' },
  { id: 'wo3',  title: 'HVAC compressor down',        property: '1530 Front St',     unit: 'Suite 200', priority: 'high', status: 'open',        vendor: 'Cool Air SD',           cost: 3200,  dateCreated: '2026-04-06', dateResolved: null,         description: 'Commercial tenant reports no cooling. Compressor not engaging.' },
  { id: 'wo4',  title: 'Garbage disposal replacement', property: '3742 Park Blvd',   unit: 'C-301', priority: 'medium',    status: 'in_progress', vendor: 'HandyPro Services',     cost: 350,   dateCreated: '2026-03-28', dateResolved: null,         description: 'Disposal jammed and motor burnt out. Needs full replacement.' },
  { id: 'wo5',  title: 'Exterior paint touch-up',     property: '735 W Laurel St',   unit: 'Common', priority: 'low',     status: 'open',        vendor: 'Coastal Painters',      cost: 1800,  dateCreated: '2026-03-15', dateResolved: null,         description: 'Peeling paint on south-facing exterior. HOA notice received.' },
  { id: 'wo6',  title: 'Broken window latch',          property: '915 Turquoise St', unit: 'Unit 1', priority: 'medium',   status: 'resolved',    vendor: 'HandyPro Services',     cost: 175,   dateCreated: '2026-03-10', dateResolved: '2026-03-14', description: 'Window won\'t lock properly. Security concern.' },
  { id: 'wo7',  title: 'Elevator inspection',          property: '2280 Kettner Blvd', unit: 'Common', priority: 'high',    status: 'resolved',    vendor: 'ThyssenKrupp Elevator', cost: 2200,  dateCreated: '2026-02-20', dateResolved: '2026-03-05', description: 'Annual state-required elevator inspection and certification.' },
  { id: 'wo8',  title: 'Parking lot repaving',         property: '4490 30th St',     unit: 'Common', priority: 'low',      status: 'open',        vendor: 'Metro Paving',          cost: 8500,  dateCreated: '2026-03-20', dateResolved: null,         description: 'Potholes and cracks in rear parking lot. Trip hazard.' },
  { id: 'wo9',  title: 'Smoke detector battery swap',  property: '3742 Park Blvd',   unit: 'All',    priority: 'medium',   status: 'resolved',    vendor: 'In-house',              cost: 120,   dateCreated: '2026-03-01', dateResolved: '2026-03-03', description: 'Annual battery replacement for all units.' },
  { id: 'wo10', title: 'Gas line leak detection',      property: '4821 Voltaire St', unit: 'B-112',  priority: 'emergency', status: 'resolved',   vendor: 'SDG&E Emergency',       cost: 0,     dateCreated: '2026-02-15', dateResolved: '2026-02-15', description: 'Tenant reported gas smell. SDG&E dispatched immediately.' },
  { id: 'wo11', title: 'Pool pump motor replacement',  property: '2280 Kettner Blvd', unit: 'Common', priority: 'medium',  status: 'in_progress', vendor: 'Blue Wave Pool Svc',    cost: 1400,  dateCreated: '2026-04-01', dateResolved: null,         description: 'Pool pump making grinding noise. Motor bearing failure.' },
  { id: 'wo12', title: 'Electrical outlet sparking',   property: '3742 Park Blvd',   unit: 'D-105',  priority: 'emergency', status: 'in_progress', vendor: 'Bright Spark Electric', cost: 600,   dateCreated: '2026-04-08', dateResolved: null,         description: 'Bedroom outlet producing sparks when used. Immediate fire risk.' },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const priorityConfig: Record<Priority, { label: string; cls: string }> = {
  emergency: { label: 'Emergency', cls: 'bg-rose-50 text-[#B91C1C] border-rose-200' },
  high:      { label: 'High',      cls: 'bg-orange-50 text-orange-800 border-orange-200' },
  medium:    { label: 'Medium',    cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  low:       { label: 'Low',       cls: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
};

const statusConfig: Record<TicketStatus, { label: string; cls: string }> = {
  open:        { label: 'Open',        cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  in_progress: { label: 'In Progress', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  resolved:    { label: 'Resolved',    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [showForm, setShowForm] = useState(false);

  const openTickets = MOCK_ORDERS.filter((o) => o.status !== 'resolved').length;
  const resolvedOrders = MOCK_ORDERS.filter((o) => o.dateResolved);
  const avgResolution = resolvedOrders.length > 0
    ? Math.round(resolvedOrders.reduce((s, o) => {
        const days = Math.round((new Date(o.dateResolved! + 'T00:00:00').getTime() - new Date(o.dateCreated + 'T00:00:00').getTime()) / 86400000);
        return s + days;
      }, 0) / resolvedOrders.length)
    : 0;
  const monthlySpend = MOCK_ORDERS.filter((o) => o.dateCreated >= '2026-04-01').reduce((s, o) => s + o.cost, 0);
  const emergencyCount = MOCK_ORDERS.filter((o) => o.priority === 'emergency' && o.status !== 'resolved').length;

  const rows = useMemo(() => {
    let r = [...MOCK_ORDERS];
    if (statusFilter !== 'all') r = r.filter((o) => o.status === statusFilter);
    if (priorityFilter !== 'all') r = r.filter((o) => o.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.property.toLowerCase().includes(q) ||
          o.vendor.toLowerCase().includes(q),
      );
    }
    const priorityOrder: Record<Priority, number> = { emergency: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<TicketStatus, number> = { open: 0, in_progress: 1, resolved: 2 };
    r.sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || priorityOrder[a.priority] - priorityOrder[b.priority]);
    return r;
  }, [search, statusFilter, priorityFilter]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Manager &middot; Maintenance</p>
              <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Work <em className="italic">Orders</em>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
                {MOCK_ORDERS.length} total work orders. {openTickets} open tickets requiring attention across {new Set(MOCK_ORDERS.map((o) => o.property)).size} properties.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md border bg-white px-3 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Export</button>
              <button onClick={() => setShowForm(!showForm)} className="rounded-md border border-transparent px-3 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>+ New Work Order</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Open tickets" value={String(openTickets)} hint={`${MOCK_ORDERS.filter((o) => o.status === 'in_progress').length} in progress`} accent />
            <Kpi label="Avg resolution" value={`${avgResolution} days`} hint="Across resolved tickets" />
            <Kpi label="Monthly spend" value={fmtMoney(monthlySpend)} hint="April 2026" />
            <Kpi label="Emergencies" value={String(emergencyCount)} hint="Active emergency tickets" accent={emergencyCount > 0} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {showForm && (
          <section className="mb-8">
            <div className="rounded-lg border bg-white p-6" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
              <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                New <em className="italic">Work Order</em>
              </h2>
              <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Create a maintenance request</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FormField label="Title" placeholder="Water heater failure" />
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Property</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option>4821 Voltaire St</option>
                    <option>1530 Front St</option>
                    <option>3742 Park Blvd</option>
                    <option>915 Turquoise St</option>
                    <option>2280 Kettner Blvd</option>
                    <option>735 W Laurel St</option>
                    <option>4490 30th St</option>
                  </select>
                </div>
                <FormField label="Unit" placeholder="A-204" />
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Priority</label>
                  <select className="w-full rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                    <option value="emergency">Emergency</option>
                    <option value="high">High</option>
                    <option value="medium" selected>Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <FormField label="Vendor" placeholder="SD Plumbing Pros" />
                <FormField label="Estimated Cost ($)" placeholder="2,500" type="number" />
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>Description</label>
                <textarea rows={3} placeholder="Describe the issue..." className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)' }} />
              </div>
              <div className="mt-5 flex gap-2">
                <button className="rounded-md border border-transparent px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:opacity-90" style={{ backgroundColor: '#F9D96A' }}>Submit Work Order</button>
                <button onClick={() => setShowForm(false)} className="rounded-md border bg-white px-4 py-2 text-xs font-medium transition-colors hover:border-[#111111]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>Cancel</button>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
                Ticket <em className="italic">Log</em>
              </h2>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{rows.length} work orders</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, property, vendor..."
                className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none sm:w-64"
                style={{ borderColor: 'rgba(17,17,17,0.08)' }}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="rounded-md border bg-white px-3 py-2 text-sm focus:border-[#111111] focus:outline-none" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}>
                <option value="all">All priorities</option>
                <option value="emergency">Emergency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-white md:block" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-neutral-50 text-left text-[11px] uppercase tracking-[0.14em]" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono)' }}>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Property</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium text-right">Cost</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const pc = priorityConfig[o.priority];
                  const sc = statusConfig[o.status];
                  return (
                    <motion.tr
                      key={o.id}
                      whileHover={{ backgroundColor: '#FDF8E8' }}
                      className="cursor-pointer border-b last:border-0"
                      style={{ borderColor: 'rgba(17,17,17,0.08)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#111111]">{o.title}</div>
                        <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{o.unit}</div>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{o.property}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${pc.cls}`}>{pc.label}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.cls}`}>{sc.label}</span></td>
                      <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>{o.vendor}</td>
                      <td className="px-4 py-3 text-right" style={{ fontFamily: 'var(--font-geist-mono)' }}>{o.cost > 0 ? fmtMoney(o.cost) : '--'}</td>
                      <td className="px-4 py-3" style={{ color: 'rgba(17,17,17,0.65)' }}>
                        {fmtDate(o.dateCreated)}
                        {o.dateResolved && <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>Closed {fmtDate(o.dateResolved)}</div>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((o) => {
              const pc = priorityConfig[o.priority];
              const sc = statusConfig[o.status];
              return (
                <div key={o.id} className="rounded-lg border bg-white p-4" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[#111111]">{o.title}</div>
                      <div className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{o.property} &middot; {o.unit}</div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${pc.cls}`}>{pc.label}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${sc.cls}`}>{sc.label}</span>
                    <span style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.65)' }}>{o.cost > 0 ? fmtMoney(o.cost) : '--'}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs" style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.45)' }}>
                    <span>{o.vendor}</span>
                    <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{fmtDate(o.dateCreated)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? '#F9D96A' : 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}

function FormField({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em]" style={{ fontFamily: 'var(--font-geist-mono)', color: 'rgba(17,17,17,0.45)' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-[#111111] focus:outline-none"
        style={{ borderColor: 'rgba(17,17,17,0.08)' }}
      />
    </div>
  );
}
