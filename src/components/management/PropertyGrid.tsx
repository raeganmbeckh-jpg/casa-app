'use client';

import { BuildingIcon, UsersIcon, DollarSignIcon } from 'lucide-react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupancy: number;
  monthlyNOI: number;
  status: 'healthy' | 'warning' | 'critical';
  imageUrl?: string;
}

// Mock data - will be replaced with real API call
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Riverside Towers',
    address: '1450 River Rd, Austin, TX 78701',
    units: 248,
    occupancy: 96.8,
    monthlyNOI: 124500,
    status: 'healthy',
  },
  {
    id: '2',
    name: 'Oakwood Commons',
    address: '890 Oak Street, Austin, TX 78704',
    units: 156,
    occupancy: 89.1,
    monthlyNOI: 67800,
    status: 'warning',
  },
  {
    id: '3',
    name: 'Sunset Vista Apartments',
    address: '2301 Sunset Blvd, Austin, TX 78745',
    units: 324,
    occupancy: 94.4,
    monthlyNOI: 156200,
    status: 'healthy',
  },
  {
    id: '4',
    name: 'Downtown Lofts',
    address: '567 Congress Ave, Austin, TX 78701',
    units: 89,
    occupancy: 82.0,
    monthlyNOI: 45300,
    status: 'critical',
  },
];

export default function PropertyGrid() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-display text-2xl font-light text-gray-900">
          Properties
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {MOCK_PROPERTIES.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <Link
      href={`/management/properties/${property.id}`}
      className="block p-6 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-xl font-light text-gray-900">
              {property.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                statusColors[property.status]
              }`}
            >
              {property.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{property.address}</p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <BuildingIcon className="w-4 h-4 text-gray-400" />
              <span>{property.units} units</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <UsersIcon className="w-4 h-4 text-gray-400" />
              <span>{property.occupancy}% occupied</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSignIcon className="w-4 h-4 text-gray-400" />
              <span>${(property.monthlyNOI / 1000).toFixed(0)}K NOI/mo</span>
            </div>
          </div>
        </div>

        <div className="ml-4">
          <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            <BuildingIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}