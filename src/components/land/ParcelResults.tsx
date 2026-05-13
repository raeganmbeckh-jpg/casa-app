'use client';

import { MapPin, DollarSign, Maximize, TrendingUp, ExternalLink } from 'lucide-react';

interface Parcel {
  id: string;
  apn: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  acres: number;
  pricePerAcre: number;
  totalPrice: number;
  zoning: string;
  status: 'available' | 'under-contract' | 'sold' | 'tracked';
  daysOnMarket: number;
  utilities: string;
}

const mockParcels: Parcel[] = [
  {
    id: '1',
    apn: '123-456-789',
    address: '1234 Rural Route',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    acres: 25.5,
    pricePerAcre: 48200,
    totalPrice: 1229100,
    zoning: 'Agricultural',
    status: 'available',
    daysOnMarket: 45,
    utilities: 'Partial',
  },
  {
    id: '2',
    apn: '987-654-321',
    address: '5678 County Road 100',
    city: 'Dripping Springs',
    state: 'TX',
    zip: '78620',
    acres: 50.0,
    pricePerAcre: 52000,
    totalPrice: 2600000,
    zoning: 'Residential',
    status: 'under-contract',
    daysOnMarket: 12,
    utilities: 'Full',
  },
  {
    id: '3',
    apn: '456-789-123',
    address: 'TBD Highway 290',
    city: 'Johnson City',
    state: 'TX',
    zip: '78636',
    acres: 100.0,
    pricePerAcre: 38000,
    totalPrice: 3800000,
    zoning: 'Commercial',
    status: 'tracked',
    daysOnMarket: 180,
    utilities: 'None',
  },
];

const statusColors = {
  available: 'bg-green-100 text-green-800',
  'under-contract': 'bg-yellow-100 text-yellow-800',
  sold: 'bg-red-100 text-red-800',
  tracked: 'bg-blue-100 text-blue-800',
};

const statusLabels = {
  available: 'Available',
  'under-contract': 'Under Contract',
  sold: 'Sold',
  tracked: 'Tracked',
};

export default function ParcelResults() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="font-['Inter'] text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{mockParcels.length}</span> parcels
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent">
          <option>Sort by: Price (Low to High)</option>
          <option>Sort by: Price (High to Low)</option>
          <option>Sort by: Acreage (Low to High)</option>
          <option>Sort by: Acreage (High to Low)</option>
          <option>Sort by: Days on Market</option>
        </select>
      </div>

      {mockParcels.map((parcel) => (
        <div
          key={parcel.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#F9D96A] transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-['Cormorant_Garamond'] text-xl font-light text-gray-900">
                  {parcel.address}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-['Inter'] font-medium ${statusColors[parcel.status]}`}>
                  {statusLabels[parcel.status]}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-['Inter']">
                <MapPin className="w-4 h-4" />
                <span>{parcel.city}, {parcel.state} {parcel.zip}</span>
                <span className="text-gray-400">•</span>
                <span>APN: {parcel.apn}</span>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
              <ExternalLink className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-['Inter'] mb-1">
                <Maximize className="w-4 h-4" />
                <span>Acreage</span>
              </div>
              <div className="font-['Cormorant_Garamond'] text-2xl font-light text-gray-900">
                {parcel.acres}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-['Inter'] mb-1">
                <DollarSign className="w-4 h-4" />
                <span>$/Acre</span>
              </div>
              <div className="font-['Cormorant_Garamond'] text-2xl font-light text-gray-900">
                ${(parcel.pricePerAcre / 1000).toFixed(0)}k
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-['Inter'] mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Total Price</span>
              </div>
              <div className="font-['Cormorant_Garamond'] text-2xl font-light text-gray-900">
                ${(parcel.totalPrice / 1000000).toFixed(2)}M
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 font-['Inter'] mb-1">
                Days on Market
              </div>
              <div className="font-['Cormorant_Garamond'] text-2xl font-light text-gray-900">
                {parcel.daysOnMarket}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm font-['Inter']">
              <span className="text-gray-600">Zoning:</span>
              <span className="font-medium text-gray-900">{parcel.zoning}</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-['Inter']">
              <span className="text-gray-600">Utilities:</span>
              <span className="font-medium text-gray-900">{parcel.utilities}</span>
            </div>
            <div className="ml-auto">
              <button className="px-4 py-2 bg-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#f7d04d] transition-colors font-['Inter'] text-sm font-medium">
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
