import { useEffect, useRef } from 'react';
import { showLocalNotification } from './pushNotifications';

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

let lastShownIndex = -1;

function scheduleDailyAt(hour, minute, callback) {
  function msUntilNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.getTime() - now.getTime();
  }
  let timeoutId = setTimeout(function run() {
    callback();
    timeoutId = setTimeout(run, 24 * 60 * 60 * 1000);
  }, msUntilNext());
  return () => clearTimeout(timeoutId);
}

export function useTodoReminder(todos) {
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const startedRef = useRef(false);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    // Wait until todos are actually loaded — avoid firing on empty initial state
    if (todos.length === 0 || startedRef.current) return;
    startedRef.current = true;

    function fireReminder() {
      const pending = todosRef.current.filter((t) => !t.completed);
      if (pending.length === 0) return; // skip silently — no false "all done"
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

    // First reminder after 30 min, not immediately on load
    const intervalId = setInterval(fireReminder, INTERVAL_MS);

    // 7:00 AM IST — morning reminder
    const cancelMorning = scheduleDailyAt(7, 0, () => {
      showLocalNotification(
        '🌅 Good Morning!',
        'Start your day right — add your tasks for today.',
        { tag: 'morning-reminder' }
      );
    });

    // 9:00 PM IST — night reminder
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
  }, [todos.length]); // only runs once when todos first load
}
