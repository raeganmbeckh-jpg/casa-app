'use client';

import { useState } from 'react';
import QISHeader from '@/components/investment/QISHeader';
import QISScoreCard from '@/components/investment/QISScoreCard';
import AgentScores from '@/components/investment/AgentScores';
import RiskBreakdown from '@/components/investment/RiskBreakdown';
import MarketPositioning from '@/components/investment/MarketPositioning';
import ConsensusAnalysis from '@/components/investment/ConsensusAnalysis';
import HistoricalPerformance from '@/components/investment/HistoricalPerformance';

export default function QISDashboard({ params }: { params: { id: string } }) {
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('90d');

  return (
    <div className="min-h-screen bg-white">
      <QISHeader propertyId={params.id} timeframe={timeframe} onTimeframeChange={setTimeframe} />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <QISScoreCard propertyId={params.id} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentScores propertyId={params.id} />
          <RiskBreakdown propertyId={params.id} />
        </div>

        <MarketPositioning propertyId={params.id} />
        
        <ConsensusAnalysis propertyId={params.id} />
        
        <HistoricalPerformance propertyId={params.id} timeframe={timeframe} />
      </div>
    </div>
  );
}