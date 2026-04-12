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
  let id = setTimeout(function run() {
    callback();
    id = setTimeout(run, 24 * 60 * 60 * 1000);
  }, msUntilNext());
  return () => clearTimeout(id);
}

export function useTodoReminder(todos) {
  const todosRef = useRef(todos);
  todosRef.current = todos;
  const startedRef = useRef(false);

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (todos.length === 0 || startedRef.current) return;
    startedRef.current = true;

    function fireReminder() {
      const pending = todosRef.current.filter((t) => !t.completed);
      if (pending.length === 0) return;
      lastShownIndex = (lastShownIndex + 1) % pending.length;
      showLocalNotification(
        `⚡ ${pending.length} task${pending.length > 1 ? 's' : ''} pending`,
        pending[lastShownIndex].title
      );
    }

    const intervalId = setInterval(fireReminder, INTERVAL_MS);

    const cancelMorning = scheduleDailyAt(7, 0, () =>
      showLocalNotification('🌅 Good Morning!', 'Add your tasks for today.')
    );

    const cancelNight = scheduleDailyAt(21, 0, () => {
      const pending = todosRef.current.filter((t) => !t.completed);
      const done = todosRef.current.filter((t) => t.completed).length;
      showLocalNotification(
        '🌙 Evening Check-in',
        pending.length > 0
          ? `${done} done, ${pending.length} pending. Update your tasks!`
          : '🎉 All tasks completed today!'
      );
    });

    return () => {
      clearInterval(intervalId);
      cancelMorning();
      cancelNight();
    };
  }, [todos.length]);
}
