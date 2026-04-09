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

  try {
    // Fetch both basic and detailed profile in parallel
    const [basicRes, detailRes] = await Promise.all([
      fetch(
        `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?${params}`,
        { headers }
      ),
      fetch(
        `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?${params}`,
        { headers }
      ),
    ]);

    const [basic, detail] = await Promise.all([
      basicRes.json(),
      detailRes.json(),
    ]);

    return NextResponse.json({
      basic: basic?.property?.[0] || null,
      detail: detail?.property?.[0] || null,
      status: basic?.status || detail?.status,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from ATTOM API" },
      { status: 500 }
    );
  }
}
