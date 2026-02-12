import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DEBUG endpoint - use admin client with full permissions
export async function GET() {
  try {
    const adminClient = createAdminClient();

    const { data: events, error } = await adminClient
      .from("events")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message, details: error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      count: events?.length || 0,
      data: events
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
