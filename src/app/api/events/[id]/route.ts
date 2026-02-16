import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseJsonSafe<T = any>(value: unknown): T | null {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function extractMatchDetails(event: any) {
  const directMatchDetails =
    typeof event?.match_details === "string"
      ? parseJsonSafe(event.match_details)
      : event?.match_details;

  if (directMatchDetails && typeof directMatchDetails === "object") {
    return directMatchDetails;
  }

  const parsedDescription = parseJsonSafe<{ match_details?: any }>(event?.description);
  if (parsedDescription?.match_details && typeof parsedDescription.match_details === "object") {
    return parsedDescription.match_details;
  }

  return null;
}

function extractDescriptionText(description: unknown) {
  if (typeof description !== "string") return description ?? null;
  const parsedDescription = parseJsonSafe<{ text?: unknown }>(description);
  if (parsedDescription && typeof parsedDescription.text === "string") {
    return parsedDescription.text;
  }
  return description;
}

function normalizeEventForMobile(event: any) {
  const matchDetails = extractMatchDetails(event);
  const league =
    typeof matchDetails?.league === "string" ? matchDetails.league.trim() : "";

  const isMatchEvent =
    event?.event_category === "match" ||
    Boolean(league || matchDetails?.homeTeam || matchDetails?.awayTeam);

  return {
    ...event,
    description: extractDescriptionText(event?.description),
    match_details: matchDetails,
    league: league || null,
    home_team: typeof matchDetails?.homeTeam === "string" ? matchDetails.homeTeam : null,
    away_team: typeof matchDetails?.awayTeam === "string" ? matchDetails.awayTeam : null,
    chapter: isMatchEvent && league ? league : event?.chapter,
    badge_label: isMatchEvent ? league || event?.chapter || "League" : event?.chapter,
  };
}

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

    const normalizedEvent = normalizeEventForMobile(event);

    // Get RSVP status if user is authenticated
    if (currentUser) {
      const { data: rsvp } = await supabase
        .from("event_rsvp")
        .select("attending")
        .eq("event_id", id)
        .eq("user_id", currentUser.id)
        .single();

      normalizedEvent.isAttending = !!rsvp?.attending;
    }

    // Count attendees
    const { data: attendees } = await supabase
      .from("event_rsvp")
      .select("id")
      .eq("event_id", id)
      .eq("attending", true);

    normalizedEvent.attendees = attendees?.length || 0;

    return NextResponse.json({ success: true, data: normalizedEvent });
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
