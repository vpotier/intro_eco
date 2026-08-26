const CACHE_NOM = "deux-sous-cache-v16";

const FICHIERS_APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./data/fiches.json",
  "./icones/icone-192.png",
  "./icones/icone-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NOM).then((cache) => cache.addAll(FICHIERS_APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== CACHE_NOM).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Les fiches : réseau en priorité pour avoir le contenu le plus à jour,
  // avec repli sur le cache si hors ligne.
  if (url.pathname.endsWith("fiches.json")) {
    event.respondWith(
      fetch(event.request)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(CACHE_NOM).then((cache) => cache.put(event.request, copie));
          return reponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Le reste de l'app (structure, style, code) : cache en priorité, réseau en secours.
  event.respondWith(
    caches.match(event.request).then((reponse) => reponse || fetch(event.request))
  );
});
