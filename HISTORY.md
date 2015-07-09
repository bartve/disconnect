0.6.4 / 2015-07-09
==================
  * Prevent `JSON.parse()` crash when the Discogs API returns HTML instead of json (maintainance mode)
  * Added Discogs API version to `DiscogsClient` config (only the default `v2` is supported at the moment)

0.6.3 / 2015-05-28
==================
  * Updated `oauth-1.0a` dependency

0.6.2 / 2015-02-25
==================
  * `database().image()` now requires the full image url as the first parameter due to the new Discogs image cluster
  * Local request throttling by `disconnect` has been disabled for `database().image()`

0.6.1 / 2015-02-17
==================
  * Added setting output format for user, artist and label profiles through `DiscogsClient.setConfig({outputFormat: 'html'})`

0.6.0 / 2015-01-19
==================
  * OAuth authentication is no longer embedded in `DiscogsClient`
  * Added OAuth signature method configuration option
  * Added support for the new `Discogs Auth` authentication methods
  * Changed default OAuth signature method to `PLAINTEXT` due to problems with `HMAC-SHA1` + database search

0.5.3 / 2014-12-02
==================
  * Fixed incorrect assumption that a Discogs order ID is numeric in `marketplace().orders()`

0.5.2 / 2014-10-30
==================
  * Fixed incorrect reference to `this` from within a callback function in `DiscogsClient.about()`
  * The internal `oauth` object of `DiscogsClient` now only gets 3 status values: `null`, `request` and `access`

0.5.1 / 2014-10-29
==================
  * Fixed a test which was failing due to changes in `0.5.0` and `npm test` now runs the tests
  * Added the possibility to set a custom configuration object with `DiscogsClient.setConfig()` for Browserify + CORS or Proxy use cases
  * Updated `README.md` to explain the `app` variable

0.5.0 / 2014-10-22
==================
  * Replaced some short circuit evaluations and improved the general readability of `client.js`
  * Implemented a more elegant way to require OAuth authentication for the `get()`, `post()`, `put()` and `delete()` functions of `DiscogsClient`
  * **Breaking change:** `DiscogsClient.getAccessToken()` now only acceps **two** parameters: `verifier` and `callback`. 
    The former `requestObject` parameter is now taken from the `oauth` property of the `DiscogsClient` instance. 
    For further info see the updated `README.md`

0.4.2 / 2014-10-20
==================
  * Fixed `this` scoping in `about()`
  * Switched from `http` to the newly implemented `https` Discogs API connection for added security

0.4.1 / 2014-10-16
==================
  * Fixed "Unexpected token u" error when trying to parse an `undefined` response value to JSON
  * `marketplace().fee()` now accepts the price argument as both a number (int/float) and a literal string

0.4.0 / 2014-10-15
==================
  * Use `strict`
  * Added local authentication check for the `database().search()` function

0.3.4 / 2014-07-30
==================
  * Added `user().contributions()` and `user().submissions()` for the newly implemented endpoints

0.3.3 / 2014-07-08
==================
  * Discogs has fixed the `/images/<filename>` endpoint, so changed `database().image()` accordingly

0.3.2 / 2014-07-01
==================
  * Added `about()` function to get general info about the Discogs API and the `disconnect` client

0.3.1 / 2014-06-26
==================
  * Fixed a litte bug in the calculation of free positions in the request queue
  * Started adding unit tests using `wru`

0.3.0 / 2014-06-24
==================
  * Added automatic request throttle of 1 request per second queueing up to 10 requests
  * Exposed the request queueing functions in `util.queue`

0.2.1 / 2014-06-20
==================
  * Fixed data encoding bug for gzipped response from `0.2.0`
  * First implementation of generic error handling using custom `Error` objects containing the HTTP status code

0.2.0 / 2014-06-19
==================
  * Implemented/fixed broken `database().image()` function from `0.1.1`
  * Added rate limiting header info to the callback params

0.1.1 / 2014-06-18
==================
  * Added `HISTORY.md`
  * Fixed some object reference bugs 
  * Compacted the `DiscogsClient` constructor
  * Added the collection folder functions
  * Added the `image` function to the `database` namespace

0.1.0 / 2014-06-18
==================
  * Initial public release