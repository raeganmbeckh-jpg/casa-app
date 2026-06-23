import React from 'react'

interface FinancialProjectionsProps {
  parcelId: string
}

const scenarios = [
  {
    name: 'Base Case',
    totalCost: 12400000,
    totalRevenue: 18200000,
    netProfit: 5800000,
    roi: 46.8,
    irr: 18.2,
    probability: 60
  },
  {
    name: 'Optimistic',
    totalCost: 12100000,
    totalRevenue: 20500000,
    netProfit: 8400000,
    roi: 69.4,
    irr: 24.7,
    probability: 25
  },
  {
    name: 'Conservative',
    totalCost: 13200000,
    totalRevenue: 16800000,
    netProfit: 3600000,
    roi: 27.3,
    irr: 12.8,
    probability: 15
  }
]

const costBreakdown = [
  { category: 'Land Acquisition', amount: 2800000, percent: 22.6 },
  { category: 'Hard Costs', amount: 7200000, percent: 58.1 },
  { category: 'Soft Costs', amount: 1600000, percent: 12.9 },
  { category: 'Contingency', amount: 800000, percent: 6.4 }
]

export default function FinancialProjections({ parcelId }: FinancialProjectionsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-cormorant text-2xl font-light text-gray-900">
          Financial Projections
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Multifamily Development scenario
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Scenario Comparison */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Scenario Analysis</h3>
          <div className="space-y-3">
            {scenarios.map((scenario, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  idx === 0 ? 'border-[#F9D96A] bg-[#F9D96A]/5' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-gray-900">{scenario.name}</span>
                  <span className="text-xs text-gray-500">{scenario.probability}% probability</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs mb-1">ROI</div>
                    <div className="font-semibold text-gray-900">{scenario.roi}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">IRR</div>
                    <div className="font-semibold text-gray-900">{scenario.irr}%</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs mb-1">Net Profit</div>
                    <div className="font-semibold text-gray-900">
                      ${(scenario.netProfit / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Cost Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Cost Breakdown</h3>
          <div className="space-y-2">
            {costBreakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.category}</span>
                  <span className="font-medium text-gray-900">
                    ${(item.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F9D96A]"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total Project Cost</span>
              <span className="text-lg font-bold text-gray-900">$12.4M</span>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Price per Unit</div>
            <div className="text-lg font-semibold text-gray-900">$258,333</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Price per SF</div>
            <div className="text-lg font-semibold text-gray-900">$287</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Stabilized NOI</div>
            <div className="text-lg font-semibold text-gray-900">$1.24M</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Exit Cap Rate</div>
            <div className="text-lg font-semibold text-gray-900">5.2%</div>
          </div>
        </div>
      </div>
    </div>
  )
}