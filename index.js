'use strict';

const Util = require('./lib/util.js'),
    DiscogsClient = require('./lib/client.js');

/**
 * Expose the DiscogsClient and Util classes
 */
module.exports = {
    Client: DiscogsClient,
    Util: Util,
    /** @deprecated Use Util instead */
    util: Util
};