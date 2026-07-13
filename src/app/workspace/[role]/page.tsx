import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RoleDashboardFallback({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  // Each role now has its own dedicated dashboard at /workspace/{role}/page.tsx
  // This fallback should never be reached, but if it is, redirect to select-role
  redirect(`/workspace/${role}`);
}
