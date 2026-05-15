"use client"
import React from 'react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const currentPage = usePathname()
  const { user } = useAuth()

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
      {user ? (
        <Link href="/today" className='btn-primary py-2.5! px-6! text-sm'>
          Go to App
        </Link>
      ) : (
        <Link href="/signup" className='btn-primary py-2.5! px-6! text-sm'>
          Start Selah
        </Link>
      )}
    </nav>
  )
}
