import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { email, name, role, use_case } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    console.log(`[waitlist] signup: ${email} | name=${name || "—"} | role=${role || "—"}`);

    // Try insert — on unique violation, return existing position
    const { error: insertErr } = await supabase.from("waitlist_signups").insert({
      email: email.toLowerCase().trim(),
      name: name || null,
      role: role || null,
      use_case: use_case || null,
    });

    if (insertErr && insertErr.code === "23505") {
      // Already signed up — get position
      const { count } = await supabase.from("waitlist_signups").select("*", { count: "exact", head: true });
      const { data: existing } = await supabase.from("waitlist_signups").select("created_at").eq("email", email.toLowerCase().trim()).single();
      const { count: position } = await supabase.from("waitlist_signups").select("*", { count: "exact", head: true }).lte("created_at", existing?.created_at || new Date().toISOString());
      console.log(`[waitlist] already signed up: ${email}, position #${position}`);
      return NextResponse.json({ success: true, position: position || 1, message: "You're already on the list!" });
    }

    if (insertErr) {
      console.error("[waitlist] insert error:", insertErr.message);
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    // Get position (total count)
    const { count } = await supabase.from("waitlist_signups").select("*", { count: "exact", head: true });
    console.log(`[waitlist] new signup: ${email}, position #${count}`);

    return NextResponse.json({ success: true, position: count || 1, message: "Welcome to the waitlist!" });
  } catch (err: any) {
    console.error("[waitlist] error:", err.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
