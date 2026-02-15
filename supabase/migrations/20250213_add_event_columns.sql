-- Add missing columns to events table for match support

-- Add event category column (general or match)
alter table events add column if not exists event_category text default 'general';

-- Add cover image column
alter table events add column if not exists cover_image text;

-- Add match details JSON column for storing match-specific data
alter table events add column if not exists match_details jsonb;

-- Add signups counter
alter table events add column if not exists signups integer default 0;

-- Add max signups (capacity)
alter table events add column if not exists max_signups integer default 300;

-- Add chapter name as text (for simpler queries)
alter table events add column if not exists chapter text;

-- Add event type (Onsite, Online, Hybrid)
alter table events add column if not exists type text default 'Onsite';

-- Add event_date as date for simpler filtering (derived from start_date)
alter table events add column if not exists event_date date;

-- Create function to auto-update event_date from start_date
create or replace function update_event_date()
returns trigger as $$
begin
  new.event_date := new.start_date::date;
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update event_date
drop trigger if exists set_event_date on events;
create trigger set_event_date
  before insert or update on events
  for each row
  execute function update_event_date();

-- Update existing events to have event_date
update events set event_date = start_date::date where event_date is null;

-- Create index for event category
create index if not exists idx_events_event_category on events(event_category);

-- Create index for event date
create index if not exists idx_events_event_date on events(event_date);
