'use client'

import { Building2, MapPin, Calendar, TrendingUp } from 'lucide-react'

interface PropertyHeaderProps {
  propertyId: string
}

export default function PropertyHeader({ propertyId }: PropertyHeaderProps) {
  // Mock data - will be replaced with real data from Supabase
  const property = {
    name: 'Sunset Gardens Apartments',
    address: '4521 Maple Avenue, Los Angeles, CA 90012',
    type: 'Multifamily',
    units: 48,
    acquired: 'March 2023',
    value: '$12,400,000',
    status: 'performing',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="relative h-48 bg-gray-100">
        <img 
          src={property.image} 
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            property.status === 'performing' 
              ? 'bg-green-100 text-green-800' 
              : property.status === 'watchlist'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {property.status === 'performing' ? '✓ Performing' : property.status === 'watchlist' ? '⚠ Watchlist' : '⚠ Alert'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 mb-2">{property.name}</h1>
            <div className="flex items-center text-gray-600 mb-1">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{property.address}</span>
            </div>
          </div>
          <button className="px-4 py-2 border border-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#F9D96A] hover:bg-opacity-10 transition-colors">
            Edit Property
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Type</div>
              <div className="font-medium text-gray-900">{property.type}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Units</div>
              <div className="font-medium text-gray-900">{property.units}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Acquired</div>
              <div className="font-medium text-gray-900">{property.acquired}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm text-gray-500">Value</div>
              <div className="font-medium text-gray-900">{property.value}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
