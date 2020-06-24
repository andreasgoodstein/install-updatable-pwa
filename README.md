# install-updatable-pwa

An npm package containing easy starter files for creating an updatable PWA using Typescript

## Quick use

To use, run following command in your PWA project folder: `npx install-updatable-pwa`

## Details

The package will copy PWA files (service worker, webmanifest and icons) to the current folder (failing on name collision). These files can then be customized by the user, to reflect the specific use cases of the project. As a minimum, values in manifest.webmanifest should be changed, and real icons should be used.

### Updatable caching strategy

The service worker uses cache-first (with a fallback on network request) for serving resources to the client. However, in the background it completes a network request for every resource request and checks if a new version is available. If a new version is returned, the cache is updated and the client is notified through a customizable callback method.

The callback method is `handlePWAUpdate()` in `register_sw.ts`. This method should be implemented to handle update events as fits the project (ie. reload page, notify user, show update call-to-action button etc.)
