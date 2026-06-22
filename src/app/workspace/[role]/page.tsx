"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Wrench,
} from "lucide-react";

const INK = "#111111";
const HAIRLINE = "rgba(17,17,17,0.08)";
const BUTTER = "#F9D96A";
const BUTTER_SOFT = "rgba(249,217,106,0.10)";
const DIM = "rgba(17,17,17,0.45)";
const MID = "rgba(17,17,17,0.65)";
const SOFT_HOVER = "rgba(17,17,17,0.035)";
const RED = "#B91C1C";
const GREEN = "#15803D";

const KPI_DATA = {
  properties: { value: 12, delta: 0, hint: "Across San Diego County" },
  occupancy: { value: 94.2, delta: 1.8, hint: "Of 187 units" },
  monthlyRent: { value: 487400, delta: 3.2, hint: "Billed this month" },
  atRisk: { value: 6, delta: -2, hint: "Tenants with risk score >= 60" },
};

const OCCUPANCY_TREND = [88, 89, 90, 91, 91, 92, 92, 93, 93, 94, 94, 94.2];
const RENT_TREND = [451, 459, 463, 468, 472, 475, 478, 481, 483, 485, 486, 487.4];
const MAINTENANCE_TREND = [22, 18, 19, 25, 21, 17, 19, 16, 14, 17, 15, 13];
const APPLICATIONS_TREND = [8, 12, 14, 11, 16, 19, 17, 22, 20, 24, 23, 27];

type ActivityItem = {
  id: string;
  type: "payment" | "maintenance" | "lease" | "communication" | "alert";
  title: string;
  detail: string;
  time: string;
  urgent?: boolean;
};

const ACTIVITY: ActivityItem[] = [
  { id: "a1", type: "alert",         title: "Liam O\u2019Sullivan - delinquent",  detail: "Unit H-307 - North Park Row - 56 days past due",         time: "8m",  urgent: true },
  { id: "a2", type: "payment",       title: "Marcus Reynolds - partial",     detail: "$1,200 of $2,400 received - 28 days late",                 time: "23m" },
  { id: "a3", type: "maintenance",   title: "Bedroom outlet sparking",       detail: "Priya Kapoor - Unit C-301 - Mission Bay Lofts",            time: "1h",  urgent: true },
  { id: "a4", type: "lease",         title: "Renewal - Maya Hernandez",      detail: "Lease ends May 31 - proposed +4% renewal",                  time: "2h" },
  { id: "a5", type: "payment",       title: "Daniel Park - paid in full",    detail: "$3,950 - Unit F-410 - Mission Bay Lofts",                   time: "3h" },
  { id: "a6", type: "communication", title: "Yuki Tanaka - move-in question",detail: "Lease document clarification request",                     time: "5h" },
  { id: "a7", type: "maintenance",   title: "Garbage disposal - resolved",   detail: "Reynolds unit - vendor invoice $185",                       time: "8h" },
];

type Priority = {
  id: string;
  label: string;
  detail: string;
  due: string;
};

const PRIORITIES: Priority[] = [
  { id: "p1", label: "Send notice to Liam O\u2019Sullivan",  detail: "Day 56 of delinquency - legal threshold approaching", due: "Today" },
  { id: "p2", label: "Approve Reynolds payment plan",   detail: "Tenant proposed 90-day catch-up",                     due: "Today" },
  { id: "p3", label: "Schedule HVAC at Villa Sonoma",   detail: "Quarterly preventive - 18 units",                     due: "Tomorrow" },
  { id: "p4", label: "Renew Hernandez lease",           detail: "30-day window opens - low risk profile",              due: "This week" },
];

const fmtMoneyShort = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
};

function Sparkline({
  data,
  color = INK,
  width = 80,
  height = 22,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="1.25" points={points} />
    </svg>
  );
}

