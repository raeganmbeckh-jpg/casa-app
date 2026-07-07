"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PageTitle,
  Card,
  KpiCard,
  ListContainer,
  ListHeader,
  ListRow,
  PillButton,
  SectionLabel,
  StatusDot,
  StaggerIn,
  YellowBadge,
  T,
} from "@/components/ui/primitives";

/* ── Types ──────────────────────────────────────────────────────── */
type PaymentMethod = "card" | "ach";
type PaymentStatus = "paid" | "pending" | "failed" | "late";
type ConnectStatus = "none" | "pending" | "complete";
type CollectionStatus = "paid" | "pending" | "late";

type Payment = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl: string;
};

type UnitCard = {
  id: string;
  unit: string;
  tenant: string;
  property: string;
  rent: number;
  status: CollectionStatus;
};

/* ── Helpers ────────────────────────────────────────────────────── */
const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/* ── Mock data ──────────────────────────────────────────────────── */
const MOCK_PAYMENTS: Payment[] = [
  { id: "p1",  tenant: "Maya Hernandez",   property: "Villa Sonoma",      unit: "A-204", amount: 2850, date: "2026-04-01", method: "ach",  status: "paid",    receiptUrl: "#" },
  { id: "p2",  tenant: "James Okafor",     property: "Villa Sonoma",      unit: "B-112", amount: 3100, date: "2026-04-01", method: "card", status: "paid",    receiptUrl: "#" },
  { id: "p3",  tenant: "Priya Kapoor",     property: "Mission Bay Lofts", unit: "C-301", amount: 3650, date: "2026-04-04", method: "ach",  status: "pending", receiptUrl: "#" },
  { id: "p4",  tenant: "Marcus Reynolds",  property: "North Park Row",    unit: "D-105", amount: 2400, date: "2026-03-28", method: "card", status: "late",    receiptUrl: "#" },
  { id: "p5",  tenant: "Sasha Mendoza",    property: "North Park Row",    unit: "E-208", amount: 2600, date: "2026-04-01", method: "ach",  status: "paid",    receiptUrl: "#" },
  { id: "p6",  tenant: "Daniel Park",      property: "Mission Bay Lofts", unit: "F-410", amount: 3950, date: "2026-04-02", method: "ach",  status: "paid",    receiptUrl: "#" },
  { id: "p7",  tenant: "Aaliyah Brooks",   property: "Villa Sonoma",      unit: "G-102", amount: 2750, date: "2026-04-01", method: "card", status: "paid",    receiptUrl: "#" },
  { id: "p8",  tenant: "Liam O\u2019Sullivan",  property: "North Park Row",    unit: "H-307", amount: 2550, date: "2026-03-15", method: "ach",  status: "failed",  receiptUrl: "#" },
  { id: "p9",  tenant: "Yuki Tanaka",      property: "Mission Bay Lofts", unit: "I-201", amount: 3400, date: "2026-04-01", method: "ach",  status: "paid",    receiptUrl: "#" },
  { id: "p10", tenant: "Camille Dubois",   property: "Villa Sonoma",      unit: "J-115", amount: 2900, date: "2026-04-01", method: "card", status: "paid",    receiptUrl: "#" },
  { id: "p11", tenant: "Ethan Morales",    property: "North Park Row",    unit: "K-203", amount: 2350, date: "2026-04-05", method: "ach",  status: "pending", receiptUrl: "#" },
  { id: "p12", tenant: "Nina Volkov",      property: "Mission Bay Lofts", unit: "L-108", amount: 3200, date: "2026-04-01", method: "card", status: "paid",    receiptUrl: "#" },
];

