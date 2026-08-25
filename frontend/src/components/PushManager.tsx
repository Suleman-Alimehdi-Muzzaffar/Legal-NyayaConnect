import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { subscribePush } from '@/lib/pushClient';

export default function PushManager() {
  const { token } = useAuth();
  useEffect(() => {
    if (!token) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'denied') return;
    const doSub = async () => {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }
      await subscribePush(token);
    };
    // wait for SW ready (vite-plugin-pwa registers auto)
    const t = setTimeout(doSub, 1500);
    return () => clearTimeout(t);
  }, [token]);
  return null;
}
