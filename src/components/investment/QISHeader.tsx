'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface QISHeaderProps {
  propertyId: string;
  timeframe: '30d' | '90d' | '1y';
  onTimeframeChange: (timeframe: '30d' | '90d' | '1y') => void;
}

export default function QISHeader({ propertyId, timeframe, onTimeframeChange }: QISHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link 
          href="/investment/pipeline" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pipeline
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Cormorant_Garamond'] text-4xl font-semibold text-gray-900">
              Quantum Intelligence Score
            </h1>
            <p className="text-gray-600 mt-2">
              Multi-agent consensus analysis for property {propertyId}
            </p>
          </div>
          
          <div className="flex gap-2">
            {(['30d', '90d', '1y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === tf
                    ? 'bg-[#F9D96A] text-gray-900'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tf === '30d' ? '30 Days' : tf === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}