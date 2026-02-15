-- ============================================================================
-- Creates a Postgres function that reloads the PostgREST schema cache.
-- This is needed so that columns added via ALTER TABLE (city, country,
-- cover_image, etc.) are recognized by the Supabase JS client.
--
-- RUN THIS IN: Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.reload_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NOTIFY pgrst, 'reload schema';
END;
$$;

-- Grant execute to service_role so the admin client can call it
GRANT EXECUTE ON FUNCTION public.reload_schema_cache() TO service_role;
