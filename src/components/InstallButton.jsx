"use client"
import { useState, useEffect } from 'react'

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Prompt may have already fired before this component mounted
    if (window._deferredInstallPrompt) {
      setPrompt(window._deferredInstallPrompt)
    }

    const onInstallable = (e) => setPrompt(e.detail)
    const onInstalled = () => {
      setInstalled(true)
      setPrompt(null)
      window._deferredInstallPrompt = null
    }

    window.addEventListener('pwa:installable', onInstallable)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwa:installable', onInstallable)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed || !prompt) return null

  const handleInstall = async () => {
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  return (
    <button
      onClick={handleInstall}
      style={{
        margin: '0 32px 24px',
        padding: '12px',
        background: 'rgba(157, 79, 20, 0.1)',
        border: '1.5px dashed #9d4f14',
        borderRadius: '8px',
        color: '#9d4f14',
        fontWeight: 600,
        fontSize: '0.85rem',
        cursor: 'pointer',
        width: 'calc(100% - 64px)',
        textAlign: 'center',
      }}
    >
      📲 Install App
    </button>
  )
}
