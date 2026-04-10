import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.length < 3) {
    return NextResponse.json({ suggestions: [] });
  }

  const apiKey = process.env.ATTOM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] });
  }

  const headers = { Accept: "application/json", apikey: apiKey };
  const base = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

  try {
    // ATTOM doesn't have a dedicated autocomplete endpoint,
    // so we search by partial address and return formatted results
    const commaIdx = q.indexOf(",");
    let address1 = q;
    let address2 = "";
    if (commaIdx !== -1) {
      address1 = q.slice(0, commaIdx).trim();
      address2 = q.slice(commaIdx + 1).trim();
    }

    const params = new URLSearchParams({ address1, address2, pageSize: "5" });
    const res = await fetch(`${base}/property/address?${params}`, { headers });
    const data = await res.json();

    const suggestions = (data?.property || []).map((p: any) => {
      const a = p.address || {};
      return {
        address: [a.line1, a.locality, a.countrySubd, a.postal1].filter(Boolean).join(", "),
        line1: a.line1 || "",
        city: a.locality || "",
        state: a.countrySubd || "",
        zip: a.postal1 || "",
      };
    });

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
