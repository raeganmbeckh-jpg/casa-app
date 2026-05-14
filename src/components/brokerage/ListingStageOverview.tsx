'use client';

import { FileText, Eye, Calendar, CheckCircle } from 'lucide-react';

interface StageCardProps {
  stage: string;
  count: number;
  value: string;
  icon: React.ReactNode;
  color: string;
}

function StageCard({ stage, count, value, icon, color }: StageCardProps) {
  return (
    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`rounded-full ${color} bg-opacity-10 p-2`}>
              {icon}
            </div>
            <h3 className="font-['Inter'] text-sm font-semibold text-gray-900">{stage}</h3>
          </div>
          <div className="mt-4">
            <p className="font-['Cormorant_Garamond'] text-2xl font-semibold text-gray-900">
              {count} Listings
            </p>
            <p className="font-['Inter'] mt-1 text-sm text-gray-600">{value} total value</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListingStageOverview() {
  const stages = [
    {
      stage: 'Prospecting',
      count: 12,
      value: '$5.2M',
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      color: 'bg-blue-600',
    },
    {
      stage: 'Active',
      count: 28,
      value: '$14.8M',
      icon: <Eye className="h-5 w-5 text-[#F9D96A]" />,
      color: 'bg-[#F9D96A]',
    },
    {
      stage: 'Under Contract',
      count: 7,
      value: '$3.4M',
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      color: 'bg-purple-600',
    },
    {
      stage: 'Closed',
      count: 15,
      value: '$6.8M',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: 'bg-green-600',
    },
  ];

  return (
    <div>
      <h2 className="font-['Cormorant_Garamond'] mb-4 text-2xl font-semibold text-gray-900">
        Pipeline by Stage
      </h2>
      <div className="flex gap-4">
        {stages.map((stage) => (
          <StageCard key={stage.stage} {...stage} />
        ))}
      </div>
    </div>
  );
}
