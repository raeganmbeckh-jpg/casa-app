import { PipelineMetrics } from '@/components/lending/PipelineMetrics'
import { LoanStageOverview } from '@/components/lending/LoanStageOverview'
import { LoanFilters } from '@/components/lending/LoanFilters'
import { LoansTable } from '@/components/lending/LoansTable'

export default function LoanPipelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-gray-900">
          Loan Pipeline
        </h1>
        <p className="mt-2 text-gray-600">
          Track active loan applications, underwriting progress, and portfolio risk metrics
        </p>
      </div>

      <PipelineMetrics />
      <LoanStageOverview />
      <LoanFilters />
      <LoansTable />
    </div>
  )
}
