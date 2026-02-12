import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const { name, description, member_count } = body;

    const { data: updated, error } = await supabase
      .from("chapters")
      .update({
        name,
        description,
        member_count,
        updated_at: new Date().toISOString(),
      })
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
