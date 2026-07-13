import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = getRoleConfig("lender")!;
  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
