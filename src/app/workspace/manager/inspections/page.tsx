import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  YellowBadge,
  StaggerIn,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  ClipboardCheck,
  Eye,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) => {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const conditionColors: Record<string, string> = {
  excellent: T.green,
  good: "#22C55E",
  fair: "#D97706",
  poor: T.red,
  damaged: T.red,
};

const conditionLabel = (c: string | null) => {
  if (!c) return "N/A";
  return c.charAt(0).toUpperCase() + c.slice(1);
};

const typeStyles: Record<string, { bg: string; text: string; label: string }> =
  {
    move_in: {
      bg: "rgba(59,130,246,0.1)",
      text: "#2563EB",
      label: "Move-In",
    },
    move_out: {
      bg: "rgba(185,28,28,0.08)",
      text: T.red,
      label: "Move-Out",
    },
    routine: {
      bg: "rgba(249,217,106,0.2)",
      text: "#92700C",
      label: "Routine",
    },
  };

const findingAreas = [
  "kitchen",
  "bathrooms",
  "bedrooms",
  "exterior",
  "common_areas",
];

const areaLabels: Record<string, string> = {
  kitchen: "Kitchen",
  bathrooms: "Bathrooms",
  bedrooms: "Bedrooms",
  exterior: "Exterior",
  common_areas: "Common Areas",
};

export default async function InspectionsPage() {
  const supabase = createServerClient();

  const [{ data: inspections }, { data: properties }] = await Promise.all([
    supabase
      .from("inspections")
      .select("*")
      .order("inspection_date", { ascending: false }),
    supabase.from("properties").select("id, address"),
  ]);

  const inspList = inspections ?? [];
  const propMap = new Map(
    (properties ?? []).map((p: any) => [p.id, p.address])
  );

  // KPIs
  const totalInspections = inspList.length;
  const goodOrBetter = inspList.filter(
    (i) =>
      i.overall_condition === "good" || i.overall_condition === "excellent"
  ).length;
  const needsAttention = inspList.filter(
    (i) => i.overall_condition === "fair" || i.overall_condition === "poor"
  ).length;
  const tenantSigned = inspList.filter(
    (i) => i.tenant_signed === true
  ).length;

  return (
    <div style={{ backgroundColor: T.cream, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageTitle eyebrow="INSPECTIONS" title="Property Inspections" />

        {/* KPI Cards */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total Inspections"
            value={totalInspections}
            note="All recorded"
          />
          <KpiCard
            label={`Condition "Good"+`}
            value={goodOrBetter}
            note="Good or excellent"
          />
          <KpiCard
            label="Needs Attention"
            value={needsAttention}
            note="Fair or poor condition"
          />
          <KpiCard
            label="Tenant Signed"
            value={tenantSigned}
            note="Acknowledged by tenant"
          />
        </div>

        {/* Inspection Cards */}
        <SectionLabel>INSPECTION REPORTS</SectionLabel>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {inspList.length === 0 && (
            <Card>
              <p className="text-center text-sm text-stone-500">
                No inspections found.
              </p>
            </Card>
          )}
          {inspList.map((insp, i) => {
            const address = insp.property_id
              ? propMap.get(insp.property_id) || "Unknown Property"
              : "Unknown Property";
            const typeConf =
              typeStyles[insp.type] || typeStyles.routine;
            const condColor =
              conditionColors[insp.overall_condition] || "rgba(120,113,108,1)";

            // Parse findings jsonb
            const findings: Record<string, any> =
              typeof insp.findings === "object" && insp.findings
                ? insp.findings
                : {};

            return (
              <StaggerIn key={insp.id} index={i}>
                <Card>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <IconChip>
                        <ClipboardCheck size={18} style={{ color: T.ink }} />
                      </IconChip>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {address}
                        </p>
                        {/* Type badge */}
                        <span
                          className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: typeConf.bg,
                            color: typeConf.text,
                          }}
                        >
                          {typeConf.label}
                        </span>
                      </div>
                    </div>

                    {/* Overall condition badge */}
                    <div className="text-right">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          backgroundColor:
                            condColor === T.green
                              ? "rgba(21,128,61,0.08)"
                              : condColor === "#22C55E"
                                ? "rgba(34,197,94,0.1)"
                                : condColor === "#D97706"
                                  ? "rgba(217,119,6,0.1)"
                                  : "rgba(185,28,28,0.08)",
                          color: condColor,
                        }}
                      >
                        <StatusDot color={condColor} />
                        {conditionLabel(insp.overall_condition)}
                      </span>
                    </div>
                  </div>

                  {/* Date + Inspector */}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-stone-400" />
                      {fmtDate(insp.inspection_date)}
                    </span>
                    {insp.inspector_name && (
                      <span className="flex items-center gap-1.5">
                        <User size={12} className="text-stone-400" />
                        {insp.inspector_name}
                      </span>
                    )}
                  </div>

                  {/* Findings breakdown */}
                  {Object.keys(findings).length > 0 && (
                    <div className="mt-4 rounded-2xl border border-stone-100 bg-[#FAFAF7] p-4">
                      <p
                        className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-400"
                        style={{ fontFamily: "var(--font-geist-mono)" }}
                      >
                        Findings by Area
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
                        {findingAreas.map((area) => {
                          const areaData = findings[area];
                          if (!areaData) return null;
                          const areaCond =
                            typeof areaData === "string"
                              ? areaData
                              : areaData?.condition || null;
                          const areaColor =
                            conditionColors[areaCond] ||
                            "rgba(120,113,108,1)";
                          return (
                            <div
                              key={area}
                              className="flex items-center gap-2 text-xs text-stone-600"
                            >
                              <StatusDot color={areaColor} />
                              {areaLabels[area] || area}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tenant signed */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      {insp.tenant_signed ? (
                        <>
                          <CheckCircle2 size={14} style={{ color: T.green }} />
                          <span style={{ color: T.green }}>Tenant signed</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="text-stone-300" />
                          <span className="text-stone-400">
                            Not signed by tenant
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {insp.notes && (
                    <p className="mt-3 border-t border-stone-100 pt-3 text-xs leading-5 text-stone-500">
                      {insp.notes}
                    </p>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
