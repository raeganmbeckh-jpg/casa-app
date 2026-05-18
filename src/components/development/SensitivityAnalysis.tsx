'use client';

export default function SensitivityAnalysis() {
  const scenarios = [
    {
      name: 'Base Case',
      costVariance: 0,
      revenueVariance: 0,
      roi: 24.3,
      profit: 2050000,
      status: 'base',
    },
    {
      name: 'Cost Overrun (+10%)',
      costVariance: 10,
      revenueVariance: 0,
      roi: 16.8,
      profit: 1205000,
      status: 'caution',
    },
    {
      name: 'Revenue Shortfall (-10%)',
      costVariance: 0,
      revenueVariance: -10,
      roi: 15.2,
      profit: 927000,
      status: 'caution',
    },
    {
      name: 'Worst Case (+10% cost, -10% rev)',
      costVariance: 10,
      revenueVariance: -10,
      roi: 7.6,
      profit: 82000,
      status: 'risk',
    },
    {
      name: 'Best Case (-5% cost, +10% rev)',
      costVariance: -5,
      revenueVariance: 10,
      roi: 35.1,
      profit: 3318000,
      status: 'upside',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'base':
        return 'bg-gray-100 text-gray-800';
      case 'upside':
        return 'bg-green-100 text-green-800';
      case 'caution':
        return 'bg-yellow-100 text-yellow-800';
      case 'risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 20) return 'text-green-600';
    if (roi >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-bold text-gray-900">Sensitivity Analysis</h2>
        <button className="text-sm text-[#F9D96A] hover:text-[#f7d04a] font-medium">
          Run Custom Scenario
        </button>
      </div>

      <div className="space-y-4">
        {scenarios.map((scenario, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:border-[#F9D96A] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                <div className="flex gap-3 mt-1 text-xs text-gray-600">
                  {scenario.costVariance !== 0 && (
                    <span>Cost: {scenario.costVariance > 0 ? '+' : ''}{scenario.costVariance}%</span>
                  )}
                  {scenario.revenueVariance !== 0 && (
                    <span>Revenue: {scenario.revenueVariance > 0 ? '+' : ''}{scenario.revenueVariance}%</span>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(scenario.status)}`}>
                {scenario.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">ROI</div>
                <div className={`text-xl font-bold ${getRoiColor(scenario.roi)}`}>
                  {scenario.roi.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Net Profit</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(scenario.profit)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="text-sm font-medium text-blue-800">Agent Analysis</div>
            <div className="text-xs text-blue-700 mt-1">
              Project remains profitable in 4/5 scenarios. Risk Modeler flags 10% cost overrun as most likely downside risk. Recommend maintaining 15% contingency buffer.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}