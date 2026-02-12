import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/announcements/:id — Get a single announcement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error("Fetch announcement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/:id — Update an announcement
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

    // Check if user is the author
    const { data: announcement } = await supabase
      .from("announcements")
      .select("author_id")
      .eq("id", id)
      .single();

    if (announcement?.author_id !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only update your own announcements" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category } = body;

    const { data: updated, error } = await supabase
      .from("announcements")
      .update({
        title,
        content,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📝 Announcement updated:", id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update announcement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/:id — Delete an announcement
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

    // Check if user is the author
    const { data: announcement } = await supabase
      .from("announcements")
      .select("author_id")
      .eq("id", id)
      .single();

    if (announcement?.author_id !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only delete your own announcements" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("🗑️ Announcement deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
