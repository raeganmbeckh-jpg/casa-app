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
  FileText,
  FolderOpen,
  BarChart3,
  Clock,
  File,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtFileSize = (bytes: number | null | undefined) => {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusColor = (status: string | null) => {
  if (!status) return T.dim;
  const s = status.toLowerCase();
  if (s.includes("final") || s.includes("published") || s.includes("complete"))
    return T.green;
  if (s.includes("draft")) return T.yellow;
  return T.dim;
};

export default async function DocumentsPage() {
  const supabase = createServerClient();

  let reports: any[] = [];
  let documents: any[] = [];

  try {
    const reportsRes = await supabase
      .from("investor_reports")
      .select("*")
      .order("created_at", { ascending: false });
    reports = (reportsRes.data ?? []) as any[];
  } catch {
    // table may not exist
  }

  try {
    const docsRes = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    documents = (docsRes.data ?? []) as any[];
  } catch {
    // table may not exist
  }

  // KPIs
  const totalReports = reports.length;
  const totalDocs = documents.length;
  const latestReportPeriod =
    reports.length > 0
      ? reports[0].period_end
        ? `${fmtDate(reports[0].period_start)} - ${fmtDate(reports[0].period_end)}`
        : reports[0].report_type || "—"
      : "—";

  return (
    <div className="space-y-10">
      <PageTitle
        eyebrow="DOCUMENT CENTER"
        title="Documents & Reports"
        subtitle="Investor reports, deal documents, and files organized in one place."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Reports" value={totalReports} />
        <KpiCard label="Total Documents" value={totalDocs} />
        <KpiCard
          label="Latest Period"
          value={latestReportPeriod}
        />
        <KpiCard
          label="Total Files"
          value={totalReports + totalDocs}
          note="Reports + Documents"
        />
      </div>

      {/* SECTION 1: Investor Reports */}
      <div className="space-y-4">
        <SectionLabel>INVESTOR REPORTS</SectionLabel>

        {reports.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <BarChart3
                className="mx-auto mb-4 text-stone-300"
                size={40}
                strokeWidth={1.2}
              />
              <p className="text-lg font-medium text-stone-700">
                No investor reports yet
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Investor reports will appear here once they are generated.
                Reports typically include market commentary, performance
                summaries, and portfolio outlooks.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {reports.map((report, i) => (
              <StaggerIn key={report.id ?? i} index={i}>
                <Card>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconChip>
                          <FileText size={18} />
                        </IconChip>
                        <div>
                          <p className="text-base font-medium text-stone-900">
                            {report.report_type || "Investor Report"}
                          </p>
                          {(report.period_start || report.period_end) && (
                            <p className="text-xs text-stone-500">
                              {fmtDate(report.period_start)}
                              {report.period_end &&
                                ` \u2014 ${fmtDate(report.period_end)}`}
                            </p>
                          )}
                        </div>
                      </div>
                      {report.status && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor:
                              report.status.toLowerCase().includes("final") ||
                              report.status.toLowerCase().includes("published")
                                ? "#F0FDF4"
                                : report.status.toLowerCase().includes("draft")
                                  ? "rgba(249,217,106,0.2)"
                                  : "#F5F5F5",
                            color: statusColor(report.status),
                          }}
                        >
                          <StatusDot color={statusColor(report.status)} />
                          {report.status}
                        </span>
                      )}
                    </div>

                    {/* Executive Summary */}
                    {report.executive_summary && (
                      <div className="rounded-xl bg-[#FAFAF7] p-4">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                          Executive Summary
                        </p>
                        <p className="text-sm leading-relaxed text-stone-700">
                          {report.executive_summary.length > 300
                            ? report.executive_summary.slice(0, 300) + "..."
                            : report.executive_summary}
                        </p>
                      </div>
                    )}

                    {/* Market Commentary & Outlook */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {report.market_commentary && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                            Market Commentary
                          </p>
                          <p className="text-xs leading-relaxed text-stone-600">
                            {report.market_commentary.length > 180
                              ? report.market_commentary.slice(0, 180) + "..."
                              : report.market_commentary}
                          </p>
                        </div>
                      )}
                      {report.outlook && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                            Outlook
                          </p>
                          <p className="text-xs leading-relaxed text-stone-600">
                            {report.outlook.length > 180
                              ? report.outlook.slice(0, 180) + "..."
                              : report.outlook}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </StaggerIn>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Deal Documents */}
      <div className="space-y-4">
        <SectionLabel>DEAL DOCUMENTS</SectionLabel>

        {documents.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <FolderOpen
                className="mx-auto mb-4 text-stone-300"
                size={40}
                strokeWidth={1.2}
              />
              <p className="text-lg font-medium text-stone-700">
                No documents uploaded yet
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Documents associated with deals such as appraisals,
                inspections, title reports, and financial statements will
                appear here.
              </p>
            </div>
          </Card>
        ) : (
          <ListContainer>
            <ListHeader label={`${documents.length} DOCUMENTS`} />
            <div className="px-3 pb-3 space-y-2">
              {documents.map((doc, i) => (
                <ListRow key={doc.id ?? i} last={i === documents.length - 1}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "rgba(249,217,106,0.15)",
                      }}
                    >
                      <File size={16} className="text-stone-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {doc.name || doc.document_name || doc.file_name || "Untitled"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {fmtDate(doc.created_at || doc.uploaded_at)}
                        {doc.file_size_bytes
                          ? ` \u00b7 ${fmtFileSize(doc.file_size_bytes)}`
                          : doc.file_size
                            ? ` \u00b7 ${doc.file_size}`
                            : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(doc.document_type || doc.type) && (
                      <YellowBadge>
                        {doc.document_type || doc.type}
                      </YellowBadge>
                    )}
                    <ChevronRight size={16} className="text-stone-300" />
                  </div>
                </ListRow>
              ))}
            </div>
          </ListContainer>
        )}
      </div>
    </div>
  );
}
