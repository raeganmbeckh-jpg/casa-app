"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Calendar,
  DollarSign,
  Home,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import AIPanel from "@/components/AIPanel";

function PropertyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [property, setProperty] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function load() {
      const [p, d, r, s] = await Promise.all([
        supabase.from("properties").select("*").eq("id", id).single(),
        supabase.from("property_details").select("*").eq("property_id", id).single(),
        supabase.from("property_rooms").select("*").eq("property_id", id),
        supabase.from("property_systems").select("*").eq("property_id", id),
      ]);
      setProperty(p.data);
      setDetails(d.data);
      setRooms(r.data || []);
      setSystems(s.data || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  const infoItems = [
    { icon: Bed, label: "Bedrooms", value: details?.bedrooms ?? property.bedrooms ?? "—" },
    { icon: Bath, label: "Bathrooms", value: details?.bathrooms ?? property.bathrooms ?? "—" },
    { icon: Ruler, label: "Sq Ft", value: details?.square_feet ?? property.square_feet ?? "—" },
    { icon: Calendar, label: "Year Built", value: details?.year_built ?? property.year_built ?? "—" },
    { icon: DollarSign, label: "Value", value: details?.estimated_value ? `$${Number(details.estimated_value).toLocaleString()}` : "—" },
    { icon: Home, label: "Type", value: details?.property_type ?? property.property_type ?? "—" },
  ];

  return (
    <div className="min-h-screen pb-8">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {property.name || property.address || "Property Detail"}
            </h1>
            {property.address && (
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.address}
                {property.city && `, ${property.city}`}
                {property.state && `, ${property.state}`}
                {property.zip && ` ${property.zip}`}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {infoItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            );
          })}
        </div>

        {rooms.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-3">Rooms</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map((room: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 text-sm">
                  <p className="font-medium">{room.name || room.room_type || `Room ${i + 1}`}</p>
                  {room.dimensions && (
                    <p className="text-gray-400 text-xs mt-1">{room.dimensions}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {systems.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold mb-3">Property Systems</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {Object.keys(systems[0]).slice(0, 5).map((k) => (
                      <th
                        key={k}
                        className="text-left py-2 px-3 text-gray-400 font-medium"
                      >
                        {k.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {systems.map((sys: any, i: number) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      {Object.keys(systems[0]).slice(0, 5).map((k) => (
                        <td key={k} className="py-2 px-3 truncate max-w-[200px]">
                          {String(sys[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold mb-3">All Property Data</h3>
          <pre className="text-xs text-gray-400 overflow-auto max-h-96 bg-black/20 rounded-lg p-4">
            {JSON.stringify({ ...property, details, rooms, systems }, null, 2)}
          </pre>
        </div>
      </div>
      <AIPanel />
    </div>
  );
}

export default function PropertyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PropertyContent />
    </Suspense>
  );
}
