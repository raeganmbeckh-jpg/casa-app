import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  IconChip,
  T,
} from "@/components/ui/primitives";
import {
  FileText,
  Shield,
  Receipt,
  FileSpreadsheet,
  File,
  FolderOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtDate = (iso: string) => {
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

const docTypeIcon = (type: string) => {
  const t = (type || "").toLowerCase();
  if (t.includes("lease")) return FileText;
  if (t.includes("insurance")) return Shield;
  if (t.includes("receipt") || t.includes("invoice") || t.includes("financial"))
    return Receipt;
  if (t.includes("inspection") || t.includes("report"))
    return FileSpreadsheet;
  return File;
};

export default async function DocumentsPage() {
  const supabase = createServerClient();

  const [{ data: documents }, { data: properties }] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("properties").select("id, address"),
  ]);

  const docList = (documents ?? []) as any[];
  const propMap = new Map<string, string>();
  for (const p of properties ?? []) {
    propMap.set(p.id, p.address);
  }

  // KPIs
  const totalDocs = docList.length;
  const totalBytes = docList.reduce(
    (s, d) => s + Number(d.file_size_bytes || 0),
    0
  );
  const distinctTypes = new Set(docList.map((d) => d.document_type).filter(Boolean))
    .size;

  // Group by document_type
  const grouped = new Map<string, any[]>();
  for (const doc of docList) {
    const type = doc.document_type || "Other";
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(doc);
  }

  // Sort groups alphabetically, within each group by created_at desc (already sorted)
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="DOCUMENTS"
        title={
          <>
            Document <em className="italic">Vault</em>
          </>
        }
        subtitle="All uploaded documents organized by type."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <KpiCard label="TOTAL DOCUMENTS" value={totalDocs} />
        <KpiCard label="TOTAL SIZE" value={fmtFileSize(totalBytes)} />
        <KpiCard
          label="DOCUMENT TYPES"
          value={distinctTypes}
          note={distinctTypes === 1 ? "1 category" : `${distinctTypes} categories`}
        />
      </section>

      {/* Documents grouped by type */}
      {docList.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              No documents found. Upload documents to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {sortedGroups.map(([typeName, docs]) => {
            const Icon = docTypeIcon(typeName);
            return (
              <section key={typeName}>
                <div className="mb-3 flex items-center gap-3">
                  <SectionLabel>
                    {typeName.toUpperCase().replace(/_/g, " ")}
                  </SectionLabel>
                  <span className="text-xs text-stone-400">
                    {docs.length} document{docs.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {docs.map((doc, i) => {
                    const propAddress = doc.property_id
                      ? propMap.get(doc.property_id)
                      : null;

                    return (
                      <StaggerIn key={doc.id} index={i}>
                        <Card>
                          <div className="flex items-start gap-3">
                            <IconChip>
                              <Icon className="h-4 w-4 text-stone-800" />
                            </IconChip>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-stone-900">
                                {doc.name || doc.file_url || "Untitled"}
                              </p>
                              {propAddress && (
                                <p className="mt-0.5 truncate text-xs text-stone-500">
                                  {propAddress}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                            <span
                              style={{ fontFamily: "var(--font-geist-mono)" }}
                            >
                              {fmtFileSize(doc.file_size_bytes)}
                            </span>
                            <span>{fmtDate(doc.uploaded_at || doc.created_at)}</span>
                          </div>

                          {doc.ai_summary && (
                            <p className="mt-3 line-clamp-2 text-xs italic text-stone-400">
                              {doc.ai_summary}
                            </p>
                          )}
                        </Card>
                      </StaggerIn>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
