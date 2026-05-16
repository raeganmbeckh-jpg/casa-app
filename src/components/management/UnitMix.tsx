'use client'

interface UnitMixProps {
  propertyId: string
}

export default function UnitMix({ propertyId }: UnitMixProps) {
  // Mock data - will be replaced with real data from Supabase
  const unitTypes = [
    { type: 'Studio', count: 8, occupied: 7, avgRent: '$1,850', marketRent: '$1,950' },
    { type: '1 Bed / 1 Bath', count: 20, occupied: 19, avgRent: '$2,350', marketRent: '$2,475' },
    { type: '2 Bed / 2 Bath', count: 16, occupied: 16, avgRent: '$3,100', marketRent: '$3,250' },
    { type: '3 Bed / 2 Bath', count: 4, occupied: 4, avgRent: '$3,850', marketRent: '$4,100' }
  ]

  const totalUnits = unitTypes.reduce((sum, unit) => sum + unit.count, 0)
  const totalOccupied = unitTypes.reduce((sum, unit) => sum + unit.occupied, 0)
  const occupancyRate = ((totalOccupied / totalUnits) * 100).toFixed(1)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Unit Mix & Occupancy</h2>
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{totalOccupied}/{totalUnits}</span> units occupied
          <span className="ml-2 text-green-600 font-medium">({occupancyRate}%)</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Unit Type</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Total</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Occupied</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Vacant</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Avg Rent</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Market Rent</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Gap</th>
            </tr>
          </thead>
          <tbody>
            {unitTypes.map((unit, index) => {
              const vacant = unit.count - unit.occupied
              const occupancy = ((unit.occupied / unit.count) * 100).toFixed(0)
              const avgRentNum = parseInt(unit.avgRent.replace(/[$,]/g, ''))
              const marketRentNum = parseInt(unit.marketRent.replace(/[$,]/g, ''))
              const gap = marketRentNum - avgRentNum
              const gapPercent = ((gap / avgRentNum) * 100).toFixed(1)

              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{unit.type}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{unit.count}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-gray-900">{unit.occupied}</span>
                    <span className="ml-1 text-xs text-gray-500">({occupancy}%)</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={vacant > 0 ? 'text-yellow-600 font-medium' : 'text-gray-400'}>
                      {vacant}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">{unit.avgRent}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{unit.marketRent}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-600 font-medium">
                      +${gap.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">({gapPercent}%)</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
