importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const CACHE_STATIC_NAME = "static-v2";
const CACHE_DYNAMIC_NAME = "dynamic-v1";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "/src/images/main-image-lg.jpg",
  "/src/images/main-image-sm.jpg",
  "/favicon.ico",
  "/manifest.json",
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

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

//dynamic caching for cache, then network strategy
self.addEventListener("fetch", (event) => {
  var url = "https://pwagram-a333e-default-rtdb.firebaseio.com/posts";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then((res) => {
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(() => {
            return clonedRes.json();
          })
          .then((data) => {
            for (let key in data) {
              writeData("posts", data[key]);
            }
          });
        return res;
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

self.addEventListener("sync", (event) => {
  console.log("[service worker] Background syncing...", event);
  if (event.tag === "sync-new-posts") {
    console.log("[service worker] Syncing new Posts");
    event.waitUntil(
      readAllData("sync-posts").then((data) => {
        for (let dt of data) {
          fetch(
            "https://pwagram-a333e-default-rtdb.firebaseio.com/posts.json",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                id: dt.id,
                title: dt.title,
                location: dt.location,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/pwagram-a333e.appspot.com/o/sf-boat.jpg?alt=media&token=b8dcb864-1060-4721-b031-6fc109e09390",
              }),
            }
          )
            .then((res) => {
              console.log("Sent data", res);
              if (res.ok) {
                deleteItemFromData("sync-posts", dt.id);
              }
            })
            .catch((err) => {
              console.log("Error while sending data", err);
            });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);
  if (action === "confirm") {
    console.log("Confirm was chosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll().then((clis) => {
        var client = clis.find((c) => {
          return (c.visivilityState = "visible");
        });

        if (client !== undefined) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener("notificationclose", (event) => {
  console.log("notification was closed", event);
});

self.addEventListener("push", (event) => {
  console.log("Push Notification received", event);
  var data = { title: "new", content: "Something new happend!", openUrl: '/' };
  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  var options = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
