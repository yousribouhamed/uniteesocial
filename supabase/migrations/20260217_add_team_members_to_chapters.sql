ALTER TABLE public.chapters
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;

UPDATE public.chapters
SET team_members = '[]'::jsonb
WHERE team_members IS NULL;
