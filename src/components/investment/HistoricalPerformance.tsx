'use client';

import { TrendingUp } from 'lucide-react';

interface HistoricalPerformanceProps {
  propertyId: string;
  timeframe: '30d' | '90d' | '1y';
}

export default function HistoricalPerformance({ propertyId, timeframe }: HistoricalPerformanceProps) {
  // Mock data for score evolution
  const history = [
    { date: 'Jan 2026', score: 68, prediction: 'Hold', actual: 'N/A' },
    { date: 'Feb 2026', score: 71, prediction: 'Hold', actual: 'N/A' },
    { date: 'Mar 2026', score: 74, prediction: 'Buy', actual: 'N/A' },
    { date: 'Apr 2026', score: 72, prediction: 'Hold', actual: 'N/A' },
    { date: 'May 2026', score: 78, prediction: 'Buy', actual: 'Current' }
  ];

  const outcomeMetrics = [
    { metric: 'Prediction Accuracy', value: '83%', description: 'Buy/Hold calls vs. actual outcomes' },
    { metric: 'Average Score Delta', value: '+2.4', description: 'Score change month-over-month' },
    { metric: 'Hit Rate (Buy)', value: '87%', description: 'Buy recommendations that outperformed' },
    { metric: 'Hit Rate (Pass)', value: '91%', description: 'Pass recommendations that underperformed' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[#F9D96A]" />
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
              Historical Performance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Score evolution and outcome learning metrics
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">QIS Score Evolution</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Prediction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actual Outcome</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.date}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">{item.score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.prediction === 'Buy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.prediction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.actual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Outcome Learning Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomeMetrics.map((item) => (
              <div key={item.metric} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-600 mb-1">{item.metric}</div>
                <div className="text-3xl font-semibold text-gray-900 mb-2">{item.value}</div>
                <div className="text-xs text-gray-600">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F9D96A] bg-opacity-10 border border-[#F9D96A] rounded-lg p-4">
          <div className="text-sm font-medium text-gray-900 mb-1">Agent Tuning Active</div>
          <div className="text-sm text-gray-700">
            All predictions are logged and compared to actual outcomes. Agent weights are automatically adjusted based on hit rate. Last tuning: May 10, 2026.
          </div>
        </div>
      </div>
    </div>
  );
}