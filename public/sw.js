const CACHE_NAME = 'lummie-v2'
const urlsToCache = [
  '/manifest.json',
  '/logo.svg',
  '/logo-l.svg',
  '/icon-192x192.svg',
  '/icon-512x512.svg',
  '/apple-touch-icon.svg',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache')
      return cache.addAll(urlsToCache).catch((error) => {
        console.error('Failed to cache some resources:', error)
        // Cache individual files instead of failing completely
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache
              .add(url)
              .catch((err) => console.warn(`Failed to cache ${url}:`, err))
          )
        )
      })
    })
  )
})

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }
  
  // Skip API requests and Next.js internal requests
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') ||
      url.pathname.includes('.hot-update.')) {
    return
  }
  
  // For HTML pages - always fetch from network (network first)
  if (event.request.mode === 'navigate' || 
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only serve cached version if network fails
        return caches.match(event.request)
      })
    )
    return
  }
  
  // For static assets - cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})
