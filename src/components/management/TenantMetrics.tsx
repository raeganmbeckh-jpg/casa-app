export function TenantMetrics() {
  const metrics = [
    { label: 'Total Units', value: '847', change: '+12', trend: 'up' },
    { label: 'Occupied', value: '812', change: '95.9%', trend: 'neutral' },
    { label: 'Lease Expirations (90d)', value: '67', change: '7.9%', trend: 'neutral' },
    { label: 'Average Rent/Unit', value: '$2,340', change: '+3.2%', trend: 'up' },
    { label: 'Collections Rate', value: '98.4%', change: '+0.6%', trend: 'up' },
    { label: 'Avg Tenant Tenure', value: '3.2 yrs', change: '+0.3', trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500">{metric.label}</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-gray-900">{metric.value}</div>
            <div
              className={`text-sm font-medium ${
                metric.trend === 'up'
                  ? 'text-green-600'
                  : metric.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {metric.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}