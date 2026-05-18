'use client';

import { useState } from 'react';

export default function ProFormaHeader() {
  const [projectName, setProjectName] = useState('Riverside Mixed-Use Development');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="text-3xl font-serif font-bold text-gray-900 border-b-2 border-[#F9D96A] focus:outline-none w-full"
              autoFocus
            />
          ) : (
            <h1
              className="text-3xl font-serif font-bold text-gray-900 cursor-pointer hover:text-gray-700"
              onClick={() => setIsEditing(true)}
            >
              {projectName}
            </h1>
          )}
          <p className="text-gray-600 mt-1">Pro Forma Analysis</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-[#F9D96A] text-gray-900 rounded-lg hover:bg-[#f7d04a] transition-colors font-medium">
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Project Cost</div>
          <div className="text-2xl font-bold text-gray-900">$8.45M</div>
          <div className="text-xs text-gray-500 mt-1">Hard + Soft Costs</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Projected ROI</div>
          <div className="text-2xl font-bold text-green-600">24.3%</div>
          <div className="text-xs text-gray-500 mt-1">On Total Investment</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
          <div className="text-2xl font-bold text-gray-900">18.5%</div>
          <div className="text-xs text-gray-500 mt-1">Net Margin</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Contingency Used</div>
          <div className="text-2xl font-bold text-yellow-600">42%</div>
          <div className="text-xs text-gray-500 mt-1">$425K of $1M</div>
        </div>
      </div>
    </div>
  );
}