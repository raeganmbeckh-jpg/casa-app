import { ScheduleHeader } from '@/components/development/ScheduleHeader';
import { CriticalPath } from '@/components/development/CriticalPath';
import { GanttChart } from '@/components/development/GanttChart';
import { RiskOverlay } from '@/components/development/RiskOverlay';
import { MilestoneTracker } from '@/components/development/MilestoneTracker';
import { WeatherImpact } from '@/components/development/WeatherImpact';
import { PermitDependencies } from '@/components/development/PermitDependencies';

export default function SchedulePage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <ScheduleHeader projectId={params.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CriticalPath projectId={params.id} />
        </div>
        <div>
          <MilestoneTracker projectId={params.id} />
        </div>
      </div>

      <GanttChart projectId={params.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskOverlay projectId={params.id} />
        <WeatherImpact projectId={params.id} />
      </div>

      <PermitDependencies projectId={params.id} />
    </div>
  );
}