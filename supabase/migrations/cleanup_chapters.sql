-- ============================================================================
-- CLEANUP: Remove all chapters-related database objects
-- RUN THIS IN: Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- Drop the reload_schema_cache function if it exists
DROP FUNCTION IF EXISTS public.reload_schema_cache();

-- Drop all policies on chapters table
DROP POLICY IF EXISTS "Allow public read chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow auth create chapters" ON public.chapters;
DROP POLICY IF EXISTS "Allow update own chapters" ON public.chapters;

-- Drop all indexes on chapters table
DROP INDEX IF EXISTS public.idx_chapters_code;
DROP INDEX IF EXISTS public.idx_chapters_created_at;

-- Drop the chapters table (CASCADE will remove any foreign key constraints)
DROP TABLE IF EXISTS public.chapters CASCADE;

-- Verify cleanup
SELECT 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE '%chapter%';
