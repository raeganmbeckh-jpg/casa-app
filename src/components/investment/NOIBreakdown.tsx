'use client';

export default function NOIBreakdown() {
  const breakdown = [
    { category: 'Gross Potential Income', amount: 650000, percent: 100 },
    { category: 'Vacancy Loss', amount: -32500, percent: -5 },
    { category: 'Effective Gross Income', amount: 617500, percent: 95, highlight: true },
    { category: 'Property Management', amount: -30875, percent: -5 },
    { category: 'Repairs & Maintenance', amount: -24700, percent: -4 },
    { category: 'Property Insurance', amount: -18525, percent: -3 },
    { category: 'Property Taxes', amount: -61750, percent: -10 },
    { category: 'Utilities', amount: -12350, percent: -2 },
    { category: 'Marketing & Leasing', amount: -6175, percent: -1 },
    { category: 'Other Operating Expenses', amount: -12350, percent: -2 },
    { category: 'Total Operating Expenses', amount: -166725, percent: -27, highlight: true },
    { category: 'Net Operating Income', amount: 450775, percent: 69, highlight: true, isNOI: true }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif font-semibold text-gray-900 mb-6">NOI Breakdown</h2>
      
      <div className="space-y-1">
        {breakdown.map((item, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-3 px-4 rounded ${
              item.highlight ? 'bg-gray-50 font-medium' : ''
            } ${item.isNOI ? 'bg-[#F9D96A]/20 border-2 border-[#F9D96A] mt-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-sm ${
                item.isNOI ? 'text-gray-900 font-semibold' : item.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'
              }`}>
                {item.category}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <span className={`text-sm tabular-nums ${
                item.isNOI ? 'text-gray-900 font-semibold' : item.highlight ? 'text-gray-900 font-medium' : 'text-gray-700'
              }`}>
                ${Math.abs(item.amount).toLocaleString()}
              </span>
              <span className={`text-sm w-16 text-right tabular-nums ${
                item.isNOI ? 'text-gray-900 font-semibold' : 'text-gray-600'
              }`}>
                {item.percent > 0 ? '+' : ''}{item.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-600 font-medium mb-1">Operating Expense Ratio</div>
          <div className="text-2xl font-semibold text-blue-900">27.0%</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-xs text-green-600 font-medium mb-1">NOI Margin</div>
          <div className="text-2xl font-semibold text-green-900">73.0%</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-xs text-purple-600 font-medium mb-1">NOI Per Unit</div>
          <div className="text-2xl font-semibold text-purple-900">$7,513</div>
          <div className="text-xs text-purple-600 mt-1">60 units</div>
        </div>
      </div>
    </div>
  );
}