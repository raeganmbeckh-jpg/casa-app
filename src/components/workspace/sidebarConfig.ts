// Icon names are strings — resolved to components client-side via ICON_MAP
// This file is imported by both server (layout.tsx) and client components

export type Role = "manager" | "investor" | "developer" | "land" | "broker" | "lender";

export type SidebarItem = {
  label: string;
  icon: string;  // lucide icon name — resolved client-side
  href: string;
  badge?: string;
};

export type RoleConfig = {
  role: Role;
  displayName: string;
  tagline: string;
  description: string;
  accent: string;
  sidebar: SidebarItem[];
};

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  manager: {
    role: "manager",
    displayName: "Property Manager",
    tagline: "The portfolio operator.",
    description: "For owners and managers running rental portfolios. Tenants, financials, maintenance, compliance — one terminal.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",      icon: "Home",         href: "" },
      { label: "Properties",     icon: "Building2",    href: "properties" },
      { label: "Tenants",        icon: "Users",        href: "tenants" },
      { label: "Maintenance",    icon: "Wrench",       href: "maintenance" },
      { label: "Financials",     icon: "PieChart",     href: "financials" },
      { label: "Compliance",     icon: "Shield",       href: "compliance" },
      { label: "Market",         icon: "LineChart",    href: "market" },
      { label: "Owner Reports",  icon: "ScrollText",   href: "owner-reports" },
    ],
  },
  investor: {
    role: "investor",
    displayName: "Investor",
    tagline: "The capital allocator.",
    description: "For individual investors, family offices, REITs. Underwrite faster, see the buyer pool, score every deal.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",       icon: "Home",         href: "" },
      { label: "Deal Pipeline",   icon: "Target",       href: "pipeline" },
      { label: "Underwriting",    icon: "BarChart3",    href: "underwriting" },
      { label: "Portfolio",       icon: "PieChart",     href: "portfolio" },
      { label: "Comps",           icon: "Activity",     href: "comps" },
      { label: "QIS Score",       icon: "Sparkles",     href: "qis" },
      { label: "Buyer Pool",      icon: "Users",        href: "buyer-pool" },
      { label: "Documents",       icon: "FileText",     href: "documents" },
    ],
  },
  developer: {
    role: "developer",
    displayName: "Developer",
    tagline: "The project builder.",
    description: "For developers, GCs, design-build firms. Pro forma, schedule risk, permits, vendors — all in one shell.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",       icon: "Home",           href: "" },
      { label: "Projects",        icon: "HardHat",        href: "projects" },
      { label: "Pro Forma",       icon: "BarChart3",      href: "proforma" },
      { label: "Construction",    icon: "Layers3",        href: "construction" },
      { label: "Permits",         icon: "ClipboardCheck", href: "permits" },
      { label: "Vendors",         icon: "Truck",          href: "vendors" },
      { label: "Cost Variance",   icon: "TrendingUp",     href: "cost-variance" },
      { label: "Stakeholders",    icon: "MessageSquare",  href: "stakeholders" },
    ],
  },
  land: {
    role: "land",
    displayName: "Land Acquisition",
    tagline: "The parcel hunter.",
    description: "For land buyers and developers scouting sites. Zoning, highest-and-best-use, environmental, off-market outreach.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",        icon: "Home",           href: "" },
      { label: "Parcel Search",    icon: "Map",            href: "parcels" },
      { label: "Zoning Analyzer",  icon: "Compass",        href: "zoning" },
      { label: "Highest & Best",   icon: "Sparkles",       href: "hbu" },
      { label: "Risk & Environ",   icon: "ShieldAlert",    href: "risk" },
      { label: "Comps",            icon: "Activity",       href: "comps" },
      { label: "Acquisition",      icon: "WalletCards",    href: "acquisition" },
      { label: "Owner Outreach",   icon: "MessageSquare",  href: "outreach" },
    ],
  },
  broker: {
    role: "broker",
    displayName: "Broker",
    tagline: "The deal closer.",
    description: "For residential, commercial, and investment sales brokers. Listings, AI buyer matching, pricing, velocity.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",       icon: "Home",         href: "" },
      { label: "Listings",        icon: "Building2",    href: "listings" },
      { label: "Buyer Match",     icon: "Users",        href: "buyers" },
      { label: "CMA Generator",   icon: "BarChart3",    href: "cma" },
      { label: "Pricing",         icon: "TrendingUp",   href: "pricing" },
      { label: "Market Pulse",    icon: "LineChart",    href: "market" },
      { label: "Days-on-Market",  icon: "Activity",     href: "dom" },
      { label: "Commission",      icon: "WalletCards",  href: "commission" },
    ],
  },
  lender: {
    role: "lender",
    displayName: "Lender",
    tagline: "The risk underwriter.",
    description: "For mortgage brokers, portfolio lenders, debt funds. Underwriting, covenants, default risk, capital markets.",
    accent: "#F9D96A",
    sidebar: [
      { label: "Dashboard",       icon: "Home",         href: "" },
      { label: "Loan Pipeline",   icon: "Target",       href: "pipeline" },
      { label: "Underwriting",    icon: "BarChart3",    href: "underwriting" },
      { label: "Borrowers",       icon: "Users",        href: "borrowers" },
      { label: "Property Risk",   icon: "ShieldAlert",  href: "property-risk" },
      { label: "Rate Modeler",    icon: "TrendingUp",   href: "rates" },
      { label: "Covenants",       icon: "Gavel",        href: "covenants" },
      { label: "Capital Markets", icon: "Banknote",     href: "capital-markets" },
    ],
  },
};

export const ROLES_ORDERED: Role[] = ["manager", "investor", "developer", "land", "broker", "lender"];

export function getRoleConfig(role: string | undefined): RoleConfig | null {
  if (!role) return null;
  if (role in ROLE_CONFIGS) return ROLE_CONFIGS[role as Role];
  return null;
}

export function buildHref(role: Role, subpath: string): string {
  return `/workspace/${role}${subpath ? `/${subpath}` : ""}`;
}
