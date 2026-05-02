import { useEffect, useRef } from 'react';

const REMINDER_HOUR = 21;
const TASK_COUNT = 7;

function msUntilHour(hour) {
  const now = new Date();
  const target = new Date();
  target.setHours(hour, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}

function fireNotification(progress) {
  if (Notification.permission !== 'granted') return;
  const done = Math.round((progress / 100) * TASK_COUNT);
  const remaining = TASK_COUNT - done;
  new Notification('🔥 75 HARD — Günü Kurtarma Zamanı!', {
    body: remaining > 0
      ? `${remaining} görevin eksik. Gün bitmeden tamamla!`
      : 'Tüm görevleri tamamladın! Harika iş. 💪',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: '75hard-daily',
  });
}

export function useNotifications(progress) {
  const timerRef = useRef(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  };

  const sendTestNotification = () => {
    if (Notification.permission !== 'granted') return;
    new Notification('🔥 75 HARD — Test Bildirimi', {
      body: 'Bildirimler aktif! Her gün saat 21:00\'de hatırlatma gelecek.',
      icon: '/logo.svg',
      tag: '75hard-test',
    });
  };

  useEffect(() => {
    if (Notification.permission !== 'granted') return;
    if (timerRef.current) clearTimeout(timerRef.current);

    const schedule = () => {
      const delay = msUntilHour(REMINDER_HOUR);
      timerRef.current = setTimeout(() => {
        if (progressRef.current < 100) fireNotification(progressRef.current);
        schedule();
      }, delay);
    };

    schedule();
    return () => clearTimeout(timerRef.current);
  }, []);

  return {
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    requestPermission,
    sendTestNotification,
  };
}
