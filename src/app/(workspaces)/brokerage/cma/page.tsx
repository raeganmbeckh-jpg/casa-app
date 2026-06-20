import { CMAHeader } from '@/components/brokerage/CMAHeader'
import { SubjectProperty } from '@/components/brokerage/SubjectProperty'
import { ComparableProperties } from '@/components/brokerage/ComparableProperties'
import { PricingRecommendation } from '@/components/brokerage/PricingRecommendation'
import { MarketMetrics } from '@/components/brokerage/MarketMetrics'
import { AgentConsensus } from '@/components/brokerage/AgentConsensus'

export default function CMAGeneratorPage() {
  return (
    <div className="space-y-6">
      <CMAHeader />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SubjectProperty />
          <ComparableProperties />
        </div>
        
        <div className="space-y-6">
          <PricingRecommendation />
          <MarketMetrics />
          <AgentConsensus />
        </div>
      </div>
    </div>
  )
}
