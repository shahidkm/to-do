import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

webpush.setVapidDetails(
  'mailto:admin@shahidkm.app',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

// Rotates through todos so each call picks a different one
// Stored in memory — resets on cold start (that's fine, adds variety)
let lastIndex = -1;

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const type = body.type || 'reminder';

  // Morning notification
  if (type === 'morning') {
    const payload = JSON.stringify({
      title: '\uD83C\uDF05 Good Morning!',
      body: 'Start your day right \u2014 add your tasks for today.',
      tag: 'morning-reminder',
    });
    const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, subscription');
    let sent = 0;
    await Promise.all((subs ?? []).map(async (row) => {
      try { await webpush.sendNotification(JSON.parse(row.subscription), payload); sent++; } catch {}
    }));
    return new Response(JSON.stringify({ sent, type: 'morning' }));
  }

  // Night notification
  if (type === 'night') {
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: todos } = await supabase.from('ToDo').select('completed').eq('active', true)
      .gte('created_at', `${todayStr}T00:00:00`).lte('created_at', `${todayStr}T23:59:59`);
    const done = (todos ?? []).filter((t) => t.completed).length;
    const pending = (todos ?? []).filter((t) => !t.completed).length;
    const payload = JSON.stringify({
      title: '\uD83C\uDF19 Evening Check-in',
      body: pending > 0 ? `${done} done, ${pending} still pending. Update your tasks!` : '\uD83C\uDF89 All tasks completed today. Amazing work!',
      tag: 'night-reminder',
    });
    const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, subscription');
    let sent = 0;
    await Promise.all((subs ?? []).map(async (row) => {
      try { await webpush.sendNotification(JSON.parse(row.subscription), payload); sent++; } catch {}
    }));
    return new Response(JSON.stringify({ sent, type: 'night' }));
  }

  // 1. Get today's incomplete todos
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: todos, error } = await supabase
    .from('ToDo')
    .select('id, title')
    .eq('completed', false)
    .eq('active', true)
    .gte('created_at', `${todayStr}T00:00:00`)
    .lte('created_at', `${todayStr}T23:59:59`);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  if (!todos || todos.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No pending todos' }));
  }

  // 2. Pick next todo in rotation (different each call)
  lastIndex = (lastIndex + 1) % todos.length;
  const todo = todos[lastIndex];

  const payload = JSON.stringify({
    title: `⚡ Task Reminder  •  ${todos.length} pending`,
    body: todo.title,
    url: '/',
    tag: 'todo-reminder',
    actions: [
      { action: 'open', title: '✅ Mark Done' },
      { action: 'dismiss', title: '⏰ Remind Later' },
    ],
  });

  // 3. Fetch all push subscriptions
  const { data: subs } = await supabase.from('push_subscriptions').select('id, endpoint, subscription');
  if (!subs || subs.length === 0) return new Response(JSON.stringify({ sent: 0, message: 'No subscribers' }));

  // 4. Send push to all
  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    subs.map(async (row) => {
      try {
        await webpush.sendNotification(JSON.parse(row.subscription), payload);
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) staleIds.push(row.id);
      }
    })
  );

  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  return new Response(
    JSON.stringify({ sent, todo: todo.title, cleaned: staleIds.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
