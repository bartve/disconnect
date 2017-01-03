'use strict';

const Util = require('./util.js'),
    SectionFactory = require('./factory.js'),
    DiscogsCollection = require('./collection.js'),
    DiscogsWantlist = require('./wantlist.js'),
    DiscogsList = require('./list.js');

/**
 * DiscogsUser class definition
 */
class DiscogsUser {

    /**
     * Object constructor
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @return {DiscogsUser}
     */
    constructor(client) {
        this.client = client;
    }
    
    /**
     * Get the profile for the given user
     * @param {string} user - The user name
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getProfile(user, callback) {
        return this.client.get('/users/' + Util.escape(user), callback);
    }

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Extra params like status, sort and sort_order, pagination
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getInventory(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/inventory';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Get the contributions for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination and sorting params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getContributions(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/contributions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Get the submissions for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getSubmissions(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/submissions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Get the lists for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getLists(user, params, callback) {
        let path = '/users/' + Util.escape(user) + '/lists';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else { // Add pagination params when present
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }
    
    /**
     * Test authentication by getting the identity resource for the authenticated user
     * @param {function} callback - Callback function receiving the data
     * @return {DiscogsClient|Promise}
     */
    getIdentity(callback) {
        return this.client.getIdentity(callback);
    }
    
    /**
     * Expose the collection functions
     * @returns {DiscogsCollection}
     */
    collection() {
       return SectionFactory.get(DiscogsCollection, this.client);
    }
    
    /**
     * Expose the wantlist functions
     * @returns {DiscogsWantlist}
     */
    wantlist() {
       return SectionFactory.get(DiscogsWantlist, this.client);
    }
    
    /**
     * Expose the list functions
     * @returns {DiscogsList}
     */
    list() {
       return SectionFactory.get(DiscogsList, this.client);
    }
}

/**
 * Expose DiscogsUser
 */
module.exports = DiscogsUser;