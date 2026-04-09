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

export default function Workspace() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("manager");
  const [tab, setTab] = useState("dashboard");
  const [properties, setProperties] = useState<any[]>([]);
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
      const [p, t, l, m, tx, a, os] = await Promise.all([
        supabase.from("properties").select("*").limit(50),
        supabase.from("tenants").select("*").limit(50),
        supabase.from("leases").select("*").limit(50),
        supabase.from("maintenance_requests").select("*").limit(50),
        supabase.from("transactions").select("*").limit(50),
        supabase.from("alerts").select("*").limit(50),
        supabase.from("owner_statements").select("*").limit(50),
      ]);
      setProperties(p.data || []);
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

  function renderDashboard() {
    return (
      <div className="space-y-6">
        <AddressSearch />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Properties", value: properties.length, color: "text-blue-400" },
            { label: "Tenants", value: tenants.length, color: "text-emerald-400" },
            { label: "Active Leases", value: leases.length, color: "text-purple-400" },
            { label: "Open Requests", value: maintenance.length, color: "text-amber-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5"
            >
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold mb-3">Recent Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No alerts</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 text-sm p-2 rounded bg-white/5"
                >
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{a.message || a.title || JSON.stringify(a)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderTable(data: any[], onRowClick?: (row: any) => void) {
    if (data.length === 0)
      return <p className="text-gray-500 text-sm">No data found</p>;
    const keys = Object.keys(data[0]).slice(0, 6);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {keys.map((k) => (
                <th
                  key={k}
                  className="text-left py-3 px-4 text-gray-400 font-medium"
                >
                  {k.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[var(--border)] hover:bg-white/5 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {keys.map((k) => (
                  <td key={k} className="py-3 px-4 truncate max-w-[200px]">
                    {String(row[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderTab() {
    switch (tab) {
      case "dashboard":
        return renderDashboard();
      case "properties":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Properties</h3>
            {renderTable(properties, (row) =>
              router.push(`/property?id=${row.id}`)
            )}
          </div>
        );
      case "tenants":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Tenants</h3>
            {renderTable(tenants)}
          </div>
        );
      case "leases":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Leases</h3>
            {renderTable(leases)}
          </div>
        );
      case "accounting":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Transactions</h3>
            {renderTable(transactions)}
          </div>
        );
      case "maintenance":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Maintenance Requests</h3>
            {renderTable(maintenance)}
          </div>
        );
      case "reports":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Reports</h3>
            <p className="text-gray-500 text-sm">
              Reports will be generated from your portfolio data.
            </p>
          </div>
        );
      case "owner-portal":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Owner Statements</h3>
            {renderTable(ownerStatements)}
          </div>
        );
      case "alerts":
        return (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-4">Alerts</h3>
            {renderTable(alerts)}
          </div>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1
            className="text-xl font-bold tracking-tight cursor-pointer"
            onClick={() => router.push("/")}
          >
            CASA
          </h1>
          <span className="text-sm text-gray-400 capitalize">{role} View</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-[var(--border)]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
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
