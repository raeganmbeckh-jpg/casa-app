import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.RENTCAST_API_KEY;
const BASE = "https://api.rentcast.io/v1";

async function rc(path: string) {
  if (!KEY) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json", "X-Api-Key": KEY },
    });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
  if (!KEY) return NextResponse.json({ error: "RENTCAST_API_KEY not configured" }, { status: 500 });

  const encoded = encodeURIComponent(address);

  // Extract zip from address for market stats
  const zipMatch = address.match(/\b(\d{5})\b/);
  const zip = zipMatch?.[1] || "";

  // Run all endpoints in parallel
  const [rentEstimate, rentComps, marketStats, rentHistory] = await Promise.all([
    rc(`/avm/rent/long-term?address=${encoded}`),
    rc(`/properties?address=${encoded}&radius=0.5&limit=10&propertyType=Single+Family`),
    zip ? rc(`/markets?zipCode=${zip}`) : Promise.resolve(null),
    rc(`/avm/rent/long-term/history?address=${encoded}`),
  ]);

  // Parse rent estimate
  let estimate = null;
  if (rentEstimate) {
    estimate = {
      rent: rentEstimate.rent || rentEstimate.rentRangeLow || null,
      rentLow: rentEstimate.rentRangeLow || null,
      rentHigh: rentEstimate.rentRangeHigh || null,
      confidence: rentEstimate.confidence || null,
      bedrooms: rentEstimate.bedrooms || null,
      bathrooms: rentEstimate.bathrooms || null,
      sqft: rentEstimate.squareFootage || null,
    };
  }

  // Parse rental comps
  let comps: any[] = [];
  if (Array.isArray(rentComps)) {
    comps = rentComps.slice(0, 10).map((c: any) => ({
      address: c.formattedAddress || c.addressLine1 || "",
      beds: c.bedrooms || null,
      baths: c.bathrooms || null,
      sqft: c.squareFootage || null,
      rent: c.price || c.lastSeenPrice || null,
      pricePerSqft: c.squareFootage && (c.price || c.lastSeenPrice) ? Math.round((c.price || c.lastSeenPrice) / c.squareFootage * 100) / 100 : null,
      daysOnMarket: c.daysOnMarket || null,
      propertyType: c.propertyType || null,
      distance: c.distance || null,
    }));
  }

  // Parse market stats
  let market = null;
  if (marketStats && !Array.isArray(marketStats)) {
    market = {
      medianRent: marketStats.medianRent || marketStats.averageRent || null,
      rentGrowth: marketStats.rentGrowthRate || marketStats.rentGrowth || null,
      vacancyRate: marketStats.vacancyRate || null,
      activeListings: marketStats.activeListings || marketStats.totalListings || null,
      zipCode: zip,
    };
  } else if (Array.isArray(marketStats) && marketStats.length > 0) {
    const m = marketStats[0];
    market = {
      medianRent: m.medianRent || m.averageRent || null,
      rentGrowth: m.rentGrowthRate || m.rentGrowth || null,
      vacancyRate: m.vacancyRate || null,
      activeListings: m.activeListings || m.totalListings || null,
      zipCode: zip,
    };
  }

  // Parse rent history
  let history: { date: string; rent: number }[] = [];
  if (rentHistory && Array.isArray(rentHistory)) {
    history = rentHistory.map((h: any) => ({
      date: h.date || h.month || "",
      rent: h.rent || h.value || 0,
    })).filter((h: any) => h.rent > 0);
  } else if (rentHistory?.history && Array.isArray(rentHistory.history)) {
    history = rentHistory.history.map((h: any) => ({
      date: h.date || h.month || "",
      rent: h.rent || h.value || 0,
    })).filter((h: any) => h.rent > 0);
  }

  const sources: string[] = [];
  if (estimate) sources.push("Rentcast AVM");
  if (comps.length > 0) sources.push("Rentcast Comps");
  if (market) sources.push("Rentcast Market");
  if (history.length > 0) sources.push("Rentcast History");

  return NextResponse.json({ estimate, comps, market, history, sources });
}
