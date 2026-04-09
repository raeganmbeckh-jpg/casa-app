"use client";

import { useState } from "react";
import { Search, MapPin, X, Loader2 } from "lucide-react";

interface AttomProperty {
  identifier?: { Id?: string; apn?: string };
  address?: {
    line1?: string;
    line2?: string;
    locality?: string;
    countrySubd?: string;
    postal1?: string;
  };
  summary?: {
    proptype?: string;
    propsubtype?: string;
    yearbuilt?: number;
    propLandUse?: string;
  };
  lot?: { lotSize1?: number; lotSize2?: number };
  building?: {
    size?: { bldgSize?: number; livingSize?: number };
    rooms?: { beds?: number; bathsFull?: number; bathsHalf?: number };
  };
  assessment?: {
    assessed?: { assdTtlValue?: number };
    market?: { mktTtlValue?: number };
  };
}

export default function AddressSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AttomProperty[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    setExpanded(null);

    try {
      const res = await fetch(`/api/attom?address=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (data.status?.msg === "SuccessWithResult" && data.property) {
        setResults(data.property);
      } else if (data.property) {
        setResults(Array.isArray(data.property) ? data.property : [data.property]);
      } else {
        setError(data.status?.msg || data.error || "No results found for this address.");
      }
    } catch {
      setError("Failed to search. Please try again.");
    }
    setSearching(false);
  }

  function formatAddress(p: AttomProperty) {
    const a = p.address;
    if (!a) return "Unknown address";
    return [a.line1, a.locality, a.countrySubd, a.postal1].filter(Boolean).join(", ");
  }

  return (
    <div className="bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h2 className="font-semibold text-lg">Search Any US Address</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Look up property data for any address using ATTOM
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="123 Main St, Austin, TX 78701"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-600"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setError(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-3">
          {results.map((prop, i) => {
            const isOpen = expanded === i;
            const beds = prop.building?.rooms?.beds;
            const baths = prop.building?.rooms?.bathsFull;
            const sqft = prop.building?.size?.livingSize || prop.building?.size?.bldgSize;
            const year = prop.summary?.yearbuilt;
            const value = prop.assessment?.market?.mktTtlValue || prop.assessment?.assessed?.assdTtlValue;

            return (
              <div
                key={i}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full text-left p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{formatAddress(prop)}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                        {prop.summary?.proptype && (
                          <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">
                            {prop.summary.proptype}
                          </span>
                        )}
                        {beds && <span>{beds} bed</span>}
                        {baths && <span>{baths} bath</span>}
                        {sqft && <span>{sqft.toLocaleString()} sqft</span>}
                        {year && <span>Built {year}</span>}
                        {value && (
                          <span className="text-emerald-400 font-medium">
                            ${value.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {isOpen ? "collapse" : "details"}
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--border)] p-4">
                    <pre className="text-xs text-gray-400 overflow-auto max-h-64 bg-black/20 rounded-lg p-3">
                      {JSON.stringify(prop, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
