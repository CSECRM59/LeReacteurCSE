// sw.js - Service Worker Basique

const CACHE_NAME = 'reacteur-cse-cache-v1';
const urlsToCache = [
  './',               // La racine (alias pour index.html souvent)
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './img/logo-reacteur.png', // Cache le logo de base
  './icons/icon-192x192.png',// Cache les icônes PWA
  './icons/icon-512x512.png'
  // Ajoutez ici les ressources essentielles statiques (autres images, etc.)
  // NE PAS mettre ici les CSVs ou les données dynamiques !
];

// Installation : Ouverture du cache et ajout des ressources de base
self.addEventListener('install', (event) => {
  console.log('[SW] Installation du Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache ouvert, ajout des ressources de base :', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
          console.error('[SW] Échec de mise en cache initiale :', err);
      })
  );
  self.skipWaiting(); // Force le SW à devenir actif immédiatement
});

// Activation : Nettoyage des anciens caches (si besoin dans le futur)
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation du Service Worker.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Prend le contrôle de la page immédiatement
});


// Fetch : Stratégie "Cache d'abord, puis réseau" (Cache falling back to network)
self.addEventListener('fetch', (event) => {
    // Ne pas mettre en cache les requêtes non-GET (POST etc.) ni celles vers Google Sheets/Forms
    if (event.request.method !== 'GET' || event.request.url.includes('google.com/forms') || event.request.url.includes('google.com/spreadsheets')) {
       // console.log('[SW] Requête non-GET ou vers Google interceptée, passage direct au réseau:', event.request.url);
        event.respondWith(fetch(event.request));
        return;
    }


  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Trouvé dans le cache ! On le renvoie.
        if (response) {
          // console.log('[SW] Ressource trouvée dans le cache :', event.request.url);
          return response;
        }

        // Pas dans le cache, on va chercher sur le réseau
        // console.log('[SW] Ressource non trouvée dans le cache, fetch réseau :', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Optionnel : Mettre en cache la nouvelle ressource récupérée?
            // Attention, ne pas le faire pour TOUT (éviter données dynamiques)
            // Ici, on ne met PAS en cache dynamiquement pour rester simple.
             if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                  return networkResponse; // Retourne la réponse même si erreur, pour que le navigateur l'affiche
             }
             // Si on voulait mettre en cache dynamiquement :
             /*
             const responseToCache = networkResponse.clone();
             caches.open(CACHE_NAME)
               .then(cache => {
                 cache.put(event.request, responseToCache);
               });
             */
            return networkResponse;
          }
        ).catch(error => {
            console.error('[SW] Erreur fetch réseau ET cache vide:', error);
            // Optionnel: Renvoyer une page "offline" personnalisée
            // return caches.match('/offline.html');
            // Ou juste laisser l'erreur navigateur standard
        });
      })
  );
});

console.log("Service Worker 'sw.js' chargé.");
