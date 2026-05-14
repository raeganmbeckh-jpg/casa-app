'use client';

import { Search, Filter, Download } from 'lucide-react';

export function ListingFilters() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by address, MLS, or client name..."
              className="font-['Inter'] w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#F9D96A] focus:outline-none focus:ring-1 focus:ring-[#F9D96A]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select className="font-['Inter'] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#F9D96A] focus:outline-none focus:ring-1 focus:ring-[#F9D96A]">
            <option>All Stages</option>
            <option>Prospecting</option>
            <option>Active</option>
            <option>Under Contract</option>
            <option>Closed</option>
          </select>

          <select className="font-['Inter'] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#F9D96A] focus:outline-none focus:ring-1 focus:ring-[#F9D96A]">
            <option>All Types</option>
            <option>Residential</option>
            <option>Commercial</option>
            <option>Land</option>
            <option>Multi-Family</option>
          </select>

          <select className="font-['Inter'] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-[#F9D96A] focus:outline-none focus:ring-1 focus:ring-[#F9D96A]">
            <option>Price: Any</option>
            <option>Under $250K</option>
            <option>$250K - $500K</option>
            <option>$500K - $1M</option>
            <option>$1M - $2M</option>
            <option>Over $2M</option>
          </select>

          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="font-['Inter'] text-sm font-medium text-gray-700">More Filters</span>
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-[#F9D96A] px-4 py-2 hover:bg-[#f7d159]">
            <Download className="h-4 w-4 text-gray-900" />
            <span className="font-['Inter'] text-sm font-medium text-gray-900">Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
