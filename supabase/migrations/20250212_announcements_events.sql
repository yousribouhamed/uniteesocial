-- Create announcements table
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  category text default 'General',
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Create events table
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  location text,
  chapter_id uuid,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Create event_rsvp table
create table if not exists event_rsvp (
  id uuid default gen_random_uuid() primary key,
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attending boolean default true,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(event_id, user_id)
);

-- Create chapters table
create table if not exists chapters (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  member_count integer default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  type text default 'general',
  related_id uuid,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Create chats table
create table if not exists chats (
  id uuid default gen_random_uuid() primary key,
  title text,
  is_group boolean default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()),
  updated_at timestamp with time zone default timezone('utc', now())
);

-- Create chat_messages table
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Create chat_participants table
create table if not exists chat_participants (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid not null references chats(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc', now()),
  unique(chat_id, user_id)
);

-- Enable RLS
alter table announcements enable row level security;
alter table events enable row level security;
alter table event_rsvp enable row level security;
alter table chapters enable row level security;
alter table notifications enable row level security;
alter table chats enable row level security;
alter table chat_messages enable row level security;
alter table chat_participants enable row level security;

-- RLS Policies for announcements (public read, admin write)
create policy "Allow public read announcements"
  on announcements for select
  using (true);

create policy "Allow admin create announcements"
  on announcements for insert
  with check (auth.uid() is not null);

create policy "Allow admin update own announcements"
  on announcements for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- RLS Policies for events (public read, auth write)
create policy "Allow public read events"
  on events for select
  using (true);

create policy "Allow auth create events"
  on events for insert
  with check (auth.uid() is not null);

create policy "Allow update own events"
  on events for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

-- RLS Policies for event_rsvp
create policy "Allow auth read rsvp"
  on event_rsvp for select
  using (auth.uid() is not null);

create policy "Allow auth write rsvp"
  on event_rsvp for insert
  with check (auth.uid() = user_id);

create policy "Allow update own rsvp"
  on event_rsvp for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for chapters (public read, auth write)
create policy "Allow public read chapters"
  on chapters for select
  using (true);

create policy "Allow auth create chapters"
  on chapters for insert
  with check (auth.uid() is not null);

-- RLS Policies for notifications (users can only read their own)
create policy "Allow users read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Allow app insert notifications"
  on notifications for insert
  with check (true);

create policy "Allow users update own notifications"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policies for chats
create policy "Allow auth read chats"
  on chats for select
  using (auth.uid() is not null);

create policy "Allow auth create chats"
  on chats for insert
  with check (auth.uid() is not null);

-- RLS Policies for chat_messages
create policy "Allow auth read messages"
  on chat_messages for select
  using (auth.uid() is not null);

create policy "Allow auth create messages"
  on chat_messages for insert
  with check (auth.uid() = sender_id);

-- RLS Policies for chat_participants
create policy "Allow auth read participants"
  on chat_participants for select
  using (auth.uid() is not null);

create policy "Allow auth create participants"
  on chat_participants for insert
  with check (auth.uid() is not null);

-- Create indexes for better performance
create index if not exists idx_announcements_created_at on announcements(created_at desc);
create index if not exists idx_announcements_category on announcements(category);
create index if not exists idx_events_start_date on events(start_date);
create index if not exists idx_event_rsvp_event_id on event_rsvp(event_id);
create index if not exists idx_event_rsvp_user_id on event_rsvp(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(read);
create index if not exists idx_chat_messages_chat_id on chat_messages(chat_id);
create index if not exists idx_chat_messages_created_at on chat_messages(created_at);
