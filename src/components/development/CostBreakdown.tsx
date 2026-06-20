'use client';

export default function CostBreakdown() {
  const hardCosts = [
    { category: 'Land Acquisition', amount: 1500000, percentage: 17.8 },
    { category: 'Structure & Framing', amount: 2100000, percentage: 24.9 },
    { category: 'Interior Finishes', amount: 1850000, percentage: 21.9 },
    { category: 'Contingency', amount: 1000000, percentage: 11.8 },
    { category: 'MEP Systems', amount: 980000, percentage: 11.6 },
    { category: 'Exterior Finishes', amount: 620000, percentage: 7.3 },
    { category: 'Sitework & Demo', amount: 450000, percentage: 5.3 },
    { category: 'Foundation', amount: 380000, percentage: 4.5 },
  ];

  const softCosts = [
    { category: 'Financing Costs', amount: 320000, percentage: 27.1 },
    { category: 'Architectural Fees', amount: 285000, percentage: 24.2 },
    { category: 'Engineering', amount: 195000, percentage: 16.5 },
    { category: 'Marketing & Leasing', amount: 180000, percentage: 15.3 },
    { category: 'Permits & Entitlements', amount: 145000, percentage: 12.3 },
    { category: 'Insurance', amount: 125000, percentage: 10.6 },
    { category: 'Legal Fees', amount: 95000, percentage: 8.1 },
  ];

  const totalHardCosts = hardCosts.reduce((sum, item) => sum + item.amount, 0);
  const totalSoftCosts = softCosts.reduce((sum, item) => sum + item.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Cost Breakdown</h2>

      {/* Hard Costs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Hard Costs</h3>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(totalHardCosts)}</span>
        </div>

        <div className="space-y-3">
          {hardCosts.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{item.category}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#F9D96A] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Soft Costs */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Soft Costs</h3>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(totalSoftCosts)}</span>
        </div>

        <div className="space-y-3">
          {softCosts.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{item.category}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total Project Cost</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalHardCosts + totalSoftCosts)}</span>
        </div>
      </div>
    </div>
  );
}