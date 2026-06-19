"use client"
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'
import { getPendingEntries, removePendingEntry } from '@/utils/offlineStorage'
import { RefreshCcw, CheckCircle2, AlertTriangle, X } from 'lucide-react'

export default function OfflineSync() {
  const { user } = useAuth()
  const [status, setStatus] = useState('idle') // idle | syncing | done | error
  const [syncCount, setSyncCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const sync = async () => {
      if (!navigator.onLine) return
      const pending = getPendingEntries()
      if (pending.length === 0) return

      setStatus('syncing')
      setSyncCount(pending.length)
      let failCount = 0

      for (const entry of pending) {
        const { _offlineId, ...payload } = entry
        try {
          const { error } = await supabase.from('entries').insert(payload)
          if (!error) {
            removePendingEntry(_offlineId)
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      // Clear stale history caches so next visit fetches fresh data
      if (failCount < pending.length) {
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith('cached_history'))
            .forEach((k) => localStorage.removeItem(k))
        } catch {}
      }

      if (failCount === 0) {
        setStatus('done')
        setTimeout(() => setStatus('idle'), 3500)
      } else {
        setStatus('error')
      }
    }

    // Try immediately on mount (handles app opening while back online)
    sync()
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [user])

  if (status === 'idle') return null

  const label =
    status === 'syncing' ? <span className="flex items-center gap-1"><RefreshCcw size={14} className="animate-spin" /> Syncing {syncCount} offline {syncCount === 1 ? 'entry' : 'entries'}…</span> :
    status === 'done'    ? <span className="flex items-center gap-1"><CheckCircle2 size={14} /> {syncCount} {syncCount === 1 ? 'entry' : 'entries'} synced to your account</span> :
                           <span className="flex items-center gap-1"><AlertTriangle size={14} /> Some entries failed to sync — will retry when online.</span>

  return (
    <div className={`sync-toast sync-toast--${status}`}>
      <span>{label}</span>
      {(status === 'done' || status === 'error') && (
        <button className="sync-toast-close flex items-center justify-center" onClick={() => setStatus('idle')} aria-label="Dismiss"><X size={14} /></button>
      )}
    </div>
  )
}
