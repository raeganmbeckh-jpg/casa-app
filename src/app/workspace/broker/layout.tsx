import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("broker")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
