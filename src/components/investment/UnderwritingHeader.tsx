'use client';

import { useState } from 'react';

export default function UnderwritingHeader() {
  const [dealName, setDealName] = useState('New Deal Analysis');

  return (
    <div className="bg-white border-b border-gray-200 pb-6">
      <div className="flex items-start justify-between">
        <div>
          <input
            type="text"
            value={dealName}
            onChange={(e) => setDealName(e.target.value)}
            className="text-3xl font-serif font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 mb-2"
          />
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 text-sm bg-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#f7d455] transition-colors font-medium">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}