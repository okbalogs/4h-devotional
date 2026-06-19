"use client"
import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'

export default function InstallPopup() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('pwa-dismissed')) return

    const show = (p) => {
      setPrompt(p)
      setTimeout(() => setVisible(true), 2800)
    }

    if (window._deferredInstallPrompt) show(window._deferredInstallPrompt)

    const onInstallable = (e) => show(e.detail)
    const onInstalled = () => { setDone(true); setVisible(false) }

    window.addEventListener('pwa:installable', onInstallable)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwa:installable', onInstallable)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setDone(true)
      window._deferredInstallPrompt = null
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  if (done || !prompt) return null

  return (
    <div className={`pwa-popup ${visible ? 'pwa-popup--visible' : ''}`} role="dialog" aria-label="Install app">
      <div className="pwa-popup-glyph">✦</div>

      <div className="pwa-popup-body">
        <p className="pwa-popup-eyebrow">Your pocket sanctuary awaits</p>
        <strong className="pwa-popup-title">Install 4H on your device</strong>
        <p className="pwa-popup-sub">
          Offline devotions, zero Wi-Fi. God is always in range.
        </p>
      </div>

      <div className="pwa-popup-actions">
        <button className="pwa-popup-btn-install flex items-center justify-center gap-1" onClick={handleInstall}>
          Install Now <Smartphone size={16} />
        </button>
        <button className="pwa-popup-btn-dismiss" onClick={handleDismiss}>
          Maybe later
        </button>
      </div>
    </div>
  )
}
