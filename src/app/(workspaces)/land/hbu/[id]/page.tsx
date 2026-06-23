import HBUHeader from '@/components/land/HBUHeader'
import UseCaseAnalysis from '@/components/land/UseCaseAnalysis'
import FinancialProjections from '@/components/land/FinancialProjections'
import RezoningScenarios from '@/components/land/RezoningScenarios'
import DevelopmentTimeline from '@/components/land/DevelopmentTimeline'
import AgentRecommendations from '@/components/land/AgentRecommendations'
import ComparableAnalysis from '@/components/land/ComparableAnalysis'

export default function HBUCalculatorPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-white">
      <HBUHeader parcelId={params.id} />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <UseCaseAnalysis parcelId={params.id} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FinancialProjections parcelId={params.id} />
          <RezoningScenarios parcelId={params.id} />
        </div>
        
        <DevelopmentTimeline parcelId={params.id} />
        
        <AgentRecommendations parcelId={params.id} />
        
        <ComparableAnalysis parcelId={params.id} />
      </div>
    </div>
  )
}