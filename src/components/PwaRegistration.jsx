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

  // Sync pending offline entries when user is logged in and online
  useEffect(() => {
    if (!user) return

    const syncPending = async () => {
      if (!navigator.onLine || !hasPendingEntries()) return
      const pending = getPendingEntries()
      for (const entry of pending) {
        const { _offlineId, ...entryData } = entry
        const { error } = await supabase.from('entries').insert(entryData)
        if (!error) removePendingEntry(_offlineId)
      }
    }

    syncPending()
    window.addEventListener('online', syncPending)
    return () => window.removeEventListener('online', syncPending)
  }, [user])

  return null
}
