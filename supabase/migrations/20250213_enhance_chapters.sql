-- Add missing columns to chapters table for full portal/app sync
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS visible boolean DEFAULT true;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS is_main boolean DEFAULT false;
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS event_count integer DEFAULT 0;

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_chapters_code ON chapters(code);
