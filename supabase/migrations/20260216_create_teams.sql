-- ============================================================================
-- CREATE: teams table for match event team management
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  stadium_name TEXT DEFAULT '',
  stadium_name_ar TEXT DEFAULT '',
  manager_name TEXT DEFAULT '',
  manager_name_ar TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_league ON public.teams (league);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_unique_league_name ON public.teams (league, name_en);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read teams"
  ON public.teams
  FOR SELECT
  USING (true);

CREATE POLICY "Allow auth create teams"
  ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow auth update teams"
  ON public.teams
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow auth delete teams"
  ON public.teams
  FOR DELETE
  TO authenticated
  USING (true);
