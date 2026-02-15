import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/chapters/:id — Get chapter details and announcements
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: chapter, error } = await supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    console.error("Fetch chapter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/chapters/:id — Update a chapter
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is the creator
    const { data: chapter } = await supabase
      .from("chapters")
      .select("created_by")
      .eq("id", id)
      .single();

    if (chapter?.created_by !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only update your own chapters" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, member_count, city, country, code, visible, status, cover_image, is_main, event_count } = body;

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (member_count !== undefined) updateData.member_count = member_count;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (code !== undefined) updateData.code = code;
    if (visible !== undefined) updateData.visible = visible;
    if (status !== undefined) updateData.status = status;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (is_main !== undefined) updateData.is_main = is_main;
    if (event_count !== undefined) updateData.event_count = event_count;

    // Use admin client to bypass PostgREST schema cache issues
    const adminSupabase = createAdminClient();

    // Reload PostgREST schema cache to ensure columns added via ALTER TABLE
    // (city, country, cover_image, etc.) are recognized and not silently dropped
    const { error: rpcError } = await adminSupabase.rpc('reload_schema_cache');
    if (rpcError) {
      console.warn('reload_schema_cache RPC not available:', rpcError.message);
    }

    const { data: updated, error } = await adminSupabase
      .from("chapters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📚 Chapter updated:", id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update chapter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/chapters/:id — Delete a chapter
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is the creator
    const { data: chapter } = await supabase
      .from("chapters")
      .select("created_by")
      .eq("id", id)
      .single();

    if (chapter?.created_by !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only delete your own chapters" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("🗑️ Chapter deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
