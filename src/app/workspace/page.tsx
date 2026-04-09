"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type RoleId } from "@/lib/roles";
import RoleSwitcher from "@/components/RoleSwitcher";
import AIPanel from "@/components/AIPanel";
import AddressSearch from "@/components/AddressSearch";

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
  prospecting: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

interface PortfolioProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  units: number;
  monthly_rent: string | null;
  status: string;
  cap_rate: string | null;
  estimated_value: string | null;
  tenant_name: string | null;
  lease_status: string | null;
}

export default function Workspace() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("manager");
  const [tab, setTab] = useState("dashboard");
  const [portfolio, setPortfolio] = useState<PortfolioProperty[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [ownerStatements, setOwnerStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("casa-role") as RoleId | null;
    if (!saved) {
      router.push("/");
      return;
    }
    setRole(saved);

    async function load() {
      const [props, t, l, m, tx, a, os] = await Promise.all([
        supabase
          .from("properties")
          .select("*, leases(monthly_rent, status, tenant_id, tenants(first_name, last_name))")
          .limit(50),
        supabase.from("tenants").select("*").limit(50),
        supabase.from("leases").select("*").limit(50),
        supabase.from("maintenance_requests").select("*").limit(50),
        supabase.from("transactions").select("*").limit(50),
        supabase.from("alerts").select("*").limit(50),
        supabase.from("owner_statements").select("*").limit(50),
      ]);

      const mapped: PortfolioProperty[] = (props.data || []).map((p: any) => {
        const lease = p.leases?.[0];
        const tenant = lease?.tenants;
        return {
          id: p.id,
          address: p.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
          property_type: p.property_type,
          units: p.units,
          monthly_rent: lease?.monthly_rent || p.monthly_rent,
          status: p.status,
          cap_rate: p.cap_rate,
          estimated_value: p.estimated_value,
          tenant_name: tenant
            ? `${tenant.first_name} ${tenant.last_name}`
            : null,
          lease_status: lease?.status || null,
        };
      });

      setPortfolio(mapped);
      setTenants(t.data || []);
      setLeases(l.data || []);
      setMaintenance(m.data || []);
      setTransactions(tx.data || []);
      setAlerts(a.data || []);
      setOwnerStatements(os.data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const totalRent = portfolio.reduce(
    (sum, p) => sum + (p.monthly_rent ? parseFloat(p.monthly_rent) : 0),
    0
  );
  const totalValue = portfolio.reduce(
    (sum, p) => sum + (p.estimated_value ? parseFloat(p.estimated_value) : 0),
    0
  );
  const occupiedCount = portfolio.filter((p) => p.status === "occupied").length;

  function renderDashboard() {
    return (
      <div className="space-y-6">
        <AddressSearch />

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              label: "Portfolio Value",
              value: `$${totalValue.toLocaleString()}`,
              color: "text-white",
              sub: `${portfolio.length} properties`,
            },
            {
              label: "Monthly Rent",
              value: `$${totalRent.toLocaleString()}`,
              color: "text-emerald-400",
              sub: `$${(totalRent * 12).toLocaleString()}/yr`,
            },
            {
              label: "Occupancy",
              value: portfolio.length
                ? `${Math.round((occupiedCount / portfolio.length) * 100)}%`
                : "—",
              color: "text-blue-400",
              sub: `${occupiedCount}/${portfolio.length} occupied`,
            },
            {
              label: "Avg Cap Rate",
              value: portfolio.filter((p) => p.cap_rate).length
                ? `${(
                    portfolio.reduce(
                      (s, p) => s + (p.cap_rate ? parseFloat(p.cap_rate) : 0),
                      0
                    ) / portfolio.filter((p) => p.cap_rate).length
                  ).toFixed(1)}%`
                : "—",
              color: "text-purple-400",
              sub: "weighted avg",
            },
            {
              label: "Open Requests",
              value: String(maintenance.length),
              color:
                maintenance.length > 0 ? "text-amber-400" : "text-gray-400",
              sub: "maintenance",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-[#080a12] border border-[#1e2235] rounded-lg p-4"
            >
              <p className="text-[9px] text-gray-600 font-mono uppercase tracking-widest mb-1">
                {kpi.label}
              </p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>
                {kpi.value}
              </p>
              <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                {kpi.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Portfolio property cards */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] font-mono">
              Portfolio Properties
            </span>
            <span className="text-[10px] text-gray-600 font-mono ml-auto">
              {portfolio.length} TOTAL
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {portfolio.map((p) => {
              const statusClass =
                STATUS_COLORS[p.status] || STATUS_COLORS.vacant;
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
                    <span
                      className={`text-[8px] font-bold px-2 py-1 rounded border font-mono uppercase tracking-widest shrink-0 ml-2 ${statusClass}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-[8px] text-gray-600 font-mono tracking-widest">
                        RENT/MO
                      </p>
                      <p className="text-sm font-mono font-bold text-emerald-400">
                        {p.monthly_rent
                          ? `$${parseFloat(p.monthly_rent).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-600 font-mono tracking-widest">
                        VALUE
                      </p>
                      <p className="text-sm font-mono font-bold text-white">
                        {p.estimated_value
                          ? `$${parseFloat(p.estimated_value).toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-600 font-mono tracking-widest">
                        CAP RATE
                      </p>
                      <p className="text-sm font-mono font-bold text-purple-400">
                        {p.cap_rate ? `${p.cap_rate}%` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#131728]">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-[11px] font-mono text-gray-400">
                        {p.tenant_name || "No tenant"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-gray-600">
                        {p.property_type}
                      </span>
                      <span className="text-[9px] font-mono text-gray-700">
                        &middot;
                      </span>
                      <span className="text-[9px] font-mono text-gray-600">
                        {p.units} unit{p.units !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <div className="bg-[#080a12] border border-[#1e2235] rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#131728] bg-[#0c0e18]">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] font-mono">
                Active Alerts
              </span>
            </div>
            <div className="divide-y divide-[#131728]">
              {alerts.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-mono"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-gray-300">
                    {a.message || a.title || a.alert_type || "Alert"}
                  </span>
                  {a.severity && (
                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded tracking-widest ml-auto ${
                        a.severity === "high" || a.severity === "critical"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {a.severity.toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderTable(
    data: any[],
    columns?: Array<{ key: string; label: string; fmt?: string }>,
    onRowClick?: (row: any) => void
  ) {
    if (data.length === 0)
      return (
        <p className="text-gray-500 text-sm font-mono py-8 text-center">
          No data found
        </p>
      );
    const cols =
      columns ||
      Object.keys(data[0])
        .slice(0, 6)
        .map((k) => ({ key: k, label: k.replace(/_/g, " ") }));
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono">
          <thead>
            <tr className="border-b border-[#131728]">
              {cols.map((c) => (
                <th
                  key={c.key}
                  className="text-left py-3 px-4 text-gray-600 font-medium uppercase tracking-widest text-[9px]"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[#131728] hover:bg-[#0e1020] transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {cols.map((c) => {
                  let val = row[c.key];
                  if ("fmt" in c && c.fmt === "usd" && val)
                    val = `$${parseFloat(val).toLocaleString()}`;
                  return (
                    <td
                      key={c.key}
                      className="py-3 px-4 text-gray-300 truncate max-w-[200px]"
                    >
                      {String(val ?? "—")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function Card({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: any;
    children: React.ReactNode;
  }) {
    return (
      <div className="bg-[#080a12] border border-[#1e2235] rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#131728] bg-[#0c0e18]">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] font-mono">
            {title}
          </span>
        </div>
        <div>{children}</div>
      </div>
    );
  }

  function renderTab() {
    switch (tab) {
      case "dashboard":
        return renderDashboard();
      case "properties":
        return (
          <Card title="Properties" icon={Building2}>
            {renderTable(
              portfolio,
              [
                { key: "address", label: "Address" },
                { key: "city", label: "City" },
                { key: "property_type", label: "Type" },
                { key: "status", label: "Status" },
                { key: "monthly_rent", label: "Rent/Mo", fmt: "usd" },
                { key: "tenant_name", label: "Tenant" },
              ],
              (row) => router.push(`/property?id=${row.id}`)
            )}
          </Card>
        );
      case "tenants":
        return (
          <Card title="Tenants" icon={Users}>
            {renderTable(tenants)}
          </Card>
        );
      case "leases":
        return (
          <Card title="Leases" icon={FileText}>
            {renderTable(leases)}
          </Card>
        );
      case "accounting":
        return (
          <Card title="Transactions" icon={DollarSign}>
            {renderTable(transactions)}
          </Card>
        );
      case "maintenance":
        return (
          <Card title="Maintenance Requests" icon={Wrench}>
            {renderTable(maintenance)}
          </Card>
        );
      case "reports":
        return (
          <Card title="Reports" icon={BarChart3}>
            <div className="p-6 text-center">
              <BarChart3 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-mono">
                Reports will be generated from portfolio data
              </p>
            </div>
          </Card>
        );
      case "owner-portal":
        return (
          <Card title="Owner Statements" icon={UserCircle}>
            {renderTable(ownerStatements)}
          </Card>
        );
      case "alerts":
        return (
          <Card title="Alerts" icon={Bell}>
            {renderTable(alerts)}
          </Card>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-[10px] font-mono text-gray-600 tracking-widest">
            LOADING PORTFOLIO
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-[var(--background)]">
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
            <span className="text-[10px] text-gray-500 font-mono capitalize">
              {role}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded text-[10px] font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-gray-600 hover:text-gray-300 hover:bg-[#0e1020] border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
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
