"use client"
import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'

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
    <button className="btn-install flex items-center justify-center gap-1" onClick={handleInstall}>
      <Smartphone size={16} /> Install App
    </button>
  )
}
