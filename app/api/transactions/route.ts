import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If Supabase not configured, return empty array
  if (!url || !key) {
    return NextResponse.json([]);
  }

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .limit(1000);

    if (error) {
      console.error(error);
      return NextResponse.json([]);
    }

    return NextResponse.json(data || []);
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}