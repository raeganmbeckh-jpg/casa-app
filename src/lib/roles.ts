export const ROLES = [
  {
    id: "manager",
    label: "Manager",
    description: "Manage properties, tenants, leases, and maintenance",
    icon: "Building2",
  },
  {
    id: "investor",
    label: "Investor",
    description: "Analyze deals, track ROI, and review portfolios",
    icon: "TrendingUp",
  },
  {
    id: "developer",
    label: "Developer",
    description: "Plan, entitle, and build real estate projects",
    icon: "Layers",
  },
  {
    id: "broker",
    label: "Broker",
    description: "List properties, manage clients, close transactions",
    icon: "Handshake",
  },
  {
    id: "lender",
    label: "Lender",
    description: "Underwrite loans, assess risk, monitor debt",
    icon: "Landmark",
  },
  {
    id: "land",
    label: "Land",
    description: "Source parcels, screen deals, map targets",
    icon: "MapPin",
  },
] as const;

export type RoleId = (typeof ROLES)[number]["id"];
