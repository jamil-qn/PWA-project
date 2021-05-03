const CACHE_STATIC_NAME = "static-v8";
const CACHE_DYNAMIC_NAME = "dynamic-v8";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "/favicon.ico",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

// //cache max items 
// const trimCache = (cacheName, maxItems) => {
//   caches.open(cacheName).then((cache) => {
//     return cache.keys().then((keys) => {
//       if (keys.length > maxItems) {
//         cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
//       }
//     });
//   });
// };

self.addEventListener("install", (event) => {
  console.log("[service worker] Installing Service Worker...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      console.log("[SW] Precaching App Shell");
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[service worker] Activating Service Worker...", event);
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

const isInArray = (string, array) => {
  return array.includes(string);
};

//dynamic caching for cache, then network strategy
self.addEventListener("fetch", (event) => {
  var url = "https://httpbin.org/get";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
        return fetch(event.request).then((res) => {
          // trimCache(CACHE_DYNAMIC_NAME, 3);
          cache.put(event.request.url, res.clone());
          return res;
        });
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then((res) => {
              caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch((err) => {
              return caches.open(CACHE_STATIC_NAME).then((cache) => {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});


////default fetch cache
// self.addEventListener('fetch' , (event)=>{
//     // console.log('[Service Worker] Fetching service worker...',event);
//     event.respondWith(
//         caches.match(event.request)
//         .then((response) =>{
//             if(response) {
//                 return response;
//             }else {
//                 return fetch(event.request)
//                 .then((res) =>{
//                     caches.open(CACHE_DYNAMIC_NAME)
//                     .then((cache) =>{
//                         cache.put(event.request.url , res.clone());
//                         return res;
//                     })
//                 })
//                 .catch((err) =>{
//                     return caches.open(CACHE_STATIC_NAME)
//                     .then(cache =>{
//                         return cache.match('/offline.html');
//                     })
//                 })
//             }
//         })
//     );
// });

// //network, fallback to cache
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//       fetch(event.request)
//       .then(res =>{
//           caches.open(CACHE_DYNAMIC_NAME)
//           .then(cache =>{
//               caches.put(event.request.url , res.clone());
//               return res;
//           })
//       })
//     ).catch(err =>{
//         return caches.match(event.request);
//     });
// });

// //network-only
// self.addEventListener("fetch", (event) => {
//   event.respondWith(fetch(event.request));
// });

// //cache-only
// self.addEventListener("fetch", (event) => {
//   event.respondWith(caches.match(event.request));
// });
