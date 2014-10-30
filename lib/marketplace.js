'use strict';

var util = require('./util.js');

module.exports = function(client){
	var marketplace = {};
	
	/**
	 * Copy the inventory function from the user module
	 */
	
	marketplace.inventory = require('./user.js')(client).inventory;
	
	/**
	 * Get a marketplace listing
	 * @param {(number|string)} listing - The listing ID
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.listing = function(listing, callback){
		client.get('/marketplace/listings/'+listing, callback);
	};
	
	/**
	 * Create a marketplace listing
	 * @param {object} data - The data for the listing
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.addListing = function(data, callback){
		client.post({url: '/marketplace/listings', requireAuth: true}, data, callback);
	};
	
	/**
	 * Edit a marketplace listing
	 * @param {(number|string)} listing - The listing ID 
	 * @param {object} data - The data for the listing
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.editListing = function(listing, data, callback){
		client.post({url: '/marketplace/listings/'+listing, requireAuth: true}, data, callback);
	};
	
	/**
	 * Delete a marketplace listing
	 * @param {(number|string)} [listing] - The listing ID 
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.deleteListing = function(listing, callback){
		client.delete({url: '/marketplace/listings/'+listing, requireAuth: true}, callback);
	};
	
	/**
	 * List your orders or get the details of one order
	 * @param {object|number} [params] - The optional sorting and pagination params or the order ID
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.orders = function(params, callback){
		var path = '/marketplace/orders';
		if((arguments.length === 1) && (typeof params === 'function')){
			callback = params;
		}else{
			if(isNaN(params)){
				path = util.addParams(path, params);
			}else{ // Params is the order ID
				path += '/'+params;
			}
		}
		client.get({url: path, requireAuth: true}, callback);
	};
	
	/**
	 * Edit a marketplace order
	 * @param {(number|string)} order - The order ID 
	 * @param {object} data - The data for the order
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.editOrder = function(order, data, callback){
		client.post({url: '/marketplace/orders/'+order, requireAuth: true}, data, callback);
	};
	
	/**
	 * List the messages for the given order ID
	 * @param {(number|string)} order - The order ID
	 * @param {object} [params] - Optional paging parameters 
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.orderMessages = function(order, params, callback){
		var path = '/marketplace/orders/'+order+'/messages';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get({url: path, requireAuth: true}, callback);
	};
	
	/**
	 * Add a message to the given order ID
	 * @param {(number|string)} order - The order ID
	 * @param {object} data - The message data 
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.orderAddMessage = function(order, data, callback){
		client.post({url: '/marketplace/orders/'+order+'/messages', requireAuth: true}, data, callback);
	};
	
	/**
	 * Get the marketplace fee for a given price
	 * @param {(number|string)} price - The price as a number or string
	 * @param {string} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.fee = function(price, currency, callback){
		var path = '/marketplace/fee/'+((typeof price === 'number') ? price.toFixed(2) : price);
		if((arguments.length === 2) && (typeof currency === 'function')){
			callback = currency;
		}else if(currency){ // Get the fee in a given currency
			path += '/'+currency;
		}
		client.get(path, callback);
	};
	
	/**
	 * Get price suggestions for a given release ID
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 */
	
	marketplace.suggestPrice = function(release, callback){
		client.get({url: '/marketplace/price_suggestions/'+release, requireAuth: true}, callback);
	};
	
	return marketplace;
};