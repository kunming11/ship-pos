// 這是強制離線腳本
const CACHE_NAME = "pos-offline-v1";

// 安裝時：強迫瀏覽器立刻啟動
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// 啟動時：清除舊的快取，確保是用最新的
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 抓取資料時：有網路就上網抓並更新快取，沒網路就讀快取
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果上網成功，把新的檔案存進快取
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() => {
        // 如果斷網，就去快取裡面找
        return caches.match(event.request);
      })
  );
});
