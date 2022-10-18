const STATIC_CACHE_NAME = 'static-cache-v1.1';
const INMUTABLE_CACHE_NAME = 'inmutable-cache-v1.1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1.1';

const appShellStaticFields = [
    './',
    './index.html',
    './manifest.json',
    './images/icons/android-launchericon-48-48.png',
    './images/icons/android-launchericon-72-72.png',
    './images/icons/android-launchericon-96-96.png',
    './images/icons/android-launchericon-144-144.png',
    './images/icons/android-launchericon-192-192.png',
    './images/icons/android-launchericon-512-512.png'
];

const appShellInmutableFields = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.min.js'
]



function cleanCache(cahceName, numberItems){
    caches.open(cahceName).then((cache)=>{
        cache.keys().then((keys)=>{
            if(keys.length > numberItems){
                cache.delete(keys[0]).then(cleanCache(cahceName, numberItems));
            }
        });
    });
}


self.addEventListener('install', (event) => {
    console.log('[Service Worker]: Instalado');

    const promiseCache = caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(appShellStaticFields);
    });

    const promiseCacheInmutable = caches.open(INMUTABLE_CACHE_NAME).then((cache) => {
        return cache.addAll(appShellInmutableFields);
    });

    event.waitUntil(Promise.all([promiseCache, promiseCacheInmutable]));
});

// self.addEventListener('fetch',(event)=>{
//     const respCache = caches.match(event.request)
//     event.respondWith(fetch(respCache));
// });


//cache with fallback

self.addEventListener('fetch', (event)=>{
    const resp = caches.match(event.request).then((respCache)=>{
        console.log(`[Service Worker] Fetched resource ${event.request.url}`);
        if(respCache){
            return respCache;
        }
        //No esta en cache, entonces vamos a la web
        return fetch(event.request).then((respWeb)=>{
            caches.open(DYNAMIC_CACHE_NAME).then((cahce)=>{
                console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
                cahce.put(event.request,respWeb);
                cleanCache(DYNAMIC_CACHE_NAME,5);
            });
            return respWeb.clone();
        });
    });
    event.respondWith(resp);
});
