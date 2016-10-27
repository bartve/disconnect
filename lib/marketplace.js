'use strict';

var util = require('./util.js');

module.exports = function(client){
	var marketplace = {};
	
	/**
	 * Copy the getInventory function from the user module
	 */
	
	marketplace.getInventory = require('./user.js')(client).getInventory;
	
	/**
	 * Get a marketplace listing
	 * @param {(number|string)} listing - The listing ID
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getListing = function(listing, callback){
		return client.get('/marketplace/listings/'+listing, callback);
	};
	
	/**
	 * Create a marketplace listing
	 * @param {object} data - The data for the listing
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.addListing = function(data, callback){
		return client.post({url: '/marketplace/listings', authLevel: 2}, data, callback);
	};
	
	/**
	 * Edit a marketplace listing
	 * @param {(number|string)} listing - The listing ID 
	 * @param {object} data - The data for the listing
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.editListing = function(listing, data, callback){
		return client.post({url: '/marketplace/listings/'+listing, authLevel: 2}, data, callback);
	};
	
	/**
	 * Delete a marketplace listing
	 * @param {(number|string)} [listing] - The listing ID 
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.deleteListing = function(listing, callback){
		return client.delete({url: '/marketplace/listings/'+listing, authLevel: 2}, callback);
	};
	
	/**
	 * Get a list of the authenticated user's orders
	 * @param {object} [params] - Optional sorting and pagination params
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getOrders = function(params, callback){
		var path = '/marketplace/orders';
		if((arguments.length === 1) && (typeof params === 'function')){
			callback = params;
		}else if(typeof params === 'object'){
			path = util.addParams(path, params);
		}
		return client.get({url: path, authLevel: 2}, callback);
	};
	
	/**
	 * Get details of a marketplace order
	 * @param {string} order - The order ID 
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getOrder = function(order, callback){
		return client.get({url: '/marketplace/orders/'+order, authLevel: 2}, callback);
	};
	
	/**
	 * Edit a marketplace order
	 * @param {string} order - The order ID 
	 * @param {object} data - The data for the order
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.editOrder = function(order, data, callback){
		return client.post({url: '/marketplace/orders/'+order, authLevel: 2}, data, callback);
	};
	
	/**
	 * List the messages for the given order ID
	 * @param {string} order - The order ID
	 * @param {object} [params] - Optional pagination parameters 
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getOrderMessages = function(order, params, callback){
		var path = '/marketplace/orders/'+order+'/messages';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		return client.get({url: path, authLevel: 2}, callback);
	};
	
	/**
	 * Add a message to the given order ID
	 * @param {string} order - The order ID
	 * @param {object} data - The message data 
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.addOrderMessage = function(order, data, callback){
		return client.post({url: '/marketplace/orders/'+order+'/messages', authLevel: 2}, data, callback);
	};
	
	/**
	 * Get the marketplace fee for a given price
	 * @param {(number|string)} price - The price as a number or string
	 * @param {string} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getFee = function(price, currency, callback){
		var path = '/marketplace/fee/'+((typeof price === 'number') ? price.toFixed(2) : price);
		if((arguments.length === 2) && (typeof currency === 'function')){
			callback = currency;
		}else if(currency){ // Get the fee in a given currency
			path += '/'+currency;
		}
		return client.get(path, callback);
	};
	
	/**
	 * Get price suggestions for a given release ID in the user's selling currency
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	marketplace.getPriceSuggestions = function(release, callback){
		return client.get({url: '/marketplace/price_suggestions/'+release, authLevel: 2}, callback);
	};
	
	return marketplace;
};