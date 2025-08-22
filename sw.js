/**
 * Service Worker for Fish & Boat Ladders Game
 * Provides offline caching support for the game files
 * Updates cache when online, serves cached version when offline
 */

const CACHE_NAME = 'fish-boat-ladders-v1.0.0';
const CACHE_URLS = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './manifest.json',
];

/**
 * Install event - Cache all essential files
 */
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: All files cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch(error => {
                console.error('Service Worker: Cache installation failed', error);
            })
    );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim(); // Take control of all clients
            })
    );
});

/**
 * Fetch event - Network first, cache fallback strategy
 * This ensures latest version loads when online, cached version when offline
 */
self.addEventListener('fetch', event => {
    // Only handle GET requests for our domain
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        // Try network first (for latest version)
        fetch(event.request)
            .then(response => {
                // If successful, update cache with latest version
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        })
                        .catch(error => {
                            console.warn('Service Worker: Failed to update cache', error);
                        });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try cache
                console.log('Service Worker: Network failed, serving from cache');
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            console.log('Service Worker: Serving cached file', event.request.url);
                            return cachedResponse;
                        }
                        
                        // If not in cache and it's the main page, serve index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        
                        // Return a basic offline response for other requests
                        return new Response('Offline - File not cached', {
                            status: 404,
                            statusText: 'Offline'
                        });
                    });
            })
    );
});

/**
 * Message event - Handle communication from main thread
 */
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_STATUS') {
        // Send cache status back to main thread
        caches.open(CACHE_NAME)
            .then(cache => cache.keys())
            .then(keys => {
                event.ports[0].postMessage({
                    type: 'CACHE_STATUS_RESPONSE',
                    cachedFiles: keys.length,
                    cacheSize: keys.map(key => key.url)
                });
            });
    }
});

/**
 * Error event - Handle service worker errors
 */
self.addEventListener('error', event => {
    console.error('Service Worker: Error occurred', event.error);
});

/**
 * Unhandled rejection event - Handle promise rejections
 */
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});