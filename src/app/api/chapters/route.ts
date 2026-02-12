import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/chapters — List all chapters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const { data: chapters, error } = await supabase
      .from("chapters")
      .select("*")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: chapters });
  } catch (error) {
    console.error("Fetch chapters error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chapters — Create a new chapter
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Chapter name is required" },
        { status: 400 }
      );
    }

    const { data: chapter, error } = await supabase
      .from("chapters")
      .insert({
        name,
        description,
        created_by: currentUser.id,
        member_count: 1,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📚 New chapter created:", chapter.id);

    return NextResponse.json(
      { success: true, data: chapter },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
