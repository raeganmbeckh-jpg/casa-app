'use client';

import { Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherImpactProps {
  projectId: string;
}

export function WeatherImpact({ projectId }: WeatherImpactProps) {
  // Mock data - will be replaced with real data
  const forecast = [
    {
      week: 'This Week',
      conditions: 'Partly Cloudy',
      temp: '65-75°F',
      precipitation: 10,
      impact: 'low',
      affectedTasks: []
    },
    {
      week: 'Next Week',
      conditions: 'Rain Likely',
      temp: '58-68°F',
      precipitation: 70,
      impact: 'high',
      affectedTasks: ['Steel erection', 'Concrete pours']
    },
    {
      week: 'Week of Mar 15',
      conditions: 'Clear',
      temp: '68-78°F',
      precipitation: 5,
      impact: 'low',
      affectedTasks: []
    }
  ];

  const historicalDelays = {
    rainDays: 12,
    windDays: 3,
    coldDays: 2,
    totalImpact: 17
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-serif text-gray-900 mb-6">Weather Impact</h2>

      <div className="space-y-4 mb-6">
        {forecast.map((period, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 ${
              period.impact === 'high' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900 mb-1">{period.week}</div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Cloud className="w-4 h-4" />
                    {period.conditions}
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    {period.temp}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{period.precipitation}%</div>
                <div className="text-xs text-gray-500">precip</div>
              </div>
            </div>

            {period.affectedTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="text-xs font-medium text-yellow-800 mb-1">Affected Activities:</div>
                <div className="flex flex-wrap gap-1">
                  {period.affectedTasks.map((task, i) => (
                    <span key={i} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {task}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-900 mb-3">Historical Weather Delays</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CloudRain className="w-4 h-4" />
              <span className="text-sm">Rain Days</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{historicalDelays.rainDays}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Wind className="w-4 h-4" />
              <span className="text-sm">High Wind</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">{historicalDelays.windDays}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold">{historicalDelays.totalImpact}</span> total days lost to weather (9.2% of schedule)
        </div>
      </div>
    </div>
  );
}