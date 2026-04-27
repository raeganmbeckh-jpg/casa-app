import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      response:
        "AI agent is not configured yet. Add your ANTHROPIC_API_KEY to .env.local to enable AI analysis.",
    });
  }

  try {
    const { messages } = await req.json();
    // Fetch portfolio context
    const [properties, tenants, leases, alerts] = await Promise.all([
      supabase.from("properties").select("*").limit(20),
      supabase.from("tenants").select("*").limit(20),
      supabase.from("leases").select("*").limit(20),
      supabase.from("alerts").select("*").limit(10),
    ]);

    const context = JSON.stringify({
      properties: properties.data,
      tenants: tenants.data,
      leases: leases.data,
      alerts: alerts.data,
    });

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        temperature: 0,
        system: `You are CASA AI, a real estate portfolio intelligence assistant. You analyze property data, tenant information, leases, and market conditions. Be concise and actionable. Here is the current portfolio data:\n\n${context}`,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await res.json();
    const response =
      data.content?.[0]?.text || "I couldn't generate a response.";

    return NextResponse.json({ response });
  } catch (_error) {
    return NextResponse.json(
      { error: "AI agent error" },
      { status: 500 }
    );
  }
}
