import { NextRequest, NextResponse } from "next/server";

const KEY = process.env.RENTCAST_API_KEY;
const BASE = "https://api.rentcast.io/v1";

async function rc(path: string, label: string, diag: any[]) {
  if (!KEY) {
    console.error(`[rentcast:${label}] RENTCAST_API_KEY is not set in environment`);
    diag.push({ label, ok: false, reason: "no_api_key" });
    return null;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Accept: "application/json", "X-Api-Key": KEY },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "<unreadable>");
      console.error(`[rentcast:${label}] ${BASE}${path} returned ${res.status}: ${errText.slice(0, 300)}`);
      diag.push({ label, ok: false, status: res.status, reason: errText.slice(0, 200) });
      return null;
    }
    const json = await res.json();
    const shape = Array.isArray(json) ? `array(${json.length})` : (json && typeof json === "object" ? `object(keys=${Object.keys(json).slice(0,8).join(",")})` : typeof json);
    console.log(`[rentcast:${label}] OK ${BASE}${path} → ${shape}`);
    diag.push({ label, ok: true, shape });
    return json;
  } catch (err: any) {
    console.error(`[rentcast:${label}] fetch threw for ${BASE}${path}:`, err?.message || err);
    diag.push({ label, ok: false, reason: `threw: ${err?.message || "unknown"}` });
    return null;
  }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });

  const diag: any[] = [];
  console.log(`[rentcast] incoming address: "${address}" | KEY_present=${!!KEY}`);

  if (!KEY) {
    return NextResponse.json({
      estimate: null, comps: [], market: null, history: [], sources: [],
      _diagnostics: { error: "RENTCAST_API_KEY missing in environment", diag: [] }
    });
  }

  const encoded = encodeURIComponent(address);
  const zipMatch = address.match(/\b(\d{5})\b/);
  const zip = zipMatch?.[1] || "";
  console.log(`[rentcast] parsed zip: "${zip}"`);

  const [rentEstimate, rentComps, marketStats, rentHistory] = await Promise.all([
    rc(`/avm/rent/long-term?address=${encoded}`, "rentEstimate", diag),
    rc(`/properties?address=${encoded}&radius=0.5&limit=10&propertyType=Single+Family`, "rentComps", diag),
    zip ? rc(`/markets?zipCode=${zip}`, "marketStats", diag) : Promise.resolve(null),
    rc(`/avm/rent/long-term/history?address=${encoded}`, "rentHistory", diag),
  ]);

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

  let market = null;
  if (marketStats && typeof marketStats === "object" && !Array.isArray(marketStats)) {
    // Rentcast nests current-tier market data under rentalData
    const rd = marketStats.rentalData || marketStats;
    market = {
      medianRent: rd.medianRent || rd.averageRent || rd.medianPrice || rd.averagePrice || null,
      rentGrowth: rd.rentGrowthRate || rd.rentGrowth || rd.yearOverYearChange || null,
      vacancyRate: rd.vacancyRate || null,
      activeListings: rd.activeListings || rd.totalListings || rd.listingCount || null,
      zipCode: zip,
    };
  } else if (Array.isArray(marketStats) && marketStats.length > 0) {
    const m = marketStats[0];
    const rd = m.rentalData || m;
    market = {
      medianRent: rd.medianRent || rd.averageRent || rd.medianPrice || rd.averagePrice || null,
      rentGrowth: rd.rentGrowthRate || rd.rentGrowth || rd.yearOverYearChange || null,
      vacancyRate: rd.vacancyRate || null,
      activeListings: rd.activeListings || rd.totalListings || rd.listingCount || null,
      zipCode: zip,
    };
  }

  let history: { date: string; rent: number }[] = [];
  if (rentHistory && Array.isArray(rentHistory)) {
    history = rentHistory.map((h: any) => ({ date: h.date || h.month || "", rent: h.rent || h.value || 0 })).filter((h: any) => h.rent > 0);
  } else if (rentHistory?.history && Array.isArray(rentHistory.history)) {
    history = rentHistory.history.map((h: any) => ({ date: h.date || h.month || "", rent: h.rent || h.value || 0 })).filter((h: any) => h.rent > 0);
  }

  const sources: string[] = [];
  if (estimate) sources.push("Rentcast AVM");
  if (comps.length > 0) sources.push("Rentcast Comps");
  if (market) sources.push("Rentcast Market");
  if (history.length > 0) sources.push("Rentcast History");

  console.log(`[rentcast] summary: estimate=${!!estimate} comps=${comps.length} market=${!!market} history=${history.length}`);

  return NextResponse.json({
    estimate, comps, market, history, sources,
    _diagnostics: { zip, diag }
  });
}