const MOCK_UNITS: UnitCard[] = [
  { id: "u1",  unit: "A-204", tenant: "Maya Hernandez",  property: "Villa Sonoma",      rent: 2850, status: "paid" },
  { id: "u2",  unit: "B-112", tenant: "James Okafor",    property: "Villa Sonoma",      rent: 3100, status: "paid" },
  { id: "u3",  unit: "G-102", tenant: "Aaliyah Brooks",  property: "Villa Sonoma",      rent: 2750, status: "paid" },
  { id: "u4",  unit: "J-115", tenant: "Camille Dubois",  property: "Villa Sonoma",      rent: 2900, status: "paid" },
  { id: "u5",  unit: "M-310", tenant: "Aiko Sato",       property: "Villa Sonoma",      rent: 2700, status: "pending" },
  { id: "u6",  unit: "N-401", tenant: "Derek Kim",       property: "Villa Sonoma",      rent: 3050, status: "paid" },
  { id: "u7",  unit: "C-301", tenant: "Priya Kapoor",    property: "Mission Bay Lofts", rent: 3650, status: "pending" },
  { id: "u8",  unit: "F-410", tenant: "Daniel Park",     property: "Mission Bay Lofts", rent: 3950, status: "paid" },
  { id: "u9",  unit: "I-201", tenant: "Yuki Tanaka",     property: "Mission Bay Lofts", rent: 3400, status: "paid" },
  { id: "u10", unit: "L-108", tenant: "Nina Volkov",     property: "Mission Bay Lofts", rent: 3200, status: "paid" },
  { id: "u11", unit: "O-205", tenant: "Sam Reeves",      property: "Mission Bay Lofts", rent: 3550, status: "late" },
  { id: "u12", unit: "P-312", tenant: "Layla Farouk",    property: "Mission Bay Lofts", rent: 3800, status: "paid" },
  { id: "u13", unit: "D-105", tenant: "Marcus Reynolds", property: "North Park Row",    rent: 2400, status: "late" },
  { id: "u14", unit: "E-208", tenant: "Sasha Mendoza",   property: "North Park Row",    rent: 2600, status: "paid" },
  { id: "u15", unit: "H-307", tenant: "Liam O\u2019Sullivan", property: "North Park Row", rent: 2550, status: "late" },
  { id: "u16", unit: "K-203", tenant: "Ethan Morales",   property: "North Park Row",    rent: 2350, status: "pending" },
  { id: "u17", unit: "Q-104", tenant: "Jade Thompson",   property: "North Park Row",    rent: 2500, status: "paid" },
  { id: "u18", unit: "R-209", tenant: "Carlos Rivera",   property: "North Park Row",    rent: 2450, status: "paid" },
];

/* ── KPIs (derived) ─────────────────────────────────────────────── */
const collectedThisMonth = MOCK_PAYMENTS.filter((p) => p.status === "paid" && p.date.startsWith("2026-04")).reduce((s, p) => s + p.amount, 0);
const outstandingBalance = MOCK_PAYMENTS.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
const autopayPct = 72;
const lateCount = MOCK_UNITS.filter((u) => u.status === "late").length;

/* ── Active leases for rent collection ──────────────────────────── */
type ActiveLease = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  monthlyRent: number;
  paidThisMonth: boolean;
};

const MOCK_LEASES: ActiveLease[] = [
  { id: "l1", tenant: "Maya Hernandez",   property: "Villa Sonoma",      unit: "A-204", monthlyRent: 2850, paidThisMonth: true },
  { id: "l2", tenant: "James Okafor",     property: "Villa Sonoma",      unit: "B-112", monthlyRent: 3100, paidThisMonth: true },
  { id: "l3", tenant: "Priya Kapoor",     property: "Mission Bay Lofts", unit: "C-301", monthlyRent: 3650, paidThisMonth: false },
  { id: "l4", tenant: "Marcus Reynolds",  property: "North Park Row",    unit: "D-105", monthlyRent: 2400, paidThisMonth: false },
  { id: "l5", tenant: "Sasha Mendoza",    property: "North Park Row",    unit: "E-208", monthlyRent: 2600, paidThisMonth: true },
  { id: "l6", tenant: "Daniel Park",      property: "Mission Bay Lofts", unit: "F-410", monthlyRent: 3950, paidThisMonth: true },
  { id: "l7", tenant: "Aaliyah Brooks",   property: "Villa Sonoma",      unit: "G-102", monthlyRent: 2750, paidThisMonth: false },
  { id: "l8", tenant: "Liam O\u2019Sullivan", property: "North Park Row", unit: "H-307", monthlyRent: 2550, paidThisMonth: false },
];

const INITIAL_CONNECT: ConnectStatus = "none";

/* ── Status helpers ─────────────────────────────────────────────── */
function statusPillColor(status: PaymentStatus) {
  const map: Record<PaymentStatus, { bg: string; text: string }> = {
    paid:    { bg: "rgba(21,128,61,0.08)", text: T.green },
    pending: { bg: "rgba(217,119,6,0.08)", text: "#D97706" },
    failed:  { bg: "rgba(185,28,28,0.08)", text: T.red },
    late:    { bg: "rgba(185,28,28,0.08)", text: T.red },
  };
  return map[status];
}

