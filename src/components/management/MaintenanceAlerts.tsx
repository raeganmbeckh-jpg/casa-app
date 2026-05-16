'use client'

import { AlertCircle, Clock, Wrench } from 'lucide-react'

interface MaintenanceAlertsProps {
  propertyId: string
}

export default function MaintenanceAlerts({ propertyId }: MaintenanceAlertsProps) {
  // Mock data - will be replaced with real data from Supabase
  const alerts = [
    {
      priority: 'high',
      category: 'HVAC',
      unit: 'Unit 214',
      description: 'AC system failing, tenant reported no cooling',
      reported: '2 hours ago',
      estimatedCost: '$450-850'
    },
    {
      priority: 'medium',
      category: 'Plumbing',
      unit: 'Unit 108',
      description: 'Slow drain in kitchen sink',
      reported: '1 day ago',
      estimatedCost: '$150-300'
    },
    {
      priority: 'low',
      category: 'Electrical',
      unit: 'Common Area',
      description: 'Parking lot light fixture out',
      reported: '3 days ago',
      estimatedCost: '$75-150'
    },
    {
      priority: 'preventive',
      category: 'HVAC',
      unit: 'Building-wide',
      description: 'Quarterly HVAC filter replacement due',
      reported: 'Scheduled',
      estimatedCost: '$1,200'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'preventive': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4" />
      case 'preventive': return <Clock className="h-4 w-4" />
      default: return <Wrench className="h-4 w-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif text-gray-900">Maintenance Alerts</h2>
        <span className="text-sm text-gray-600">{alerts.length} active</span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                  getPriorityColor(alert.priority)
                }`}>
                  {getPriorityIcon(alert.priority)}
                  {alert.priority.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-900">{alert.category}</span>
              </div>
              <span className="text-xs text-gray-500">{alert.reported}</span>
            </div>
            
            <div className="mb-2">
              <div className="text-sm font-medium text-gray-900 mb-1">{alert.unit}</div>
              <div className="text-sm text-gray-600">{alert.description}</div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Est. Cost: {alert.estimatedCost}</span>
              <button className="text-xs font-medium text-[#F9D96A] hover:text-yellow-600">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        View All Maintenance Requests
      </button>
    </div>
  )
}
