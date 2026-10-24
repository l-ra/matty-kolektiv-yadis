const CACHE='yadis-pwa-v1.5.2';
const ASSETS=['./','./index.html','./style.css','./pwa.js','./app.js','./tides.js','./finance.js','./finance-plan-edit.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));

self.addEventListener('activate',e=>e.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;

  const url=new URL(e.request.url);
  const networkFirst=e.request.mode==='navigate' || url.pathname.endsWith('/manifest.webmanifest');

  if(networkFirst){
    e.respondWith(
      fetch(e.request)
        .then(r=>{
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return r;
        })
        .catch(()=>caches.match(e.request).then(hit=>hit || (e.request.mode==='navigate'?caches.match('./index.html'):undefined)))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit=>hit || fetch(e.request).then(r=>{
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,copy));
      return r;
    }))
  );
});
