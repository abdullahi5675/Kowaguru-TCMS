const CACHE_NAME = 'kowaguru-tcms-v2';

// Assets to safely precache on install
const PRECACHE_ASSETS = [
  '/home',
  '/auth/login',
  '/manifest.json',
  '/app-icon.png',
  '/hero-bg.webp',
  '/favicon.ico',
];

// Install Event: Safely cache public app shell without failing on redirects
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Pre-caching offline app shell');
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[ServiceWorker] Skipping precache for ${asset}:`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Delete old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first with resilient offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML Pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If valid response (200), cache it for offline use
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          // Network failed (device is offline) — search cache for exact request or fallbacks
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;

          // If looking for dashboard offline, check cached dashboard page
          const dashboardCache = await caches.match('/dashboard');
          if (dashboardCache) return dashboardCache;

          // Fallback to home or login page
          const homeCache = await caches.match('/home');
          if (homeCache) return homeCache;

          const loginCache = await caches.match('/auth/login');
          if (loginCache) return loginCache;

          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>KowaGuru TCMS - Offline</title>
              <style>
                body { font-family: system-ui, sans-serif; background: #111827; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                .card { background: #1f2937; padding: 30px; border-radius: 16px; border: 1px solid #374151; max-width: 400px; }
                h1 { color: #f87171; font-size: 20px; margin-top: 0; }
                p { color: #9ca3af; font-size: 14px; line-height: 1.5; }
                button { background: #b91c1c; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 15px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>✂️ KowaGuru TCMS (Offline Mode)</h1>
                <p>You are currently offline. Your saved data is stored locally. Reconnect to internet to sync changes.</p>
                <button onclick="window.location.reload()">Retry Connection</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (_next, images, CSS, JS, fonts)
  if (
    url.origin === location.origin &&
    (url.pathname.startsWith('/_next/') ||
     url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|css|js|woff2?|ico|json)$/))
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache immediately, update in background if online
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        }).catch(() => {
          // Return empty 200 response for missing images when offline
          return new Response('', { status: 200, statusText: 'OK' });
        });
      })
    );
    return;
  }

  // 3. API Requests: Network First, Fallback to Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ error: 'Offline mode: showing local data' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }
});
