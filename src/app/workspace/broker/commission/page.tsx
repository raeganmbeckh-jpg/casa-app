import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  DarkStatCard,
  KpiCard,
  PageTitle,
  SectionLabel,
  YellowBadge,
  StaggerIn,
  ListContainer,
  ListHeader,
  ListRow,
  StatusDot,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  Wallet,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Briefcase,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const fmtDate = (d: string | null) => {
  if (!d) return "TBD";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const fmtPct = (n: number | null) => {
  if (n == null) return "N/A";
  return `${Number(n).toFixed(1)}%`;
};

export default async function CommissionPage() {
  const supabase = createServerClient();

  const [commissionsRes, dealsRes] = await Promise.all([
    supabase.from("commissions").select("*").order("close_date", { ascending: false }),
    supabase.from("deals").select("*").order("closing_date", { ascending: false }),
  ]);

  const commissions = commissionsRes.data ?? [];
  const deals = dealsRes.data ?? [];

  const totalNet = commissions.reduce(
    (s, c) => s + Number(c.net_commission || 0),
    0
  );
  const totalGross = commissions.reduce(
    (s, c) => s + Number(c.gross_commission || 0),
    0
  );
  const pendingCommissions = commissions.filter((c) => c.status === "pending");
  const closedCommissions = commissions.filter((c) => c.status === "closed");
  const pendingNet = pendingCommissions.reduce(
    (s, c) => s + Number(c.net_commission || 0),
    0
  );
  const closedNet = closedCommissions.reduce(
    (s, c) => s + Number(c.net_commission || 0),
    0
  );
  const totalVolume = commissions.reduce(
    (s, c) => s + Number(c.sale_price || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-4 py-10 sm:px-6 lg:px-10">
      <PageTitle
        eyebrow="REVENUE"
        title="Commission Tracker"
        subtitle="Gross and net commission tracking across all transactions."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <DarkStatCard
          label="Total Net Commission"
          value={fmtMoney(totalNet)}
          subtitle={`${fmtMoney(totalGross)} gross | ${commissions.length} deals`}
          icon={<Wallet size={20} className="text-stone-400" />}
          progress={
            totalGross > 0
              ? Math.round((closedNet / totalNet) * 100)
              : 0
          }
        />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <KpiCard
            label="Closed Revenue"
            value={fmtMoney(closedNet)}
            note={`${closedCommissions.length} closed`}
          />
          <KpiCard
            label="Pipeline Revenue"
            value={fmtMoney(pendingNet)}
            note={`${pendingCommissions.length} pending`}
          />
          <KpiCard
            label="Total Volume"
            value={fmtMoney(totalVolume)}
            note="Sale price sum"
          />
          <KpiCard
            label="Avg Net/Deal"
            value={fmtMoney(
              commissions.length
                ? Math.round(totalNet / commissions.length)
                : 0
            )}
            note="Per transaction"
          />
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="mt-10">
        <SectionLabel>PIPELINE SUMMARY</SectionLabel>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <IconChip>
                <Clock size={14} className="text-stone-700" />
              </IconChip>
              <div>
                <p className="text-sm font-semibold text-stone-900">Pending</p>
                <p className="text-xs text-stone-500">
                  {pendingCommissions.length} deals awaiting close
                </p>
              </div>
            </div>
            <p className="text-3xl font-medium tracking-tight text-stone-900">
              {fmtMoney(pendingNet)}
            </p>
          </Card>
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <IconChip>
                <CheckCircle size={14} className="text-stone-700" />
              </IconChip>
              <div>
                <p className="text-sm font-semibold text-stone-900">Closed</p>
                <p className="text-xs text-stone-500">
                  {closedCommissions.length} deals completed
                </p>
              </div>
            </div>
            <p className="text-3xl font-medium tracking-tight" style={{ color: T.green }}>
              {fmtMoney(closedNet)}
            </p>
          </Card>
        </div>
      </div>

      {/* Commission Cards */}
      <div className="mt-10">
        <SectionLabel>ALL COMMISSIONS</SectionLabel>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {commissions.map((comm, i) => (
            <StaggerIn key={comm.id} index={i}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-900">
                      {comm.address}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      comm.status === "closed"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {comm.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 rounded-xl border border-stone-200 bg-[#FAFAF7] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Sale Price</span>
                    <span className="font-mono font-medium text-stone-800">
                      {fmtMoney(Number(comm.sale_price || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Commission %</span>
                    <span className="font-mono text-stone-800">
                      {fmtPct(comm.commission_pct)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Gross</span>
                    <span className="font-mono text-stone-800">
                      {fmtMoney(Number(comm.gross_commission || 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Split %</span>
                    <span className="font-mono text-stone-800">
                      {fmtPct(comm.split_pct)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-t border-stone-200 pt-2">
                    <span className="font-medium text-stone-700">Net</span>
                    <span
                      className="font-mono text-sm font-semibold"
                      style={{ color: T.green }}
                    >
                      {fmtMoney(Number(comm.net_commission || 0))}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar size={11} />
                  Close: {fmtDate(comm.close_date)}
                </div>
              </Card>
            </StaggerIn>
          ))}
        </div>
      </div>

      {/* Deals Section */}
      {deals.length > 0 && (
        <div className="mt-12">
          <SectionLabel>DEAL PIPELINE</SectionLabel>
          <div className="mt-4">
            <ListContainer>
              <ListHeader label="ACTIVE DEALS" />
              {deals.map((deal, i) => (
                <div key={deal.id} className="px-4 pb-2">
                  <ListRow last={i === deals.length - 1}>
                    <div className="flex items-center gap-3">
                      <IconChip>
                        <Briefcase size={14} className="text-stone-700" />
                      </IconChip>
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {deal.address}
                        </p>
                        <p className="text-xs text-stone-500">
                          {deal.stage} &middot; {deal.side} side
                          {deal.closing_date
                            ? ` &middot; Close: ${fmtDate(deal.closing_date)}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">
                        {fmtMoney(Number(deal.price || 0))}
                      </p>
                      {deal.commission && (
                        <p className="text-xs text-stone-500">
                          {fmtMoney(Number(deal.commission))} comm
                        </p>
                      )}
                    </div>
                  </ListRow>
                </div>
              ))}
            </ListContainer>
          </div>
        </div>
      )}
    </div>
  );
}
