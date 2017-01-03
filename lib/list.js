'use strict';

const Util = require('./util.js');

/**
 * DiscogsList class definition
 */
class DiscogsList {

    /**
     * Object constructor
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @return {DiscogsList}
     */
    constructor(client) {
        this.client = client;
    }
    
    /**
     * Get the items in a list by list ID
     * @param {(number|string)} list - The list ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getItems(list, params, callback) {
        let path = '/lists/' + Util.escape(list);
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }
}

module.exports = DiscogsList;