"use client"
import { useState, useEffect } from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: "/", label: "Sanctuary" },
  { href: "/explore", label: "Explore" },
  { href: "/fellowship", label: "Fellowship" },
  { href: "/courses", label: "Courses" },
]

export default function Navbar() {
  const currentPage = usePathname()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [currentPage])

  const ctaHref = user ? "/today" : "/signup"
  const ctaLabel = user ? "Go to App" : "Start Selah"

  return (
    <header className={`site-nav-header ${scrolled ? 'site-nav-header--scrolled' : ''}`}>
      <nav className="site-nav">

        {/* Logo */}
        <Link href="/" className="site-nav-logo">
          <span className="site-nav-logo-mark">✦</span>
          Editorial Devotion
        </Link>

        {/* Desktop links */}
        <div className="site-nav-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`site-nav-link ${currentPage === href ? 'site-nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="site-nav-actions">
          <ThemeToggle />
          <Link href={ctaHref} className="site-nav-cta">
            {ctaLabel}
          </Link>
          {/* Mobile burger */}
          <button
            className={`site-nav-burger ${menuOpen ? 'site-nav-burger--open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`site-nav-drawer ${menuOpen ? 'site-nav-drawer--open' : ''}`}>
        <div className="site-nav-drawer-links">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`site-nav-drawer-link ${currentPage === href ? 'site-nav-drawer-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link href={ctaHref} className="site-nav-drawer-cta btn-primary" onClick={() => setMenuOpen(false)}>
          {ctaLabel}
        </Link>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="site-nav-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  )
}
