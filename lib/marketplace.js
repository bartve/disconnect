var util = require('./util.js'),
	AuthError = require('./error.js').AuthError;

module.exports = function(client){
	var marketplace = {};
	
	/**
	 * Copy the inventory function from the user module
	 */
	
	marketplace.inventory = require('./user.js')(client).inventory;
	
	/**
	 * Get a marketplace listing
	 * @param {Integer} listing - The listing ID
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.listing = function(listing, callback){
		client.get('/marketplace/listings/'+listing, callback);
	};
	
	/**
	 * Create a marketplace listing
	 * http://www.discogs.com/developers/resources/marketplace/listing.html#create-a-listing
	 * @param {Object} data - The data for the listing
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.addListing = function(data, callback){
		if(client.authenticated()){
			client.post('/marketplace/listings', data, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Edit a marketplace listing
	 * @param {Integer} listing - The listing ID 
	 * @param {Object} data - The data for the listing
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.editListing = function(listing, data, callback){
		if(client.authenticated()){
			client.post('/marketplace/listings/'+listing, data, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Delete a marketplace listing
	 * @param {Integer} [listing] - The listing ID 
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.deleteListing = function(listing, callback){
		if(client.authenticated()){
			client.delete('/marketplace/listings/'+listing, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * List your orders or get the details of one order
	 * http://www.discogs.com/developers/resources/marketplace/order.html#list-orders
	 * @param {Object|Integer} [params] - The optional sorting and pagination params or the order ID
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.orders = function(params, callback){
		if(client.authenticated()){
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
			client.get(path, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Edit a marketplace order
	 * http://www.discogs.com/developers/resources/marketplace/order.html#edit-an-order
	 * @param {Integer} order - The order ID 
	 * @param {Object} data - The data for the order
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.editOrder = function(order, data, callback){
		if(client.authenticated()){
			client.post('/marketplace/orders/'+order, data, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * List the messages for the given order ID
	 * @param {Integer} order - The order ID
	 * @param {Object} [params] - Optional paging parameters 
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.orderMessages = function(order, params, callback){
		if(client.authenticated()){
			var path = '/marketplace/orders/'+order+'/messages';
			if((arguments.length === 2) && (typeof params === 'function')){
				callback = params;
			}else{
				path = util.addParams(path, params);
			}
			client.get(path, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Add a message to the given order ID
	 * @param {Integer} order - The order ID
	 * @param {Object} data - The message data 
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.orderAddMessage = function(order, data, callback){
		if(client.authenticated()){
			client.post('/marketplace/orders/'+order+'/messages', data, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Get the marketplace fee for a given price
	 * @param {Float} price - The price as a float
	 * @param {String} [currency] - Optional currency as one of USD, GBP, EUR, CAD, AUD, or JPY. Defaults to USD.
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.fee = function(price, currency, callback){
		var path = '/marketplace/fee/'+price;
		if((arguments.length === 2) && (typeof currency === 'function')){
			callback = currency;
		}else if(currency){ // Get the fee in a given currency
			path += '/'+currency;
		}
		client.get(path, callback);
	};
	
	/**
	 * get price suggestions for a given release ID
	 * @param {Integer} release - The release ID
	 * @param {Function} [callback] - The callback
	 */
	
	marketplace.suggestPrice = function(release, callback){
		if(client.authenticated()){
			client.get('/marketplace/price_suggestions/'+release, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	return marketplace;
};