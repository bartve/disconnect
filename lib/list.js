'use strict';

const Util = require('./util.js');

module.exports = function(client) {
    const list = {};

    /**
     * Get the items in a list by list ID
     * @param {(number|string)} list - The list ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    list.getItems = function(list, params, callback) {
        let path = '/lists/' + Util.escape(list);
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    return list;
};