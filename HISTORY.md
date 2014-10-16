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