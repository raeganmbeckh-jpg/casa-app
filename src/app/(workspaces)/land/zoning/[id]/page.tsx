'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import ZoningHeader from '@/components/land/ZoningHeader';
import ZoningClassification from '@/components/land/ZoningClassification';
import PermittedUses from '@/components/land/PermittedUses';
import RezoningPotential from '@/components/land/RezoningPotential';
import EntitlementTimeline from '@/components/land/EntitlementTimeline';
import AgentAnalysis from '@/components/land/ZoningAgentAnalysis';

export default function ZoningAnalyzerPage() {
  const params = useParams();
  const parcelId = params.id as string;

  // Mock data - will be replaced with Supabase queries
  const parcelData = {
    id: parcelId,
    address: '1234 Development Blvd',
    apn: '123-456-789',
    acres: 5.2,
    jurisdiction: 'City of Austin',
    currentZoning: 'R-1 Single Family Residential',
    overlay: 'Historic District Overlay',
    floodZone: 'X (Minimal Risk)',
    lastUpdated: '2024-03-15'
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ZoningHeader parcel={parcelData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ZoningClassification parcel={parcelData} />
            <PermittedUses zoning={parcelData.currentZoning} />
            <RezoningPotential parcel={parcelData} />
          </div>
          
          <div className="space-y-6">
            <AgentAnalysis parcel={parcelData} />
            <EntitlementTimeline parcel={parcelData} />
          </div>
        </div>
      </div>
    </div>
  );
}