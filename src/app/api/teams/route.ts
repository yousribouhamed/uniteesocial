import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isTeamsTableMissingError(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("public.teams"));
}

// GET /api/teams — List all teams
export async function GET() {
  try {
    const adminClient = createAdminClient();

    const { data: teams, error } = await adminClient
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (isTeamsTableMissingError(error)) {
        return NextResponse.json(
          {
            success: false,
            code: "TEAMS_TABLE_MISSING",
            error: "Teams backend is not initialized. Run the teams migration first.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: teams || [] });
  } catch (error) {
    console.error("Fetch teams error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/teams — Create a new team
export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient();
    const body = await request.json();

    const {
      league,
      name_en,
      name_ar,
      logo_url,
      website_url,
      stadium_name,
      stadium_name_ar,
      manager_name,
      manager_name_ar,
      visible,
    } = body;

    if (!league || !name_en) {
      return NextResponse.json(
        { error: "League and team name are required" },
        { status: 400 }
      );
    }

    const payload = {
      league: String(league).trim(),
      name_en: String(name_en).trim(),
      name_ar: String(name_ar || "").trim(),
      logo_url: String(logo_url || "").trim(),
      website_url: String(website_url || "").trim(),
      stadium_name: String(stadium_name || "").trim(),
      stadium_name_ar: String(stadium_name_ar || "").trim(),
      manager_name: String(manager_name || "").trim(),
      manager_name_ar: String(manager_name_ar || "").trim(),
      visible: visible ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data: team, error } = await adminClient
      .from("teams")
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (isTeamsTableMissingError(error)) {
        return NextResponse.json(
          {
            success: false,
            code: "TEAMS_TABLE_MISSING",
            error: "Teams backend is not initialized. Run the teams migration first.",
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    console.error("Create team error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
