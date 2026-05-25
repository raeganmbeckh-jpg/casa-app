import React from 'react'

interface HBUHeaderProps {
  parcelId: string
}

export default function HBUHeader({ parcelId }: HBUHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-cormorant text-4xl font-light text-gray-900">
                Highest & Best Use Analysis
              </h1>
              <span className="px-3 py-1 bg-[#F9D96A] text-gray-900 text-sm font-medium rounded-full">
                Parcel {parcelId}
              </span>
            </div>
            <p className="text-gray-600 font-inter text-sm">
              Multi-agent analysis of optimal development scenarios
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Run Analysis
            </button>
          </div>
        </div>
        
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-500">Parcel Size:</span>
            <span className="ml-2 font-medium text-gray-900">2.47 acres</span>
          </div>
          <div>
            <span className="text-gray-500">Current Zoning:</span>
            <span className="ml-2 font-medium text-gray-900">R-3 Residential</span>
          </div>
          <div>
            <span className="text-gray-500">Market:</span>
            <span className="ml-2 font-medium text-gray-900">Austin, TX</span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <span className="ml-2 font-medium text-gray-900">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}