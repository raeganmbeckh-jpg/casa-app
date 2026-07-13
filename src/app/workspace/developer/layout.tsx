import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("developer")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
