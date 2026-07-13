import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default async function FinancialsPage() {
  const supabase = createServerClient();

  const [{ data: transactions }, { data: properties }] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false }),
    supabase.from("properties").select("id, address"),
  ]);

  const txList = transactions ?? [];
  const propList = properties ?? [];

  const propMap = new Map(propList.map((p: any) => [p.id, p]));

  // Income = type 'income' OR positive amount that isn't expense
  const incomeTx = txList.filter(
    (tx: any) => tx.type === "income" || (Number(tx.amount) > 0 && tx.type !== "expense")
  );
  const expenseTx = txList.filter(
    (tx: any) => tx.type === "expense" || Number(tx.amount) < 0
  );

  const totalIncome = incomeTx.reduce(
    (s: number, tx: any) => s + Math.abs(Number(tx.amount)),
    0
  );
  const totalExpenses = expenseTx.reduce(
    (s: number, tx: any) => s + Math.abs(Number(tx.amount)),
    0
  );
  const noi = totalIncome - totalExpenses;

  // Per-property breakdown
  const propertyData: Record<string, { address: string; income: number; expenses: number }> = {};
  for (const tx of txList) {
    const pid = tx.property_id;
    if (!pid) continue;
    if (!propertyData[pid]) {
      const prop = propMap.get(pid);
      propertyData[pid] = {
        address: prop?.address ?? "Unknown Property",
        income: 0,
        expenses: 0,
      };
    }
    const amt = Number(tx.amount);
    if (tx.type === "income" || (amt > 0 && tx.type !== "expense")) {
      propertyData[pid].income += Math.abs(amt);
    } else {
      propertyData[pid].expenses += Math.abs(amt);
    }
  }

  const propertyBreakdown = Object.entries(propertyData)
    .map(([id, data]) => ({
      id,
      ...data,
      net: data.income - data.expenses,
    }))
    .sort((a, b) => b.net - a.net);

  // Find max income across properties for relative bar widths
  const maxPropertyValue = Math.max(
    ...propertyBreakdown.map((p) => Math.max(p.income, p.expenses)),
    1
  );

  // Enrich transactions with property address
  const enrichedTx = txList.map((tx: any) => ({
    ...tx,
    propertyAddress: propMap.get(tx.property_id)?.address ?? "Portfolio",
  }));

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="FINANCIAL INTELLIGENCE"
        title={
          <>
            Finan<em className="italic">cials</em>
          </>
        }
        subtitle="Profit and loss waterfall. All figures computed from live transaction data."
      />

      {/* Top: Two DarkStatCards */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <StaggerIn index={0}>
          <DarkStatCard
            label="TOTAL INCOME"
            value={fmtMoney(totalIncome)}
            subtitle={`${incomeTx.length} income transaction${incomeTx.length !== 1 ? "s" : ""}`}
          />
        </StaggerIn>
        <StaggerIn index={1}>
          <DarkStatCard
            label="TOTAL EXPENSES"
            value={fmtMoney(totalExpenses)}
            subtitle={`${expenseTx.length} expense transaction${expenseTx.length !== 1 ? "s" : ""}`}
          />
        </StaggerIn>
      </section>

      {/* NOI Highlight */}
      <section className="mb-10">
        <StaggerIn index={2}>
          <Card className="border-[#F9D96A]/40 text-center py-12">
            <p
              className="text-xs uppercase tracking-[0.22em] text-stone-500"
              style={{ fontFamily: "var(--font-geist-mono)" }}
            >
              NET OPERATING INCOME
            </p>
            <p
              className="mt-4 text-7xl font-semibold tracking-[-0.04em] md:text-8xl"
              style={{
                fontFamily: "var(--font-heading)",
                color: noi >= 0 ? T.green : T.red,
              }}
            >
              {fmtMoney(noi)}
            </p>
            <p className="mt-4 text-sm text-stone-500">
              Income {fmtMoney(totalIncome)} minus Expenses {fmtMoney(totalExpenses)}
            </p>
          </Card>
        </StaggerIn>
      </section>

      {/* Per-Property Breakdown */}
      <section className="mb-10">
        <SectionLabel>PROPERTY BREAKDOWN</SectionLabel>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {propertyBreakdown.map((prop, i) => (
            <StaggerIn key={prop.id} index={i}>
              <Card>
                <p className="text-sm font-medium text-stone-900">
                  {prop.address}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Income
                    </p>
                    <p
                      className="mt-1 text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: T.green,
                      }}
                    >
                      {fmtMoney(prop.income)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Expenses
                    </p>
                    <p
                      className="mt-1 text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: T.red,
                      }}
                    >
                      {fmtMoney(prop.expenses)}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] uppercase tracking-[0.16em] text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Net
                    </p>
                    <p
                      className="mt-1 text-lg font-medium"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: prop.net >= 0 ? T.green : T.red,
                      }}
                    >
                      {fmtMoney(prop.net)}
                    </p>
                  </div>
                </div>
                {/* Horizontal bar */}
                <div className="mt-4 flex gap-1 h-3 rounded-full overflow-hidden bg-stone-100">
                  <div
                    className="rounded-l-full"
                    style={{
                      width: `${(prop.income / maxPropertyValue) * 100}%`,
                      backgroundColor: T.green,
                      opacity: 0.7,
                    }}
                  />
                  <div
                    className="rounded-r-full"
                    style={{
                      width: `${(prop.expenses / maxPropertyValue) * 100}%`,
                      backgroundColor: T.red,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-stone-400">
                  <span>Income</span>
                  <span>Expenses</span>
                </div>
              </Card>
            </StaggerIn>
          ))}
          {propertyBreakdown.length === 0 && (
            <Card>
              <p className="py-6 text-center text-sm text-stone-400">
                No property-level data available.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* Transaction Ledger */}
      <section>
        <SectionLabel>TRANSACTION LEDGER</SectionLabel>
        <div className="mt-3 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-[#fffdf8] shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-[0.14em] text-stone-500">
                <th
                  className="px-6 py-4 font-medium"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Date
                </th>
                <th
                  className="hidden px-6 py-4 font-medium md:table-cell"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Property
                </th>
                <th
                  className="px-6 py-4 font-medium"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Description
                </th>
                <th
                  className="px-6 py-4 font-medium text-right"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {enrichedTx.map((tx: any) => {
                const amt = Number(tx.amount);
                const isIncome =
                  tx.type === "income" || (amt > 0 && tx.type !== "expense");
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-stone-100 last:border-0 transition-colors hover:bg-[#FAFAF7]"
                  >
                    <td
                      className="px-6 py-3 text-stone-600"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {tx.date ? fmtDate(tx.date) : "--"}
                    </td>
                    <td className="hidden px-6 py-3 text-stone-600 md:table-cell">
                      {tx.propertyAddress}
                    </td>
                    <td className="px-6 py-3 font-medium text-stone-900">
                      {tx.description || "--"}
                    </td>
                    <td
                      className="px-6 py-3 text-right font-medium"
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        color: isIncome ? T.green : T.red,
                      }}
                    >
                      {isIncome ? "+" : ""}
                      {fmtMoney(amt)}
                    </td>
                  </tr>
                );
              })}
              {enrichedTx.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-stone-400"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
