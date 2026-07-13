import { createServerClient } from "@/lib/supabase-server";
import {
  Card,
  KpiCard,
  PageTitle,
  SectionLabel,
  StaggerIn,
  IconChip,
  YellowBadge,
} from "@/components/ui/primitives";
import { T } from "@/components/ui/tokens";
import { Wrench, Phone, Mail, Star, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const supabase = createServerClient();

  const [{ data: vendors, error: vendorsErr }, { data: maintenanceRequests }] =
    await Promise.all([
      supabase.from("vendors").select("*"),
      supabase.from("maintenance_requests").select("id, vendor_id"),
    ]);

  const vendorList = vendors ?? [];
  const mxList = maintenanceRequests ?? [];

  // Count jobs per vendor
  const jobCounts: Record<string, number> = {};
  for (const mx of mxList) {
    if (mx.vendor_id) {
      jobCounts[mx.vendor_id] = (jobCounts[mx.vendor_id] || 0) + 1;
    }
  }

  // KPIs
  const totalVendors = vendorList.length;
  const activeVendors = vendorList.filter(
    (v: any) =>
      v.status === "active" ||
      v.status === "Active" ||
      (!v.status && true) // count those without status
  ).length;

  const ratings = vendorList
    .map((v: any) => Number(v.rating))
    .filter((r) => !isNaN(r) && r > 0);
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "N/A";

  // Determine columns dynamically — pick a sample vendor
  const sampleVendor = vendorList[0] as Record<string, any> | undefined;
  const hasSpecialty = sampleVendor
    ? "specialty" in sampleVendor || "category" in sampleVendor
    : false;
  const specialtyKey = sampleVendor
    ? "specialty" in sampleVendor
      ? "specialty"
      : "category" in sampleVendor
        ? "category"
        : null
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAF7] px-6 py-8 lg:px-10">
      <PageTitle
        eyebrow="TEAM & VENDORS"
        title={
          <>
            Your <em className="italic">Team</em>
          </>
        }
        subtitle="Vendor contacts, specialties, and job history from live data."
      />

      {/* KPIs */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <KpiCard label="TOTAL VENDORS" value={totalVendors} />
        <KpiCard
          label="ACTIVE"
          value={activeVendors}
          note={`${totalVendors - activeVendors} inactive`}
        />
        <KpiCard
          label="AVG RATING"
          value={avgRating}
          note={ratings.length > 0 ? `From ${ratings.length} rated vendors` : "No ratings yet"}
        />
      </section>

      {/* Vendor cards */}
      {vendorList.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <User className="mx-auto mb-3 h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              {vendorsErr
                ? "Could not load vendors table."
                : "No vendors found. Add your first vendor to get started."}
            </p>
          </div>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {vendorList.map((vendor: any, i: number) => {
            const name = vendor.name || vendor.company_name || "Unnamed Vendor";
            const specialty = specialtyKey ? vendor[specialtyKey] : null;
            const email = vendor.email;
            const phone = vendor.phone;
            const rating = vendor.rating ? Number(vendor.rating) : null;
            const jobs = jobCounts[vendor.id] || 0;

            return (
              <StaggerIn key={vendor.id} index={i}>
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <IconChip>
                        <Wrench className="h-4 w-4 text-stone-800" />
                      </IconChip>
                      <div>
                        <p className="text-lg font-medium tracking-tight text-stone-900">
                          {name}
                        </p>
                        {specialty && <YellowBadge>{specialty}</YellowBadge>}
                      </div>
                    </div>
                    {rating !== null && !isNaN(rating) && (
                      <div className="flex items-center gap-1 text-sm text-stone-600">
                        <Star className="h-3.5 w-3.5 fill-[#F9D96A] text-[#F9D96A]" />
                        {rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="mt-5 space-y-2">
                    {phone && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                        {phone}
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center gap-2 text-sm text-stone-600">
                        <Mail className="h-3.5 w-3.5 text-stone-400" />
                        {email}
                      </div>
                    )}
                  </div>

                  {/* Footer: job count + status */}
                  <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4">
                    <p
                      className="text-xs text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      {jobs} job{jobs !== 1 ? "s" : ""} assigned
                    </p>
                    {vendor.status && (
                      <span
                        className="inline-flex items-center gap-1.5 text-xs capitalize text-stone-500"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              vendor.status === "active" ? T.green : T.dim,
                          }}
                        />
                        {vendor.status}
                      </span>
                    )}
                  </div>

                  {/* Show any extra columns for flexibility */}
                  {vendor.notes && (
                    <p className="mt-3 text-xs italic text-stone-400">
                      {vendor.notes}
                    </p>
                  )}
                  {vendor.hourly_rate && (
                    <p
                      className="mt-1 text-xs text-stone-500"
                      style={{ fontFamily: "var(--font-geist-mono)" }}
                    >
                      Rate: ${Number(vendor.hourly_rate).toFixed(0)}/hr
                    </p>
                  )}
                </Card>
              </StaggerIn>
            );
          })}
        </section>
      )}
    </div>
  );
}
