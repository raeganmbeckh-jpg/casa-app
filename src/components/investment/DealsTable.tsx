'use client';

export default function DealsTable() {
  const deals = [
    {
      id: 1,
      name: 'Riverside Apartments',
      address: '1234 River St, Portland, OR',
      type: 'Multifamily',
      stage: 'Due Diligence',
      price: '$4.2M',
      irr: '18.4%',
      capRate: '6.2%',
      daysInPipeline: 38,
      agent: 'Underwriter AI',
      status: 'green',
    },
    {
      id: 2,
      name: 'Downtown Office Tower',
      address: '500 Main St, Seattle, WA',
      type: 'Office',
      stage: 'Under Contract',
      price: '$12.8M',
      irr: '14.2%',
      capRate: '5.8%',
      daysInPipeline: 52,
      agent: 'Underwriter AI',
      status: 'yellow',
    },
    {
      id: 3,
      name: 'Strip Mall Portfolio',
      address: 'Multiple Locations, TX',
      type: 'Retail',
      stage: 'Underwriting',
      price: '$8.5M',
      irr: '16.1%',
      capRate: '7.1%',
      daysInPipeline: 22,
      agent: 'Underwriter AI',
      status: 'green',
    },
    {
      id: 4,
      name: 'Industrial Warehouse',
      address: '789 Industrial Pkwy, Phoenix, AZ',
      type: 'Industrial',
      stage: 'Evaluation',
      price: '$6.1M',
      irr: '19.2%',
      capRate: '6.9%',
      daysInPipeline: 12,
      agent: 'Comp Analyst',
      status: 'green',
    },
    {
      id: 5,
      name: 'Garden Apartments',
      address: '321 Oak Ave, Denver, CO',
      type: 'Multifamily',
      stage: 'Under Contract',
      price: '$5.9M',
      irr: '15.8%',
      capRate: '6.5%',
      daysInPipeline: 67,
      agent: 'Risk Modeler',
      status: 'red',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                IRR
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Cap Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className="cursor-pointer transition-colors hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{deal.name}</p>
                    <p className="text-sm text-gray-600">{deal.address}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {deal.type}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                    {deal.stage}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {deal.price}
                </td>
                <td className="px-6 py-4 font-semibold text-green-600">
                  {deal.irr}
                </td>
                <td className="px-6 py-4 text-gray-900">{deal.capRate}</td>
                <td className="px-6 py-4 text-gray-900">
                  {deal.daysInPipeline}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {deal.agent}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex h-3 w-3 rounded-full ${getStatusColor(
                      deal.status
                    )}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
