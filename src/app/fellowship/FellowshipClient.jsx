'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/utils/supabase'
import { useAuth } from '@/context/AuthContext'

const testimonials = [
  {
    quote: "This app has transformed my morning quiet time into a deep conversation with God. The 4H structure brings a clarity I never had before — I used to read and forget. Now I write and remember.",
    name: 'Sarah Adesola',
    role: 'ECWA Member, Lagos',
    initials: 'SA',
  },
  {
    quote: "I travel a lot for work and my devotion used to be the first thing to go. Since I installed this on my phone, I have not missed a single morning — even on flights without Wi-Fi.",
    name: 'Chukwuemeka Obi',
    role: 'ECWA Member, Abuja',
    initials: 'CO',
  },
  {
    quote: "My cell group started using Editorial Devotion together. We share our 'Help' reflections in our WhatsApp group every morning. It has changed the depth of our conversations completely.",
    name: 'Funke Adeyemi',
    role: 'Cell Group Leader, Port Harcourt',
    initials: 'FA',
  },
]

const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Kaduna', 'Benin City']

export default function FellowshipClient() {
  const { user } = useAuth()
  const [searchCity, setSearchCity] = useState('')
  const [searched, setSearched] = useState(false)
  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  const fetchGroups = async (city) => {
    if (!city.trim()) return
    setGroupsLoading(true)
    const { data } = await supabase
      .from('small_groups')
      .select('id, name, church, city, leader_name, description')
      .ilike('city', `%${city.trim()}%`)
      .order('created_at', { ascending: false })
      .limit(6)
    setGroups(data || [])
    setGroupsLoading(false)
  }

  const handleSearch = () => {
    if (searchCity.trim()) {
      setSearched(true)
      fetchGroups(searchCity)
    }
  }

  const handleCityPill = (city) => {
    setSearchCity(city)
    setSearched(true)
    fetchGroups(city)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <main>
      {/* ─── HEADER ─── */}
      <section className="hero-section" style={{ gridTemplateColumns: '1fr', textAlign: 'center', paddingBottom: '40px' }}>
        <div className="hero-text" style={{ margin: '0 auto', maxWidth: '660px' }}>
          <span className="section-tag">COMMUNITY</span>
          <h1 style={{ fontSize: '3rem' }}>
            You were not meant to <em>walk alone.</em>
          </h1>
          <p>
            The Christian life is communal. Fellowship connects your private devotion
            to a body of believers who will hold you accountable, encourage you,
            and grow with you. Find your community here.
          </p>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ padding: '60px', background: 'var(--clr-card)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span className="section-tag">FROM THE COMMUNITY</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--clr-dark)', margin: '16px 0 48px' }}>
            What brethren are saying
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '28px' }}>
            {testimonials.map(({ quote, name, role, initials }) => (
              <div
                key={name}
                style={{
                  background: 'var(--clr-cream)',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: '0 4px 20px rgba(47, 93, 69, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                }}
              >
                <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.96rem', lineHeight: '1.8', fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--clr-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: 'var(--clr-primary)',
                    flexShrink: 0,
                    fontWeight: 700,
                  }}>
                    {initials}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--clr-dark)', display: 'block' }}>{name}</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--clr-primary)' }}>{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FIND A GROUP ─── */}
      <section style={{ padding: '80px 60px' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <span className="section-tag">SMALL GROUPS</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--clr-dark)', margin: '16px 0 16px' }}>
            Find a group near you
          </h2>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '1rem', lineHeight: '1.75', marginBottom: '40px' }}>
            True discipleship does not happen in isolation. Across Nigeria, ECWA cell groups
            and small fellowship circles use the 4H framework together. Enter your city to find
            a group meeting near you, or start one in your church.
          </p>

          <div style={{ background: 'var(--clr-card)', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(47, 93, 69, 0.08)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                value={searchCity}
                onChange={e => { setSearchCity(e.target.value); setSearched(false) }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your city — e.g. Lagos, Abuja, Kano…"
                style={{
                  flex: 1, padding: '14px 18px', borderRadius: '8px',
                  border: '1.5px solid var(--clr-border)', background: 'var(--clr-cream)',
                  fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--clr-text)',
                }}
              />
              <button
                className="btn-primary"
                style={{ border: 'none', padding: '14px 24px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                onClick={handleSearch}
              >
                Search
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: searched ? '28px' : 0 }}>
              {cities.map(city => (
                <button
                  key={city}
                  onClick={() => handleCityPill(city)}
                  style={{
                    padding: '6px 14px', background: searchCity === city ? 'var(--clr-primary)' : 'var(--clr-cream)',
                    borderRadius: '20px', fontSize: '0.82rem',
                    color: searchCity === city ? '#fff' : 'var(--clr-text-muted)',
                    cursor: 'pointer', border: `1px solid ${searchCity === city ? 'var(--clr-primary)' : 'var(--clr-border)'}`,
                    fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >
                  {city}
                </button>
              ))}
            </div>

            {searched && searchCity.trim() && (
              groupsLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>
                  Searching…
                </div>
              ) : groups.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {groups.map(grp => (
                    <div
                      key={grp.id}
                      style={{
                        padding: '20px 24px', background: 'var(--clr-cream)', borderRadius: '12px',
                        border: '1px solid var(--clr-border)',
                      }}
                    >
                      <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--clr-dark)', fontWeight: 700 }}>
                        {grp.name}
                      </p>
                      {grp.church && (
                        <p style={{ margin: '0 0 2px', fontSize: '0.82rem', color: 'var(--clr-text-muted)' }}>{grp.church}</p>
                      )}
                      <p style={{ margin: '0 0 6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {grp.city}
                      </p>
                      {grp.description && (
                        <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--clr-text-muted)', lineHeight: '1.5' }}>{grp.description}</p>
                      )}
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                        Led by {grp.leader_name || 'unknown'}
                      </p>
                    </div>
                  ))}
                  {user ? (
                    <Link
                      href="/community?tab=groups"
                      style={{ display: 'block', textAlign: 'center', padding: '12px', color: 'var(--clr-primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Join a group or create your own →
                    </Link>
                  ) : (
                    <Link
                      href="/signup"
                      style={{ display: 'block', textAlign: 'center', padding: '12px', color: 'var(--clr-primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Sign up to join a group →
                    </Link>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '24px', background: 'var(--clr-cream)', borderRadius: '12px',
                  border: '1px dashed var(--clr-border)', textAlign: 'center',
                }}>
                  <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.95rem', marginBottom: '12px' }}>
                    No registered groups found in <strong>{searchCity}</strong> yet.
                  </p>
                  {user ? (
                    <Link href="/community?tab=groups" style={{ color: 'var(--clr-primary)', fontSize: '0.88rem', fontWeight: 600 }}>
                      Be the first — start a group →
                    </Link>
                  ) : (
                    <p style={{ color: 'var(--clr-primary)', fontSize: '0.88rem', fontWeight: 600 }}>
                      Be the first — start a 4H group at your local ECWA church and we will list it here.
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── ACCOUNTABILITY ─── */}
      <section className="fellowship-dark-section">
        <h2>Invite an accountability partner</h2>
        <p>
          Share your devotion streak with someone you trust — a friend, a spouse, a pastor.
          Consistent journalling is far easier when someone is journalling alongside you.
        </p>
        {user ? (
          <Link href="/community?tab=partners" className="btn-primary btn-lg">
            Open Community →
          </Link>
        ) : (
          <Link href="/signup" className="btn-primary btn-lg">
            Get Started Free
          </Link>
        )}
      </section>
    </main>
  )
}
