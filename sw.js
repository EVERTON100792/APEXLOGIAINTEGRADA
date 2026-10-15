/* ApexLog — service worker mínimo (torna o app instalável + cache dos ícones) */
const CACHE = 'apexlog-icons-v1';
const ASSETS = [
  './',
  './manifest.webmanifest',
  './icons/apex-192.png',
  './icons/apex-512.png',
  './icons/apex-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Ícones/manifesto: cache-first (nunca quebra o app se falhar)
  if (url.pathname.includes('/icons/') || url.pathname.endsWith('.webmanifest')) {
    e.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
      )
    );
    return;
  }
  // Demais rotas: rede normal (não intercepta POST/Supabase)
});
