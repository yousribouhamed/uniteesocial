import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CHAPTERS } from "@/data/chapters";

/**
 * POST /api/chapters/setup — One-time setup endpoint
 * Creates the chapters table and seeds DEFAULT_CHAPTERS.
 * Uses the admin (service role) client to bypass RLS.
 *
 * Call once from the portal or via:
 *   curl -X POST https://uniteesocial.vercel.app/api/chapters/setup
 */
export async function POST() {
  try {
    const supabase = createAdminClient();

    // Step 1: Try to access the table first
    const { error: probeError } = await supabase.from("chapters").select("id").limit(1);

    if (probeError && probeError.message.includes("schema cache")) {
      // Table doesn't exist — return SQL instructions
      return NextResponse.json({
        success: false,
        error: "chapters table does not exist",
        message: "Please run the following SQL in the Supabase Dashboard SQL Editor (supabase.com → your project → SQL Editor):",
        sql: CREATE_TABLE_SQL,
      }, { status: 400 });
    }

    // Step 2: Check if chapters already exist
    const { data: existing } = await supabase.from("chapters").select("id").limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Chapters already exist. No seeding needed.",
      });
    }

    // Step 3: Seed DEFAULT_CHAPTERS
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1 });
    const createdBy = users?.users?.[0]?.id;

    if (!createdBy) {
      return NextResponse.json(
        { error: "No users found. Create an admin user first." },
        { status: 400 }
      );
    }

    const seedData = DEFAULT_CHAPTERS.map((ch, index) => ({
      name: ch.name,
      description: `${ch.name} — ${ch.city}, ${ch.country}`,
      city: ch.city,
      country: ch.country,
      code: ch.code,
      member_count: ch.team || 0,
      event_count: parseInt(ch.events) || 0,
      visible: ch.visible,
      status: ch.status,
      is_main: index === 0,
      created_by: createdBy,
    }));

    const { data: seeded, error: seedError } = await supabase
      .from("chapters")
      .insert(seedData)
      .select();

    if (seedError) {
      return NextResponse.json(
        { error: `Failed to seed: ${seedError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${seeded?.length || 0} chapters`,
      data: seeded,
    });
  } catch (error) {
    console.error("Chapter setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const CREATE_TABLE_SQL = `
-- Create chapters table with all columns
CREATE TABLE IF NOT EXISTS chapters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  member_count integer DEFAULT 0,
  city text,
  country text,
  code text,
  visible boolean DEFAULT true,
  status text DEFAULT 'Active',
  cover_image text,
  is_main boolean DEFAULT false,
  event_count integer DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read chapters"
  ON chapters FOR SELECT
  USING (true);

-- Allow authenticated users to create
CREATE POLICY "Allow auth create chapters"
  ON chapters FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow creators to update their own chapters
CREATE POLICY "Allow update own chapters"
  ON chapters FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_code ON chapters(code);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at DESC);
`.trim();
