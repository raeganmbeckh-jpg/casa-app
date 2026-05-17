'use client';

export default function ReturnsCalculator() {
  // Mock calculated values - in production these would be computed from PropertyInputs
  const metrics = [
    { label: 'Cap Rate', value: '7.82%', trend: '+0.3%', status: 'good' },
    { label: 'Cash-on-Cash Return', value: '8.45%', trend: '+1.2%', status: 'good' },
    { label: '5-Year IRR', value: '14.7%', trend: '+2.1%', status: 'excellent' },
    { label: 'Equity Multiple', value: '1.89x', trend: '+0.15x', status: 'good' },
    { label: 'DSCR', value: '1.45', trend: '+0.08', status: 'good' },
    { label: 'Debt Yield', value: '11.2%', trend: '+0.5%', status: 'good' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-700 bg-green-50';
      case 'good': return 'text-blue-700 bg-blue-50';
      case 'caution': return 'text-yellow-700 bg-yellow-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-semibold text-gray-900">Returns Analysis</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live calculation
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="p-4 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
            <div className="text-2xl font-semibold text-gray-900 mb-2">{metric.value}</div>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {metric.trend}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <strong>Agent Commentary:</strong> This deal shows strong returns across all metrics. The IRR of 14.7% exceeds typical market thresholds for this asset class. DSCR of 1.45 provides comfortable debt service coverage. Consider stress testing vacancy assumptions.
          </div>
        </div>
      </div>
    </div>
  );
}