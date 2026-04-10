import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "q parameter required" }, { status: 400 });
  }

  const base = "https://www.courtlistener.com/api/rest/v3";

  try {
    // Search dockets (cases) and opinions in parallel
    const [docketsRes, opinionsRes] = await Promise.all([
      fetch(`${base}/dockets/?q=${encodeURIComponent(q)}&order_by=-date_filed&page_size=10`, {
        headers: { Accept: "application/json" },
      }),
      fetch(`${base}/search/?q=${encodeURIComponent(q)}&type=o&order_by=score+desc&page_size=5`, {
        headers: { Accept: "application/json" },
      }),
    ]);

    const [dockets, opinions] = await Promise.all([
      docketsRes.ok ? docketsRes.json() : { results: [] },
      opinionsRes.ok ? opinionsRes.json() : { results: [] },
    ]);

    const cases = (dockets.results || []).map((d: any) => ({
      id: d.id,
      case_name: d.case_name || "Unknown",
      court: d.court_id || d.court || "",
      date_filed: d.date_filed || "",
      date_terminated: d.date_terminated || null,
      status: d.date_terminated ? "terminated" : "active",
      nature_of_suit: d.nature_of_suit || "",
      docket_number: d.docket_number || "",
    }));

    const opinionResults = (opinions.results || []).map((o: any) => ({
      case_name: o.caseName || o.case_name || "",
      court: o.court || "",
      date: o.dateFiled || o.date_filed || "",
      snippet: o.snippet || "",
    }));

    return NextResponse.json({
      cases,
      opinions: opinionResults,
      total_cases: dockets.count || cases.length,
      total_opinions: opinions.count || opinionResults.length,
    });
  } catch {
    return NextResponse.json({ cases: [], opinions: [], total_cases: 0, total_opinions: 0 });
  }
}
