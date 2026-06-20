import PropertyHeader from '@/components/management/PropertyHeader'
import PropertyMetrics from '@/components/management/PropertyMetrics'
import AgentCommentary from '@/components/management/AgentCommentary'
import UnitMix from '@/components/management/UnitMix'
import FinancialSnapshot from '@/components/management/FinancialSnapshot'
import MaintenanceAlerts from '@/components/management/MaintenanceAlerts'

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <PropertyHeader propertyId={params.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PropertyMetrics propertyId={params.id} />
          <UnitMix propertyId={params.id} />
          <FinancialSnapshot propertyId={params.id} />
        </div>
        
        <div className="space-y-6">
          <AgentCommentary propertyId={params.id} />
          <MaintenanceAlerts propertyId={params.id} />
        </div>
      </div>
    </div>
  )
}
