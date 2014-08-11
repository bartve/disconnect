'use strict';

var discogs = module.exports = {};

/**
 * Expose Discogs utility function library
 */
 
discogs.util = require('./lib/util.js');

/**
 * Expose Discogs Client class
 */

discogs.Client = require('./lib/client.js');