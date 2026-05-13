'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function ParcelSearchFilters() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minAcres: '',
    maxAcres: '',
    minPrice: '',
    maxPrice: '',
    zoning: 'all',
    utilities: 'all',
    access: 'all',
  });

  const handleReset = () => {
    setFilters({
      search: '',
      minAcres: '',
      maxAcres: '',
      minPrice: '',
      maxPrice: '',
      zoning: 'all',
      utilities: 'all',
      access: 'all',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by address, APN, or county..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-['Inter'] text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Filters
        </button>
        {(filters.search || filters.minAcres || filters.maxAcres || filters.minPrice || filters.maxPrice) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-['Inter'] text-sm"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Min Acres
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAcres}
              onChange={(e) => setFilters({ ...filters, minAcres: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Max Acres
            </label>
            <input
              type="number"
              placeholder="1000"
              value={filters.maxAcres}
              onChange={(e) => setFilters({ ...filters, maxAcres: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Min Price
            </label>
            <input
              type="number"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Max Price
            </label>
            <input
              type="number"
              placeholder="$10,000,000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Zoning
            </label>
            <select
              value={filters.zoning}
              onChange={(e) => setFilters({ ...filters, zoning: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            >
              <option value="all">All Zoning</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agricultural">Agricultural</option>
              <option value="mixed">Mixed Use</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Utilities
            </label>
            <select
              value={filters.utilities}
              onChange={(e) => setFilters({ ...filters, utilities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="full">Full Utilities</option>
              <option value="partial">Partial Utilities</option>
              <option value="none">No Utilities</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-['Inter'] text-gray-700 mb-2">
              Road Access
            </label>
            <select
              value={filters.access}
              onChange={(e) => setFilters({ ...filters, access: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Inter'] text-sm focus:outline-none focus:ring-2 focus:ring-[#F9D96A] focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="paved">Paved Road</option>
              <option value="gravel">Gravel Road</option>
              <option value="private">Private Access</option>
              <option value="none">No Access</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
