import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address parameter required" }, { status: 400 });
  }

  const apiKey = process.env.ATTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ATTOM API key not configured" }, { status: 500 });
  }

  const commaIdx = address.indexOf(",");
  let address1 = address;
  let address2 = "";
  if (commaIdx !== -1) {
    address1 = address.slice(0, commaIdx).trim();
    address2 = address.slice(commaIdx + 1).trim();
  }

  const params = new URLSearchParams({ address1, address2 });
  const headers = { Accept: "application/json", apikey: apiKey };
  const base = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

  try {
    const [basicRes, detailRes] = await Promise.all([
      fetch(`${base}/property/address?${params}`, { headers }),
      fetch(`${base}/property/detail?${params}`, { headers }),
    ]);

    const [basic, detail] = await Promise.all([
      basicRes.json(),
      detailRes.json(),
    ]);

    const prop = detail?.property?.[0] || basic?.property?.[0];
    let comps: any[] = [];

    // Fetch comps using the property's geo if available
    const lat = prop?.location?.latitude;
    const lon = prop?.location?.longitude;
    if (lat && lon) {
      try {
        const compsParams = new URLSearchParams({
          latitude: String(lat),
          longitude: String(lon),
          searchRadius: "0.5",
          minSaleAmt: "100000",
          maxSaleAmt: "10000000",
          saleDateRange: "24",
          pageSize: "5",
        });
        const compsRes = await fetch(
          `${base}/sale/snapshot?${compsParams}`,
          { headers }
        );
        const compsData = await compsRes.json();
        comps = compsData?.property || [];
      } catch {
        // comps are optional
      }
    }

    return NextResponse.json({
      basic: basic?.property?.[0] || null,
      detail: detail?.property?.[0] || null,
      comps,
      status: basic?.status || detail?.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from ATTOM API" },
      { status: 500 }
    );
  }
}
