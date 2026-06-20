import { TrendingUp, TrendingDown, MapPin, Calendar } from 'lucide-react'

const comparables = [
  {
    id: 1,
    address: '1256 Oak Avenue',
    city: 'Austin, TX 78704',
    price: 685000,
    beds: 4,
    baths: 3,
    sqft: 2480,
    yearBuilt: 2016,
    soldDate: '2024-04-15',
    daysOnMarket: 12,
    pricePerSqft: 276,
    adjustedPrice: 678000,
    similarity: 94
  },
  {
    id: 2,
    address: '789 Cedar Lane',
    city: 'Austin, TX 78704',
    price: 662000,
    beds: 4,
    baths: 2.5,
    sqft: 2400,
    yearBuilt: 2014,
    soldDate: '2024-04-08',
    daysOnMarket: 18,
    pricePerSqft: 276,
    adjustedPrice: 671000,
    similarity: 91
  },
  {
    id: 3,
    address: '432 Pine Street',
    city: 'Austin, TX 78704',
    price: 695000,
    beds: 4,
    baths: 3.5,
    sqft: 2550,
    yearBuilt: 2017,
    soldDate: '2024-03-28',
    daysOnMarket: 9,
    pricePerSqft: 273,
    adjustedPrice: 681000,
    similarity: 89
  }
]

export function ComparableProperties() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Comparable Properties</h2>
          <p className="text-gray-600 text-sm mt-1">Recent sales in the subject area, adjusted for differences</p>
        </div>
        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Adjust Criteria
        </button>
      </div>

      <div className="space-y-4">
        {comparables.map((comp) => (
          <div key={comp.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#F9D96A] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-medium text-gray-900">{comp.address}</h3>
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                    {comp.similarity}% Match
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{comp.city}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="w-4 h-4" />
                  <span>Sold {comp.soldDate}</span>
                  <span className="mx-2">•</span>
                  <span>{comp.daysOnMarket} days on market</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Sold Price</div>
                <div className="text-xl font-semibold text-gray-900">${comp.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">${comp.pricePerSqft}/sq ft</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-600">Bedrooms</div>
                <div className="text-sm font-medium text-gray-900">{comp.beds}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Bathrooms</div>
                <div className="text-sm font-medium text-gray-900">{comp.baths}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Square Feet</div>
                <div className="text-sm font-medium text-gray-900">{comp.sqft.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">Year Built</div>
                <div className="text-sm font-medium text-gray-900">{comp.yearBuilt}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                Adjusted Price (after comps)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">${comp.adjustedPrice.toLocaleString()}</span>
                {comp.adjustedPrice > comp.price ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
