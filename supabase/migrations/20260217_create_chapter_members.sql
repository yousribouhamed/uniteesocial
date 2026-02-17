CREATE TABLE IF NOT EXISTS public.chapter_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  member_ref TEXT DEFAULT '',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  avatar_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapter_members_chapter_id
  ON public.chapter_members (chapter_id);

CREATE INDEX IF NOT EXISTS idx_chapter_members_sort
  ON public.chapter_members (chapter_id, sort_order, created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_members_unique_ref
  ON public.chapter_members (chapter_id, member_ref)
  WHERE member_ref <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_members_unique_email
  ON public.chapter_members (chapter_id, email);

ALTER TABLE public.chapter_members ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_members'
      AND policyname = 'Allow public read chapter members'
  ) THEN
    CREATE POLICY "Allow public read chapter members"
      ON public.chapter_members
      FOR SELECT
      USING (true);
  END IF;
END
$$;

INSERT INTO public.chapter_members (
  chapter_id,
  member_ref,
  name,
  email,
  role,
  avatar_url,
  sort_order
)
SELECT
  c.id AS chapter_id,
  COALESCE(team_member.member ->> 'id', '') AS member_ref,
  team_member.member ->> 'name' AS name,
  team_member.member ->> 'email' AS email,
  COALESCE(NULLIF(team_member.member ->> 'role', ''), 'Member') AS role,
  COALESCE(team_member.member ->> 'avatarUrl', '') AS avatar_url,
  (team_member.ord - 1)::INTEGER AS sort_order
FROM public.chapters c
CROSS JOIN LATERAL jsonb_array_elements(
  CASE
    WHEN jsonb_typeof(c.notifications -> 'team_members') = 'array'
      THEN c.notifications -> 'team_members'
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS team_member(member, ord)
WHERE
  COALESCE(NULLIF(team_member.member ->> 'name', ''), '') <> ''
  AND COALESCE(NULLIF(team_member.member ->> 'email', ''), '') <> ''
ON CONFLICT (chapter_id, email) DO UPDATE
SET
  member_ref = EXCLUDED.member_ref,
  role = EXCLUDED.role,
  avatar_url = EXCLUDED.avatar_url,
  sort_order = EXCLUDED.sort_order;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_members'
      AND policyname = 'Allow auth create chapter members'
  ) THEN
    CREATE POLICY "Allow auth create chapter members"
      ON public.chapter_members
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_members'
      AND policyname = 'Allow auth update chapter members'
  ) THEN
    CREATE POLICY "Allow auth update chapter members"
      ON public.chapter_members
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'chapter_members'
      AND policyname = 'Allow auth delete chapter members'
  ) THEN
    CREATE POLICY "Allow auth delete chapter members"
      ON public.chapter_members
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END
$$;
