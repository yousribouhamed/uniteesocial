import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/events — List all events with RSVP status
export async function GET(request: Request) {
  try {
    // Use admin client to bypass RLS restrictions and allow public read access
    const adminClient = createAdminClient();
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const { data: events, error: eventsError } = await adminClient
      .from("events")
      .select("*")
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (eventsError) {
      return NextResponse.json(
        { error: eventsError.message },
        { status: 400 }
      );
    }

    // Return events directly - no RSVP logic needed for mobile app
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Fetch events error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/events — Create a new event
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
    const { title, description, start_date, end_date, location, chapter_id } =
      body;

    if (!title || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Title, start_date, and end_date are required" },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        description,
        start_date,
        end_date,
        location,
        chapter_id,
        created_by: currentUser.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("📅 New event created:", event.id);

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
