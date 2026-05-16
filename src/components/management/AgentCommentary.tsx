'use client'

import { Bot, AlertTriangle, CheckCircle, Info } from 'lucide-react'

interface AgentCommentaryProps {
  propertyId: string
}

export default function AgentCommentary({ propertyId }: AgentCommentaryProps) {
  // Mock data - will be replaced with real agent outputs
  const commentary = [
    {
      agent: 'Financial Analyst',
      type: 'positive',
      message: 'NOI growth outpacing market average by 3.2%. Strong rent collection and low vacancy driving performance.',
      confidence: 94
    },
    {
      agent: 'Operations',
      type: 'neutral',
      message: 'Maintenance backlog within normal range. Recommend scheduling HVAC preventive maintenance for Q3.',
      confidence: 87
    },
    {
      agent: 'Tenant Relations',
      type: 'warning',
      message: '3 lease renewals expiring next quarter. Current market rents 8% above in-place rents—renewal risk moderate.',
      confidence: 91
    },
    {
      agent: 'Market Position',
      type: 'positive',
      message: 'Property ranks in top 15% of comparable assets within 2-mile radius. Rent growth potential remains strong.',
      confidence: 89
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default: return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      default: return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-serif text-gray-900">Agent Commentary</h2>
      </div>
      
      <div className="space-y-4">
        {commentary.map((item, index) => (
          <div key={index} className={`border rounded-lg p-4 ${getBorderColor(item.type)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{item.agent}</div>
                  <div className="text-xs text-gray-500">{item.confidence}% confidence</div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
          View Full Agent Debate →
        </button>
      </div>
    </div>
  )
}
