'use client';

import {
  AlertTriangleIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  WrenchIcon,
} from 'lucide-react';

type AlertType = 'maintenance' | 'financial' | 'lease' | 'compliance' | 'operations';

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  property: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

// Mock data - will be replaced with real API call
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'maintenance',
    title: 'HVAC system maintenance overdue',
    property: 'Riverside Towers',
    timestamp: '2 hours ago',
    severity: 'high',
  },
  {
    id: '2',
    type: 'lease',
    title: '3 leases expiring in 30 days',
    property: 'Oakwood Commons',
    timestamp: '4 hours ago',
    severity: 'medium',
  },
  {
    id: '3',
    type: 'financial',
    title: 'Rent collection below target',
    property: 'Downtown Lofts',
    timestamp: '6 hours ago',
    severity: 'high',
  },
  {
    id: '4',
    type: 'compliance',
    title: 'Fire inspection scheduled',
    property: 'Sunset Vista',
    timestamp: '1 day ago',
    severity: 'low',
  },
  {
    id: '5',
    type: 'operations',
    title: 'High utility usage detected',
    property: 'Riverside Towers',
    timestamp: '1 day ago',
    severity: 'medium',
  },
];

const ALERT_ICONS: Record<AlertType, React.ElementType> = {
  maintenance: WrenchIcon,
  financial: DollarSignIcon,
  lease: FileTextIcon,
  compliance: AlertTriangleIcon,
  operations: ClockIcon,
};

export default function AlertsFeed() {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-display text-2xl font-light text-gray-900">
          Active Alerts
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {MOCK_ALERTS.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const Icon = ALERT_ICONS[alert.type];

  const severityColors = {
    low: 'text-blue-600 bg-blue-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50',
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${severityColors[alert.severity]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {alert.title}
          </p>
          <p className="text-xs text-gray-600 mt-1">{alert.property}</p>
          <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
        </div>
      </div>
    </div>
  );
}