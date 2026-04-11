import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  const attomKey = process.env.ATTOM_API_KEY;

  // Try Google Geocoding first (more reliable for reverse geocoding)
  if (googleKey) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`
      );
      const data = await res.json();
      const result = data.results?.[0];
      if (result?.formatted_address) {
        return NextResponse.json({ address: result.formatted_address });
      }
    } catch {
      // Fall through to ATTOM
    }
  }

  // Fallback to ATTOM
  if (attomKey) {
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        searchRadius: "0.1",
        pageSize: "1",
      });
      const res = await fetch(
        `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/snapshot?${params}`,
        { headers: { Accept: "application/json", apikey: attomKey } }
      );
      const data = await res.json();
      const prop = data?.property?.[0];
      if (prop) {
        const a = prop.address || {};
        const address = [a.line1, a.locality, a.countrySubd, a.postal1].filter(Boolean).join(", ");
        if (address) return NextResponse.json({ address });
      }
    } catch {
      // Fall through
    }
  }

  return NextResponse.json({ address: null });
}
