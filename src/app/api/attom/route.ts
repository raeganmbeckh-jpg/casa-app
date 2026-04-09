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
    const res = await fetch(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/address?address1=${encodeURIComponent(address)}`,
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
