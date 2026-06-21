export function TenantFilters() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Tenants
          </label>
          <input
            type="text"
            placeholder="Name, unit, phone..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All Properties</option>
            <option>Riverside Plaza</option>
            <option>Oak Street Apartments</option>
            <option>Downtown Lofts</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lease Status
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Expiring Soon</option>
            <option>Month-to-Month</option>
            <option>Notice Given</option>
          </select>
        </div>

        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
            <option>All</option>
            <option>Current</option>
            <option>Late (1-30d)</option>
            <option>Delinquent (30+d)</option>
          </select>
        </div>

        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
          Clear Filters
        </button>
      </div>
    </div>
  );
}