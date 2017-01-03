'use strict';

const Util = require('./util.js'),
    DiscogsUser = require('./user.js');

/**
 * DiscogsMarketplace class definition
 */
class DiscogsMarketplace {

    /**
     * Object constructor
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @return {DiscogsMarketplace}
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Get a marketplace listing
     * @param {(number|string)} listing - The listing ID
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getListing(listing, callback) {
        return this.client.get('/marketplace/listings/' + listing, callback);
    }

    /**
     * Create a marketplace listing
     * @param {object} data - The data for the listing
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    addListing(data, callback) {
        return this.client.post({url: '/marketplace/listings', authLevel: 2}, data, callback);
    }

    /**
     * Edit a marketplace listing
     * @param {(number|string)} listing - The listing ID 
     * @param {object} data - The data for the listing
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    editListing(listing, data, callback) {
        return this.client.post({url: '/marketplace/listings/' + listing, authLevel: 2}, data, callback);
    }

    /**
     * Delete a marketplace listing
     * @param {(number|string)} [listing] - The listing ID 
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    deleteListing(listing, callback) {
        return this.client.delete({url: '/marketplace/listings/' + listing, authLevel: 2}, callback);
    }

    /**
     * Get a list of the authenticated user's orders
     * @param {object} [params] - Optional sorting and pagination params
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getOrders(params, callback) {
        let path = '/marketplace/orders';
        if ((arguments.length === 1) && (typeof params === 'function')) {
            callback = params;
        } else if (typeof params === 'object') {
            path = Util.addParams(path, params);
        }
        return this.client.get({url: path, authLevel: 2}, callback);
    }

    /**
     * Get details of a marketplace order
     * @param {string} order - The order ID 
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getOrder(order, callback) {
        return this.client.get({url: '/marketplace/orders/' + order, authLevel: 2}, callback);
    }

    /**
     * Edit a marketplace order
     * @param {string} order - The order ID 
     * @param {object} data - The data for the order
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    editOrder(order, data, callback) {
        return this.client.post({url: '/marketplace/orders/' + order, authLevel: 2}, data, callback);
    }

    /**
     * List the messages for the given order ID
     * @param {string} order - The order ID
     * @param {object} [params] - Optional pagination parameters 
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getOrderMessages(order, params, callback) {
        let path = '/marketplace/orders/' + order + '/messages';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get({url: path, authLevel: 2}, callback);
    }

    /**
     * Add a message to the given order ID
     * @param {string} order - The order ID
     * @param {object} data - The message data 
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    addOrderMessage(order, data, callback) {
        return this.client.post({url: '/marketplace/orders/' + order + '/messages', authLevel: 2}, data, callback);
    }

    /**
     * Get the marketplace fee for a given price
     * @param {(number|string)} price - The price as a number or string
     * @param {string} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getFee(price, currency, callback) {
        let path = '/marketplace/fee/' + ((typeof price === 'number') ? price.toFixed(2) : price);
        if ((arguments.length === 2) && (typeof currency === 'function')) {
            callback = currency;
        } else if (currency) { // Get the fee in a given currency
            path += '/' + currency;
        }
        return this.client.get(path, callback);
    }

    /**
     * Get price suggestions for a given release ID in the user's selling currency
     * @param {(number|string)} release - The release ID
     * @param {function} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    getPriceSuggestions(release, callback) {
        return this.client.get({url: '/marketplace/price_suggestions/' + release, authLevel: 2}, callback);
    }
}

/**
 * Copy the getInventory function from the DiscogsUser class
 */
DiscogsMarketplace.prototype.getInventory = DiscogsUser.prototype.getInventory;

/**
 * Expose DiscogsMarketplace;
 */
module.exports = DiscogsMarketplace;