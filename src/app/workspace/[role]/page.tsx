"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Layers3,
  MapPin,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import {
  PageTitle,
  Card,
  DarkStatCard,
  KpiCard,
  ListContainer,
  ListHeader,
  ListRow,
  IconChip,
  PillButton,
  StatusDot,
  StaggerIn,
  SectionLabel,
  YellowBadge,
  T,
} from "@/components/ui/primitives";

/* ── Data ──────────────────────────────────────────────────────── */

const KPI_DATA = {
  properties: { value: 12, hint: "Across San Diego County" },
  occupancy: { value: "94.2%", hint: "Of 187 units" },
  monthlyRent: { value: "$487K", hint: "Billed this month" },
  atRisk: { value: 6, hint: "Risk score >= 60" },
};

const agents = [
  { name: "Market Pulse", status: "Scanning comps", icon: BarChart3 },
  { name: "Debt Stack", status: "Stress testing rates", icon: Layers3 },
  { name: "Zoning Watch", status: "Checking constraints", icon: MapPin },
  { name: "Risk Agent", status: "Flagging exposure", icon: ShieldAlert },
];

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

const OCCUPANCY_TREND = [88, 89, 90, 91, 91, 92, 92, 93, 93, 94, 94, 94.2];
const RENT_TREND = [451, 459, 463, 468, 472, 475, 478, 481, 483, 485, 486, 487.4];

