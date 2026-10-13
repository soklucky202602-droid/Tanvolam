// Mang truoc, cache du phong: luon lay ban moi khi co mang, choi offline khi mat mang
const scopePath = new URL(self.registration.scope).pathname;
const C = 'jx-xanh-'+scopePath+'-v43';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith('jx-xanh-'+scopePath+'-') || (scopePath==='/' && k==='jx-xanh-v1')) && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.startsWith(scopePath+'api/')) return;
  // Never substitute a cached game for the new portal (or the reverse) offline.
  if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>new Response('<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Mất kết nối</title><body style="background:#111b16;color:#eee;font:18px system-ui;padding:30px"><h1>Chưa có kết nối máy chủ</h1><p>Hãy kết nối mạng rồi tải lại. Dữ liệu nhân vật vẫn được lưu theo tài khoản.</p><button onclick="location.reload()">Thử lại</button></body></html>',{status:503,headers:{'content-type':'text/html; charset=utf-8'}})));return;}
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request)));
});
