import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Users,
  UserCircle,
  HardHat,
  Ruler,
  Building2,
  MessageSquare,
  ArrowRight,
  Clock,
  FileQuestion,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) => {
  if (!iso) return "---";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type Person = {
  name: string;
  role: string;
  projects: string[];
};

const ROLE_ICONS: Record<string, typeof UserCircle> = {
  "Project Manager": UserCircle,
  Contractor: HardHat,
  Architect: Ruler,
  Planner: Building2,
  Other: Users,
};

const ROLE_ORDER = [
  "Project Manager",
  "Contractor",
  "Architect",
  "Planner",
  "Other",
];

const RFI_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  open:        { bg: "#FEF3C7", text: "#92400E" },
  in_progress: { bg: "#DBEAFE", text: "#1E40AF" },
  answered:    { bg: "#D1FAE5", text: "#065F46" },
  closed:      { bg: "#F3F4F6", text: "#374151" },
};

const fmtStatus = (s: string) =>
  s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default async function StakeholdersPage() {
  const supabase = createServerClient();

  const [{ data: devProjects }, { data: rfis }, { data: entitlements }] =
    await Promise.all([
      supabase.from("dev_projects").select("*"),
      supabase.from("rfis").select("*").order("created_at", { ascending: false }),
      supabase.from("entitlements").select("id, project_id, assigned_planner, planner_email, planner_phone"),
    ]);

  const projects = devProjects ?? [];
  const rfiList = rfis ?? [];
  const entList = entitlements ?? [];

  // Build project name lookup
  const projectMap = new Map<string, string>();
  for (const p of projects) {
    projectMap.set(p.id, p.name);
  }

  // Extract people from all sources
  const peopleMap = new Map<string, Person>();

  const addPerson = (name: string | null, role: string, projectId: string | null) => {
    if (!name || name.trim() === "") return;
    const trimmed = name.trim();
    const key = `${trimmed}::${role}`;
    const projName = projectId ? projectMap.get(projectId) ?? "Unknown" : "---";
    if (peopleMap.has(key)) {
      const existing = peopleMap.get(key)!;
      if (!existing.projects.includes(projName)) {
        existing.projects.push(projName);
      }
    } else {
      peopleMap.set(key, { name: trimmed, role, projects: [projName] });
    }
  };

  // From dev_projects
  for (const p of projects) {
    addPerson(p.project_manager, "Project Manager", p.id);
    addPerson(p.general_contractor, "Contractor", p.id);
    addPerson(p.architect, "Architect", p.id);
  }

  // From entitlements
  for (const e of entList) {
    addPerson(e.assigned_planner, "Planner", e.project_id);
  }

  // From RFIs - submitters and assignees
  for (const r of rfiList) {
    if (r.submitted_by) addPerson(r.submitted_by, "Other", r.project_id);
    if (r.assigned_to) addPerson(r.assigned_to, "Other", r.project_id);
  }

  const allPeople = Array.from(peopleMap.values());

  // Group by role
  const byRole = new Map<string, Person[]>();
  for (const person of allPeople) {
    if (!byRole.has(person.role)) byRole.set(person.role, []);
    byRole.get(person.role)!.push(person);
  }

  // KPIs
  const totalPeople = allPeople.length;
  const totalProjects = projects.length;
  const totalRfis = rfiList.length;
  const roleCount = byRole.size;

  // Recent RFIs as communication timeline (top 15)
  const recentRfis = rfiList.slice(0, 15);

  if (totalPeople === 0 && rfiList.length === 0) {
    return (
      <div
        className="min-h-screen px-6 py-8 lg:px-10"
        style={{ backgroundColor: T.cream, color: T.ink }}
      >
        <PageTitle
          eyebrow="STAKEHOLDERS"
          title={
            <>
              Project <em className="italic text-stone-500">Team</em>.
            </>
          }
        />
        <Card>
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">
              No stakeholders found. Add team members to your projects to
              populate this directory.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      <PageTitle
        eyebrow="STAKEHOLDERS"
        title={
          <>
            Project <em className="italic text-stone-500">Team</em>.
          </>
        }
        subtitle={`${totalPeople} team members across ${totalProjects} projects.`}
      />

      {/* KPI Row */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="TEAM MEMBERS" value={totalPeople} />
        <KpiCard
          label="ROLES"
          value={roleCount}
          note={ROLE_ORDER.filter((r) => byRole.has(r))
            .slice(0, 3)
            .join(", ")}
        />
        <KpiCard label="PROJECTS" value={totalProjects} />
        <KpiCard
          label="TOTAL RFIS"
          value={totalRfis}
          note="Communication log"
        />
      </section>

      {/* Stakeholder directory by role */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <SectionLabel>TEAM DIRECTORY</SectionLabel>

          {ROLE_ORDER.filter((role) => byRole.has(role)).map((role, ri) => {
            const people = byRole.get(role)!;
            const RoleIcon = ROLE_ICONS[role] ?? Users;

            return (
              <StaggerIn key={role} index={ri}>
                <div className="mb-2">
                  <div className="mb-3 flex items-center gap-2">
                    <RoleIcon className="h-4 w-4 text-stone-400" />
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {role}s ({people.length})
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {people.map((person, pi) => (
                      <Card key={`${person.name}-${pi}`} padded={false}>
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                              style={{
                                backgroundColor: "rgba(249,217,106,0.25)",
                                color: "#92700C",
                              }}
                            >
                              {person.name
                                .split(" ")
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-medium text-stone-900">
                                {person.name}
                              </h4>
                              <p className="text-xs text-stone-500">{role}</p>
                            </div>
                          </div>
                          {person.projects.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {person.projects.map((proj, j) => (
                                <span
                                  key={j}
                                  className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
                                >
                                  {proj}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </StaggerIn>
            );
          })}
        </div>

        {/* Communication log - RFI timeline */}
        <div>
          <SectionLabel>COMMUNICATION LOG</SectionLabel>
          <p className="mt-1 mb-4 text-xs text-stone-500">
            Recent RFIs showing who communicated with whom.
          </p>

          {recentRfis.length > 0 ? (
            <ListContainer>
              <ListHeader label="RECENT RFIS" />
              <div className="px-4 pb-4">
                {recentRfis.map((rfi, i) => {
                  const st =
                    RFI_STATUS_STYLE[rfi.status] ?? RFI_STATUS_STYLE.open;
                  const projName =
                    projectMap.get(rfi.project_id) ?? "Unknown Project";

                  return (
                    <ListRow key={rfi.id} last={i === recentRfis.length - 1}>
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <IconChip>
                          <FileQuestion className="h-3.5 w-3.5 text-stone-700" />
                        </IconChip>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider text-stone-400"
                              style={{
                                fontFamily: "var(--font-geist-mono)",
                              }}
                            >
                              RFI-{rfi.rfi_number ?? rfi.id?.slice(0, 4)}
                            </span>
                            {rfi.priority && (
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                  rfi.priority === "high" || rfi.priority === "critical"
                                    ? "bg-red-50 text-red-700"
                                    : rfi.priority === "medium"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-stone-100 text-stone-500"
                                }`}
                              >
                                {rfi.priority}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-sm font-medium text-stone-900">
                            {rfi.title}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
                            {rfi.submitted_by && (
                              <>
                                <span className="font-medium text-stone-700">
                                  {rfi.submitted_by}
                                </span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </>
                            )}
                            {rfi.assigned_to && (
                              <span className="font-medium text-stone-700">
                                {rfi.assigned_to}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400">
                            <span>{projName}</span>
                            {rfi.created_at && (
                              <>
                                <span>·</span>
                                <span>{fmtDate(rfi.created_at)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ backgroundColor: st.bg, color: st.text }}
                      >
                        {fmtStatus(rfi.status ?? "open")}
                      </span>
                    </ListRow>
                  );
                })}
              </div>
            </ListContainer>
          ) : (
            <Card>
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-stone-300" />
                <p className="mt-3 text-sm text-stone-500">
                  No RFIs found. Communication log will appear here.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
