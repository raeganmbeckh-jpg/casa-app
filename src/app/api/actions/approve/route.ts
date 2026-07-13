import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const sb = supabase();

    // Update to approved
    const { data: action, error } = await sb
      .from("agent_actions")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "proposed")
      .select()
      .single();

    if (error || !action) {
      return NextResponse.json({ error: error?.message || "Action not found or not in proposed state" }, { status: 400 });
    }

    // Immediately trigger execution
    const execRes = await fetch(new URL("/api/actions/execute", req.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const execData = await execRes.json();
    return NextResponse.json({ action, execution: execData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
