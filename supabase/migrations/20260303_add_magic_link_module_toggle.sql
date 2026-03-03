-- Add tenant-level magic link login toggle to business profile modules

ALTER TABLE public.business_profiles
ALTER COLUMN modules SET DEFAULT '{
  "events": false,
  "tickets": false,
  "calendarView": false,
  "chat": false,
  "magicLinkLogin": false,
  "exploreMembers": true,
  "exploreCompany": true
}'::jsonb;

UPDATE public.business_profiles
SET modules = COALESCE(modules, '{}'::jsonb) || '{"magicLinkLogin": false}'::jsonb
WHERE NOT (COALESCE(modules, '{}'::jsonb) ? 'magicLinkLogin');
