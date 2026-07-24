"use client"
import { useState, useEffect } from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from './ThemeToggle'

const PRIMARY = '#5C3D2E'

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
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [currentPage])

  const ctaHref = user ? "/today" : "/signin"
  const ctaLabel = user ? "Go to App" : "Start Selah"

  return (
    <header className="floating-navbar">
      <nav style={{
        padding: '0 1.25rem',
        height: scrolled ? '3.75rem' : '4.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        transition: 'height 0.3s ease',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.025em', textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
          <span>4H Devotional</span>
        </Link>

        {/* Desktop links */}
        <div
          className="nav-desktop-links"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.2rem', flex: 1, justifyContent: 'center',
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = currentPage === href
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '9999px', fontSize: '0.85rem',
                  fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <ThemeToggle />
          <Link
            href={ctaHref}
            className="nav-desktop-cta"
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '9999px',
              background: PRIMARY, color: '#fff', fontWeight: 600,
              fontSize: '0.85rem', textDecoration: 'none',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 14px rgba(92,61,46,0.25)',
            }}
          >
            {ctaLabel}
          </Link>

          {/* Burger */}
          <button
            className="nav-burger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              gap: '5px', width: '38px', height: '38px', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '10px',
            }}
          >
            <span className="burger-bar" style={{
              display: 'block', width: '18px', height: '2px', borderRadius: '2px',
              transition: 'transform 0.3s, opacity 0.3s', transformOrigin: 'center',
              transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            }} />
            <span className="burger-bar" style={{
              display: 'block', width: '18px', height: '2px', borderRadius: '2px',
              transition: 'opacity 0.3s', opacity: menuOpen ? 0 : 1,
            }} />
            <span className="burger-bar" style={{
              display: 'block', width: '18px', height: '2px', borderRadius: '2px',
              transition: 'transform 0.3s', transformOrigin: 'center',
              transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            }} />
          </button>
        </div>
      </nav>

      {/* Mobile Glass Drawer */}
      <div
        className="nav-mobile-drawer"
        style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
          borderRadius: '1.5rem',
          padding: '1rem 1.25rem 1.25rem',
          transition: 'opacity 0.25s, transform 0.25s',
          opacity: menuOpen ? 1 : 0,
          transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: menuOpen ? 'all' : 'none',
          display: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`mobile-drawer-link ${currentPage === href ? 'mobile-drawer-link--active' : ''}`}
              style={{
                display: 'block', padding: '0.75rem 1rem', borderRadius: '0.85rem',
                fontSize: '0.95rem', fontWeight: 500, textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          href={ctaHref}
          onClick={() => setMenuOpen(false)}
          style={{
            display: 'flex', justifyContent: 'center', width: '100%', padding: '0.75rem',
            borderRadius: '0.85rem', background: PRIMARY, color: '#fff',
            fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(92,61,46,0.25)',
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, top: '5rem', background: 'rgba(0,0,0,0.3)', zIndex: -1, backdropFilter: 'blur(4px)' }}
        />
      )}

      <style jsx global>{`
        .floating-navbar {
          position: fixed;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          max-width: 64rem;
          z-index: 100;
          border-radius: 9999px;
          background: rgba(253, 250, 246, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 10px 30px rgba(92, 61, 46, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          color: #2d2b29;
        }

        .nav-link {
          color: #64748b;
        }
        .nav-link:hover {
          color: #5C3D2E;
          background: rgba(92, 61, 46, 0.05);
        }
        .nav-link--active {
          color: #5C3D2E !important;
          background: rgba(92, 61, 46, 0.09) !important;
        }

        .burger-bar {
          background: #475569;
        }

        .nav-mobile-drawer {
          background: rgba(253, 250, 246, 0.9);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 16px 40px rgba(92, 61, 46, 0.12);
        }
        .mobile-drawer-link {
          color: #64748b;
        }
        .mobile-drawer-link--active {
          color: #5C3D2E;
          background: rgba(92, 61, 46, 0.09);
        }

        /* ─── DARK MODE FLOATING NAVBAR ─── */
        [data-theme="dark"] .floating-navbar {
          background: rgba(22, 20, 18, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          color: #f1f5f9;
        }
        [data-theme="dark"] .nav-link {
          color: #a09890;
        }
        [data-theme="dark"] .nav-link:hover {
          color: #C49A6C;
          background: rgba(196, 154, 108, 0.1);
        }
        [data-theme="dark"] .nav-link--active {
          color: #C49A6C !important;
          background: rgba(196, 154, 108, 0.15) !important;
        }
        [data-theme="dark"] .burger-bar {
          background: #cbd5e1;
        }
        [data-theme="dark"] .nav-mobile-drawer {
          background: rgba(22, 20, 18, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        [data-theme="dark"] .mobile-drawer-link {
          color: #a09890;
        }
        [data-theme="dark"] .mobile-drawer-link--active {
          color: #C49A6C;
          background: rgba(196, 154, 108, 0.15);
        }

        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-cta { display: none !important; }
          .nav-burger { display: flex !important; }
          .nav-mobile-drawer { display: block !important; }
        }
      `}</style>
    </header>
  )
}
