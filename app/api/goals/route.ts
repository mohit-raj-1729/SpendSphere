// app/api/goals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ goals: [] });
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Goals fetch error:", error);
      return NextResponse.json({ goals: [] });
    }

    return NextResponse.json({ goals: data || [] });
  } catch (err) {
    console.error("Goals API error:", err);
    return NextResponse.json({ goals: [] });
  }
}

export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { title, target_amount, target_date, description, icon, color } = body;

    if (!title || !target_amount) {
      return NextResponse.json({ error: "Title and target amount are required" }, { status: 400 });
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("goals")
      .insert({
        title,
        target_amount: Number(target_amount),
        current_amount: 0,
        target_date: target_date || null,
        description: description || null,
        icon: icon || "🎯",
        color: color || "violet",
      })
      .select()
      .single();

    if (error) {
      console.error("Goal creation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ goal: data });
  } catch (err) {
    console.error("Create goal error:", err);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}