self.addEventListener('install' , (event)=>{
    console.log('[service worker] Installing Service Worker...' , event);
});

self.addEventListener('activate' , (event)=>{
    console.log('[service worker] Activating Service Worker...' , event);
    return self.clients.claim();
});

self.addEventListener('fetch' , (event)=>{
    console.log('[Service Worker] Fetching service worker...',event);
    event.respondWith(fetch(event.request));
});