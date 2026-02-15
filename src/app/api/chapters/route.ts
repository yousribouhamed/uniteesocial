import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CHAPTERS } from "@/data/chapters";

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

    // If DB table is missing or empty, return DEFAULT_CHAPTERS as fallback
    if (error || !chapters || chapters.length === 0) {
      if (error) {
        console.warn("Chapters query error (table may not exist):", error.message);
      }

      // Try auto-seeding first
      if (!error) {
        const seeded = await seedDefaultChapters(supabase);
        if (seeded.length > 0) {
          return NextResponse.json({ success: true, data: seeded });
        }
      }

      // Return static fallback so both portal and app always have data
      const fallback = DEFAULT_CHAPTERS.map((ch, i) => ({
        id: `default-${i}`,
        name: ch.name,
        description: `${ch.name} — ${ch.city}, ${ch.country}`,
        city: ch.city,
        country: ch.country,
        code: ch.code,
        member_count: ch.team || 0,
        event_count: parseInt(ch.events) || 0,
        visible: ch.visible,
        status: ch.status,
        is_main: i === 0,
        cover_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      return NextResponse.json({ success: true, data: fallback });
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
      code,
      visible,
      status,
      cover_image,
      is_main,
      event_count
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
      code: code || null,
      cover_image: cover_image || null,
      created_by: currentUser.id,
      member_count: typeof member_count === "number" ? member_count : 1,
      is_main: is_main || false,
      visible: visible ?? true,
      status: status || "Active",
      event_count: typeof event_count === "number" ? event_count : 0,
    };

    console.log("💾 Inserting to Supabase:", insertData);

    // Use admin client (service_role key) to bypass PostgREST schema cache
    // and RLS restrictions. The anon-key client may not recognize columns
    // added via ALTER TABLE (city, country, cover_image, etc.), causing them
    // to be silently dropped and saved as NULL.
    const adminSupabase = createAdminClient();
    const { data: chapter, error } = await adminSupabase
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

/**
 * Seeds DEFAULT_CHAPTERS into the database when it's empty.
 * Uses the authenticated user as the creator.
 */
async function seedDefaultChapters(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Need an authenticated user to satisfy the created_by FK
    const createdBy = user?.id;
    if (!createdBy) {
      console.warn("Cannot seed chapters: no authenticated user");
      return [];
    }

    const seedData = DEFAULT_CHAPTERS.map((ch, index) => ({
      name: ch.name,
      description: `${ch.name} — ${ch.city}, ${ch.country}`,
      city: ch.city,
      country: ch.country,
      code: ch.code,
      member_count: ch.team || 0,
      event_count: parseInt(ch.events) || 0,
      visible: ch.visible,
      status: ch.status,
      is_main: index === 0, // First chapter is main
      created_by: createdBy,
    }));

    const { data: seeded, error } = await supabase
      .from("chapters")
      .insert(seedData)
      .select();

    if (error) {
      console.error("Failed to seed chapters:", error.message);
      return [];
    }

    console.log(`📚 Seeded ${seeded?.length || 0} default chapters`);
    return seeded || [];
  } catch (error) {
    console.error("Seed chapters error:", error);
    return [];
  }
}
