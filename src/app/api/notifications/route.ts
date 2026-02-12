import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/notifications — Get user's notifications
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";
    const unreadOnly = searchParams.get("unread_only") === "true";

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.id);

    if (unreadOnly) {
      query = query.eq("read", false);
    }

    const { data: notifications, error } = await query
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Count unread
    const { data: unreadData } = await supabase
      .from("notifications")
      .select("id", { count: "exact" })
      .eq("user_id", currentUser.id)
      .eq("read", false);

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount: unreadData?.length || 0,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notifications — Create a new notification (internal use)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, title, message, type, related_id } = body;

    if (!user_id || !title) {
      return NextResponse.json(
        { error: "user_id and title are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id,
        title,
        message,
        type: type || "general",
        related_id,
        read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📬 New notification created for user:", user_id);

    return NextResponse.json(
      { success: true, data: notification },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
