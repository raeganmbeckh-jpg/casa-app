'use client';

import { ArrowLeft, MapPin, FileText, Clock } from 'lucide-react';
import Link from 'next/link';

interface ZoningHeaderProps {
  parcel: {
    id: string;
    address: string;
    apn: string;
    acres: number;
    jurisdiction: string;
    currentZoning: string;
    lastUpdated: string;
  };
}

export default function ZoningHeader({ parcel }: ZoningHeaderProps) {
  return (
    <div className="space-y-4">
      <Link 
        href="/land/parcels"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Parcel Search
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="font-serif text-3xl text-gray-900">
                Zoning & Entitlement Analysis
              </h1>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{parcel.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>APN: {parcel.apn}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Updated {parcel.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="text-sm text-gray-500">Current Zoning</div>
            <div className="px-4 py-2 bg-[#F9D96A]/10 border border-[#F9D96A] rounded-lg">
              <div className="font-mono text-sm font-semibold text-gray-900">
                {parcel.currentZoning}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {parcel.acres.toFixed(1)} acres • {parcel.jurisdiction}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}