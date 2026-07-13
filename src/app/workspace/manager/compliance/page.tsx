import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StatusDot,
  YellowBadge,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Eye,
  Landmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  const supabase = createServerClient();

  const [
    { data: properties },
    { data: leases },
    { data: inspections },
    { data: securityDeposits },
  ] = await Promise.all([
    supabase.from("properties").select("id, address"),
    supabase
      .from("leases")
      .select("id, property_id, status, end_date, esign_status"),
    supabase
      .from("inspections")
      .select("id, property_id, overall_condition, inspection_date"),
    supabase.from("security_deposits").select("id, lease_id, status"),
  ]);

  const propList = properties ?? [];
  const leaseList = leases ?? [];
  const inspList = inspections ?? [];
  const depositList = securityDeposits ?? [];

  // Build lease-to-property map for deposit lookups
  const leasePropertyMap = new Map(
    leaseList.map((l: any) => [l.id, l.property_id])
  );

  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Per-property compliance evaluation
  type ComplianceCheck = {
    label: string;
    passed: boolean;
    detail: string;
  };

  type PropertyCompliance = {
    id: string;
    address: string;
    checks: ComplianceCheck[];
    score: number;
    total: number;
    actionItems: string[];
  };

  const propertyCompliance: PropertyCompliance[] = propList.map((prop) => {
    const checks: ComplianceCheck[] = [];
    const actionItems: string[] = [];

    // 1. Lease status: active + signed = compliant
    const propLeases = leaseList.filter(
      (l: any) => l.property_id === prop.id
    );
    const hasActiveSigned = propLeases.some(
      (l: any) =>
        l.status === "active" &&
        (l.esign_status === "signed" || l.esign_status === "completed")
    );
    checks.push({
      label: "Active Signed Lease",
      passed: hasActiveSigned,
      detail: hasActiveSigned
        ? "Active lease with valid signature"
        : propLeases.length === 0
          ? "No leases found"
          : "No active signed lease",
    });
    if (!hasActiveSigned) {
      actionItems.push(
        `${prop.address}: Ensure an active lease is signed for this property.`
      );
    }

    // 2. Inspection currency: within last 12 months
    const propInspections = inspList.filter(
      (i: any) => i.property_id === prop.id
    );
    const recentInspection = propInspections.some((i: any) => {
      if (!i.inspection_date) return false;
      return new Date(i.inspection_date) >= oneYearAgo;
    });
    checks.push({
      label: "Inspection Current",
      passed: recentInspection,
      detail: recentInspection
        ? "Inspected within last 12 months"
        : "No inspection in last 12 months",
    });
    if (!recentInspection) {
      actionItems.push(
        `${prop.address}: Schedule a property inspection (overdue).`
      );
    }

    // 3. Security deposit held
    const propLeaseIds = propLeases.map((l: any) => l.id);
    const propDeposits = depositList.filter((d: any) =>
      propLeaseIds.includes(d.lease_id)
    );
    const depositHeld = propDeposits.some(
      (d: any) => d.status === "held"
    );
    // If no deposits exist at all, treat as N/A (pass if no leases need it)
    const depositCheck =
      propDeposits.length === 0 ? propLeases.length === 0 : depositHeld;
    checks.push({
      label: "Security Deposit",
      passed: depositCheck,
      detail: depositHeld
        ? "Security deposit held"
        : propDeposits.length === 0
          ? "No deposit records"
          : "Deposit not in held status",
    });
    if (!depositCheck) {
      actionItems.push(
        `${prop.address}: Verify security deposit status is up to date.`
      );
    }

    const score = checks.filter((c) => c.passed).length;

    return {
      id: prop.id,
      address: prop.address,
      checks,
      score,
      total: checks.length,
      actionItems,
    };
  });

  // Overall stats
  const totalProperties = propertyCompliance.length;
  const fullyCompliant = propertyCompliance.filter(
    (p) => p.score === p.total
  ).length;
  const compliancePct =
    totalProperties > 0
      ? Math.round((fullyCompliant / totalProperties) * 100)
      : 0;
  const allActionItems = propertyCompliance.flatMap((p) => p.actionItems);

  return (
    <div style={{ backgroundColor: T.cream, minHeight: "100vh" }}>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageTitle eyebrow="COMPLIANCE" title="Portfolio Compliance" />

        {/* Overall Score */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <DarkStatCard
            label="Compliance Score"
            value={`${compliancePct}%`}
            subtitle={`${fullyCompliant} of ${totalProperties} properties fully compliant`}
            progress={compliancePct}
            icon={<ShieldCheck size={20} className="text-stone-400" />}
          />
          <KpiCard
            label="Properties Reviewed"
            value={totalProperties}
            note="In portfolio"
          />
          <KpiCard
            label="Action Items"
            value={allActionItems.length}
            note={
              allActionItems.length === 0
                ? "All clear"
                : "Items need attention"
            }
          />
        </div>

        {/* Per-Property Compliance Cards */}
        <SectionLabel>PROPERTY COMPLIANCE</SectionLabel>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {propertyCompliance.length === 0 && (
            <Card>
              <p className="text-center text-sm text-stone-500">
                No properties found.
              </p>
            </Card>
          )}
          {propertyCompliance.map((prop, i) => {
            const allPassed = prop.score === prop.total;
            return (
              <StaggerIn key={prop.id} index={i}>
                <Card>
                  {/* Property header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: allPassed
                            ? "rgba(21,128,61,0.08)"
                            : "rgba(217,119,6,0.1)",
                        }}
                      >
                        {allPassed ? (
                          <ShieldCheck size={18} style={{ color: T.green }} />
                        ) : (
                          <ShieldAlert
                            size={18}
                            style={{ color: "#D97706" }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {prop.address}
                        </p>
                        <p className="text-xs text-stone-500">
                          {prop.score}/{prop.total} checks passed
                        </p>
                      </div>
                    </div>

                    {/* Overall badge */}
                    {allPassed ? (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                        style={{
                          backgroundColor: "rgba(21,128,61,0.08)",
                          color: T.green,
                        }}
                      >
                        Compliant
                      </span>
                    ) : (
                      <YellowBadge>NEEDS REVIEW</YellowBadge>
                    )}
                  </div>

                  {/* Compliance items */}
                  <div className="mt-5 space-y-3">
                    {prop.checks.map((check) => (
                      <div
                        key={check.label}
                        className="flex items-center gap-3"
                      >
                        {check.passed ? (
                          <CheckCircle2
                            size={16}
                            style={{ color: T.green }}
                            className="shrink-0"
                          />
                        ) : (
                          <XCircle
                            size={16}
                            style={{ color: T.red }}
                            className="shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-stone-800">
                            {check.label}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {check.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </StaggerIn>
            );
          })}
        </div>

        {/* Action Items Section */}
        {allActionItems.length > 0 && (
          <div className="mt-10">
            <SectionLabel>ACTION ITEMS</SectionLabel>
            <ListContainer className="mt-4">
              <ListHeader label="RECOMMENDED ACTIONS" />
              <div className="px-4 pb-4">
                {allActionItems.map((item, i) => (
                  <ListRow key={i} last={i === allActionItems.length - 1}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        size={14}
                        style={{ color: "#D97706" }}
                        className="shrink-0"
                      />
                      <span className="text-sm text-stone-700">{item}</span>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-stone-400" />
                  </ListRow>
                ))}
              </div>
            </ListContainer>
          </div>
        )}
      </div>
    </div>
  );
}
