'use client';

import { Building2, Home, Trees, Factory } from 'lucide-react';

interface ZoningClassificationProps {
  parcel: {
    currentZoning: string;
    overlay?: string;
    floodZone: string;
  };
}

export default function ZoningClassification({ parcel }: ZoningClassificationProps) {
  const zoningDetails = {
    category: 'Residential',
    subcategory: 'Single Family',
    minLotSize: '5,000 sq ft',
    maxHeight: '35 feet',
    maxCoverage: '40%',
    setbacks: {
      front: '25 feet',
      side: '5 feet',
      rear: '20 feet'
    },
    parking: '2 spaces per dwelling unit',
    density: '8.7 units per acre'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-6">
        <h2 className="font-serif text-2xl text-gray-900">Zoning Classification</h2>
        <p className="text-sm text-gray-500 mt-1">Current designation and development standards</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Classification Badge */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-[#F9D96A]/20 rounded-lg">
            <Home className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Classification</div>
            <div className="font-semibold text-lg text-gray-900">
              {zoningDetails.category} — {zoningDetails.subcategory}
            </div>
          </div>
        </div>

        {/* Overlays & Special Designations */}
        {parcel.overlay && (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-700">Special Designations</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded text-xs font-medium text-amber-900">
                {parcel.overlay}
              </span>
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-900">
                Flood Zone: {parcel.floodZone}
              </span>
            </div>
          </div>
        )}

        {/* Development Standards Grid */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700">Development Standards</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Minimum Lot Size</div>
              <div className="font-mono text-sm font-semibold text-gray-900">{zoningDetails.minLotSize}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Maximum Height</div>
              <div className="font-mono text-sm font-semibold text-gray-900">{zoningDetails.maxHeight}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Maximum Coverage</div>
              <div className="font-mono text-sm font-semibold text-gray-900">{zoningDetails.maxCoverage}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Maximum Density</div>
              <div className="font-mono text-sm font-semibold text-gray-900">{zoningDetails.density}</div>
            </div>
          </div>
        </div>

        {/* Setbacks */}
        <div className="space-y-3">
          <div className="text-sm font-semibold text-gray-700">Required Setbacks</div>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Front Yard</span>
              <span className="font-mono font-semibold text-gray-900">{zoningDetails.setbacks.front}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Side Yard</span>
              <span className="font-mono font-semibold text-gray-900">{zoningDetails.setbacks.side}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rear Yard</span>
              <span className="font-mono font-semibold text-gray-900">{zoningDetails.setbacks.rear}</span>
            </div>
          </div>
        </div>

        {/* Parking Requirements */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-700">Parking Requirements</div>
          <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-900">
            {zoningDetails.parking}
          </div>
        </div>
      </div>
    </div>
  );
}