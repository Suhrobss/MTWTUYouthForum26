// PLAI//OS service worker: offline shell + Web Push
const CACHE = 'plai-v6';
const SHELL = ['/', '/index.html', '/styles.css?v=6', '/app.js?v=6', '/icon.svg', '/manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('/'))));
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: 'MTWTU Youth Forum', body: e.data?.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'MTWTU Youth Forum', { body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', tag: d.tag, data: { url: d.url || '/#/updates' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/#/updates';
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => { for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus(); } } return clients.openWindow(url); }));
});
