-- ============================================================================
-- FIX: Reload PostgREST schema cache so city/country/cover_image columns
-- are recognized by the anon-key Supabase client.
--
-- BACKGROUND:
-- The chapters table was originally created without city, country, cover_image,
-- and chapter_name columns. These were added later via ALTER TABLE.
-- PostgREST caches the schema at startup; columns added afterwards may be
-- silently ignored, causing INSERT/UPDATE values to be dropped (saved as NULL).
--
-- RUN THIS IN: Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Ensure the columns exist (idempotent)
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS chapter_name TEXT;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false;
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- 2. Grant the anon and authenticated roles full access to these columns
GRANT SELECT, INSERT, UPDATE ON public.chapters TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chapters TO authenticated;

-- 3. Reload the PostgREST schema cache so it picks up the new columns
NOTIFY pgrst, 'reload schema';

-- 4. Verify: list all columns on the chapters table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'chapters'
ORDER BY ordinal_position;
