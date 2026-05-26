'use client'

import { Users, TrendingUp, Send } from 'lucide-react'

export default function BuyerMatchingHeader() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-gray-900">Buyer Matching</h1>
            <p className="mt-1 text-sm text-gray-600">
              AI-powered buyer-listing compatibility scoring
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">247</div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Active Buyers
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">89%</div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Match Rate
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">34</div>
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Send className="w-3 h-3" />
                Pending Outreach
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
