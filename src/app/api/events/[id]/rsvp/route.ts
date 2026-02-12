import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/events/:id/rsvp — RSVP to an event
export async function POST(
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

    const body = await request.json();
    const { attending } = body;

    // Check if event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("id", id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if RSVP already exists
    const { data: existingRsvp } = await supabase
      .from("event_rsvp")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", currentUser.id)
      .single();

    if (existingRsvp) {
      // Update existing RSVP
      const { data: updated, error } = await supabase
        .from("event_rsvp")
        .update({ attending })
        .eq("event_id", id)
        .eq("user_id", currentUser.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      console.log(`📍 RSVP updated: User ${currentUser.id} -> Event ${id}`);

      return NextResponse.json({ success: true, data: updated });
    } else {
      // Create new RSVP
      const { data: newRsvp, error } = await supabase
        .from("event_rsvp")
        .insert({
          event_id: id,
          user_id: currentUser.id,
          attending,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      console.log(`📍 RSVP created: User ${currentUser.id} -> Event ${id}`);

      return NextResponse.json(
        { success: true, data: newRsvp },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id/rsvp — Cancel RSVP
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

    const { error } = await supabase
      .from("event_rsvp")
      .delete()
      .eq("event_id", id)
      .eq("user_id", currentUser.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(
      `❌ RSVP cancelled: User ${currentUser.id} -> Event ${id}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel RSVP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
