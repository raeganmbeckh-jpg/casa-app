'use client'

import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'Sunset Heights Apartments',
    address: '2847 Valencia St, San Francisco, CA',
    stage: 'Under Construction',
    type: 'Multifamily',
    units: 124,
    totalCost: '$87.2M',
    budgetVariance: '+2.3%',
    schedule: 'On Track',
    completionDate: '2026-12-15',
    roi: '19.2%',
    alerts: 0,
  },
  {
    id: 2,
    name: 'Downtown Office Tower',
    address: '555 Market St, San Francisco, CA',
    stage: 'Permitting',
    type: 'Office',
    sqft: '287,000',
    totalCost: '$142.5M',
    budgetVariance: '-1.2%',
    schedule: 'Delayed 14d',
    completionDate: '2027-08-30',
    roi: '16.8%',
    alerts: 2,
  },
  {
    id: 3,
    name: 'Mission Bay Retail Center',
    address: '1200 Third St, San Francisco, CA',
    stage: 'Pre-Development',
    type: 'Retail',
    sqft: '45,000',
    totalCost: '$32.1M',
    budgetVariance: '0.0%',
    schedule: 'On Track',
    completionDate: '2027-03-20',
    roi: '21.5%',
    alerts: 0,
  },
  {
    id: 4,
    name: 'Bayview Mixed-Use',
    address: '890 Oakdale Ave, San Francisco, CA',
    stage: 'Under Construction',
    type: 'Mixed-Use',
    units: 78,
    totalCost: '$56.8M',
    budgetVariance: '+8.7%',
    schedule: 'Delayed 28d',
    completionDate: '2026-11-01',
    roi: '14.2%',
    alerts: 3,
  },
  {
    id: 5,
    name: 'Industrial Park Phase 2',
    address: '3400 Cesar Chavez St, San Francisco, CA',
    stage: 'Lease-Up',
    type: 'Industrial',
    sqft: '125,000',
    totalCost: '$28.4M',
    budgetVariance: '-0.8%',
    schedule: 'Complete',
    completionDate: '2026-04-15',
    roi: '22.1%',
    alerts: 0,
  },
]

function getStageColor(stage: string) {
  const colors: Record<string, string> = {
    Concept: 'bg-blue-100 text-blue-800',
    'Pre-Development': 'bg-purple-100 text-purple-800',
    Permitting: 'bg-yellow-100 text-yellow-800',
    'Under Construction': 'bg-orange-100 text-orange-800',
    'Lease-Up': 'bg-green-100 text-green-800',
    Stabilized: 'bg-emerald-100 text-emerald-800',
  }
  return colors[stage] || 'bg-gray-100 text-gray-800'
}

function getScheduleColor(schedule: string) {
  if (schedule === 'On Track' || schedule === 'Complete') return 'text-green-600'
  if (schedule.includes('Delayed')) return 'text-red-600'
  return 'text-gray-600'
}

export function ProjectsTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Project
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Stage
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Size
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Total Cost
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Budget Var.
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Schedule
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider font-['Inter']">
              Projected ROI
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-start gap-3">
                  {project.alerts > 0 && (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 font-['Inter']">
                      {project.name}
                    </p>
                    <p className="text-sm text-gray-500 font-['Inter']">
                      {project.address}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-['Inter'] ${getStageColor(
                    project.stage
                  )}`}
                >
                  {project.stage}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-['Inter']">
                {project.type}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-['Inter']">
                {project.units ? `${project.units} units` : project.sqft + ' SF'}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 font-['Inter']">
                {project.totalCost}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-sm font-['Inter']">
                  {project.budgetVariance.startsWith('+') ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">{project.budgetVariance}</span>
                    </>
                  ) : project.budgetVariance.startsWith('-') ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">{project.budgetVariance}</span>
                    </>
                  ) : (
                    <span className="text-gray-600">{project.budgetVariance}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-sm font-medium font-['Inter'] ${getScheduleColor(
                    project.schedule
                  )}`}
                >
                  {project.schedule}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 font-['Inter']">
                {project.roi}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
