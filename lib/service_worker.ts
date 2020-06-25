// enable service worker type checking. adding 'Worker' to lib in tsconfig might be required
export default null;
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = "pwaCache-v1";
const UPDATE_KEY = "pwaHasUpdate";
const URLS_TO_CACHE = [self.location.origin];

self.addEventListener("install", (event: InstallEvent) => {
  event.waitUntil(asyncPopulateCacheOnInstall);
});

self.addEventListener("fetch", (event: FetchEvent) => {
  if (event.request.mode === "navigate") {
    event.respondWith(asyncReturnThenUpdateCacheResource(event));
  }
});

async function asyncPopulateCacheOnInstall() {
  const cache = await caches.open(CACHE_NAME);

  cache.addAll(URLS_TO_CACHE);
}

async function asyncReturnThenUpdateCacheResource(event: FetchEvent) {
  const urlString = getNormalizedUrlString(event.request.url);

  const fetchResponsePromise = fetch(urlString);
  const responsePromiseClone = fetchResponsePromise.then((r) => r.clone());

  event.waitUntil(
    asyncUpdateCacheWithLatestResponse(
      urlString,
      responsePromiseClone,
      event.resultingClientId || event.clientId
    )
  );

  // Prefer the cached response, falling back to the fetch response.
  return (await caches.match(urlString)) || fetchResponsePromise;
}

function getNormalizedUrlString(requestUrl: string) {
  const normalizedUrl = new URL(requestUrl);
  normalizedUrl.search = "";

  return normalizedUrl.toString();
}

async function asyncUpdateCacheWithLatestResponse(
  urlString: string,
  responsePromise: Promise<Response>,
  clientId: string
) {
  const response = await responsePromise;
  const responseToCompare = response.clone();

  if (
    !responseToCompare.ok ||
    (await cachedResponseIsCurrent(urlString, responseToCompare))
  ) {
    return;
  }

  await updateCachedResponse(urlString, response);

  await sendUpdateMessageToClient(clientId);
}

async function cachedResponseIsCurrent(
  urlString: string,
  response: Response
): Promise<Boolean> {
  const storedResponse = await caches.match(urlString);

  if (!storedResponse) {
    return false;
  }

  const [storedText, responseText] = await Promise.all([
    storedResponse.text(),
    response.text(),
  ]);

  return storedText === responseText;
}

async function updateCachedResponse(urlString: string, response: Response) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(urlString, response);
}

async function sendUpdateMessageToClient(clientId: string) {
  const client = (await self.clients.get(clientId)) as WindowClient;

  if (client) {
    client.postMessage(UPDATE_KEY);
  }
}
