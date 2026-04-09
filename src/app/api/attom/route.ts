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

  try {
    // Split "2167 Villa Sonoma Glen, Escondido, CA 92029" into
    // address1 = "2167 Villa Sonoma Glen"
    // address2 = "Escondido, CA 92029"
    const commaIdx = address.indexOf(",");
    let address1 = address;
    let address2 = "";
    if (commaIdx !== -1) {
      address1 = address.slice(0, commaIdx).trim();
      address2 = address.slice(commaIdx + 1).trim();
    }

    const params = new URLSearchParams({ address1, address2 });
    const res = await fetch(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?${params}`,
      {
        headers: {
          Accept: "application/json",
          apikey: apiKey,
        },
      }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from ATTOM API" },
      { status: 500 }
    );
  }
}
