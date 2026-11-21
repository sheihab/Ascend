// Ascend service worker: offline app shell + notification clicks.
const CACHE = 'ascend-f611a36cd6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/badge-96.png', './favicon.png', './img/n-ai.png', './img/n-biz.png', './img/n-book.png', './img/n-comm.png', './img/n-done.png', './img/n-eng.png', './img/n-gym.png', './img/n-java.png', './img/n-math.png', './img/n-money.png', './img/n-net.png', './img/n-refl.png', './img/n-streak.png', './img/n-style.png', './img/n-uni.png', './img/n-zh.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    // network first so updates arrive, cached copy when offline
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  if (url.origin === location.origin || url.host.endsWith('gstatic.com') || url.host.endsWith('googleapis.com')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit)));
  }
});
self.addEventListener('notificationclick', e => {
  const n = e.notification, data = n.data || {};
  n.close();
  if (e.action === 'later') return;
  const wantStart = (e.action === 'start' || !e.action) && data.di && data.key;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if ('focus' in c) { if (wantStart) c.postMessage({ type: 'start', di: data.di, key: data.key }); return c.focus(); }
    }
    const url = wantStart ? './?start=' + encodeURIComponent(data.di) + '&k=' + encodeURIComponent(data.key) + '#today' : './#today';
    return self.clients.openWindow(url);
  }));
});
