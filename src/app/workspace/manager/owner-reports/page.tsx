import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { FileBarChart, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtPeriod = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const fmtDate = (iso: string) => {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusBadge = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s === "draft")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(249,217,106,0.2)", color: "#92700C" }}
      >
        Draft
      </span>
    );
  if (s === "sent")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(21,128,61,0.08)", color: T.green }}
      >
        Sent
      </span>
    );
  if (s === "paid")
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium"
        style={{ backgroundColor: "rgba(59,130,246,0.08)", color: "rgb(30,64,175)" }}
      >
        Paid
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
      {status || "Unknown"}
    </span>
  );
};

export default async function OwnerReportsPage() {
  const supabase = createServerClient();

  const { data: statements } = await supabase
    .from("owner_statements")
    .select("*")
    .order("period_start", { ascending: false });

  const stmtList = (statements ?? []) as any[];

  // KPIs
  const totalStatements = stmtList.length;
  const latestNet =
    stmtList.length > 0 ? Number(stmtList[0].net_owner || 0) : 0;
  const totalGrossRent = stmtList.reduce(
    (s, st) => s + Number(st.gross_rent || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="OWNER REPORTS"
        title={
          <>
            Owner <em className="italic">Statements</em>
          </>
        }
        subtitle="Period-by-period P&L summaries for property owners."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="STATEMENTS GENERATED"
          value={totalStatements}
        />
        <KpiCard
          label="LATEST NET TO OWNER"
          value={stmtList.length > 0 ? fmtMoney(latestNet) : "N/A"}
          note={
            stmtList.length > 0
              ? `Period: ${fmtPeriod(stmtList[0].period_start)}`
              : undefined
          }
        />
        <KpiCard
          label="TOTAL GROSS RENT"
          value={fmtMoney(totalGrossRent)}
          note={`Across ${totalStatements} statements`}
        />
      </section>

      {/* Statements */}
      <SectionLabel>ALL STATEMENTS</SectionLabel>

      {stmtList.length === 0 ? (
        <Card className="mt-3">
          <div className="py-12 text-center">
            <FileBarChart className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              No owner statements generated yet.
            </p>
          </div>
        </Card>
      ) : (
        <div className="mt-3 space-y-4">
          {stmtList.map((stmt, i) => {
            const gross = Number(stmt.gross_rent || 0);
            const vacancies = Number(stmt.vacancies || 0);
            const mgmtFee = Number(stmt.management_fee || 0);
            const maintenance = Number(stmt.maintenance || 0);
            const other = Number(stmt.other_expenses || 0);
            const net = Number(stmt.net_owner || 0);
            const sentAt = fmtDate(stmt.sent_at);
            const paidAt = fmtDate(stmt.paid_at);

            return (
              <StaggerIn key={stmt.id} index={Math.min(i, 10)}>
                <Card>
                  {/* Header: period + status */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-stone-400" />
                      <div>
                        <p className="text-lg font-medium tracking-tight text-stone-900">
                          {fmtPeriod(stmt.period_start)}
                          {stmt.period_end &&
                          stmt.period_end !== stmt.period_start
                            ? ` — ${fmtPeriod(stmt.period_end)}`
                            : ""}
                        </p>
                        {stmt.notes && (
                          <p className="mt-0.5 text-xs italic text-stone-400">
                            {stmt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {statusBadge(stmt.status)}
                  </div>

                  {/* P&L breakdown */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Gross Rent</span>
                      <span
                        className="font-medium"
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          color: T.green,
                        }}
                      >
                        {fmtMoney(gross)}
                      </span>
                    </div>

                    {vacancies > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">
                          Less: Vacancies
                        </span>
                        <span
                          className="font-medium"
                          style={{
                            fontFamily: "var(--font-geist-mono)",
                            color: T.red,
                          }}
                        >
                          ({fmtMoney(vacancies)})
                        </span>
                      </div>
                    )}

                    {mgmtFee > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">
                          Less: Management Fee
                        </span>
                        <span
                          className="text-stone-700"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          ({fmtMoney(mgmtFee)})
                        </span>
                      </div>
                    )}

                    {maintenance > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">
                          Less: Maintenance
                        </span>
                        <span
                          className="text-stone-700"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          ({fmtMoney(maintenance)})
                        </span>
                      </div>
                    )}

                    {other > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">
                          Less: Other Expenses
                        </span>
                        <span
                          className="text-stone-700"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          ({fmtMoney(other)})
                        </span>
                      </div>
                    )}

                    {/* Net to Owner */}
                    <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                      <span className="text-sm font-medium text-stone-900">
                        Net to Owner
                      </span>
                      <span
                        className="text-xl font-semibold tracking-tight"
                        style={{
                          fontFamily: "var(--font-geist-mono)",
                          color: net >= 0 ? T.green : T.red,
                        }}
                      >
                        {fmtMoney(net)}
                      </span>
                    </div>
                  </div>

                  {/* Footer: sent / paid */}
                  {(sentAt || paidAt) && (
                    <div className="mt-4 flex gap-4 text-xs text-stone-400">
                      {sentAt && <span>Sent {sentAt}</span>}
                      {paidAt && <span>Paid {paidAt}</span>}
                    </div>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
