'use strict';

const Util = require('./util.js'),
    collection = require('./collection.js'),
    wantlist = require('./wantlist.js'),
    list = require('./list.js');

module.exports = function(client) {
    const user = {};

    /**
     * Get the profile for the given user
     * @param {string} user - The user name
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getProfile = function(user, callback) {
        return client.get('/users/' + Util.escape(user), callback);
    };

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Extra params like status, sort and sort_order, pagination
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getInventory = function(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/inventory';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Copy the client getIdentity function to the user module
     */
    user.getIdentity = client.getIdentity;

    /**
     * Expose the collection functions and pass the client instance
     * @returns {object}
     */
    user.collection = function() {
        return collection(client);
    };

    /**
     * Expose the wantlist functions and pass the client instance
     * @returns {object}
     */
    user.wantlist = function() {
        return wantlist(client);
    };

    /**
     * Expose the list functions and pass the client instance
     * @returns {object}
     */
    user.list = function() {
        return list(client);
    };

    /**
     * Get the contributions for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination and sorting params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getContributions = function(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/contributions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get the submissions for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getSubmissions = function(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/submissions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get the lists for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getLists = function(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/lists';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    return user;
};