export default function ManagerDashboardPage() {
  const occupancyUp = OCCUPANCY_TREND[OCCUPANCY_TREND.length - 1] >= OCCUPANCY_TREND[0];
  const rentUp = RENT_TREND[RENT_TREND.length - 1] >= RENT_TREND[0];
  const maintenanceDown = MAINTENANCE_TREND[MAINTENANCE_TREND.length - 1] <= MAINTENANCE_TREND[0];
  const appsUp = APPLICATIONS_TREND[APPLICATIONS_TREND.length - 1] >= APPLICATIONS_TREND[0];

  return (
    <div className="px-6 py-8 lg:px-10">
      <header className="mb-8">
        <div className="text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
          MANAGER &middot; DASHBOARD
        </div>
        <h1 className="mt-2 text-5xl tracking-tight" style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: INK }}>
          The <em className="italic" style={{ color: MID }}>desk</em>.
        </h1>
        <p className="mt-2 max-w-xl text-sm" style={{ color: MID, fontFamily: "var(--font-inter)" }}>
          What needs your attention today. Tenants at risk, leases on the horizon, and the quiet portfolio health beneath it all.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-px overflow-hidden border md:grid-cols-4" style={{ borderColor: HAIRLINE, backgroundColor: HAIRLINE }}>
        <Kpi icon={Building2}   label="Properties"      value={String(KPI_DATA.properties.value)} hint={KPI_DATA.properties.hint} delta={KPI_DATA.properties.delta} trend={OCCUPANCY_TREND}   trendColor={INK} />
        <Kpi icon={Users}       label="Occupancy"       value={`${KPI_DATA.occupancy.value}%`}    hint={KPI_DATA.occupancy.hint}  delta={KPI_DATA.occupancy.delta}  trend={OCCUPANCY_TREND}   trendColor={occupancyUp ? GREEN : RED} />
        <Kpi icon={DollarSign}  label="Monthly Rent"    value={fmtMoneyShort(KPI_DATA.monthlyRent.value)} hint={KPI_DATA.monthlyRent.hint} delta={KPI_DATA.monthlyRent.delta} trend={RENT_TREND} trendColor={rentUp ? GREEN : RED} accent />
        <Kpi icon={AlertCircle} label="At-Risk Tenants" value={String(KPI_DATA.atRisk.value)}     hint={KPI_DATA.atRisk.hint}     delta={KPI_DATA.atRisk.delta} deltaInverted trend={MAINTENANCE_TREND} trendColor={maintenanceDown ? GREEN : RED} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden border bg-white" style={{ borderColor: HAIRLINE }}>
          <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: HAIRLINE }}>
            <div className="text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
              RECENT ACTIVITY
            </div>
            <Link href="/workspace/manager/tenants" className="flex items-center gap-1 text-[10px] tracking-[0.16em]" style={{ fontFamily: "var(--font-geist-mono)", color: INK }}>
              VIEW ALL
              <ArrowUpRight size={11} strokeWidth={1.75} />
            </Link>
          </div>
          <ul>
            {ACTIVITY.map((a, idx) => (
              <ActivityRow key={a.id} item={a} last={idx === ACTIVITY.length - 1} />
            ))}
          </ul>
        </div>

        <div className="overflow-hidden border bg-white" style={{ borderColor: HAIRLINE }}>
          <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: HAIRLINE }}>
            <div className="text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
              TODAY&apos;S PRIORITIES
            </div>
            <span className="text-[10px] tabular-nums" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
              {String(PRIORITIES.length).padStart(2, "0")}
            </span>
          </div>
          <ul>
            {PRIORITIES.map((p, idx) => (
              <PriorityRow key={p.id} item={p} last={idx === PRIORITIES.length - 1} />
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
          PORTFOLIO PULSE &middot; LAST 12 MONTHS
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden border md:grid-cols-4" style={{ borderColor: HAIRLINE, backgroundColor: HAIRLINE }}>
          <MiniChart label="Occupancy"      latest={`${OCCUPANCY_TREND[OCCUPANCY_TREND.length-1]}%`}                data={OCCUPANCY_TREND}   color={occupancyUp ? GREEN : RED} />
          <MiniChart label="Rent Collected" latest={fmtMoneyShort(RENT_TREND[RENT_TREND.length-1] * 1000)}          data={RENT_TREND}        color={rentUp ? GREEN : RED} />
          <MiniChart label="Tickets Open"   latest={String(MAINTENANCE_TREND[MAINTENANCE_TREND.length-1])}          data={MAINTENANCE_TREND} color={maintenanceDown ? GREEN : RED} />
          <MiniChart label="Applications"   latest={String(APPLICATIONS_TREND[APPLICATIONS_TREND.length-1])}        data={APPLICATIONS_TREND} color={appsUp ? GREEN : RED} />
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between text-[10px] tracking-[0.18em]" style={{ color: DIM, fontFamily: "var(--font-geist-mono)" }}>
        <span>&#x2318;K to search &middot; &#x21B5; to open &middot; ESC to close</span>
        <span>CASA &middot; MANAGER &middot; v0.4</span>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  delta,
  deltaInverted,
  trend,
  trendColor,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  hint: string;
  delta: number;
  deltaInverted?: boolean;
  trend: number[];
  trendColor: string;
  accent?: boolean;
}) {
  const isPositive = deltaInverted ? delta < 0 : delta > 0;
  const isNegative = deltaInverted ? delta > 0 : delta < 0;
  const deltaColor = isPositive ? GREEN : isNegative ? RED : MID;
  const deltaSign = delta > 0 ? "+" : "";

  return (
    <div className="bg-white p-5" style={{ borderLeft: accent ? `2px solid ${BUTTER}` : undefined }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
            <Icon size={11} strokeWidth={1.5} />
            {label.toUpperCase()}
          </div>
          <div className="mt-2 text-3xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: INK }}>
            {value}
          </div>
        </div>
        <Sparkline data={trend} color={trendColor} width={56} height={20} />
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-[11px]" style={{ color: DIM }}>{hint}</div>
        {delta !== 0 && (
          <div className="text-[11px] font-medium tabular-nums" style={{ color: deltaColor, fontFamily: "var(--font-geist-mono)" }}>
            {deltaSign}{delta}{(label === "Occupancy" || label === "Monthly Rent") ? "%" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRow({ item, last }: { item: ActivityItem; last: boolean }) {
  const Icon =
    item.type === "payment"       ? DollarSign  :
    item.type === "maintenance"   ? Wrench      :
    item.type === "lease"         ? CheckCircle2:
    item.type === "communication" ? Users       :
                                    AlertCircle;
  const iconColor = item.urgent ? RED : MID;

  return (
    <li>
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex items-start gap-4 px-5 py-3.5 transition-colors"
        style={{ borderBottom: last ? "none" : `1px solid ${HAIRLINE}`, backgroundColor: "transparent" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = SOFT_HOVER; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <Icon size={14} strokeWidth={1.5} style={{ color: iconColor, marginTop: 2 }} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px]" style={{ color: INK, fontFamily: "var(--font-inter)", fontWeight: item.urgent ? 500 : 400 }}>
              {item.title}
            </span>
            {item.urgent && (
              <span className="text-[9px] tracking-[0.14em] px-1.5" style={{ fontFamily: "var(--font-geist-mono)", color: INK, backgroundColor: BUTTER }}>
                URGENT
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[12px]" style={{ color: MID, fontFamily: "var(--font-inter)" }}>
            {item.detail}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Clock size={10} strokeWidth={1.5} style={{ color: DIM }} />
          <span className="text-[10px] tabular-nums" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
            {item.time}
          </span>
        </div>
      </motion.div>
    </li>
  );
}

function PriorityRow({ item, last }: { item: Priority; last: boolean }) {
  const dueColor = item.due === "Today" ? RED : item.due === "Tomorrow" ? "#D97706" : MID;
  return (
    <li>
      <motion.div
        whileHover={{ x: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="cursor-pointer px-5 py-3.5 transition-colors"
        style={{ borderBottom: last ? "none" : `1px solid ${HAIRLINE}`, backgroundColor: "transparent" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = BUTTER_SOFT; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px]" style={{ color: INK, fontFamily: "var(--font-inter)", fontWeight: 500 }}>
            {item.label}
          </span>
          <span className="shrink-0 text-[10px] tracking-[0.14em] tabular-nums" style={{ fontFamily: "var(--font-geist-mono)", color: dueColor }}>
            {item.due.toUpperCase()}
          </span>
        </div>
        <div className="mt-1 text-[12px]" style={{ color: MID, fontFamily: "var(--font-inter)" }}>
          {item.detail}
        </div>
      </motion.div>
    </li>
  );
}

function MiniChart({
  label,
  latest,
  data,
  color,
}: {
  label: string;
  latest: string;
  data: number[];
  color: string;
}) {
  return (
    <div className="bg-white p-5">
      <div className="text-[10px] tracking-[0.22em]" style={{ fontFamily: "var(--font-geist-mono)", color: DIM }}>
        {label.toUpperCase()}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 500, color: INK }}>
          {latest}
        </div>
        <Sparkline data={data} color={color} width={84} height={28} />
      </div>
    </div>
  );
}
