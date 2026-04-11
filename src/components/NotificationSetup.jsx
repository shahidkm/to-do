import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { enablePushNotifications, disablePushNotifications, isPushEnabled, registerSW } from '../utils/pushNotifications';

export default function NotificationSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

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
      setDebugInfo(null);
    } else {
      const result = await enablePushNotifications();
      if (result.ok) {
        setEnabled(true);
        fireDirectNotification('✅ Enabled!', 'Notifications are working!');
      } else if (result.reason === 'denied') {
        alert('Notification permission denied. Enable it in browser/phone settings.');
      } else {
        alert('Failed. Check console (F12) for error details.');
      }
    }
    setLoading(false);
  }

  // Bypass service worker — use Notification API directly first to confirm browser allows it
  async function fireDirectNotification(title, body) {
    try {
      // Try direct Notification first (works when page is open)
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
        setDebugInfo('✅ Direct notification fired');
        return;
      }
    } catch (e) {
      // Some browsers block direct Notification, fall through to SW
    }
    // Fallback to service worker
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body });
      setDebugInfo('✅ SW notification fired');
    } catch (e) {
      setDebugInfo('❌ Error: ' + e.message);
      console.error('Notification error:', e);
    }
  }

  async function runDebug() {
    const lines = [];
    lines.push('Permission: ' + Notification.permission);
    lines.push('SW supported: ' + ('serviceWorker' in navigator));
    lines.push('Push supported: ' + ('PushManager' in window));

    const regs = await navigator.serviceWorker.getRegistrations();
    lines.push('SW registrations: ' + regs.length);
    if (regs.length > 0) lines.push('SW scope: ' + regs[0].scope);

    setDebugInfo(lines.join(' | '));

    // Try firing notification right now
    if (Notification.permission === 'granted') {
      try {
        new Notification('🔔 Debug Test', { body: 'If you see this, notifications work!' });
        setDebugInfo(prev => prev + ' | ✅ Notification sent!');
      } catch (e) {
        // try SW
        try {
          const reg = await navigator.serviceWorker.ready;
          await reg.showNotification('🔔 Debug Test', { body: 'SW notification test' });
          setDebugInfo(prev => prev + ' | ✅ SW notification sent!');
        } catch (e2) {
          setDebugInfo(prev => prev + ' | ❌ ' + e2.message);
        }
      }
    } else {
      // Request permission now
      const p = await Notification.requestPermission();
      setDebugInfo(prev => prev + ' | Permission result: ' + p);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

        {/* Debug button — always visible */}
        <button
          onClick={runDebug}
          title="Debug notifications"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 10px', height: 28, borderRadius: 8, cursor: 'pointer',
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.3)',
            color: '#fbbf24', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.05em', whiteSpace: 'nowrap',
          }}
        >
          TEST
        </button>

        {/* Bell toggle */}
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
      </div>

      {/* Debug output */}
      {debugInfo && (
        <div style={{
          maxWidth: 320, fontSize: 10, color: '#94a3b8',
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '6px 10px', lineHeight: 1.6,
          wordBreak: 'break-all',
        }}>
          {debugInfo}
        </div>
      )}
    </div>
  );
}
