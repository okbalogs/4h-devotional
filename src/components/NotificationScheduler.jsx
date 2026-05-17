"use client"
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

// Reads notification preferences from localStorage (works fully offline).
// On every mount it checks whether today's notification should fire and
// either shows it immediately (if the time has passed) or schedules a
// setTimeout for later in the day.
// Preference keys: notif_enabled ('true'/'false'), notif_time ('HH:MM'),
// notif_last_date ('YYYY-MM-DD' of the last shown notification).
export default function NotificationScheduler() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const enabled = localStorage.getItem('notif_enabled') === 'true'
    if (!enabled) return

    const timeStr = localStorage.getItem('notif_time') || '06:00'
    const [h, m] = timeStr.split(':').map(Number)
    const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

    // Already fired today — nothing to do
    if (localStorage.getItem('notif_last_date') === todayStr) return

    const scheduled = new Date()
    scheduled.setHours(h, m, 0, 0)
    const msUntil = scheduled.getTime() - Date.now()

    const fire = () => {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification('Time for your Selah ✦', {
            body: 'Your daily 4H devotion awaits. Draw near to God.',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'daily-selah',
            renotify: false,
            data: { url: '/today' },
          })
          localStorage.setItem('notif_last_date', todayStr)
        })
        .catch(() => {})
    }

    if (msUntil <= 0) {
      // Scheduled time has already passed today — fire immediately
      fire()
      return
    }

    const timer = setTimeout(fire, msUntil)
    return () => clearTimeout(timer)
  }, [user])

  return null
}
