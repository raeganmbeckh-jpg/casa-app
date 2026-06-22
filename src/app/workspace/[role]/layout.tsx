import { redirect } from "next/navigation";
import { getRoleConfig } from "@/components/workspace/sidebarConfig";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const config = getRoleConfig(role);

  if (!config) {
    redirect("/select-role");
  }

  return <WorkspaceShell config={config}>{children}</WorkspaceShell>;
}
