import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }

  const apiKey = process.env.ATTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const headers = { Accept: "application/json", apikey: apiKey };
  const base = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      searchRadius: "0.1",
      pageSize: "1",
    });
    const res = await fetch(`${base}/property/snapshot?${params}`, { headers });
    const data = await res.json();

    const prop = data?.property?.[0];
    if (!prop) {
      return NextResponse.json({ address: null });
    }

    const a = prop.address || {};
    const address = [a.line1, a.locality, a.countrySubd, a.postal1].filter(Boolean).join(", ");
    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ address: null });
  }
}
