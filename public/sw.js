const STATIC_CACHE = 'static-v6'
const DYNAMIC_CACHE = 'dynamic-v6'
const VERSE_CACHE = 'verse-v6'

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

// ─── Install: pre-cache app shell ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      Promise.allSettled(APP_SHELL.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

// ─── Activate: drop old caches ───
self.addEventListener('activate', (event) => {
  const valid = [STATIC_CACHE, DYNAMIC_CACHE, VERSE_CACHE]
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !valid.includes(k)).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Return the best cached response for a pathname, ignoring Vary headers.
// Falls back to root shell if nothing else matches.
async function serveFromCache(pathname) {
  const opts = { ignoreVary: true }
  return (
    (await caches.match(new Request(pathname), opts)) ||
    (await caches.match('/', opts))
  )
}

// Strip the Vary header before caching so future lookups always succeed
// regardless of what RSC/Next-Router headers the request carries.
function makeCacheable(response) {
  const headers = new Headers(response.headers)
  headers.delete('Vary')
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// ─── Push: show notification ───
self.addEventListener('push', (event) => {
  let data = { title: '4H Devotion', body: 'You have a new notification', url: '/community?tab=partners' }
  if (event.data) {
    try { data = { ...data, ...JSON.parse(event.data.text()) } } catch {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      data: { url: data.url },
      tag: 'selah-notification',
      renotify: true,
    })
  )
})

// ─── Notification click: focus existing tab or open /today ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/today'
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if ('focus' in client) return client.focus()
        }
        if (clients.openWindow) return clients.openWindow(url)
      })
  )
})

// ─── Fetch ───
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET
  if (request.method !== 'GET') return

  // ── Bible verse API — cache-first ──
  if (url.hostname === 'bible-api.com') {
    event.respondWith(
      caches.open(VERSE_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreVary: true })
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

  // ── Supabase — network only, data cached in localStorage by the app ──
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

  // ── Next.js static chunks — stale-while-revalidate ──
  if (url.pathname.startsWith('/_next/static')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreVary: true })
        if (cached) {
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

  // ── Images & fonts — cache-first ──
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request, { ignoreVary: true })
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

  // ── Same-origin app pages — network-first, cache fallback ──
  //
  // Next.js App Router sends RSC fetch requests (with headers like RSC: 1,
  // Next-Router-State-Tree, etc.) for client-side navigation. Cached HTML
  // responses carry Vary headers that reference those fields, so a plain
  // caches.match() call won't serve them. We fix this by:
  //   1. Stripping Vary before storing (makeCacheable)
  //   2. Keying the cache on pathname only — RSC requests often carry
  //      a ?_rsc=<nonce> query string that would miss the cached entry
  //   3. Using { ignoreVary: true } on every cache lookup
  //
  // When offline Next.js receives the cached HTML for an RSC request and
  // re-renders the page from that shell — which is correct for this app
  // because all data fetching is client-side.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then((c) =>
              // Key by pathname so a single entry covers both RSC and
              // normal navigation requests to the same route.
              c.put(new Request(url.pathname), makeCacheable(response.clone()))
            )
          }
          return response
        })
        .catch(() => serveFromCache(url.pathname))
    )
    return
  }
})
