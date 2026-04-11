import { useEffect, useRef } from 'react';
import { showLocalNotification } from './pushNotifications';

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

let lastShownIndex = -1;

// Schedule a daily notification at a specific hour & minute
function scheduleDailyAt(hour, minute, callback) {
  function msUntilNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1); // already passed today, schedule tomorrow
    return next.getTime() - now.getTime();
  }

  let timeoutId;
  function schedule() {
    timeoutId = setTimeout(() => {
      callback();
      // Re-schedule for next day
      timeoutId = setInterval(callback, 24 * 60 * 60 * 1000);
    }, msUntilNext());
  }

  schedule();
  return () => clearTimeout(timeoutId);
}

export function useTodoReminder(todos) {
  const todosRef = useRef(todos);
  todosRef.current = todos;

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // ── 30-min task reminder ──────────────────────────────
    function fireReminder() {
      const pending = todosRef.current.filter((t) => !t.completed);
      if (pending.length === 0) {
        showLocalNotification(
          '🎉 All Done!',
          'You completed all your tasks for today. Great work!',
          { tag: 'all-done' }
        );
        return;
      }
      lastShownIndex = (lastShownIndex + 1) % pending.length;
      const todo = pending[lastShownIndex];
      showLocalNotification(
        `⚡ Task Reminder  •  ${pending.length} pending`,
        todo.title,
        {
          tag: 'todo-reminder',
          actions: [
            { action: 'open', title: '✅ Mark Done' },
            { action: 'dismiss', title: '⏰ Remind Later' },
          ],
        }
      );
    }

    fireReminder();
    const intervalId = setInterval(fireReminder, INTERVAL_MS);

    // ── 7:00 AM — Morning reminder to add todos ───────────
    const cancelMorning = scheduleDailyAt(7, 0, () => {
      showLocalNotification(
        '🌅 Good Morning!',
        'Start your day right — add your tasks for today.',
        { tag: 'morning-reminder' }
      );
    });

    // ── 9:00 PM — Night reminder to update todos ─────────
    const cancelNight = scheduleDailyAt(21, 0, () => {
      const pending = todosRef.current.filter((t) => !t.completed);
      const done = todosRef.current.filter((t) => t.completed).length;
      showLocalNotification(
        '🌙 Evening Check-in',
        pending.length > 0
          ? `${done} done, ${pending.length} still pending. Update your tasks!`
          : '🎉 All tasks completed today. Amazing work!',
        { tag: 'night-reminder' }
      );
    });

    return () => {
      clearInterval(intervalId);
      cancelMorning();
      cancelNight();
    };
  }, []);
}
