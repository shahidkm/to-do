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
-- 2. Enable pg_cron extension (run as superuser)
-- ─────────────────────────────────────────────
create extension if not exists pg_cron;

-- ─────────────────────────────────────────────
-- 3. Schedule daily push at 9:00 AM UTC
--    Calls the send-push edge function every day
-- ─────────────────────────────────────────────
select cron.schedule(
  'daily-friend-reminder',          -- job name
  '0 9 * * *',                      -- every day at 09:00 UTC
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

-- ─────────────────────────────────────────────
-- 4. Schedule todo reminder every 30 minutes
--    Picks a different incomplete todo each time
-- ─────────────────────────────────────────────
select cron.schedule(
  'todo-reminder-30min',            -- job name
  '*/30 * * * *',                   -- every 30 minutes
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

-- ─────────────────────────────────────────────
-- 4. To verify the cron job was created:
-- ─────────────────────────────────────────────
-- select * from cron.job;

-- ─────────────────────────────────────────────
-- 5. To change the time (e.g. 8 AM UTC):
--    select cron.unschedule('daily-friend-reminder');
--    then re-run step 3 with new time
-- ─────────────────────────────────────────────
