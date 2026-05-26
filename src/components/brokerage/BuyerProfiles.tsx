'use client'

import { User, MapPin, DollarSign, Calendar } from 'lucide-react'

const buyers = [
  {
    id: 'BYR-001',
    name: 'Sarah & Michael Chen',
    type: 'First-Time Buyer',
    budget: { min: 450000, max: 550000 },
    beds: { min: 3, max: 4 },
    locations: ['Springfield', 'Shelbyville'],
    preApproved: true,
    timeline: 'Immediate',
    lastActivity: '2 hours ago',
    matchScore: 94
  },
  {
    id: 'BYR-002',
    name: 'Robert Williams',
    type: 'Investment Buyer',
    budget: { min: 600000, max: 800000 },
    beds: { min: 3, max: 5 },
    locations: ['Portland', 'Beaverton'],
    preApproved: true,
    timeline: '30-60 days',
    lastActivity: '1 day ago',
    matchScore: 87
  },
  {
    id: 'BYR-003',
    name: 'Emily Thompson',
    type: 'Move-Up Buyer',
    budget: { min: 1100000, max: 1400000 },
    beds: { min: 4, max: 6 },
    locations: ['Seattle', 'Bellevue'],
    preApproved: true,
    timeline: '60-90 days',
    lastActivity: '3 days ago',
    matchScore: 91
  }
]

export default function BuyerProfiles() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif text-gray-900">Active Buyer Profiles</h2>
            <p className="text-sm text-gray-600 mt-1">Pre-qualified buyers in your pipeline</p>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
            Add Buyer
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {buyers.map((buyer) => (
          <div key={buyer.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{buyer.name}</h3>
                    <p className="text-sm text-gray-600">{buyer.type}</p>
                  </div>
                  {buyer.preApproved && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Pre-Approved
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>${buyer.budget.min.toLocaleString()} - ${buyer.budget.max.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <MapPin className="w-4 h-4" />
                    <span>{buyer.locations.join(', ')}</span>
                  </div>
                  <div className="text-gray-600">
                    {buyer.beds.min}-{buyer.beds.max} bedrooms preferred
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Timeline: {buyer.timeline}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  Last activity: {buyer.lastActivity}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900">{buyer.matchScore}%</div>
                <div className="text-xs text-gray-600 mt-1">Match Score</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
