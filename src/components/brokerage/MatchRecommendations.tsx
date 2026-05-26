'use client'

import { Home, User, TrendingUp, AlertCircle } from 'lucide-react'

const recommendations = [
  {
    id: 'REC-001',
    listing: '742 Evergreen Terrace',
    listingId: 'LST-001',
    buyer: 'Sarah & Michael Chen',
    buyerId: 'BYR-001',
    matchScore: 94,
    reasons: [
      'Price within budget ($485K vs $450K-$550K)',
      'Preferred location (Springfield)',
      '3 bed matches requirement',
      'Move-in ready condition'
    ],
    concerns: ['Slightly above midpoint budget'],
    priority: 'high',
    contacted: false
  },
  {
    id: 'REC-002',
    listing: '123 Main Street',
    listingId: 'LST-002',
    buyer: 'Emily Thompson',
    buyerId: 'BYR-003',
    matchScore: 91,
    reasons: [
      'Premium location match',
      '4 bed within range',
      'High-end finishes align with profile',
      'Timeline matches (60-90 days)'
    ],
    concerns: ['Below budget range'],
    priority: 'medium',
    contacted: true
  },
  {
    id: 'REC-003',
    listing: '123 Main Street',
    listingId: 'LST-002',
    buyer: 'Robert Williams',
    buyerId: 'BYR-002',
    matchScore: 87,
    reasons: [
      'Investment-grade property',
      'Strong rental market in Portland',
      'Price within budget',
      'Near transit/amenities'
    ],
    concerns: ['Buyer prefers newer construction'],
    priority: 'medium',
    contacted: false
  }
]

export default function MatchRecommendations() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-serif text-gray-900">Top Match Recommendations</h2>
        <p className="text-sm text-gray-600 mt-1">AI-scored buyer-listing compatibility</p>
      </div>

      <div className="divide-y divide-gray-200">
        {recommendations.map((rec) => (
          <div key={rec.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-4">
              {/* Match Score */}
              <div className="text-center flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#F9D96A] flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{rec.matchScore}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">Match</div>
              </div>

              {/* Match Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{rec.listing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{rec.buyer}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.priority === 'high' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        High Priority
                      </span>
                    )}
                    {rec.contacted && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Contacted
                      </span>
                    )}
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">Why This Match Works</span>
                  </div>
                  <ul className="space-y-1">
                    {rec.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-gray-600 pl-6">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                {rec.concerns.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-medium text-gray-700">Potential Concerns</span>
                    </div>
                    <ul className="space-y-1">
                      {rec.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-gray-600 pl-6">
                          • {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="flex-shrink-0">
                {!rec.contacted ? (
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
                    Contact Buyer
                  </button>
                ) : (
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                    Follow Up
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
