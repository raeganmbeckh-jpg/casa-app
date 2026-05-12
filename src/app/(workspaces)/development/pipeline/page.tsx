import { PipelineMetrics } from '@/components/development/PipelineMetrics'
import { ProjectStageOverview } from '@/components/development/ProjectStageOverview'
import { ProjectFilters } from '@/components/development/ProjectFilters'
import { ProjectsTable } from '@/components/development/ProjectsTable'

export default function DevelopmentPipelinePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-gray-900 mb-2">
            Project Pipeline
          </h1>
          <p className="text-gray-600 font-['Inter']">
            Track all development projects from concept to completion
          </p>
        </div>

        {/* Metrics */}
        <PipelineMetrics />

        {/* Stage Overview */}
        <ProjectStageOverview />

        {/* Filters & Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <ProjectFilters />
          </div>
          <ProjectsTable />
        </div>
      </div>
    </div>
  )
}
