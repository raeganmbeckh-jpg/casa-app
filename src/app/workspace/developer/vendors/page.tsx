import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  YellowBadge,
  IconChip,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import {
  HardHat,
  Phone,
  Mail,
  Star,
  Users,
  Wrench,
} from "lucide-react";

export const dynamic = "force-dynamic";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default async function VendorsPage() {
  const supabase = createServerClient();

  const { data: vendors, error } = await supabase
    .from("vendors")
    .select("*")
    .order("name");

  const rows = vendors ?? [];

  // Discover column names dynamically from the first row
  const sampleKeys = rows.length > 0 ? Object.keys(rows[0]) : [];
  const hasRating = sampleKeys.includes("rating");
  const hasSpecialty =
    sampleKeys.includes("specialty") || sampleKeys.includes("category");
  const hasPhone = sampleKeys.includes("phone");
  const hasEmail = sampleKeys.includes("email");
  const hasHourlyRate = sampleKeys.includes("hourly_rate");
  const hasStatus = sampleKeys.includes("status");
  const hasNotes = sampleKeys.includes("notes");

  const getSpecialty = (v: any): string =>
    v.specialty ?? v.category ?? "General";

  // KPIs
  const totalVendors = rows.length;
  const specialties = new Set(rows.map((v) => getSpecialty(v)));
  const specialtyCount = specialties.size;
  const avgRating = hasRating
    ? rows.length > 0
      ? (
          rows.reduce((s, v) => s + Number(v.rating ?? 0), 0) / rows.length
        ).toFixed(1)
      : "0"
    : null;
  const activeVendors = hasStatus
    ? rows.filter((v) => v.status === "active").length
    : rows.length;

  if (rows.length === 0) {
    return (
      <div
        className="min-h-screen px-6 py-8 lg:px-10"
        style={{ backgroundColor: T.cream, color: T.ink }}
      >
        <PageTitle
          eyebrow="VENDOR NETWORK"
          title={
            <>
              Contractors & <em className="italic text-stone-500">Vendors</em>.
            </>
          }
        />
        <Card>
          <div className="py-16 text-center">
            <HardHat className="mx-auto h-10 w-10 text-stone-300" />
            <p className="mt-4 text-sm text-stone-500">
              No vendors found. Add contractors and vendors to build your
              network.
            </p>
            {error && (
              <p className="mt-2 text-xs text-red-400">
                {error.message}
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Group by specialty
  const bySpecialty = new Map<string, typeof rows>();
  for (const v of rows) {
    const key = getSpecialty(v);
    if (!bySpecialty.has(key)) bySpecialty.set(key, []);
    bySpecialty.get(key)!.push(v);
  }

  return (
    <div
      className="min-h-screen px-6 py-8 lg:px-10"
      style={{ backgroundColor: T.cream, color: T.ink }}
    >
      <PageTitle
        eyebrow="VENDOR NETWORK"
        title={
          <>
            Contractors & <em className="italic text-stone-500">Vendors</em>.
          </>
        }
        subtitle={`${totalVendors} vendors across ${specialtyCount} specialties.`}
      />

      {/* KPI Row */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="TOTAL VENDORS" value={totalVendors} />
        <KpiCard
          label="SPECIALTIES"
          value={specialtyCount}
          note={`${totalVendors} contractors`}
        />
        {avgRating !== null && (
          <KpiCard label="AVG RATING" value={`${avgRating} / 5`} />
        )}
        <KpiCard
          label={hasStatus ? "ACTIVE" : "VENDORS"}
          value={activeVendors}
          note={hasStatus ? "Currently active" : "In directory"}
        />
      </section>

      {/* Vendor Cards */}
      <SectionLabel>DIRECTORY</SectionLabel>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((vendor, i) => {
          const rating = Number(vendor.rating ?? 0);
          const specialty = getSpecialty(vendor);

          return (
            <StaggerIn key={vendor.id} index={i}>
              <Card className="flex flex-col" padded={false}>
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <IconChip>
                        <Wrench className="h-4 w-4 text-stone-700" />
                      </IconChip>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-medium text-stone-900">
                          {vendor.name}
                        </h3>
                        <YellowBadge>{specialty}</YellowBadge>
                      </div>
                    </div>
                    {hasRating && rating > 0 && (
                      <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span
                          className="text-xs font-semibold text-amber-800"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 space-y-2">
                    {hasPhone && vendor.phone && (
                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <Phone className="h-3 w-3 text-stone-400" />
                        <span
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {vendor.phone}
                        </span>
                      </div>
                    )}
                    {hasEmail && vendor.email && (
                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <Mail className="h-3 w-3 text-stone-400" />
                        {vendor.email}
                      </div>
                    )}
                    {hasHourlyRate && vendor.hourly_rate && (
                      <div className="flex items-center gap-2 text-xs text-stone-600">
                        <span className="text-stone-400">$/hr</span>
                        <span
                          className="font-medium text-stone-800"
                          style={{ fontFamily: "var(--font-geist-mono)" }}
                        >
                          {fmtMoney(Number(vendor.hourly_rate))}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status + Notes */}
                  <div className="mt-4 flex items-center gap-2">
                    {hasStatus && vendor.status && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          vendor.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : vendor.status === "preferred"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {vendor.status.charAt(0).toUpperCase() +
                          vendor.status.slice(1)}
                      </span>
                    )}
                  </div>

                  {hasNotes && vendor.notes && (
                    <p className="mt-3 text-xs leading-relaxed text-stone-500">
                      {vendor.notes}
                    </p>
                  )}
                </div>
              </Card>
            </StaggerIn>
          );
        })}
      </div>
    </div>
  );
}
