import { TrendingUp, Target, AlertCircle } from 'lucide-react'

export function PricingRecommendation() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-4">Pricing Recommendation</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Recommended List Price</span>
          <Target className="w-4 h-4 text-[#F9D96A]" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">$677,500</div>
        <div className="text-sm text-gray-600">$276.53 per sq ft</div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Conservative</span>
            <span className="text-sm font-semibold text-gray-900">$665,000</span>
          </div>
          <div className="text-xs text-gray-600">Quick sale, 7-14 days</div>
        </div>

        <div className="p-3 bg-[#F9D96A]/10 border border-[#F9D96A] rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">Optimal</span>
            <span className="text-sm font-semibold text-gray-900">$677,500</span>
          </div>
          <div className="text-xs text-gray-600">Best value, 14-21 days</div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Aggressive</span>
            <span className="text-sm font-semibold text-gray-900">$695,000</span>
          </div>
          <div className="text-xs text-gray-600">Test market, 30+ days</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>Based on 3 comparable sales within 0.5 miles, adjusted for condition and features.</p>
        </div>
      </div>
    </div>
  )
}
