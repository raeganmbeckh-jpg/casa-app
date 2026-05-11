'use client';

import { useState } from 'react';

export default function DealFilters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assetType, setAssetType] = useState('all');
  const [stage, setStage] = useState('all');

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex-1 min-w-[240px]">
        <input
          type="text"
          placeholder="Search deals, addresses, sellers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#F9D96A] focus:outline-none focus:ring-2 focus:ring-[#F9D96A]/20"
        />
      </div>

      <select
        value={assetType}
        onChange={(e) => setAssetType(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#F9D96A] focus:outline-none focus:ring-2 focus:ring-[#F9D96A]/20"
      >
        <option value="all">All Asset Types</option>
        <option value="multifamily">Multifamily</option>
        <option value="office">Office</option>
        <option value="retail">Retail</option>
        <option value="industrial">Industrial</option>
        <option value="land">Land</option>
        <option value="other">Other</option>
      </select>

      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#F9D96A] focus:outline-none focus:ring-2 focus:ring-[#F9D96A]/20"
      >
        <option value="all">All Stages</option>
        <option value="evaluation">Evaluation</option>
        <option value="underwriting">Underwriting</option>
        <option value="contract">Under Contract</option>
        <option value="due-diligence">Due Diligence</option>
        <option value="closed">Closed</option>
      </select>

      <button className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
        More Filters
      </button>

      <button className="rounded-lg bg-gray-100 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-200">
        Clear All
      </button>
    </div>
  );
}
