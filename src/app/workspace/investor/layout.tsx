import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("investor")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
