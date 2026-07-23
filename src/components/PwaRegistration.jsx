"use client"
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { hasPendingEntries } from '@/utils/offlineStorage'

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

  // Sync handled by OfflineSync component

  return null
}
