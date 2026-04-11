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

const MEET_GOAL_DAYS: Record<string, number> = {
  weekly: 7,
  monthly: 30,
  quarterly: 90,
};

Deno.serve(async (req) => {
  // Allow manual trigger via POST with optional auth check
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 1. Fetch all friends
  const { data: friends, error: friendsError } = await supabase
    .from('friends')
    .select('id, name, last_contacted, meet_goal');

  if (friendsError) {
    return new Response(JSON.stringify({ error: friendsError.message }), { status: 500 });
  }

  // 2. Filter overdue friends
  const today = Date.now();
  const overdue = (friends ?? []).filter((f) => {
    if (!f.last_contacted) return true; // never contacted = always overdue
    const days = Math.floor((today - new Date(f.last_contacted).getTime()) / 86400000);
    const goal = MEET_GOAL_DAYS[f.meet_goal ?? 'monthly'] ?? 30;
    return days > goal;
  });

  if (overdue.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No overdue friends' }));
  }

  // 3. Also pick a random pending todo for today
  const todayStr = new Date().toISOString().split('T')[0];
  const { data: pendingTodos } = await supabase
    .from('ToDo')
    .select('title')
    .eq('completed', false)
    .eq('active', true)
    .gte('created_at', `${todayStr}T00:00:00`)
    .lte('created_at', `${todayStr}T23:59:59`);

  const randomTodo = pendingTodos && pendingTodos.length > 0
    ? pendingTodos[Math.floor(Math.random() * pendingTodos.length)].title
    : null;

  // 4. Build notification message
  const names = overdue.slice(0, 3).map((f) => f.name).join(', ');
  const extra = overdue.length > 3 ? ` +${overdue.length - 3} more` : '';
  const friendBody = `You haven't contacted: ${names}${extra}`;
  const todoLine = randomTodo ? `\n📝 Also pending: ${randomTodo}` : '';

  const payload = JSON.stringify({
    title: `👥 ${overdue.length} friend${overdue.length > 1 ? 's' : ''} need your attention`,
    body: friendBody + todoLine,
    url: '/freinds',
    tag: 'overdue-friends',
  });

  // 4. Fetch all push subscriptions
  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, subscription');

  if (subsError) {
    return new Response(JSON.stringify({ error: subsError.message }), { status: 500 });
  }

  // 5. Send push to each subscription
  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    (subs ?? []).map(async (row) => {
      try {
        await webpush.sendNotification(JSON.parse(row.subscription), payload);
        sent++;
      } catch (err: any) {
        // 410 Gone = subscription expired, remove it
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleIds.push(row.id);
        }
        console.error('Push failed for', row.endpoint, err.statusCode);
      }
    })
  );

  // 6. Clean up stale subscriptions
  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds);
  }

  return new Response(
    JSON.stringify({ sent, overdue: overdue.length, cleaned: staleIds.length }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
