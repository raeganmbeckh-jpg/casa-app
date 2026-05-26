'use client'

import { Home, DollarSign, Calendar } from 'lucide-react'

const listings = [
  {
    id: 'LST-001',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    price: 485000,
    beds: 3,
    baths: 2,
    sqft: 2100,
    daysOnMarket: 12,
    matchCount: 18,
    status: 'active'
  },
  {
    id: 'LST-002',
    address: '123 Main Street',
    city: 'Portland',
    price: 725000,
    beds: 4,
    baths: 3,
    sqft: 2850,
    daysOnMarket: 6,
    matchCount: 24,
    status: 'active'
  },
  {
    id: 'LST-003',
    address: '456 Oak Avenue',
    city: 'Seattle',
    price: 1200000,
    beds: 5,
    baths: 4,
    sqft: 3600,
    daysOnMarket: 3,
    matchCount: 12,
    status: 'active'
  }
]

export default function ActiveListings() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-serif text-gray-900">Active Listings</h2>
        <p className="text-sm text-gray-600 mt-1">Your current inventory with match counts</p>
      </div>

      <div className="divide-y divide-gray-200">
        {listings.map((listing) => (
          <div key={listing.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{listing.address}</h3>
                    <p className="text-sm text-gray-600">{listing.city}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span>${listing.price.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600">
                    {listing.beds} bed · {listing.baths} bath · {listing.sqft.toLocaleString()} sqft
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{listing.daysOnMarket} days</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F9D96A] text-gray-900 text-sm font-medium rounded">
                  {listing.matchCount} Matches
                </div>
                <p className="text-xs text-gray-600 mt-2">View compatible buyers →</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
