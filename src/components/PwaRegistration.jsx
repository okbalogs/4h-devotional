"use client"
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getPendingEntries, removePendingEntry, hasPendingEntries } from '@/utils/offlineStorage'
import { supabase } from '@/utils/supabase'

export default function PwaRegistration() {
  const { user } = useAuth()

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  // Capture the install prompt and store it globally so InstallButton can
  // access it whenever it mounts — beforeinstallprompt fires once, early.
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      window._deferredInstallPrompt = e
      window.dispatchEvent(new CustomEvent('pwa:installable', { detail: e }))
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Sync pending offline entries when back online
  useEffect(() => {
    if (!user) return

    const syncPending = async () => {
      if (!navigator.onLine || !hasPendingEntries()) return
      for (const entry of getPendingEntries()) {
        const { _offlineId, ...data } = entry
        const { error } = await supabase.from('entries').insert(data)
        if (!error) removePendingEntry(_offlineId)
      }
    }

    syncPending()
    window.addEventListener('online', syncPending)
    return () => window.removeEventListener('online', syncPending)
  }, [user])

  return null
}
