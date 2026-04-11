-- ─────────────────────────────────────────────
-- 1. Create push_subscriptions table
-- ─────────────────────────────────────────────
create table if not exists push_subscriptions (
  id       uuid default gen_random_uuid() primary key,
  endpoint text unique not null,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Allow the anon key to insert/delete (user's own device)
alter table push_subscriptions enable row level security;

create policy "Anyone can insert subscription"
  on push_subscriptions for insert with check (true);

create policy "Anyone can delete their subscription"
  on push_subscriptions for delete using (true);

-- Service role can read all (used by edge function)
create policy "Service role reads all"
  on push_subscriptions for select using (true);


-- ─────────────────────────────────────────────
-- 2. Enable extensions
-- ─────────────────────────────────────────────
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Set cron secret (replace with your actual secret)
alter database postgres set "app.cron_secret" = 'myfriendapp2024';

-- ─────────────────────────────────────────────
-- 3. All cron jobs (IST = UTC+5:30)
-- ─────────────────────────────────────────────

-- Every 30 minutes — random pending todo reminder
select cron.schedule(
  'todo-reminder-30min',
  '*/30 * * * *',
  $$
  select net.http_post(
    url    := 'https://quufeiwzsgiuwkeyjjns.supabase.co/functions/v1/todo-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);

-- 7:00 AM IST (01:30 UTC) — Morning reminder to add todos
select cron.schedule(
  'morning-todo-reminder',
  '30 1 * * *',
  $$
  select net.http_post(
    url    := 'https://quufeiwzsgiuwkeyjjns.supabase.co/functions/v1/todo-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body   := '{"type":"morning"}'::jsonb
  );
  $$
);

-- 9:00 PM IST (15:30 UTC) — Night reminder to update todos
select cron.schedule(
  'night-todo-reminder',
  '30 15 * * *',
  $$
  select net.http_post(
    url    := 'https://quufeiwzsgiuwkeyjjns.supabase.co/functions/v1/todo-reminder',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body   := '{"type":"night"}'::jsonb
  );
  $$
);

-- 9:00 AM IST (03:30 UTC) — Daily overdue friends reminder
select cron.schedule(
  'daily-friend-reminder',
  '30 3 * * *',
  $$
  select net.http_post(
    url    := 'https://quufeiwzsgiuwkeyjjns.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
    ),
    body   := '{}'::jsonb
  );
  $$
);

-- Verify all jobs:
-- select jobname, schedule, command from cron.job;
