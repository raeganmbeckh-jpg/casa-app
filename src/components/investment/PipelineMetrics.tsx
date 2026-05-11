'use client';

export default function PipelineMetrics() {
  const metrics = [
    {
      label: 'Total Pipeline Value',
      value: '$47.2M',
      change: '+12.4%',
      positive: true,
    },
    {
      label: 'Active Deals',
      value: '23',
      change: '+3',
      positive: true,
    },
    {
      label: 'Under Contract',
      value: '8',
      change: '-1',
      positive: false,
    },
    {
      label: 'Avg. Days in Pipeline',
      value: '42',
      change: '-5 days',
      positive: true,
    },
    {
      label: 'Close Rate (90d)',
      value: '34%',
      change: '+8%',
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <p className="text-sm text-gray-600">{metric.label}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-gray-900">
            {metric.value}
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              metric.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {metric.change}
          </p>
        </div>
      ))}
    </div>
  );
}
