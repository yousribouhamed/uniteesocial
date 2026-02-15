-- ============================================================================
-- CREATE: chapters table for managing community chapters
-- RUN THIS IN: Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  city TEXT DEFAULT '',
  country TEXT DEFAULT '',
  team INTEGER DEFAULT 0,
  events TEXT DEFAULT '0 Events',
  visible BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'Active',
  cover_image TEXT DEFAULT '',
  venue_name TEXT DEFAULT '',
  full_address TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 999,
  notifications JSONB DEFAULT '{"enableNotifications": false, "autoNotifyNewEvents": true, "autoNotifyNewUpdates": false, "autoNotifyAnnouncements": true}'::jsonb,
  updated_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_code ON public.chapters (code);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON public.chapters (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON public.chapters (sort_order ASC);

-- Enable RLS
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access (for mobile app and admin portal)
CREATE POLICY "Allow public read chapters"
  ON public.chapters
  FOR SELECT
  USING (true);

-- Allow authenticated users to create chapters
CREATE POLICY "Allow auth create chapters"
  ON public.chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update chapters
CREATE POLICY "Allow auth update chapters"
  ON public.chapters
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete chapters
CREATE POLICY "Allow auth delete chapters"
  ON public.chapters
  FOR DELETE
  TO authenticated
  USING (true);

-- Verify creation
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chapters'
ORDER BY ordinal_position;
