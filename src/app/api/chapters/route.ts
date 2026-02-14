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
    const { 
      name, 
      description, 
      member_count,
      city,
      country,
      cover_image,
      is_main 
    } = body;

    console.log("📥 API received:", { name, city, country, cover_image });

    if (!name) {
      return NextResponse.json(
        { error: "Chapter name is required" },
        { status: 400 }
      );
    }

    // Ensure city and country are strings and trimmed
    const cleanCity = city && typeof city === 'string' ? city.trim() : null;
    const cleanCountry = country && typeof country === 'string' ? country.trim() : null;
    
    console.log("🧹 Cleaned values:", { cleanCity, cleanCountry });

    const insertData = {
      name,
      chapter_name: name,  // For app compatibility
      description,
      city: cleanCity,
      country: cleanCountry,
      cover_image: cover_image || null,
      created_by: currentUser.id,
      member_count: typeof member_count === "number" ? member_count : 1,
      is_main: is_main || false,
      visible: true,  // Must be true to show in app
    };
    
    console.log("💾 Inserting to Supabase:", insertData);

    const { data: chapter, error } = await supabase
      .from("chapters")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📚 New chapter created:", chapter.id);
    console.log("📊 Saved data:", { 
      city: chapter.city, 
      country: chapter.country,
      cover_image: chapter.cover_image 
    });

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
