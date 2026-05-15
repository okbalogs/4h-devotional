"use client"
import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const currentPage = usePathname()
  const { user } = useAuth()
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    if (window._deferredInstallPrompt) setInstallPrompt(window._deferredInstallPrompt)
    const onInstallable = (e) => setInstallPrompt(e.detail)
    const onInstalled = () => setInstallPrompt(null)
    window.addEventListener('pwa:installable', onInstallable)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('pwa:installable', onInstallable)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstallPrompt(null)
      window._deferredInstallPrompt = null
    }
  }

  const navLinks = [
    { href: "/", label: "Sanctuary" },
    { href: "/explore", label: "Explore" },
    { href: "/fellowship", label: "Fellowship" },
    { href: "/courses", label: "Courses" },
  ]

  return (
    <nav className='flex flex-row items-center justify-between py-5'>
      <Link href="/" className="font-serif text-lg font-bold text-(--clr-dark)">
        Editorial Devotion
      </Link>
      <div className='hidden sm:flex flex-row items-center gap-6 text-sm'>
        {navLinks.map((link, index) => (
          <Link
            href={link.href}
            key={index}
            className={
              currentPage === link.href
                ? 'font-semibold text-(--clr-primary) border-b-2 border-(--clr-primary) pb-0.5'
                : 'text-(--clr-text-muted) hover:text-(--clr-primary) transition-colors'
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ThemeToggle />
        {installPrompt && (
          <button
            onClick={handleInstall}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1.5px dashed #9d4f14',
              background: 'rgba(157,79,20,0.06)', color: '#9d4f14',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            📲 Install
          </button>
        )}
        {user ? (
          <Link href="/today" className='btn-primary py-2.5! px-6! text-sm'>
            Go to App
          </Link>
        ) : (
          <Link href="/signup" className='btn-primary py-2.5! px-6! text-sm'>
            Start Selah
          </Link>
        )}
      </div>
    </nav>
  )
}
