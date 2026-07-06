// Central icon map — resolves string icon names from sidebarConfig to lucide components
// Only imported by client components (Sidebar, CommandPalette, select-role)

import {
  Activity,
  Banknote,
  BarChart3,
  Building2,
  ClipboardCheck,
  Compass,
  FileText,
  Gavel,
  HardHat,
  Home,
  Layers3,
  LineChart,
  Map,
  MessageSquare,
  PieChart,
  ScrollText,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Banknote,
  BarChart3,
  Building2,
  ClipboardCheck,
  Compass,
  FileText,
  Gavel,
  HardHat,
  Home,
  Layers3,
  LineChart,
  Map,
  MessageSquare,
  PieChart,
  ScrollText,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  Users,
  WalletCards,
  Wrench,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Home;
}
