import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { enablePushNotifications, disablePushNotifications, isPushEnabled, registerSW, showLocalNotification } from '../utils/pushNotifications';

export default function NotificationSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setSupported(false);
      return;
    }
    registerSW();
    isPushEnabled().then(setEnabled);
  }, []);

  if (!supported) return null;

  async function toggle() {
    setLoading(true);
    if (enabled) {
      await disablePushNotifications();
      setEnabled(false);
    } else {
      const result = await enablePushNotifications();
      if (result.ok) {
        setEnabled(true);
        setTimeout(() => showLocalNotification('✅ Notifications Enabled!', 'You will get task reminders every 30 minutes.'), 500);
      } else if (result.reason === 'denied') {
        alert('Notification permission denied. Enable it in browser/phone settings.');
      } else {
        alert('Failed to enable notifications.');
      }
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={enabled ? 'Disable notifications' : 'Enable notifications'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
        background: enabled ? 'rgba(217,70,239,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${enabled ? 'rgba(217,70,239,0.4)' : 'rgba(255,255,255,0.1)'}`,
        color: enabled ? '#d946ef' : '#64748b',
        transition: 'all 0.2s', flexShrink: 0,
        boxShadow: enabled ? '0 0 10px rgba(217,70,239,0.2)' : 'none',
      }}
    >
      {loading ? (
        <div style={{ width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      ) : enabled ? (
        <Bell size={15} />
      ) : (
        <BellOff size={15} />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
