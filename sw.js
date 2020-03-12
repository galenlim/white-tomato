const cacheName = 'white-tomato';
const staticAssets = [
    './',
    './index.html',
    './js/app.js',
    './js/noise.js',
    './img/icon.png',
	'./img/favicon32.png',
	'./img/apple-icon.png',
    './css/bootstrap.min.css',
	'./css/style.css',
	'./css/solid.css',
	'./webfonts/fa-solid-900.eot',
	'./webfonts/fa-solid-900.svg',
	'./webfonts/fa-solid-900.ttf',
	'./webfonts/fa-solid-900.woff',
	'./webfonts/fa-solid-900.woff2',
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
