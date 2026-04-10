"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Wrench,
  BarChart3,
  UserCircle,
  Bell,
  MapPin,
  CircleDot,
  AlertTriangle,
  Plus,
  X,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Printer,
} from "lucide-react";
import { type RoleId } from "@/lib/roles";
import RoleSwitcher from "@/components/RoleSwitcher";
import AIPanel from "@/components/AIPanel";
import AddressSearch from "@/components/AddressSearch";
import type {
  PortfolioProperty,
  Tenant,
  Lease,
  WorkOrder,
  Transaction,
  CasaAlert,
} from "@/lib/types";
import {
  getProperties,
  getTenants,
  getLeases,
  getWorkOrders,
  getTransactions,
  getAlerts,
  generateAlerts,
  addProperty,
  addTenant,
  addLease,
  addWorkOrder,
  addTransaction,
  dismissAlert,
  updateProperty,
  getPropertyAddress,
  propertyFromAttom,
} from "@/lib/portfolio";

/* ── Constants ─────────────────────────────────────────────────── */

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "properties", label: "Properties", icon: Building2 },
  { id: "tenants", label: "Tenants", icon: Users },
  { id: "leases", label: "Leases", icon: FileText },
  { id: "accounting", label: "Accounting", icon: DollarSign },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "owner-portal", label: "Owner Portal", icon: UserCircle },
  { id: "alerts", label: "Alerts", icon: Bell },
];

const STATUS_COLORS: Record<string, string> = {
  occupied: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  vacant: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  overdue: "text-red-400 bg-red-500/10 border-red-500/20",
  maintenance: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  prospecting: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "text-blue-400 bg-blue-500/10",
  warning: "text-amber-400 bg-amber-500/10",
  critical: "text-red-400 bg-red-500/10",
};

