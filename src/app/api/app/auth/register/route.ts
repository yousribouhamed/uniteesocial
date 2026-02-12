import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/app/auth/register — Register a new mobile app user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Sign up using Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || email.split("@")[0],
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
          message: "Registration successful. Please check your email to confirm.",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("App register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
