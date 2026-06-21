export function RentRoll() {
  const tenants = [
    {
      id: 'T001',
      name: 'Sarah Johnson',
      unit: '2A',
      property: 'Riverside Plaza',
      rent: 2850,
      leaseStart: '2023-06-01',
      leaseEnd: '2024-05-31',
      status: 'active',
      paymentStatus: 'current',
      daysToExpiry: 42,
    },
    {
      id: 'T002',
      name: 'Michael Chen',
      unit: '5C',
      property: 'Riverside Plaza',
      rent: 3200,
      leaseStart: '2023-08-15',
      leaseEnd: '2024-08-14',
      status: 'active',
      paymentStatus: 'late',
      daysToExpiry: 117,
    },
    {
      id: 'T003',
      name: 'Emily Rodriguez',
      unit: '12B',
      property: 'Oak Street Apartments',
      rent: 2400,
      leaseStart: '2022-03-01',
      leaseEnd: '2024-02-28',
      status: 'active',
      paymentStatus: 'current',
      daysToExpiry: 14,
    },
    {
      id: 'T004',
      name: 'David Park',
      unit: '3D',
      property: 'Downtown Lofts',
      rent: 4100,
      leaseStart: '2023-01-01',
      leaseEnd: '2024-12-31',
      status: 'active',
      paymentStatus: 'current',
      daysToExpiry: 336,
    },
    {
      id: 'T005',
      name: 'Jennifer Martinez',
      unit: '8A',
      property: 'Riverside Plaza',
      rent: 2650,
      leaseStart: '2023-09-01',
      leaseEnd: '2024-08-31',
      status: 'notice-given',
      paymentStatus: 'current',
      daysToExpiry: 134,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold font-cormorant text-gray-900">Active Rent Roll</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Export CSV
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors">
            + Add Tenant
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monthly Rent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lease End
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days to Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-[#F9D96A] flex items-center justify-center text-gray-900 font-semibold">
                      {tenant.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                      <div className="text-xs text-gray-500">{tenant.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tenant.unit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.property}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${tenant.rent.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tenant.leaseEnd}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`text-sm font-medium ${
                      tenant.daysToExpiry <= 30
                        ? 'text-red-600'
                        : tenant.daysToExpiry <= 60
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {tenant.daysToExpiry} days
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.paymentStatus === 'current'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tenant.paymentStatus === 'current' ? 'Current' : 'Late'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tenant.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {tenant.status === 'active' ? 'Active' : 'Notice Given'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-[#F9D96A] hover:text-[#f5d153] font-medium">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing 5 of 812 tenants
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}