import { TenantMetrics } from '@/components/management/TenantMetrics';
import { RentRoll } from '@/components/management/RentRoll';
import { LeaseExpirations } from '@/components/management/LeaseExpirations';
import { TenantFilters } from '@/components/management/TenantFilters';
import { CommunicationLog } from '@/components/management/CommunicationLog';

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-cormorant text-gray-900">Tenant Management</h1>
        <p className="mt-2 text-gray-600">Rent roll, lease tracking, and tenant communications across your portfolio</p>
      </div>

      <TenantMetrics />
      <TenantFilters />
      <LeaseExpirations />
      <RentRoll />
      <CommunicationLog />
    </div>
  );
}