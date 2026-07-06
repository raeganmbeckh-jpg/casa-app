'use client';

import { motion } from 'framer-motion';

/* ── Design tokens ─────────────────────────────────────────────── */
const INK = '#111111';
const CREAM = '#FAFAF7';
const HAIRLINE = 'rgba(17,17,17,0.08)';
const BUTTER = '#F9D96A';
const DIM = 'rgba(17,17,17,0.45)';
const MID = 'rgba(17,17,17,0.65)';
const RED = '#B91C1C';
const GREEN = '#15803D';

/* ── Types ─────────────────────────────────────────────────────── */
type RiskLevel = 'clear' | 'caution' | 'high risk';

type RiskItem = {
  id: string;
  category: string;
  status: RiskLevel;
  description: string;
  source: string;
  lastChecked: string;
};

/* ── Mock data — San Diego parcels ─────────────────────────────── */
const MOCK_RISKS: RiskItem[] = [
  { id: 'r1', category: 'Flood Zone', status: 'clear', description: 'Parcel located in Zone X (minimal flood hazard). No FEMA-designated floodplain overlap.', source: 'FEMA NFHL Map Service', lastChecked: '2026-03-15' },
  { id: 'r2', category: 'Wildfire', status: 'caution', description: 'Moderate fire severity zone. Brush management required within 100 ft of structures. Cal Fire SRA designation.', source: 'CAL FIRE FHSZ Map', lastChecked: '2026-03-15' },
  { id: 'r3', category: 'Fault Zone', status: 'high risk', description: 'Parcel intersects Alquist-Priolo zone for the Rose Canyon fault. Geologic investigation required before development.', source: 'CGS Alquist-Priolo Map', lastChecked: '2026-03-12' },
  { id: 'r4', category: 'Wetlands', status: 'clear', description: 'No NWI-mapped wetlands or vernal pools identified. USACE jurisdictional determination not required.', source: 'USFWS NWI', lastChecked: '2026-02-28' },
  { id: 'r5', category: 'Soil Contamination', status: 'caution', description: 'Adjacent parcel (APN 362-041-08) listed on Cortese List as former gas station. Phase I ESA recommended.', source: 'DTSC EnviroStor', lastChecked: '2026-03-20' },
  { id: 'r6', category: 'Endangered Species', status: 'caution', description: 'Parcel within mapped habitat for California gnatcatcher (CAGN). MSCP coverage applies; 15% open space dedication may be required.', source: 'USFWS Critical Habitat', lastChecked: '2026-03-18' },
];

const overallScore = 62; // out of 100 (higher = more risk)

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const statusColor = (s: RiskLevel) => {
  if (s === 'clear') return GREEN;
  if (s === 'caution') return '#D97706';
  return RED;
};

const statusBg = (s: RiskLevel) => {
  if (s === 'clear') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === 'caution') return 'bg-amber-50 text-amber-800 border-amber-200';
  return 'bg-rose-50 text-rose-800 border-rose-200';
};

/* ── Page ──────────────────────────────────────────────────────── */
export default function EnvironmentalRiskPage() {
  const clearCount = MOCK_RISKS.filter((r) => r.status === 'clear').length;
  const cautionCount = MOCK_RISKS.filter((r) => r.status === 'caution').length;
  const highRiskCount = MOCK_RISKS.filter((r) => r.status === 'high risk').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, color: INK, fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${HAIRLINE}`, backgroundColor: '#fff' }}>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: DIM, fontFamily: 'var(--font-geist-mono)' }}>Land &middot; Risk</p>
          <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>
            Environmental &amp; Geotechnical <em className="italic">Risk</em>.
          </h1>
          <p className="mt-2 max-w-2xl text-sm" style={{ color: MID }}>
            Consolidated risk screening for San Diego parcels. Each factor sourced from authoritative public databases.
          </p>

          {/* KPIs */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Kpi label="Overall risk score" value={`${overallScore}/100`} accent />
            <Kpi label="Clear" value={String(clearCount)} hint="No action needed" />
            <Kpi label="Caution" value={String(cautionCount)} hint="Further study" />
            <Kpi label="High risk" value={String(highRiskCount)} hint="Investigation required" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {/* Risk gauge */}
        <section className="mb-10">
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Composite Risk <em className="italic">Gauge</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>APN 362-041-12 &middot; San Diego County</p>
          <div className="rounded-lg border bg-white p-6" style={{ borderColor: HAIRLINE }}>
            <div className="flex items-center gap-4">
              <div className="relative h-4 w-full overflow-hidden rounded-full" style={{ backgroundColor: HAIRLINE }}>
                <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${overallScore}%`, background: `linear-gradient(90deg, ${GREEN} 0%, #D97706 50%, ${RED} 100%)` }} />
              </div>
              <span className="shrink-0 text-2xl font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: overallScore >= 70 ? RED : overallScore >= 40 ? '#D97706' : GREEN }}>{overallScore}</span>
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM }}>
              <span>Low risk</span>
              <span>Moderate</span>
              <span>High risk</span>
            </div>
          </div>
        </section>

        {/* Risk cards */}
        <section>
          <h2 className="mb-1 text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500 }}>
            Risk <em className="italic">Factors</em>
          </h2>
          <p className="mb-5 text-xs uppercase tracking-[0.16em]" style={{ color: DIM }}>6 categories assessed</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_RISKS.map((r) => (
              <motion.div
                key={r.id}
                whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                className="rounded-lg border bg-white p-5"
                style={{ borderColor: HAIRLINE, borderLeftWidth: 3, borderLeftColor: statusColor(r.status) }}
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-medium" style={{ color: INK }}>{r.category}</h3>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusBg(r.status)}`}>{r.status}</span>
                </div>
                <p className="mt-3 text-sm" style={{ color: MID }}>{r.description}</p>
                <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]" style={{ color: DIM }}>
                  <span>{r.source}</span>
                  <span>{fmtDate(r.lastChecked)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ── Components ────────────────────────────────────────────────── */
function Kpi({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: accent ? BUTTER : HAIRLINE }}>
      <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: DIM }}>{label}</div>
      <div className="mt-2 text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 500, color: INK }}>{value}</div>
      {hint && <div className="mt-1 text-xs" style={{ color: DIM }}>{hint}</div>}
    </div>
  );
}
