'use client';

import { MapPin, Layers, Maximize2 } from 'lucide-react';

export default function ParcelMap() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="font-['Inter'] text-sm font-medium text-gray-900">
            Map View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-200 rounded transition-colors">
            <Layers className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded transition-colors">
            <Maximize2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="relative h-[600px] bg-gray-100">
        {/* Placeholder for map - will integrate real mapping service */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="font-['Inter'] text-gray-600">
              Map interface will load here
            </p>
            <p className="font-['Inter'] text-sm text-gray-500 mt-2">
              Integration with mapping provider pending
            </p>
          </div>
        </div>

        {/* Map controls overlay */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-left font-['Inter'] text-sm hover:bg-gray-50 rounded transition-colors">
              Satellite
            </button>
            <button className="w-full px-3 py-2 text-left font-['Inter'] text-sm hover:bg-gray-50 rounded transition-colors">
              Terrain
            </button>
            <button className="w-full px-3 py-2 text-left font-['Inter'] text-sm hover:bg-gray-50 rounded transition-colors">
              Zoning
            </button>
            <button className="w-full px-3 py-2 text-left font-['Inter'] text-sm hover:bg-gray-50 rounded transition-colors">
              Flood Zones
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="font-['Inter'] text-xs font-medium text-gray-900 mb-2">
            Legend
          </div>
          <div className="space-y-2 text-xs font-['Inter']">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded" />
              <span className="text-gray-600">Under Contract</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-gray-600">Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />
              <span className="text-gray-600">Tracked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
