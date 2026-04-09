export const ROLES = [
  {
    id: "manager",
    label: "Property Manager",
    description: "Manage properties, tenants, leases, and maintenance",
    icon: "Building2",
    color: "bg-blue-600",
  },
  {
    id: "investor",
    label: "Investor",
    description: "Analyze deals, track ROI, and review portfolios",
    icon: "TrendingUp",
    color: "bg-emerald-600",
  },
  {
    id: "analyst",
    label: "Market Analyst",
    description: "Research markets, comps, and submarket data",
    icon: "BarChart3",
    color: "bg-purple-600",
  },
  {
    id: "owner",
    label: "Property Owner",
    description: "View statements, reports, and asset performance",
    icon: "Home",
    color: "bg-amber-600",
  },
  {
    id: "maintenance",
    label: "Maintenance Lead",
    description: "Track work orders, vendors, and inspections",
    icon: "Wrench",
    color: "bg-red-600",
  },
  {
    id: "acquisitions",
    label: "Acquisitions",
    description: "Screen deals, run models, and evaluate targets",
    icon: "Search",
    color: "bg-cyan-600",
  },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];