const fmtMoneyShort = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n}`;
};

/* ── Helpers ───────────────────────────────────────────────────── */

function activityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "payment":       return DollarSign;
    case "maintenance":   return Wrench;
    case "lease":         return CheckCircle2;
    case "communication": return Users;
    default:              return AlertCircle;
  }
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ManagerDashboardPage() {
  return (
    <div className="min-h-screen px-5 py-8 lg:px-8" style={{ backgroundColor: T.cream, color: T.ink }}>

      {/* ── Title ────────────────────────────────────────────── */}
      <PageTitle
        eyebrow="CASA INTELLIGENCE"
        title={<>The <em className="italic text-stone-500">desk</em>.</>}
        subtitle="What needs your attention today. Tenants at risk, leases on the horizon, and the quiet portfolio health beneath it all."
      />

      {/* ── Hero + Dark stat ─────────────────────────────────── */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <StaggerIn index={0}>
          <Card>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <SectionLabel>Property Intelligence</SectionLabel>
                <h2
                  className="mt-4 max-w-2xl text-4xl leading-[0.95] tracking-tight text-stone-900 md:text-5xl"
                  style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
                >
                  Upload a property, activate the swarm, and see the truth.
                </h2>
              </div>
              <div className="hidden rounded-full bg-[#F9D96A] p-4 md:block">
                <Sparkles className="h-6 w-6 text-[#111111]" />
              </div>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-stone-600">
              CASA&apos;s AI agents scan market comps, debt structures, zoning risks, and insurance exposure to produce a clear Truth Score.
            </p>
            <div className="mt-8">
              <PillButton>
                Analyze a property <ChevronRight className="h-4 w-4" />
              </PillButton>
            </div>
          </Card>
        </StaggerIn>

        <StaggerIn index={1}>
          <DarkStatCard
            label="Portfolio NOI"
            value="$487K"
            progress={78}
            subtitle="Strong momentum across 12 properties. Occupancy trending up with minimal delinquency exposure."
            icon={<Zap className="h-5 w-5" style={{ color: T.yellow }} />}
          />
        </StaggerIn>
      </section>

      {/* ── KPI Row ──────────────────────────────────────────── */}
      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StaggerIn index={0}>
          <KpiCard label="Properties" value={KPI_DATA.properties.value} note={KPI_DATA.properties.hint} />
        </StaggerIn>
        <StaggerIn index={1}>
          <KpiCard label="Occupancy" value={KPI_DATA.occupancy.value} note={KPI_DATA.occupancy.hint} />
        </StaggerIn>
        <StaggerIn index={2}>
          <KpiCard label="Monthly Rent" value={KPI_DATA.monthlyRent.value} note={KPI_DATA.monthlyRent.hint} />
        </StaggerIn>
        <StaggerIn index={3}>
          <KpiCard label="At-Risk Tenants" value={KPI_DATA.atRisk.value} note={KPI_DATA.atRisk.hint} />
        </StaggerIn>
      </section>

      {/* ── Swarm + Chart ────────────────────────────────────── */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Swarm Activity */}
        <StaggerIn index={0}>
          <ListContainer>
            <ListHeader label="Swarm Activity" />
            <div className="space-y-2 px-4 pb-5">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <ListRow>
                      <div className="flex items-center gap-3">
                        <IconChip>
                          <Icon className="h-4 w-4 text-[#111111]" />
                        </IconChip>
                        <div>
                          <div className="text-sm font-medium text-[#111111]">{agent.name}</div>
                          <div className="text-xs text-stone-500">{agent.status}</div>
                        </div>
                      </div>
                      <StatusDot />
                    </ListRow>
                  </motion.div>
                );
              })}
            </div>
          </ListContainer>
        </StaggerIn>

        {/* Portfolio Intelligence */}
        <StaggerIn index={1}>
          <Card>
            <SectionLabel>Portfolio Intelligence</SectionLabel>
            <div className="mt-8 grid h-64 place-items-end rounded-[2rem] border border-stone-200 bg-[#FAFAF7] p-5">
              <div className="flex h-full w-full items-end gap-3">
                {[38, 52, 45, 66, 61, 72, 84, 78, 88].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: index * 0.04, duration: 0.8 }}
                    className="flex-1 rounded-t-2xl bg-[#111111]"
                  />
                ))}
              </div>
            </div>
          </Card>
        </StaggerIn>
      </section>

      {/* ── Activity + Priorities ─────────────────────────────── */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Recent Activity */}
        <StaggerIn index={0}>
          <ListContainer>
            <ListHeader
              label="Recent Activity"
              action={
                <Link
                  href="/workspace/manager/tenants"
                  className="flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-stone-500 hover:text-[#111111] transition-colors"
                >
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              }
            />
            <div className="space-y-2 px-4 pb-5">
              {ACTIVITY.map((item, idx) => {
                const Icon = activityIcon(item.type);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <ListRow last={idx === ACTIVITY.length - 1}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{ color: item.urgent ? T.red : T.mid }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-[#111111]">
                              {item.title}
                            </span>
                            {item.urgent && <YellowBadge>URGENT</YellowBadge>}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-stone-500">
                            {item.detail}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-stone-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] tabular-nums">{item.time}</span>
                      </div>
                    </ListRow>
                  </motion.div>
                );
              })}
            </div>
          </ListContainer>
        </StaggerIn>

        {/* Today's Priorities */}
        <StaggerIn index={1}>
          <ListContainer>
            <ListHeader
              label="Today's Priorities"
              action={
                <span className="text-[10px] tabular-nums text-stone-400">
                  {String(PRIORITIES.length).padStart(2, "0")}
                </span>
              }
            />
            <div className="space-y-2 px-4 pb-5">
              {PRIORITIES.map((p, idx) => {
                const dueColor = p.due === "Today" ? T.red : p.due === "Tomorrow" ? "#D97706" : T.mid;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                  >
                    <ListRow last={idx === PRIORITIES.length - 1}>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[#111111]">{p.label}</div>
                        <div className="mt-0.5 text-xs text-stone-500">{p.detail}</div>
                      </div>
                      <span
                        className="shrink-0 text-[10px] uppercase tracking-[0.14em] tabular-nums font-medium"
                        style={{ color: dueColor }}
                      >
                        {p.due}
                      </span>
                    </ListRow>
                  </motion.div>
                );
              })}
            </div>
          </ListContainer>
        </StaggerIn>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-between text-[10px] tracking-[0.18em] text-stone-400">
        <span>&#x2318;K to search &middot; &#x21B5; to open &middot; ESC to close</span>
        <span>CASA &middot; INTELLIGENCE &middot; v0.4</span>
      </div>
    </div>
  );
}