const PRIORITY_COLORS: Record<string, string> = {
  emergency: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const WO_STATUS_COLORS: Record<string, string> = {
  open: "text-amber-400 bg-amber-500/10",
  in_progress: "text-blue-400 bg-blue-500/10",
  completed: "text-emerald-400 bg-emerald-500/10",
};

const ESIGN_COLORS: Record<string, string> = {
  signed: "text-emerald-400 bg-emerald-500/10",
  pending: "text-amber-400 bg-amber-500/10",
  expired: "text-red-400 bg-red-500/10",
};

const BG_CHECK_COLORS: Record<string, string> = {
  passed: "text-emerald-400 bg-emerald-500/10",
  pending: "text-amber-400 bg-amber-500/10",
  flagged: "text-red-400 bg-red-500/10",
};

/* ── Helpers ───────────────────────────────────────────────────── */

function usd(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  return `$${n.toLocaleString()}`;
}

function pct(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  return `${n.toFixed(1)}%`;
}

function capRate(prop: PortfolioProperty): number | null {
  if (!prop.estimated_value || !prop.monthly_rent) return null;
  return ((prop.monthly_rent * 12) / prop.estimated_value) * 100;
}

function daysUntil(dateStr: string): number {
  return Math.round(
    (new Date(dateStr).getTime() - Date.now()) / 86400000
  );
}

function Badge({ text, colors }: { text: string; colors: string }) {
  return (
    <span
      className={`text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-widest ${colors}`}
    >
      {text}
    </span>
  );
}

function SectionCard({
  title,
  icon: Icon,
  accent = "text-blue-400",
  children,
  actions,
}: {
  title: string;
  icon: any;
  accent?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="bg-[#080a12] border border-[#1e2235] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#131728] bg-[#0c0e18]">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent}`} />
          <span
            className={`text-[10px] font-bold uppercase tracking-[0.2em] font-mono ${accent}`}
          >
            {title}
          </span>
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#04060c] border border-[#1e2235] rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500/50"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#04060c] border border-[#1e2235] rounded px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */

export default function Workspace() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("manager");
  const [tab, setTab] = useState("dashboard");
  const [initialSearch, setInitialSearch] = useState("");

  /* ── Data state ─────────────────────────────────────────────── */
  const [properties, setProperties] = useState<PortfolioProperty[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<CasaAlert[]>([]);

  /* ── Form toggles ──────────────────────────────────────────── */
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [showTxForm, setShowTxForm] = useState(false);
  const [showWOForm, setShowWOForm] = useState(false);

  /* ── Filters ───────────────────────────────────────────────── */
  const [woFilter, setWoFilter] = useState("all");
  const [alertFilter, setAlertFilter] = useState("all");
  const [activeReport, setActiveReport] = useState<string | null>(null);

  /* ── Form state ────────────────────────────────────────────── */
  const [tenantForm, setTenantForm] = useState({
    property_id: "",
    name: "",
    email: "",
    phone: "",
    credit_score: "700",
    monthly_income: "5000",
    income_verified: false,
    background_check: "pending" as "passed" | "pending" | "flagged",
  });
  const [leaseForm, setLeaseForm] = useState({
    property_id: "",
    tenant_id: "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    security_deposit: "",
    late_fee: "50",
    grace_days: "5",
    esign_status: "pending" as "signed" | "pending" | "expired",
    auto_renew: false,
  });
  const [txForm, setTxForm] = useState({
    property_id: "",
    type: "income" as "income" | "expense",
    category: "rent",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [woForm, setWoForm] = useState({
    property_id: "",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "emergency",
    vendor: "",
    estimated_cost: "",
  });

  /* ── Refresh data from localStorage ────────────────────────── */
  const refreshData = useCallback(() => {
    setProperties(getProperties());
    setTenants(getTenants());
    setLeases(getLeases());
    setWorkOrders(getWorkOrders());
    setTransactions(getTransactions());
    generateAlerts();
    setAlerts(getAlerts());
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("casa-role") as RoleId | null;
    if (saved) setRole(saved);
    const sq = localStorage.getItem("casa-search-query");
    if (sq) {
      setInitialSearch(sq);
      localStorage.removeItem("casa-search-query");
    }
    refreshData();
  }, [refreshData]);

  /* ── Computed ───────────────────────────────────────────────── */
  const totalValue = properties.reduce((s, p) => s + (p.estimated_value || 0), 0);
  const totalRent = properties.reduce((s, p) => s + p.monthly_rent, 0);
  const occupiedCount = properties.filter((p) => p.status === "occupied").length;
  const occupancyPct = properties.length
    ? Math.round((occupiedCount / properties.length) * 100)
    : 0;
  const capRates = properties.map(capRate).filter((c): c is number => c !== null);
  const avgCapRate = capRates.length
    ? capRates.reduce((a, b) => a + b, 0) / capRates.length
    : null;
  const openWO = workOrders.filter((w) => w.status !== "completed").length;
  const activeAlerts = alerts.filter((a) => !a.dismissed);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  /* ── Handlers ──────────────────────────────────────────────── */
  function handleAddToPortfolio(basic: any, detail: any) {
    const data = propertyFromAttom(basic, detail);
    addProperty(data);
    refreshData();
  }

  function handleAddTenant() {
    if (!tenantForm.property_id || !tenantForm.name) return;
    addTenant({
      property_id: tenantForm.property_id,
      name: tenantForm.name,
      email: tenantForm.email,
      phone: tenantForm.phone,
      credit_score: parseInt(tenantForm.credit_score) || 700,
      monthly_income: parseInt(tenantForm.monthly_income) || 0,
      income_verified: tenantForm.income_verified,
      background_check: tenantForm.background_check,
      move_in_date: new Date().toISOString().slice(0, 10),
      eviction_risk: 0,
      payment_history: [],
    });
    setShowTenantForm(false);
    setTenantForm({
      property_id: "",
      name: "",
      email: "",
      phone: "",
      credit_score: "700",
      monthly_income: "5000",
      income_verified: false,
      background_check: "pending",
    });
    refreshData();
  }

  function handleAddLease() {
    if (!leaseForm.property_id || !leaseForm.tenant_id) return;
    addLease({
      property_id: leaseForm.property_id,
      tenant_id: leaseForm.tenant_id,
      start_date: leaseForm.start_date,
      end_date: leaseForm.end_date,
      monthly_rent: parseFloat(leaseForm.monthly_rent) || 0,
      security_deposit: parseFloat(leaseForm.security_deposit) || 0,
      late_fee: parseFloat(leaseForm.late_fee) || 50,
      grace_days: parseInt(leaseForm.grace_days) || 5,
      esign_status: leaseForm.esign_status,
      auto_renew: leaseForm.auto_renew,
    });
    setShowLeaseForm(false);
    setLeaseForm({
      property_id: "",
      tenant_id: "",
      start_date: "",
      end_date: "",
      monthly_rent: "",
      security_deposit: "",
      late_fee: "50",
      grace_days: "5",
      esign_status: "pending",
      auto_renew: false,
    });
    refreshData();
  }

  function handleAddTransaction() {
    if (!txForm.property_id || !txForm.amount) return;
    addTransaction({
      property_id: txForm.property_id,
      type: txForm.type,
      category: txForm.category,
      amount: parseFloat(txForm.amount) || 0,
      date: txForm.date,
      description: txForm.description,
    });
    setShowTxForm(false);
    setTxForm({
      property_id: "",
      type: "income",
      category: "rent",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
    });
    refreshData();
  }

  function handleAddWorkOrder() {
    if (!woForm.property_id || !woForm.title) return;
    addWorkOrder({
      property_id: woForm.property_id,
      title: woForm.title,
      description: woForm.description,
      priority: woForm.priority,
      status: "open",
      vendor: woForm.vendor,
      estimated_cost: parseFloat(woForm.estimated_cost) || 0,
      actual_cost: 0,
      completed_at: null,
      recurring: false,
      photos: [],
    });
    setShowWOForm(false);
    setWoForm({
      property_id: "",
      title: "",
      description: "",
      priority: "medium",
      vendor: "",
      estimated_cost: "",
    });
    refreshData();
  }

  function handleDismissAlert(id: string) {
    dismissAlert(id);
    refreshData();
  }

  function exportCSV() {
    const headers = [
      "Date",
      "Property",
      "Type",
      "Category",
      "Amount",
      "Description",
    ];
    const rows = transactions.map((t) => [
      t.date,
      getPropertyAddress(t.property_id),
      t.type,
      t.category,
      t.amount.toString(),
      t.description,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `casa-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* property select options */
  const propOptions = [
    { value: "", label: "Select property..." },
    ...properties.map((p) => ({ value: p.id, label: p.address })),
  ];
  const tenantOptions = [
    { value: "", label: "Select tenant..." },
    ...tenants.map((t) => ({ value: t.id, label: t.name })),
  ];

  /* ── RENDER: Dashboard ──────────────────────────────────────── */
  function renderDashboard() {
    return (
      <div className="space-y-4">
        <AddressSearch onAddToPortfolio={handleAddToPortfolio} initialQuery={initialSearch} />

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "Portfolio Value", value: usd(totalValue), color: "text-white", sub: `${properties.length} properties` },
            { label: "Monthly Rent", value: usd(totalRent), color: "text-emerald-400", sub: `${usd(totalRent * 12)}/yr` },
            { label: "Occupancy", value: properties.length ? `${occupancyPct}%` : "\u2014", color: "text-blue-400", sub: `${occupiedCount}/${properties.length} occupied` },
            { label: "Avg Cap Rate", value: avgCapRate ? pct(avgCapRate) : "\u2014", color: "text-purple-400", sub: "weighted avg" },
            { label: "Open Work Orders", value: String(openWO), color: openWO > 0 ? "text-amber-400" : "text-gray-400", sub: "maintenance" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4">
              <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Property cards */}
        {properties.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] font-mono">
                Portfolio Properties
              </span>
              <span className="text-[10px] text-gray-600 font-mono ml-auto">{properties.length} TOTAL</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {properties.map((p) => {
                const cr = capRate(p);
                const tenant = tenants.find((t) => t.property_id === p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/property?id=${p.id}`)}
                    className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4 cursor-pointer hover:border-blue-500/30 hover:bg-[#0a0d16] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {p.address}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {p.city}, {p.state} {p.zip}
                        </p>
                      </div>
                      <Badge text={p.status} colors={STATUS_COLORS[p.status] || STATUS_COLORS.vacant} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-[8px] text-gray-600 font-mono tracking-widest">RENT/MO</p>
                        <p className="text-sm font-mono font-bold text-emerald-400">{p.monthly_rent ? usd(p.monthly_rent) : "\u2014"}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-600 font-mono tracking-widest">VALUE</p>
                        <p className="text-sm font-mono font-bold text-white">{usd(p.estimated_value)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-600 font-mono tracking-widest">CAP RATE</p>
                        <p className="text-sm font-mono font-bold text-purple-400">{cr ? pct(cr) : "\u2014"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#131728]">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-[11px] font-mono text-gray-400">{tenant?.name || "No tenant"}</span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-600">{p.property_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-12 text-center">
            <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">
              Search any US address above to start building your portfolio
            </p>
          </div>
        )}

        {/* Alert strip */}
        {activeAlerts.length > 0 && (
          <SectionCard title="Active Alerts" icon={Bell} accent="text-amber-400">
            <div className="divide-y divide-[#131728]">
              {activeAlerts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-3 text-sm font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-gray-300 flex-1">{a.message}</span>
                  <Badge text={a.severity} colors={SEVERITY_COLORS[a.severity] || ""} />
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    );
  }

  /* ── RENDER: Properties ─────────────────────────────────────── */
  function renderProperties() {
    if (properties.length === 0) {
      return (
        <SectionCard title="Properties" icon={Building2}>
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No properties yet. Search an address on the Dashboard to add one.</p>
          </div>
        </SectionCard>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {properties.map((p) => {
          const cr = capRate(p);
          return (
            <div
              key={p.id}
              onClick={() => router.push(`/property?id=${p.id}`)}
              className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4 cursor-pointer hover:border-blue-500/30 hover:bg-[#0a0d16] transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{p.address}</p>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">{p.city}, {p.state} {p.zip}</p>
                </div>
                <Badge text={p.status} colors={STATUS_COLORS[p.status] || STATUS_COLORS.vacant} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mb-2">
                <div><span className="text-gray-600 block text-[8px] tracking-widest">TYPE</span><span className="text-gray-300">{p.property_type}</span></div>
                <div><span className="text-gray-600 block text-[8px] tracking-widest">BEDS/BATHS</span><span className="text-gray-300">{p.beds ?? "\u2014"}/{p.baths ?? "\u2014"}</span></div>
                <div><span className="text-gray-600 block text-[8px] tracking-widest">SQFT</span><span className="text-gray-300">{p.sqft?.toLocaleString() ?? "\u2014"}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div><span className="text-gray-600 block text-[8px] tracking-widest">VALUE</span><span className="text-white font-bold">{usd(p.estimated_value)}</span></div>
                <div><span className="text-gray-600 block text-[8px] tracking-widest">RENT/MO</span><span className="text-emerald-400 font-bold">{p.monthly_rent ? usd(p.monthly_rent) : "\u2014"}</span></div>
                <div><span className="text-gray-600 block text-[8px] tracking-widest">YEAR BUILT</span><span className="text-gray-300">{p.year_built ?? "\u2014"}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── RENDER: Tenants ────────────────────────────────────────── */
  function renderTenants() {
    return (
      <SectionCard
        title="Tenants"
        icon={Users}
        actions={
          <button
            onClick={() => setShowTenantForm(!showTenantForm)}
            className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showTenantForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showTenantForm ? "Cancel" : "Add Tenant"}
          </button>
        }
      >
        {showTenantForm && (
          <div className="p-4 border-b border-[#131728] bg-[#0a0c16]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <SelectField label="Property" value={tenantForm.property_id} onChange={(v) => setTenantForm({ ...tenantForm, property_id: v })} options={propOptions} />
              <InputField label="Name" value={tenantForm.name} onChange={(v) => setTenantForm({ ...tenantForm, name: v })} placeholder="Full name" />
              <InputField label="Email" value={tenantForm.email} onChange={(v) => setTenantForm({ ...tenantForm, email: v })} type="email" placeholder="email@example.com" />
              <InputField label="Phone" value={tenantForm.phone} onChange={(v) => setTenantForm({ ...tenantForm, phone: v })} placeholder="555-0100" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <InputField label="Credit Score" value={tenantForm.credit_score} onChange={(v) => setTenantForm({ ...tenantForm, credit_score: v })} type="number" />
              <InputField label="Monthly Income" value={tenantForm.monthly_income} onChange={(v) => setTenantForm({ ...tenantForm, monthly_income: v })} type="number" />
              <div>
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Income Verified</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={tenantForm.income_verified} onChange={(e) => setTenantForm({ ...tenantForm, income_verified: e.target.checked })} className="rounded bg-[#04060c] border-[#1e2235]" />
                  <span className="text-xs font-mono text-gray-400">Verified</span>
                </label>
              </div>
              <SelectField
                label="Background Check"
                value={tenantForm.background_check}
                onChange={(v) => setTenantForm({ ...tenantForm, background_check: v as any })}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "passed", label: "Passed" },
                  { value: "flagged", label: "Flagged" },
                ]}
              />
            </div>
            <button onClick={handleAddTenant} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors">
              Save Tenant
            </button>
          </div>
        )}

        {tenants.length === 0 && !showTenantForm ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No tenants yet</p>
          </div>
        ) : tenants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-[#131728]">
                  {["Name", "Property", "Credit Score", "Monthly Income", "Verified", "Background", "Move-in", "Eviction Risk", "Payments"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-600 font-medium uppercase tracking-widest text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const csColor = t.credit_score >= 750 ? "text-emerald-400" : t.credit_score >= 650 ? "text-amber-400" : "text-red-400";
                  const riskColor = t.eviction_risk > 60 ? "bg-red-500" : t.eviction_risk > 30 ? "bg-amber-500" : "bg-emerald-500";
                  const paid = t.payment_history.filter((p: any) => p.status === "paid").length;
                  const total = t.payment_history.length;
                  return (
                    <tr key={t.id} className="border-b border-[#131728] hover:bg-[#0e1020] transition-colors">
                      <td className="py-3 px-3 text-gray-200 font-medium">{t.name}</td>
                      <td className="py-3 px-3 text-gray-400">{getPropertyAddress(t.property_id)}</td>
                      <td className={`py-3 px-3 font-bold ${csColor}`}>{t.credit_score}</td>
                      <td className="py-3 px-3 text-gray-300">{usd(t.monthly_income)}</td>
                      <td className="py-3 px-3">
                        {t.income_verified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </td>
                      <td className="py-3 px-3">
                        <Badge text={t.background_check} colors={BG_CHECK_COLORS[t.background_check] || ""} />
                      </td>
                      <td className="py-3 px-3 text-gray-400">{t.move_in_date}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#0d0f17] rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${riskColor}`} style={{ width: `${Math.max(4, t.eviction_risk)}%` }} />
                          </div>
                          <span className="text-gray-500">{t.eviction_risk}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400">{total > 0 ? `${paid}/${total} paid` : "\u2014"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>
    );
  }

  /* ── RENDER: Leases ─────────────────────────────────────────── */
  function renderLeases() {
    return (
      <SectionCard
        title="Leases"
        icon={FileText}
        actions={
          <button
            onClick={() => setShowLeaseForm(!showLeaseForm)}
            className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showLeaseForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showLeaseForm ? "Cancel" : "Add Lease"}
          </button>
        }
      >
        {showLeaseForm && (
          <div className="p-4 border-b border-[#131728] bg-[#0a0c16]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <SelectField label="Property" value={leaseForm.property_id} onChange={(v) => setLeaseForm({ ...leaseForm, property_id: v })} options={propOptions} />
              <SelectField label="Tenant" value={leaseForm.tenant_id} onChange={(v) => setLeaseForm({ ...leaseForm, tenant_id: v })} options={tenantOptions} />
              <InputField label="Start Date" value={leaseForm.start_date} onChange={(v) => setLeaseForm({ ...leaseForm, start_date: v })} type="date" />
              <InputField label="End Date" value={leaseForm.end_date} onChange={(v) => setLeaseForm({ ...leaseForm, end_date: v })} type="date" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <InputField label="Monthly Rent" value={leaseForm.monthly_rent} onChange={(v) => setLeaseForm({ ...leaseForm, monthly_rent: v })} type="number" placeholder="2000" />
              <InputField label="Security Deposit" value={leaseForm.security_deposit} onChange={(v) => setLeaseForm({ ...leaseForm, security_deposit: v })} type="number" />
              <InputField label="Late Fee" value={leaseForm.late_fee} onChange={(v) => setLeaseForm({ ...leaseForm, late_fee: v })} type="number" />
              <InputField label="Grace Days" value={leaseForm.grace_days} onChange={(v) => setLeaseForm({ ...leaseForm, grace_days: v })} type="number" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <SelectField
                label="E-Sign Status"
                value={leaseForm.esign_status}
                onChange={(v) => setLeaseForm({ ...leaseForm, esign_status: v as any })}
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "signed", label: "Signed" },
                  { value: "expired", label: "Expired" },
                ]}
              />
              <div>
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block mb-1">Auto-Renew</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={leaseForm.auto_renew} onChange={(e) => setLeaseForm({ ...leaseForm, auto_renew: e.target.checked })} className="rounded bg-[#04060c] border-[#1e2235]" />
                  <span className="text-xs font-mono text-gray-400">Enabled</span>
                </label>
              </div>
            </div>
            <button onClick={handleAddLease} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors">
              Save Lease
            </button>
          </div>
        )}

        {leases.length === 0 && !showLeaseForm ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No leases yet</p>
          </div>
        ) : leases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="border-b border-[#131728]">
                  {["Property", "Tenant", "Start", "End", "Rent/Mo", "Deposit", "Late Fee", "Grace", "E-Sign", "Auto-Renew", "Days Left"].map((h) => (
                    <th key={h} className="text-left py-3 px-3 text-gray-600 font-medium uppercase tracking-widest text-[9px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => {
                  const days = daysUntil(l.end_date);
                  const daysColor = days < 30 ? "text-red-400" : days < 60 ? "text-amber-400" : "text-emerald-400";
                  const tenant = tenants.find((t) => t.id === l.tenant_id);
                  return (
                    <tr key={l.id} className="border-b border-[#131728] hover:bg-[#0e1020] transition-colors">
                      <td className="py-3 px-3 text-gray-200">{getPropertyAddress(l.property_id)}</td>
                      <td className="py-3 px-3 text-gray-400">{tenant?.name || "\u2014"}</td>
                      <td className="py-3 px-3 text-gray-400">{l.start_date}</td>
                      <td className="py-3 px-3 text-gray-400">{l.end_date}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{usd(l.monthly_rent)}</td>
                      <td className="py-3 px-3 text-gray-300">{usd(l.security_deposit)}</td>
                      <td className="py-3 px-3 text-gray-400">{usd(l.late_fee)}</td>
                      <td className="py-3 px-3 text-gray-400">{l.grace_days}d</td>
                      <td className="py-3 px-3"><Badge text={l.esign_status} colors={ESIGN_COLORS[l.esign_status] || ""} /></td>
                      <td className="py-3 px-3">
                        {l.auto_renew ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-gray-600" />}
                      </td>
                      <td className={`py-3 px-3 font-bold ${daysColor}`}>{days > 0 ? `${days}d` : "Expired"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </SectionCard>
    );
  }

  /* ── RENDER: Accounting ─────────────────────────────────────── */
  function renderAccounting() {
    return (
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Total Income", value: usd(totalIncome), color: "text-emerald-400" },
            { label: "Total Expenses", value: usd(totalExpenses), color: "text-red-400" },
            { label: "Net Income", value: usd(totalIncome - totalExpenses), color: totalIncome - totalExpenses >= 0 ? "text-emerald-400" : "text-red-400" },
            { label: "Transactions", value: String(transactions.length), color: "text-blue-400" },
          ].map((c) => (
            <div key={c.label} className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4">
              <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-1">{c.label}</p>
              <p className={`text-xl font-bold font-mono ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Transaction ledger */}
        <SectionCard
          title="Transaction Ledger"
          icon={DollarSign}
          accent="text-emerald-400"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
              <button
                onClick={() => setShowTxForm(!showTxForm)}
                className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showTxForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {showTxForm ? "Cancel" : "Add Transaction"}
              </button>
            </div>
          }
        >
          {showTxForm && (
            <div className="p-4 border-b border-[#131728] bg-[#0a0c16]">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <SelectField label="Property" value={txForm.property_id} onChange={(v) => setTxForm({ ...txForm, property_id: v })} options={propOptions} />
                <SelectField
                  label="Type"
                  value={txForm.type}
                  onChange={(v) => setTxForm({ ...txForm, type: v as any })}
                  options={[
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ]}
                />
                <InputField label="Category" value={txForm.category} onChange={(v) => setTxForm({ ...txForm, category: v })} placeholder="rent, repairs, insurance..." />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <InputField label="Amount" value={txForm.amount} onChange={(v) => setTxForm({ ...txForm, amount: v })} type="number" placeholder="1500" />
                <InputField label="Date" value={txForm.date} onChange={(v) => setTxForm({ ...txForm, date: v })} type="date" />
                <InputField label="Description" value={txForm.description} onChange={(v) => setTxForm({ ...txForm, description: v })} placeholder="Monthly rent payment" />
              </div>
              <button onClick={handleAddTransaction} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors">
                Save Transaction
              </button>
            </div>
          )}

          {transactions.length === 0 && !showTxForm ? (
            <div className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-mono">No transactions yet</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-[#131728]">
                    {["Date", "Property", "Type", "Category", "Amount", "Description"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-gray-600 font-medium uppercase tracking-widest text-[9px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                    <tr key={t.id} className="border-b border-[#131728] hover:bg-[#0e1020] transition-colors">
                      <td className="py-3 px-3 text-gray-400">{t.date}</td>
                      <td className="py-3 px-3 text-gray-300">{getPropertyAddress(t.property_id)}</td>
                      <td className="py-3 px-3">
                        <Badge text={t.type} colors={t.type === "income" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"} />
                      </td>
                      <td className="py-3 px-3 text-gray-400">{t.category}</td>
                      <td className={`py-3 px-3 font-bold ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                        {t.type === "expense" ? "-" : ""}{usd(t.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-400 truncate max-w-[200px]">{t.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </SectionCard>

        {/* Rent Roll */}
        {properties.length > 0 && (
          <SectionCard title="Rent Roll" icon={DollarSign} accent="text-purple-400">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-[#131728]">
                    {["Property", "Status", "Monthly Rent", "Annual Rent"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-gray-600 font-medium uppercase tracking-widest text-[9px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-b border-[#131728] hover:bg-[#0e1020] transition-colors">
                      <td className="py-3 px-3 text-gray-200">{p.address}</td>
                      <td className="py-3 px-3"><Badge text={p.status} colors={STATUS_COLORS[p.status] || ""} /></td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{usd(p.monthly_rent)}</td>
                      <td className="py-3 px-3 text-gray-300">{usd(p.monthly_rent * 12)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#0c0e18]">
                    <td className="py-3 px-3 text-gray-200 font-bold">TOTAL</td>
                    <td className="py-3 px-3" />
                    <td className="py-3 px-3 text-emerald-400 font-bold">{usd(totalRent)}</td>
                    <td className="py-3 px-3 text-gray-200 font-bold">{usd(totalRent * 12)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    );
  }

  /* ── RENDER: Maintenance ────────────────────────────────────── */
  function renderMaintenance() {
    const filtered = woFilter === "all"
      ? workOrders
      : workOrders.filter((w) => w.status === woFilter);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#080a12] border border-[#1e2235] rounded-lg p-1">
            {["all", "open", "in_progress", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setWoFilter(f)}
                className={`text-[9px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded transition-colors ${
                  woFilter === f ? "bg-blue-600/20 text-blue-400" : "text-gray-600 hover:text-gray-300"
                }`}
              >
                {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowWOForm(!showWOForm)}
            className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors ml-auto"
          >
            {showWOForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {showWOForm ? "Cancel" : "New Work Order"}
          </button>
        </div>

        {showWOForm && (
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <SelectField label="Property" value={woForm.property_id} onChange={(v) => setWoForm({ ...woForm, property_id: v })} options={propOptions} />
              <InputField label="Title" value={woForm.title} onChange={(v) => setWoForm({ ...woForm, title: v })} placeholder="Fix leaking faucet" />
              <SelectField
                label="Priority"
                value={woForm.priority}
                onChange={(v) => setWoForm({ ...woForm, priority: v as any })}
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                  { value: "emergency", label: "Emergency" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
              <InputField label="Vendor" value={woForm.vendor} onChange={(v) => setWoForm({ ...woForm, vendor: v })} placeholder="ABC Plumbing" />
              <InputField label="Estimated Cost" value={woForm.estimated_cost} onChange={(v) => setWoForm({ ...woForm, estimated_cost: v })} type="number" placeholder="500" />
              <InputField label="Description" value={woForm.description} onChange={(v) => setWoForm({ ...woForm, description: v })} placeholder="Details..." />
            </div>
            <button onClick={handleAddWorkOrder} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors">
              Create Work Order
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-12 text-center">
            <Wrench className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No work orders{woFilter !== "all" ? ` with status "${woFilter}"` : ""}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((w) => (
              <div key={w.id} className={`bg-[#080a12] border rounded-lg p-4 ${PRIORITY_COLORS[w.priority]?.includes("border") ? "" : "border-[#1e2235]"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-white">{w.title}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{getPropertyAddress(w.property_id)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge text={w.priority} colors={PRIORITY_COLORS[w.priority] || ""} />
                    <Badge text={w.status.replace("_", " ")} colors={WO_STATUS_COLORS[w.status] || ""} />
                  </div>
                </div>
                {w.description && <p className="text-[11px] text-gray-400 font-mono mb-2">{w.description}</p>}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div><span className="text-gray-600 block text-[8px] tracking-widest">VENDOR</span><span className="text-gray-300">{w.vendor || "\u2014"}</span></div>
                  <div><span className="text-gray-600 block text-[8px] tracking-widest">EST. COST</span><span className="text-gray-300">{usd(w.estimated_cost)}</span></div>
                  <div><span className="text-gray-600 block text-[8px] tracking-widest">CREATED</span><span className="text-gray-300">{w.created_at.slice(0, 10)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── RENDER: Reports ────────────────────────────────────────── */
  function renderReports() {
    const reports = [
      { id: "rent-roll", title: "Rent Roll", desc: "Monthly rent schedule for all properties", icon: DollarSign },
      { id: "owner-statement", title: "Owner Statement", desc: "Income/expense summary per property", icon: FileText },
      { id: "cash-flow", title: "Cash Flow Analysis", desc: "Net cash flow breakdown by month", icon: TrendingUp },
      { id: "occupancy", title: "Occupancy Report", desc: "Vacancy rates and tenant turnover", icon: Users },
      { id: "tax-export", title: "Tax Export", desc: "Annual income and deductions for tax filing", icon: Download },
    ];

    function renderReport(id: string) {
      switch (id) {
        case "rent-roll":
          return (
            <div className="p-4">
              <h3 className="text-sm font-mono font-bold text-white mb-3">RENT ROLL REPORT</h3>
              <p className="text-[10px] text-gray-500 font-mono mb-4">Generated {new Date().toLocaleDateString()}</p>
              {properties.length === 0 ? (
                <p className="text-sm text-gray-500 font-mono">No properties in portfolio</p>
              ) : (
                <table className="w-full text-[11px] font-mono">
                  <thead><tr className="border-b border-[#131728]">
                    {["Address", "City", "Status", "Rent/Mo", "Annual"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-gray-600 text-[9px] uppercase tracking-widest">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className="border-b border-[#131728]">
                        <td className="py-2 px-3 text-gray-200">{p.address}</td>
                        <td className="py-2 px-3 text-gray-400">{p.city}, {p.state}</td>
                        <td className="py-2 px-3"><Badge text={p.status} colors={STATUS_COLORS[p.status] || ""} /></td>
                        <td className="py-2 px-3 text-emerald-400">{usd(p.monthly_rent)}</td>
                        <td className="py-2 px-3 text-gray-300">{usd(p.monthly_rent * 12)}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#0c0e18] font-bold">
                      <td className="py-2 px-3 text-gray-200" colSpan={3}>TOTAL</td>
                      <td className="py-2 px-3 text-emerald-400">{usd(totalRent)}</td>
                      <td className="py-2 px-3 text-gray-200">{usd(totalRent * 12)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          );
        case "owner-statement":
          return (
            <div className="p-4">
              <h3 className="text-sm font-mono font-bold text-white mb-3">OWNER STATEMENT</h3>
              <p className="text-[10px] text-gray-500 font-mono mb-4">Period: YTD {new Date().getFullYear()}</p>
              {properties.map((p) => {
                const pIncome = transactions.filter((t) => t.property_id === p.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
                const pExpense = transactions.filter((t) => t.property_id === p.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={p.id} className="mb-4 pb-4 border-b border-[#131728] last:border-0">
                    <p className="text-xs font-mono text-white font-bold">{p.address}</p>
                    <div className="grid grid-cols-3 gap-3 mt-2 text-[10px] font-mono">
                      <div><span className="text-gray-600 block">INCOME</span><span className="text-emerald-400">{usd(pIncome)}</span></div>
                      <div><span className="text-gray-600 block">EXPENSES</span><span className="text-red-400">{usd(pExpense)}</span></div>
                      <div><span className="text-gray-600 block">NET</span><span className={pIncome - pExpense >= 0 ? "text-emerald-400" : "text-red-400"}>{usd(pIncome - pExpense)}</span></div>
                    </div>
                  </div>
                );
              })}
              {properties.length === 0 && <p className="text-sm text-gray-500 font-mono">No properties in portfolio</p>}
            </div>
          );
        case "cash-flow":
          return (
            <div className="p-4">
              <h3 className="text-sm font-mono font-bold text-white mb-3">CASH FLOW ANALYSIS</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">TOTAL INFLOW</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{usd(totalIncome)}</p>
                </div>
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">TOTAL OUTFLOW</p>
                  <p className="text-lg font-mono font-bold text-red-400">{usd(totalExpenses)}</p>
                </div>
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">NET CASH FLOW</p>
                  <p className={`text-lg font-mono font-bold ${totalIncome - totalExpenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>{usd(totalIncome - totalExpenses)}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Monthly rent potential: {usd(totalRent)} | Annual potential: {usd(totalRent * 12)}</p>
            </div>
          );
        case "occupancy":
          return (
            <div className="p-4">
              <h3 className="text-sm font-mono font-bold text-white mb-3">OCCUPANCY REPORT</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">OCCUPANCY RATE</p>
                  <p className="text-lg font-mono font-bold text-blue-400">{occupancyPct}%</p>
                </div>
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">OCCUPIED</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{occupiedCount}</p>
                </div>
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">VACANT</p>
                  <p className="text-lg font-mono font-bold text-amber-400">{properties.length - occupiedCount}</p>
                </div>
              </div>
              {properties.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#131728] text-[11px] font-mono">
                  <span className="text-gray-300">{p.address}</span>
                  <Badge text={p.status} colors={STATUS_COLORS[p.status] || ""} />
                </div>
              ))}
              {properties.length === 0 && <p className="text-sm text-gray-500 font-mono">No properties in portfolio</p>}
            </div>
          );
        case "tax-export":
          return (
            <div className="p-4">
              <h3 className="text-sm font-mono font-bold text-white mb-3">TAX EXPORT - {new Date().getFullYear()}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">TOTAL RENTAL INCOME</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{usd(totalIncome)}</p>
                </div>
                <div className="bg-[#0a0c16] rounded p-3">
                  <p className="text-[9px] text-gray-600 font-mono tracking-widest">TOTAL DEDUCTIONS</p>
                  <p className="text-lg font-mono font-bold text-red-400">{usd(totalExpenses)}</p>
                </div>
              </div>
              <div className="bg-[#0a0c16] rounded p-3 mb-4">
                <p className="text-[9px] text-gray-600 font-mono tracking-widest">PROPERTY TAX (ANNUAL)</p>
                <p className="text-lg font-mono font-bold text-amber-400">
                  {usd(properties.reduce((s, p) => s + (p.annual_taxes || 0), 0))}
                </p>
              </div>
              <p className="text-[10px] text-gray-500 font-mono">Properties: {properties.length} | Transactions: {transactions.length}</p>
            </div>
          );
        default:
          return null;
      }
    }

    return (
      <div className="space-y-4">
        {activeReport ? (
          <div>
            <button
              onClick={() => setActiveReport(null)}
              className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors mb-3"
            >
              <X className="w-3 h-3" /> Back to Reports
            </button>
            <SectionCard title={reports.find((r) => r.id === activeReport)?.title || "Report"} icon={BarChart3} accent="text-purple-400"
              actions={
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-[9px] font-bold font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
              }
            >
              {renderReport(activeReport)}
            </SectionCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {reports.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.id} className="bg-[#080a12] border border-[#1e2235] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-mono font-bold text-white">{r.title}</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono mb-4">{r.desc}</p>
                  <button
                    onClick={() => setActiveReport(r.id)}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-widest transition-colors w-full"
                  >
                    Generate
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ── RENDER: Owner Portal ───────────────────────────────────── */
  function renderOwnerPortal() {
    if (properties.length === 0) {
      return (
        <SectionCard title="Owner Portal" icon={UserCircle}>
          <div className="p-12 text-center">
            <UserCircle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No properties in portfolio</p>
          </div>
        </SectionCard>
      );
    }

    return (
      <div className="space-y-4">
        {properties.map((p) => {
          const cr = capRate(p);
          const pIncome = transactions.filter((t) => t.property_id === p.id && t.type === "income").reduce((s, t) => s + t.amount, 0);
          const pExpense = transactions.filter((t) => t.property_id === p.id && t.type === "expense").reduce((s, t) => s + t.amount, 0);
          const netIncome = pIncome - pExpense;
          const annualYield = p.estimated_value ? ((pIncome / (p.estimated_value || 1)) * 100) : null;

          return (
            <SectionCard key={p.id} title={p.address} icon={Building2} accent="text-blue-400">
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">VALUE</p>
                    <p className="text-lg font-mono font-bold text-white">{usd(p.estimated_value)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">MONTHLY RENT</p>
                    <p className="text-lg font-mono font-bold text-emerald-400">{usd(p.monthly_rent)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">STATUS</p>
                    <div className="mt-1"><Badge text={p.status} colors={STATUS_COLORS[p.status] || ""} /></div>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">CAP RATE</p>
                    <p className="text-lg font-mono font-bold text-purple-400">{cr ? pct(cr) : "\u2014"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#131728]">
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">YTD INCOME</p>
                    <p className="text-sm font-mono font-bold text-emerald-400">{usd(pIncome)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">YTD EXPENSES</p>
                    <p className="text-sm font-mono font-bold text-red-400">{usd(pExpense)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-600 font-mono tracking-widest">NET INCOME</p>
                    <p className={`text-sm font-mono font-bold ${netIncome >= 0 ? "text-emerald-400" : "text-red-400"}`}>{usd(netIncome)}</p>
                  </div>
                </div>

                {annualYield !== null && (
                  <div className="mt-3 pt-3 border-t border-[#131728]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[8px] text-gray-600 font-mono tracking-widest">YTD YIELD</p>
                        <p className="text-sm font-mono font-bold text-cyan-400">{pct(annualYield)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-600 font-mono tracking-widest">CASH-ON-CASH</p>
                        <p className="text-sm font-mono font-bold text-cyan-400">
                          {p.last_sale_price ? pct((netIncome / p.last_sale_price) * 100) : "\u2014"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>
    );
  }

  /* ── RENDER: Alerts ─────────────────────────────────────────── */
  function renderAlerts() {
    const alertTypes = ["all", "overdue_rent", "expiring_lease", "aging_system", "vacant_unit", "maintenance"];
    const filtered = alertFilter === "all" ? alerts : alerts.filter((a) => a.type === alertFilter);
    const visible = filtered.filter((a) => !a.dismissed);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="bg-[#080a12] border border-[#1e2235] rounded px-3 py-1.5 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-blue-500/50"
          >
            {alertTypes.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All Types" : t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-gray-600 font-mono ml-auto">
            {visible.length} ALERT{visible.length !== 1 ? "S" : ""}
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-mono">No alerts {"\u2014"} your portfolio is in good shape</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((a) => (
              <div
                key={a.id}
                className="bg-[#080a12] border border-[#1e2235] rounded-lg flex items-center gap-3 px-4 py-3"
              >
                <AlertTriangle
                  className={`w-4 h-4 shrink-0 ${
                    a.severity === "critical" ? "text-red-400" : a.severity === "warning" ? "text-amber-400" : "text-blue-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-gray-200">{a.message}</p>
                  <p className="text-[9px] font-mono text-gray-600 mt-0.5">
                    {a.type.replace(/_/g, " ").toUpperCase()} {"\u00b7"} {a.created_at.slice(0, 10)}
                  </p>
                </div>
                <Badge text={a.severity} colors={SEVERITY_COLORS[a.severity] || ""} />
                <button
                  onClick={() => handleDismissAlert(a.id)}
                  className="text-gray-600 hover:text-white transition-colors shrink-0"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Tab Router ─────────────────────────────────────────────── */
  function renderTab() {
    switch (tab) {
      case "dashboard": return renderDashboard();
      case "properties": return renderProperties();
      case "tenants": return renderTenants();
      case "leases": return renderLeases();
      case "accounting": return renderAccounting();
      case "maintenance": return renderMaintenance();
      case "reports": return renderReports();
      case "owner-portal": return renderOwnerPortal();
      case "alerts": return renderAlerts();
      default: return null;
    }
  }

  /* ── Layout ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pb-16 bg-[#080a12]">
      <header className="border-b border-[#1e2235] bg-[#080a12] px-6 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-bold tracking-tight cursor-pointer font-mono hover:text-blue-400 transition-colors"
              onClick={() => router.push("/")}
            >
              CASA
            </h1>
            <div className="w-px h-5 bg-[#1e2235]" />
            <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">
              Real Estate Intelligence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CircleDot className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-gray-500 font-mono capitalize">{role}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Compact tab nav */}
        <div className="flex gap-1 overflow-x-auto pb-3 mb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const alertCount = t.id === "alerts" ? activeAlerts.length : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-gray-600 hover:text-gray-300 hover:bg-[#0e1020] border border-transparent"
                }`}
              >
                <Icon className="w-3 h-3" />
                {t.label}
                {alertCount > 0 && t.id === "alerts" && (
                  <span className="bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {renderTab()}
      </div>

      <AIPanel />
      <RoleSwitcher currentRole={role} />
    </div>
  );
}
