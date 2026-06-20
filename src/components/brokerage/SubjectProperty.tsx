import { MapPin, Home, Calendar, Ruler } from 'lucide-react'

export function SubjectProperty() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-gray-900">Subject Property</h2>
          <p className="text-gray-600 text-sm mt-1">Property being evaluated for market pricing</p>
        </div>
        <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Edit Details
        </button>
      </div>

      <div className="flex gap-6 mb-6">
        <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
          <Home className="w-12 h-12 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">1234 Maple Street</h3>
              <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>Austin, TX 78704</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">List Price (Estimate)</div>
              <div className="text-2xl font-semibold text-gray-900">$675,000</div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Bedrooms</div>
              <div className="text-lg font-medium text-gray-900">4</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Bathrooms</div>
              <div className="text-lg font-medium text-gray-900">3</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Sq Ft</div>
              <div className="text-lg font-medium text-gray-900">2,450</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Year Built</div>
              <div className="text-lg font-medium text-gray-900">2015</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-sm text-gray-600 mb-1">Property Type</div>
          <div className="text-sm font-medium text-gray-900">Single Family</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Lot Size</div>
          <div className="text-sm font-medium text-gray-900">0.25 acres</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Condition</div>
          <div className="text-sm font-medium text-gray-900">Good</div>
        </div>
      </div>
    </div>
  )
}
