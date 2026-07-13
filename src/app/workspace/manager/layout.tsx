import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("manager")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
