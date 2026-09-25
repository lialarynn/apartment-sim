const CACHE_NAME = "apartment-sim-v4";

const FILES_TO_CACHE = [
    "./",
    "./manifest.json",
    "./css/style.css",
    "./js/app.js"
];

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))

    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(name => name !== CACHE_NAME)
                        .map(name => caches.delete(name))

                );

            })
            .then(() => self.clients.claim())

    );

});


self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") {
        return;
    }

    const requestURL =
        new URL(event.request.url);

    /*
     * Always get the HTML from the network.
     * This prevents an old index.html from
     * hiding new pages or navigation buttons.
     */

    if (
        event.request.mode === "navigate" ||
        requestURL.pathname.endsWith("/") ||
        requestURL.pathname.endsWith("/index.html")
    ) {

        event.respondWith(

            fetch(event.request)
                .then(response => {

                    return response;

                })
                .catch(() => {

                    return caches.match("./");

                })

        );

        return;
    }


    /*
     * Other assets use cache-first behavior.
     * This keeps the app fast while still allowing
     * index.html to update normally.
     */

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                return response ||
                    fetch(event.request);

            })

    );

});