'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type MarketData = {
  zip: string;
  neighborhood: string;
  medianPrice: number;
  priceTrend: number[];
  inventoryCount: number;
  daysOnMarket: number;
  absorptionRate: number;
  newListings: number;
  closings: number;
  priceChangeYoY: number;
};

const MOCK_MARKETS: MarketData[] = [
  {
    zip: '92103',
    neighborhood: 'Hillcrest / Mission Hills',
    medianPrice: 985000,
    priceTrend: [910, 920, 935, 940, 950, 955, 960, 970, 975, 980, 982, 985],
    inventoryCount: 68,
    daysOnMarket: 24,
    absorptionRate: 2.1,
    newListings: 32,
    closings: 28,
    priceChangeYoY: 5.4,
  },
  {
    zip: '92104',
    neighborhood: 'North Park / University Heights',
    medianPrice: 1050000,
    priceTrend: [960, 975, 985, 990, 1000, 1010, 1015, 1025, 1030, 1040, 1045, 1050],
    inventoryCount: 45,
    daysOnMarket: 18,
    absorptionRate: 1.6,
    newListings: 28,
    closings: 31,
    priceChangeYoY: 7.2,
  },
  {
    zip: '92109',
    neighborhood: 'Pacific Beach / Mission Beach',
    medianPrice: 1325000,
    priceTrend: [1200, 1215, 1230, 1245, 1260, 1270, 1280, 1290, 1300, 1310, 1318, 1325],
    inventoryCount: 52,
    daysOnMarket: 31,
    absorptionRate: 2.8,
    newListings: 19,
    closings: 15,
    priceChangeYoY: 4.1,
  },
];

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

export default function MarketPulsePage() {
  const [zipInput, setZipInput] = useState('');
  const [selectedZip, setSelectedZip] = useState<string | null>(null);

  const handleSearch = () => {
    const trimmed = zipInput.trim();
    const match = MOCK_MARKETS.find((m) => m.zip === trimmed);
    setSelectedZip(match ? match.zip : null);
  };

  const displayMarkets = selectedZip
    ? MOCK_MARKETS.filter((m) => m.zip === selectedZip)
    : MOCK_MARKETS;

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#111111]" style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)' }}>
      <header className="border-b bg-white" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>Broker · Market</p>
            <h1 className="text-4xl tracking-tight sm:text-5xl" style={{ fontFamily: 'var(--font-heading, Cormorant Garamond, serif)', fontWeight: 500, color: '#111111' }}>
              Market <em className="italic">Pulse</em>.
            </h1>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: 'rgba(17,17,17,0.65)' }}>
              Real-time market intelligence for San Diego zip codes. Track pricing, inventory, and absorption.
            </p>
          </div>

          <div className="mt-8 flex gap-2">
            <input
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter zip code (e.g. 92103)"
              className="w-full rounded-md border bg-white px-4 py-3 text-sm placeholder:text-neutral-400 focus:outline-none sm:w-72"
              style={{ borderColor: 'rgba(17,17,17,0.08)' }}
            />
            <button
              onClick={handleSearch}
              className="rounded-md px-5 py-3 text-xs font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: '#F9D96A', color: '#111111' }}
            >
              Search
            </button>
            {selectedZip && (
              <button
                onClick={() => { setSelectedZip(null); setZipInput(''); }}
                className="rounded-md border bg-white px-3 py-3 text-xs font-medium transition-colors hover:border-[#111111]"
                style={{ borderColor: 'rgba(17,17,17,0.08)', color: 'rgba(17,17,17,0.65)' }}
              >
                Show all
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        <div className="grid gap-6">
          {displayMarkets.map((market) => (
            <MarketCard key={market.zip} market={market} />
          ))}
        </div>
      </main>
    </div>
  );
}

function MarketCard({ market }: { market: MarketData }) {
  const trendMin = Math.min(...market.priceTrend);
  const trendMax = Math.max(...market.priceTrend);
  const trendRange = trendMax - trendMin || 1;
  const sparkWidth = 240;
  const sparkHeight = 48;

  const points = market.priceTrend.map((val, i) => {
    const x = (i / (market.priceTrend.length - 1)) * sparkWidth;
    const y = sparkHeight - ((val - trendMin) / trendRange) * (sparkHeight - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const marketType = market.absorptionRate < 2 ? "Seller's Market" : market.absorptionRate > 4 ? "Buyer's Market" : 'Balanced';
  const marketColor = market.absorptionRate < 2 ? '#B91C1C' : market.absorptionRate > 4 ? '#15803D' : '#D97706';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border bg-white p-6"
      style={{ borderColor: 'rgba(17,17,17,0.08)' }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-md px-2 py-1 text-sm font-medium" style={{ backgroundColor: 'rgba(17,17,17,0.04)', fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>
              {market.zip}
            </span>
            <span className="text-lg font-medium" style={{ color: '#111111' }}>{market.neighborhood}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ color: marketColor, borderColor: marketColor + '33', backgroundColor: marketColor + '0a' }}>
              {marketType}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="flex flex-col items-end">
          <div className="text-[9px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>12-month price trend</div>
          <svg width={sparkWidth} height={sparkHeight} className="mt-1">
            <polyline
              points={points}
              fill="none"
              stroke="#F9D96A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-1 flex gap-4 text-[9px]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            <span>{MONTHS[0]}</span>
            <span>{MONTHS[11]}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCell label="Median price" value={fmtMoney(market.medianPrice)} />
        <MetricCell
          label="YoY change"
          value={`+${market.priceChangeYoY}%`}
          color={market.priceChangeYoY > 0 ? '#15803D' : '#B91C1C'}
        />
        <MetricCell label="Inventory" value={String(market.inventoryCount)} hint="active listings" />
        <MetricCell label="Days on market" value={String(market.daysOnMarket)} hint="median" />
        <MetricCell label="Absorption rate" value={`${market.absorptionRate} mo`} hint="months of supply" />
        <div className="rounded-md border p-3" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
          <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>New vs closed</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>{market.newListings}</span>
            <span className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>new</span>
            <span className="mx-1 text-xs" style={{ color: 'rgba(17,17,17,0.08)' }}>/</span>
            <span className="text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: '#111111' }}>{market.closings}</span>
            <span className="text-xs" style={{ color: 'rgba(17,17,17,0.45)' }}>closed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: string }) {
  return (
    <div className="rounded-md border p-3" style={{ borderColor: 'rgba(17,17,17,0.08)' }}>
      <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(17,17,17,0.45)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{label}</div>
      <div className="mt-1 text-lg font-medium" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: color || '#111111' }}>{value}</div>
      {hint && <div className="mt-0.5 text-[10px]" style={{ color: 'rgba(17,17,17,0.45)' }}>{hint}</div>}
    </div>
  );
}
