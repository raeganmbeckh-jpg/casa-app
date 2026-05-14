import { PipelineMetrics } from '@/components/brokerage/PipelineMetrics';
import { ListingStageOverview } from '@/components/brokerage/ListingStageOverview';
import { ListingFilters } from '@/components/brokerage/ListingFilters';
import { ListingsTable } from '@/components/brokerage/ListingsTable';

export default function ListingPipelinePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-gray-900">
            Listing Pipeline
          </h1>
          <p className="mt-2 font-['Inter'] text-sm text-gray-600">
            Track all active and prospective listings with real-time status and performance metrics
          </p>
        </div>
      </div>

      <div className="px-8 py-6">
        <PipelineMetrics />
        
        <div className="mt-8">
          <ListingStageOverview />
        </div>

        <div className="mt-8">
          <ListingFilters />
        </div>

        <div className="mt-6">
          <ListingsTable />
        </div>
      </div>
    </div>
  );
}
