import { Metadata } from 'next';
import DealStageOverview from '@/components/investment/DealStageOverview';
import DealsTable from '@/components/investment/DealsTable';
import DealFilters from '@/components/investment/DealFilters';
import PipelineMetrics from '@/components/investment/PipelineMetrics';

export const metadata: Metadata = {
  title: 'Deal Pipeline | CASA Investment',
  description: 'Track and manage your real estate investment pipeline',
};

export default function DealPipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-gray-900">
            Deal Pipeline
          </h1>
          <p className="mt-2 text-gray-600">
            Track opportunities from evaluation to closing
          </p>
        </div>
        <button className="rounded-lg bg-[#F9D96A] px-6 py-2.5 font-semibold text-gray-900 transition-all hover:bg-[#f7d04f]">
          + New Deal
        </button>
      </div>

      <PipelineMetrics />
      <DealStageOverview />
      <DealFilters />
      <DealsTable />
    </div>
  );
}
