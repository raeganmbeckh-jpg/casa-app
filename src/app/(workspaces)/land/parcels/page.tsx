import { Suspense } from 'react';
import ParcelSearchFilters from '@/components/land/ParcelSearchFilters';
import ParcelMap from '@/components/land/ParcelMap';
import ParcelResults from '@/components/land/ParcelResults';
import ParcelMetrics from '@/components/land/ParcelMetrics';

export default function ParcelSearchPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-gray-900">
            Parcel Search
          </h1>
          <p className="mt-2 text-gray-600 font-['Inter']">
            Search and analyze land parcels across markets
          </p>
        </div>
      </div>

      <div className="p-8">
        <Suspense fallback={<div className="text-gray-500">Loading metrics...</div>}>
          <ParcelMetrics />
        </Suspense>

        <div className="mt-8">
          <Suspense fallback={<div className="text-gray-500">Loading filters...</div>}>
            <ParcelSearchFilters />
          </Suspense>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-[600px] bg-gray-100 rounded-lg animate-pulse" />}>
              <ParcelMap />
            </Suspense>
          </div>

          <div className="lg:col-span-1">
            <Suspense fallback={<div className="text-gray-500">Loading results...</div>}>
              <ParcelResults />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
