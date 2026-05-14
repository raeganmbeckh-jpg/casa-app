'use client';

import { MapPin, TrendingUp, Eye, Calendar, MessageSquare } from 'lucide-react';

interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  type: string;
  price: string;
  stage: string;
  daysOnMarket: number;
  showings: number;
  offers: number;
  listDate: string;
  agent: string;
  status: 'hot' | 'warm' | 'cold';
}

const mockListings: Listing[] = [
  {
    id: 'L-001',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    type: 'Residential',
    price: '$485,000',
    stage: 'Active',
    daysOnMarket: 12,
    showings: 8,
    offers: 2,
    listDate: '2026-04-29',
    agent: 'Sarah Chen',
    status: 'hot',
  },
  {
    id: 'L-002',
    address: '1630 Revello Drive',
    city: 'Sunnydale',
    state: 'CA',
    type: 'Residential',
    price: '$1,250,000',
    stage: 'Under Contract',
    daysOnMarket: 6,
    showings: 14,
    offers: 5,
    listDate: '2026-05-05',
    agent: 'Michael Torres',
    status: 'hot',
  },
  {
    id: 'L-003',
    address: '221B Baker Street',
    city: 'London',
    state: 'UK',
    type: 'Commercial',
    price: '$2,100,000',
    stage: 'Active',
    daysOnMarket: 45,
    showings: 3,
    offers: 0,
    listDate: '2026-03-27',
    agent: 'Emma Wilson',
    status: 'cold',
  },
  {
    id: 'L-004',
    address: '1600 Pennsylvania Avenue',
    city: 'Washington',
    state: 'DC',
    type: 'Residential',
    price: '$3,750,000',
    stage: 'Prospecting',
    daysOnMarket: 0,
    showings: 0,
    offers: 0,
    listDate: '2026-05-11',
    agent: 'David Park',
    status: 'warm',
  },
  {
    id: 'L-005',
    address: '12 Grimmauld Place',
    city: 'London',
    state: 'UK',
    type: 'Multi-Family',
    price: '$890,000',
    stage: 'Active',
    daysOnMarket: 22,
    showings: 11,
    offers: 1,
    listDate: '2026-04-20',
    agent: 'Sarah Chen',
    status: 'warm',
  },
];

function getStageColor(stage: string) {
  const colors: Record<string, string> = {
    'Prospecting': 'bg-blue-100 text-blue-800',
    'Active': 'bg-yellow-100 text-yellow-800',
    'Under Contract': 'bg-purple-100 text-purple-800',
    'Closed': 'bg-green-100 text-green-800',
  };
  return colors[stage] || 'bg-gray-100 text-gray-800';
}

function getStatusIndicator(status: 'hot' | 'warm' | 'cold') {
  const colors: Record<string, string> = {
    hot: 'bg-red-500',
    warm: 'bg-yellow-500',
    cold: 'bg-blue-500',
  };
  return colors[status];
}

export function ListingsTable() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Property
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Price
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Stage
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  DOM
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Activity
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Agent
                </span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="font-['Inter'] text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockListings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${getStatusIndicator(listing.status)}`} />
                    <div>
                      <p className="font-['Inter'] text-sm font-medium text-gray-900">
                        {listing.address}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="font-['Inter'] text-xs">
                          {listing.city}, {listing.state}
                        </span>
                      </div>
                      <span className="font-['Inter'] mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                        {listing.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-['Inter'] text-sm font-semibold text-gray-900">{listing.price}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-['Inter'] inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageColor(listing.stage)}`}>
                    {listing.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-['Inter'] text-sm text-gray-900">{listing.daysOnMarket}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-['Inter'] text-xs text-gray-600">{listing.showings} showings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-['Inter'] text-xs text-gray-600">{listing.offers} offers</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-['Inter'] text-sm text-gray-900">{listing.agent}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50">
                      <MessageSquare className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
