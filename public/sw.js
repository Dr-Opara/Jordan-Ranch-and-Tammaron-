const STATIC_CACHE = "jrt-static-v1";
const STATIC_ASSETS = ["/manifest.webmanifest", "/icon-192", "/icon-512", "/apple-icon"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache authenticated pages, HTML navigations, API calls, or user data.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  const isStaticPwaAsset =
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/icon-192" ||
    url.pathname === "/icon-512" ||
    url.pathname === "/apple-icon";

  if (!isStaticPwaAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || network;
    }),
  );
});
