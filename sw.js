const cacheName = 'white-tomato';
const staticAssets = [
    '/white-tomato',
    '/white-tomato/index.html',
    '/white-tomato/js/app.js',
    '/white-tomato/js/noise.js',
    '/white-tomato/img/icon.png',
	'/white-tomato/img/favicon32.png',
    '/white-tomato/css/bootstrap.min.css'
];

self.addEventListener('install', (event) => {
	console.log('[ServiceWorker] Install');
	event.waitUntil(
		caches.open(cacheName).then((cache) => {
			console.log('[ServiceWorker] Pre-caching offline page');
			return cache.addAll(staticAssets);
		})
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
    event.waitUntil(
        caches.keys().then((keyList) => {
          return Promise.all(keyList.map((key) => {
            if (key !== cacheName) {
              console.log('[ServiceWorker] Removing old cache', key);
              return caches.delete(key);
            }
          }));
        })
    );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
	console.log('[ServiceWorker] Fetch', event.request.url);
	event.respondWith(
		fetch(event.request).then( (response) => {
				if (!response.ok) {
					return caches.match(event.request);
				}
				else {
				    return response;
				}
		}).catch( () => {
			return caches.match(event.request);
		})
	);
});
