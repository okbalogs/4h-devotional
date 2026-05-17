const STATIC_CACHE = 'static-v5'
const DYNAMIC_CACHE = 'dynamic-v5'
const VERSE_CACHE = 'verse-v5'

const APP_SHELL = [
  '/',
  '/signin',
  '/signup',
  '/explore',
  '/courses',
  '/fellowship',
  '/support',
  '/privacy',
  '/terms',
  '/instructors',
  '/today',
  '/entry/new',
  '/history',
  '/settings',
]

// ─── Install: cache full app shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      // addAll fails atomically — individual failures won't crash install
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

// ─── Activate: remove old caches ───
self.addEventListener('activate', (event) => {
  const valid = [STATIC_CACHE, DYNAMIC_CACHE, VERSE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !valid.includes(k)).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── Fetch ───
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Bible API — cache-first (offline verse reading)
  if (url.hostname === 'bible-api.com') {
    event.respondWith(
      caches.open(VERSE_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          cache.put(request, response.clone())
          return response
        } catch {
          return new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
          })
        }
      })
    )
    return
  }

  // Supabase — network only, never cache auth'd data
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    )
    return
  }

  // Next.js static chunks — cache first, update in background
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) {
          // Refresh in background so next visit gets latest
          fetch(request).then((r) => cache.put(request, r)).catch(() => {})
          return cached
        }
        const response = await fetch(request)
        cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Images and fonts — cache first
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          cache.put(request, response.clone())
          return response
        } catch {
          return new Response('', { status: 408 })
        }
      })
    )
    return
  }

  // App shell pages — network first, fall back to cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful same-origin navigation responses
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }
})
