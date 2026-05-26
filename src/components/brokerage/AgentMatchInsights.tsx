'use client'

import { Brain, TrendingUp, Users, Target } from 'lucide-react'

const insights = [
  {
    agent: 'Buyer Matcher',
    confidence: 92,
    insight: 'High-confidence match between Chen family and Evergreen Terrace. Budget alignment, location preference, and timeline all optimal. Recommend immediate outreach.',
    priority: 'high'
  },
  {
    agent: 'Pricing Strategist',
    confidence: 87,
    insight: 'Main Street listing is underpriced for current Portland market. Could support $750K-$775K based on recent comps. Consider price adjustment to attract stronger buyers.',
    priority: 'medium'
  },
  {
    agent: 'Velocity Forecaster',
    confidence: 89,
    insight: 'Oak Avenue expected to receive offers within 14 days based on location, price point, and current buyer activity in Seattle luxury segment.',
    priority: 'medium'
  },
  {
    agent: 'Market Pulse',
    confidence: 94,
    insight: 'Springfield market showing 12% increase in buyer activity over past 30 days. Multiple buyers competing for 3-bed homes in $450K-$550K range. Favorable timing for Evergreen listing.',
    priority: 'high'
  }
]

export default function AgentMatchInsights() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#F9D96A]" />
          <h2 className="text-lg font-serif text-gray-900">Agent Match Insights</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">AI-powered recommendations and market intelligence</p>
      </div>

      <div className="divide-y divide-gray-200">
        {insights.map((item, idx) => (
          <div key={idx} className="px-6 py-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {item.agent === 'Buyer Matcher' && <Users className="w-5 h-5 text-gray-600" />}
                  {item.agent === 'Pricing Strategist' && <Target className="w-5 h-5 text-gray-600" />}
                  {item.agent === 'Velocity Forecaster' && <TrendingUp className="w-5 h-5 text-gray-600" />}
                  {item.agent === 'Market Pulse' && <Brain className="w-5 h-5 text-gray-600" />}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.agent}</h3>
                  <p className="text-xs text-gray-600">Confidence: {item.confidence}%</p>
                </div>
              </div>

              {item.priority === 'high' && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                  High Priority
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {item.insight}
            </p>

            {/* Confidence Bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#F9D96A] transition-all duration-500"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