function collectionDotColor(status: CollectionStatus) {
  if (status === "paid") return T.green;
  if (status === "pending") return "#D97706";
  return T.red;
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function PaymentsPage() {
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>(INITIAL_CONNECT);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [recordForm, setRecordForm] = useState({ tenant: "", amount: "", method: "ach" as PaymentMethod, date: "" });

  const properties = Array.from(new Set(MOCK_UNITS.map((u) => u.property)));

  const handleOnboard = async () => {
    setConnectLoading(true);
    setConnectError("");
    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setConnectError(data.error || "Failed to start onboarding. Check Stripe API key.");
    } catch {
      setConnectError("Network error — could not reach Stripe. Try again.");
    } finally {
      setConnectLoading(false);
    }
  };

  const handleCollectRent = async (lease: ActiveLease) => {
    setCollectingId(lease.id);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: lease.id,
          amount: lease.monthlyRent,
          type: "rent",
          tenantEmail: "",
          successUrl: window.location.href + "?payment=success",
          cancelUrl: window.location.href + "?payment=cancelled",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      console.error("Checkout failed");
    } finally {
      setCollectingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: T.cream, color: T.ink }}>

      {/* ── Header area ─────────────────────────────────────── */}
      <div className="px-5 py-8 lg:px-8">

        <PageTitle
          eyebrow="CASA INTELLIGENCE"
          title={<>Rent <em className="italic text-stone-500">collection</em>.</>}
          subtitle="Track every dollar across your portfolio. Stripe-powered payments, automatic late fees, and real-time collection status."
        />

        {/* ── Stripe Connect onboarding card ─────────────────── */}
        <StaggerIn index={0}>
          <Card className={connectStatus === "none" ? "border-[#F9D96A]/40" : ""}>
            {connectStatus === "none" && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#111111]">Enable rent collection</p>
                  <p className="mt-1 text-xs text-stone-500">
                    Connect a Stripe account to accept card and ACH payments from tenants. Test mode — no real charges.
                  </p>
                </div>
                <PillButton onClick={handleOnboard} disabled={connectLoading}>
                  {connectLoading ? "Redirecting to Stripe..." : "Enable rent collection"}
                </PillButton>
              </div>
            )}
            {connectStatus === "pending" && (
              <div className="flex items-center gap-3">
                <YellowBadge>Onboarding in progress</YellowBadge>
                <span className="text-xs text-stone-500">Complete your Stripe verification to start receiving payouts.</span>
              </div>
            )}
            {connectStatus === "complete" && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "rgba(21,128,61,0.08)", color: T.green }}>
                  Payouts enabled
                </span>
                <span className="text-xs text-stone-400">Connected</span>
              </div>
            )}
            {connectError && (
              <p className="mt-3 text-xs" style={{ color: T.red }}>{connectError}</p>
            )}
          </Card>
        </StaggerIn>

        {/* ── KPIs ───────────────────────────────────────────── */}
        <section className="mt-6 grid gap-5 grid-cols-2 sm:grid-cols-4">
          <StaggerIn index={0}>
            <KpiCard label="Collected this month" value={fmtMoney(collectedThisMonth)} />
          </StaggerIn>
          <StaggerIn index={1}>
            <KpiCard label="Outstanding balance" value={fmtMoney(outstandingBalance)} />
          </StaggerIn>
          <StaggerIn index={2}>
            <KpiCard label="Autopay enrolled" value={`${autopayPct}%`} note="13 of 18 tenants" />
          </StaggerIn>
          <StaggerIn index={3}>
            <KpiCard label="Late payments" value={String(lateCount)} note="Past grace period" />
          </StaggerIn>
        </section>

        {/* ── Collect Rent table ──────────────────────────────── */}
        <section className="mt-8">
          <div className="mb-4">
            <h2
              className="text-3xl tracking-tight text-stone-900"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
            >
              Collect <em className="italic text-stone-500">rent</em>
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
              {MOCK_LEASES.filter((l) => !l.paidThisMonth).length} unpaid &middot; {MOCK_LEASES.filter((l) => l.paidThisMonth).length} collected this month
            </p>
          </div>

          <ListContainer>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.18em] text-stone-400 border-b border-stone-200/50">
              <span>Tenant</span>
              <span>Property</span>
              <span>Unit</span>
              <span className="text-right">Rent</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-stone-200/30 px-4 py-3">
              {MOCK_LEASES.map((lease, idx) => (
                <motion.div
                  key={lease.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center rounded-3xl px-3 py-3 hover:bg-[#FAFAF7] transition-colors"
                >
                  <span className="text-sm font-medium text-[#111111]">{lease.tenant}</span>
                  <span className="text-sm text-stone-500 hidden md:block">{lease.property}</span>
                  <span className="text-xs text-stone-400 font-mono hidden md:block">{lease.unit}</span>
                  <span className="text-sm font-medium tabular-nums text-[#111111] text-right">{fmtMoney(lease.monthlyRent)}</span>
                  <span>
                    {lease.paidThisMonth ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "rgba(21,128,61,0.08)", color: T.green }}>
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: "rgba(185,28,28,0.08)", color: T.red }}>
                        Unpaid
                      </span>
                    )}
                  </span>
                  <span className="text-right">
                    {!lease.paidThisMonth && (
                      <PillButton
                        onClick={() => handleCollectRent(lease)}
                        disabled={collectingId === lease.id}
                        className="text-xs px-4 py-1.5"
                      >
                        {collectingId === lease.id ? "Opening..." : "Collect rent"}
                      </PillButton>
                    )}
                  </span>
                </motion.div>
              ))}
            </div>
          </ListContainer>
        </section>

        {/* ── Payment History ────────────────────────────────── */}
        <section className="mt-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="text-3xl tracking-tight text-stone-900"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
              >
                Payment <em className="italic text-stone-500">history</em>
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                {MOCK_PAYMENTS.length} transactions this cycle
              </p>
            </div>
            <PillButton variant="secondary" onClick={() => setShowRecordForm(!showRecordForm)}>
              {showRecordForm ? "Cancel" : "Record manual payment"}
            </PillButton>
          </div>

          {/* ── Record Payment form ──────────────────────────── */}
          <AnimatePresence>
            {showRecordForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <Card>
                  <p className="mb-4 text-sm font-medium text-[#111111]">Record a manual payment</p>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-stone-400">Tenant</label>
                      <select
                        value={recordForm.tenant}
                        onChange={(e) => setRecordForm({ ...recordForm, tenant: e.target.value })}
                        className="w-full rounded-2xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-[#111111] focus:outline-none"
                      >
                        <option value="">Select tenant...</option>
                        {MOCK_UNITS.map((u) => (
                          <option key={u.id} value={u.tenant}>{u.tenant} ({u.unit})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-stone-400">Amount</label>
                      <input
                        type="number"
                        value={recordForm.amount}
                        onChange={(e) => setRecordForm({ ...recordForm, amount: e.target.value })}
                        placeholder="0"
                        className="w-full rounded-2xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-[#111111] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-stone-400">Method</label>
                      <select
                        value={recordForm.method}
                        onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value as PaymentMethod })}
                        className="w-full rounded-2xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-[#111111] focus:outline-none"
                      >
                        <option value="ach">ACH</option>
                        <option value="card">Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-stone-400">Date</label>
                      <input
                        type="date"
                        value={recordForm.date}
                        onChange={(e) => setRecordForm({ ...recordForm, date: e.target.value })}
                        className="w-full rounded-2xl border border-stone-200 bg-[#FAFAF7] px-3 py-2.5 text-sm text-[#111111] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <PillButton>Save Payment</PillButton>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Payment history list ─────────────────────────── */}
          <ListContainer>
            <ListHeader label="Transaction Log" />
            <div className="px-4 pb-5 space-y-2">
              {MOCK_PAYMENTS.map((p, idx) => {
                const sc = statusPillColor(p.status);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <ListRow last={idx === MOCK_PAYMENTS.length - 1}>
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <StatusDot color={sc.text} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#111111] truncate">{p.tenant}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{p.unit}</span>
                          </div>
                          <div className="mt-0.5 text-xs text-stone-500 truncate">{p.property}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 shrink-0">
                        <span className="text-sm font-medium tabular-nums text-[#111111] hidden sm:block">
                          {fmtMoney(p.amount)}
                        </span>
                        <span className="text-xs text-stone-400 tabular-nums hidden md:block">
                          {fmtDate(p.date)}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-stone-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stone-500 hidden lg:inline-flex">
                          {p.method === "card" ? "Card" : "ACH"}
                        </span>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                          style={{ backgroundColor: sc.bg, color: sc.text }}
                        >
                          {p.status}
                        </span>
                      </div>
                    </ListRow>
                  </motion.div>
                );
              })}
            </div>
          </ListContainer>
        </section>

        {/* ── Collection Status Board ────────────────────────── */}
        <section className="mt-10">
          <div className="mb-4">
            <h2
              className="text-3xl tracking-tight text-stone-900"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 500 }}
            >
              Collection <em className="italic text-stone-500">status</em>
            </h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
              {MOCK_UNITS.length} units across {properties.length} properties
            </p>
          </div>

          {properties.map((property, pIdx) => {
            const units = MOCK_UNITS.filter((u) => u.property === property);
            return (
              <StaggerIn key={property} index={pIdx}>
                <div className="mb-6">
                  <SectionLabel>{property}</SectionLabel>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {units.map((u, uIdx) => {
                      const dotColor = collectionDotColor(u.status);
                      return (
                        <motion.div
                          key={u.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: uIdx * 0.04 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="rounded-[2rem] border border-stone-200 bg-[#fffdf8] p-4 shadow-sm shadow-stone-200/40 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-[#111111] font-mono">{u.unit}</span>
                            <StatusDot color={dotColor} />
                          </div>
                          <div className="mt-2 truncate text-xs text-stone-500">{u.tenant}</div>
                          <div className="mt-1 text-sm font-medium tabular-nums text-[#111111]">{fmtMoney(u.rent)}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-wider font-medium" style={{ color: dotColor }}>
                            {u.status}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </StaggerIn>
            );
          })}
        </section>

      </div>
    </div>
  );
}
