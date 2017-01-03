'use strict';

const Util = require('./util.js');

/**
 * DiscogsWantlist class definition
 */
class DiscogsWantlist {

    /**
     * Object constructor
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @return {DiscogsWantlist}
     */
    constructor(client) {
        this.client = client;
    }
    
    /**
     * Get the list of wantlisted releases for the given user name
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getReleases(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/wants';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Add a release to the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {object} [data] - Optional notes and rating 
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    addRelease(user, release, data, callback) {
        let realData = data;
        if ((arguments.length === 3) && (typeof data === 'function')) {
            callback = data;
            realData = null;
        }
        return this.client.put({url: '/users/' + Util.escape(user) + '/wants/' + release, authLevel: 2}, realData, callback);
    }

    /**
     * Edit the notes or rating on a release in the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {object} data - The notes and rating {notes: 'Test', rating: 4}
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    editNotes(user, release, data, callback) {
        return this.client.put({url: '/users/' + Util.escape(user) + '/wants/' + release, authLevel: 2}, data, callback);
    }

    /**
     * Remove a release from the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    removeRelease(user, release, callback) {
        return this.client.delete({url: '/users/' + Util.escape(user) + '/wants/' + release, authLevel: 2}, callback);
    }
}

/**
 * Expose DiscogsWantlist
 */
module.exports = DiscogsWantlist;