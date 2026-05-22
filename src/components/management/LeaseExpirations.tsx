export function LeaseExpirations() {
  const expirations = [
    { period: 'Next 30 Days', count: 18, units: ['2A', '5C', '12B', '...'], status: 'urgent' },
    { period: '31-60 Days', count: 23, units: ['3D', '8A', '14F', '...'], status: 'warning' },
    { period: '61-90 Days', count: 26, units: ['1B', '9E', '15C', '...'], status: 'normal' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold font-cormorant text-gray-900">Upcoming Lease Expirations</h2>
        <button className="text-sm text-[#F9D96A] hover:text-[#f5d153] font-medium">
          View Renewal Strategy →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {expirations.map((exp) => (
          <div
            key={exp.period}
            className={`border-2 rounded-lg p-4 ${
              exp.status === 'urgent'
                ? 'border-red-200 bg-red-50'
                : exp.status === 'warning'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium text-gray-600 mb-1">{exp.period}</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{exp.count}</div>
            <div className="text-xs text-gray-500">Units: {exp.units.join(', ')}</div>
            <button
              className={`mt-3 w-full py-2 rounded text-sm font-medium transition-colors ${
                exp.status === 'urgent'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : exp.status === 'warning'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Start Renewals
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}