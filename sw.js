/* Simran Dryfruits — Customer Portal Service Worker (network-first, never serves stale pages while online) */
const CACHE = 'simran-customer-v4';
const ASSETS = ['./', './simran.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('simran-customer-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    // cache:'no-store' bypasses the browser HTTP cache (GitHub Pages keeps files for 10 minutes)
    fetch(new Request(req.url, { cache: 'no-store', credentials: 'same-origin' }))
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./')).then(r => r || Response.error()))
  );
});
