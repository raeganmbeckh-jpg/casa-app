import React from 'react'

interface ComparableAnalysisProps {
  parcelId: string
}

const comps = [
  {
    id: 1,
    address: '1840 E Riverside Dr',
    distance: '0.3 miles',
    acres: 2.8,
    zoning: 'MU-2',
    saleDate: '2024-03-15',
    salePrice: 3200000,
    pricePerAcre: 1142857,
    pricePerSF: 26.23,
    development: '52-unit apartment',
    relevance: 95
  },
  {
    id: 2,
    address: '2201 S 1st St',
    distance: '0.8 miles',
    acres: 2.1,
    zoning: 'R-4',
    saleDate: '2024-01-22',
    salePrice: 2450000,
    pricePerAcre: 1166667,
    pricePerSF: 26.78,
    development: '36-unit apartment',
    relevance: 88
  },
  {
    id: 3,
    address: '1515 Town Creek Dr',
    distance: '1.2 miles',
    acres: 3.2,
    zoning: 'MU-1',
    saleDate: '2023-11-08',
    salePrice: 3800000,
    pricePerAcre: 1187500,
    pricePerSF: 27.26,
    development: 'Mixed-use',
    relevance: 82
  }
]

export default function ComparableAnalysis({ parcelId }: ComparableAnalysisProps) {
  const avgPricePerAcre = Math.round(
    comps.reduce((sum, c) => sum + c.pricePerAcre, 0) / comps.length
  )
  
  const subjectAcres = 2.47
  const impliedValue = Math.round(avgPricePerAcre * subjectAcres)
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-cormorant text-2xl font-light text-gray-900">
          Comparable Land Sales
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Recent transactions within 1.5 miles
        </p>
      </div>
      
      <div className="p-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xs text-gray-500 mb-1">Avg. Price/Acre</div>
            <div className="text-lg font-bold text-gray-900">
              ${(avgPricePerAcre / 1000).toFixed(0)}K
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Subject Acres</div>
            <div className="text-lg font-bold text-gray-900">{subjectAcres}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Implied Value</div>
            <div className="text-lg font-bold text-[#F9D96A]">
              ${(impliedValue / 1000000).toFixed(2)}M
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Comp Count</div>
            <div className="text-lg font-bold text-gray-900">{comps.length}</div>
          </div>
        </div>
        
        {/* Comparables table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Address</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Size</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Zoning</th>
                <th className="text-left text-xs font-medium text-gray-500 pb-3">Sale Date</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-3">Price</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-3">$/Acre</th>
                <th className="text-right text-xs font-medium text-gray-500 pb-3">Relevance</th>
              </tr>
            </thead>
            <tbody>
              {comps.map((comp) => (
                <tr key={comp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="text-sm font-medium text-gray-900">{comp.address}</div>
                    <div className="text-xs text-gray-500">{comp.distance} • {comp.development}</div>
                  </td>
                  <td className="py-4 text-sm text-gray-900">{comp.acres} ac</td>
                  <td className="py-4 text-sm text-gray-900">{comp.zoning}</td>
                  <td className="py-4 text-sm text-gray-600">
                    {new Date(comp.saleDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </td>
                  <td className="py-4 text-sm text-gray-900 text-right font-medium">
                    ${(comp.salePrice / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-4 text-sm text-gray-900 text-right">
                    ${(comp.pricePerAcre / 1000).toFixed(0)}K
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#F9D96A]"
                          style={{ width: `${comp.relevance}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-900">{comp.relevance}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Analysis notes */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 mb-2">
                Comp Analysis Notes
              </div>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• All comps sold within last 12 months, reflecting current market pricing</li>
                <li>• Subject parcel comparable size and location to best comps</li>
                <li>• Implied value assumes similar development potential (48-52 units)</li>
                <li>• Adjust +10-15% if MU-2 rezoning achieved vs. as-is R-3 zoning</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}