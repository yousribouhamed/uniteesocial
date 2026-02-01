-- Create table for business profile
create table if not exists business_profiles (
  id uuid default gen_random_uuid() primary key,
  business_name text,
  poc_email text,
  poc_name text,
  timezone text,
  domain text,
  
  -- Branding
  colors jsonb default '{}',
  logos jsonb default '{}', -- For storing logo URLs
  
  -- Modules
  modules jsonb default '{
    "events": false,
    "tickets": false,
    "calendarView": false,
    "chat": false,
    "exploreMembers": true,
    "exploreCompany": true
  }',
  
  -- Social Links
  social_links jsonb default '{
    "linkedin": "",
    "xTwitter": "",
    "instagram": "",
    "tiktok": ""
  }',
  
  -- Legal
  terms_url text,
  privacy_url text,
  
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Policy to allow authenticated users to read/update (adjust as needed for roles)
alter table business_profiles enable row level security;

create policy "Allow generic read access"
  on business_profiles for select
  using (true);

create policy "Allow generic update access"
  on business_profiles for update
  using (true);
  
-- Insert a default row if not exists
insert into business_profiles (business_name, poc_email, poc_name)
select 'Eventy', 'eventy@gmail.com', 'Eventygo'
where not exists (select 1 from business_profiles);
