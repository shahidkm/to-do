import { useEffect, useRef } from 'react';
import { showLocalNotification } from './pushNotifications';

const INTERVAL_MS = 1 * 60 * 1000; // 5 minutes

let lastShownIndex = -1;

export function useTodoReminder(todos) {
  const todosRef = useRef(todos);
  todosRef.current = todos;

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    function fireReminder() {
      const pending = todosRef.current.filter((t) => !t.completed);
      if (pending.length === 0) return;
      lastShownIndex = (lastShownIndex + 1) % pending.length;
      const todo = pending[lastShownIndex];
      showLocalNotification('📝 Pending Task Reminder', `Don't forget: ${todo.title}`);
    }

    // Fire immediately on load, then every 30 minutes
    fireReminder();
    const id = setInterval(fireReminder, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
