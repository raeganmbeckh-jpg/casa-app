'use client';

import { ArrowLeft, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ScheduleHeaderProps {
  projectId: string;
}

export function ScheduleHeader({ projectId }: ScheduleHeaderProps) {
  // Mock data - will be replaced with real data
  const project = {
    name: 'Riverside Luxury Apartments',
    address: '2847 River Oaks Boulevard',
    startDate: '2026-01-15',
    projectedCompletion: '2027-08-30',
    actualProgress: 34,
    scheduleHealth: 'at-risk',
    daysAhead: -12
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/development/pipeline"
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-serif text-gray-900 mb-1">
              {project.name}
            </h1>
            <p className="text-gray-600">{project.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.scheduleHealth === 'on-track' && (
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              On Track
            </span>
          )}
          {project.scheduleHealth === 'at-risk' && (
            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              At Risk
            </span>
          )}
          {project.scheduleHealth === 'delayed' && (
            <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
              Delayed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            Start Date
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date(project.startDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4" />
            Projected Completion
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date(project.projectedCompletion).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            Overall Progress
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {project.actualProgress}%
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-[#F9D96A] rounded-full h-2 transition-all duration-300"
              style={{ width: `${project.actualProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            Schedule Variance
          </div>
          <div className={`text-lg font-semibold ${
            project.daysAhead >= 0 ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {project.daysAhead > 0 ? '+' : ''}{project.daysAhead} days
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {project.daysAhead >= 0 ? 'Ahead of schedule' : 'Behind schedule'}
          </div>
        </div>
      </div>
    </div>
  );
}