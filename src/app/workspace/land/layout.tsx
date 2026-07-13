import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function LandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("land")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
