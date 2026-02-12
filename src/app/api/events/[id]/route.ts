import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/events/:id — Get a single event with RSVP status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get RSVP status if user is authenticated
    if (currentUser) {
      const { data: rsvp } = await supabase
        .from("event_rsvp")
        .select("attending")
        .eq("event_id", id)
        .eq("user_id", currentUser.id)
        .single();

      event.isAttending = !!rsvp?.attending;
    }

    // Count attendees
    const { data: attendees } = await supabase
      .from("event_rsvp")
      .select("id")
      .eq("event_id", id)
      .eq("attending", true);

    event.attendees = attendees?.length || 0;

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error("Fetch event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/events/:id — Update an event
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
    const { data: event } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", id)
      .single();

    if (event?.created_by !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only update your own events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, start_date, end_date, location, chapter_id } =
      body;

    const { data: updated, error } = await supabase
      .from("events")
      .update({
        title,
        description,
        start_date,
        end_date,
        location,
        chapter_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📅 Event updated:", id);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id — Delete an event
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
    const { data: event } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", id)
      .single();

    if (event?.created_by !== currentUser.id) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("🗑️ Event deleted:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
