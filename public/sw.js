// v3 — removed protected routes from install cache
const STATIC_CACHE = 'static-v3'
const DYNAMIC_CACHE = 'dynamic-v3'
const VERSE_CACHE = 'verse-v3'

const APP_SHELL = [
  '/',
  '/signin',
  '/signup',
]

// ─── Install: cache app shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
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

  // Next.js static chunks — cache first
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Public assets (images, fonts) — cache first
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        cache.put(request, response.clone())
        return response
      })
    )
    return
  }

  // Pages — network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()))
        return response
      })
      .catch(() => caches.match(request))
  )
})
