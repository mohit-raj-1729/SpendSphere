import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error. Please check environment variables." },
        { status: 500 }
      );
    }

    console.log("Supabase URL:", supabaseUrl ? "Found" : "Missing");
    console.log("Supabase Key:", supabaseAnonKey ? "Found" : "Missing");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || "",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/app`,
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error("No user returned from Supabase");
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user profile in your database (skip if table doesn't exist)
    try {
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: name || "",
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Profile creation error (non-critical):", profileError);
        // Don't fail the signup if profile creation fails
      }
    } catch (profileErr: any) {
      console.error("Profile creation error (non-critical):", profileErr);
      // Continue even if profile creation fails
    }

    // Note: Supabase may return null session if email confirmation is required
    // This is normal behavior - user will need to confirm email first
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      session: authData.session,
      message: authData.session 
        ? "Account created successfully" 
        : "Account created! Please check your email to confirm your account.",
    });
  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { 
        error: error.message || "An error occurred during sign up",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
