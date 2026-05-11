import { Suspense } from 'react';
import PortfolioMetrics from '@/components/management/PortfolioMetrics';
import PropertyGrid from '@/components/management/PropertyGrid';
import AlertsFeed from '@/components/management/AlertsFeed';

export const metadata = {
  title: 'Portfolio Overview | CASA Management',
  description: 'Monitor all properties, occupancy, NOI, and critical alerts',
};

export default function PortfolioOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-light text-gray-900">
          Portfolio Overview
        </h1>
        <p className="mt-2 text-gray-600">
          Real-time health across all properties
        </p>
      </div>

      <Suspense fallback={<MetricsSkeleton />}>
        <PortfolioMetrics />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<GridSkeleton />}>
            <PropertyGrid />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<AlertsSkeleton />}>
            <AlertsFeed />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
}