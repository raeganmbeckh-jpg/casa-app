import { TrendingUp, Clock, Home, DollarSign } from 'lucide-react'

export function MarketMetrics() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-4">Market Metrics</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Avg Days on Market</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">13</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Fast-moving market</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Home className="w-4 h-4" />
              <span>Inventory Level</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">1.8 months</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Seller's market</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>List-to-Sale Ratio</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">101.2%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#F9D96A] h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Above asking common</div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Median Sale Price</span>
            <span className="font-semibold text-gray-900">$668,000</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.2% year over year</span>
          </div>
        </div>
      </div>
    </div>
  )
}
