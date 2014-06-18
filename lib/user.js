var util = require('./util.js');

module.exports = function(client){
	var user = {};
	
	/**
	 * Get the profile for the given user
	 * @param {String} user - The user name
	 * @param {Function} [callback] - The callback
	 */

	user.profile = function(user, callback){
		client.get('/users/'+util.escape(user), callback);
	};
	
	/**
	 * Get the inventory for the given user
	 * @param {String} user - The user name
	 * @param {Object} [params] - Extra params like status, sort and sort_order, pagination
	 * @param {Function} [callback] - The callback
	 */

	user.inventory = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/inventory';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add paging params when present
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	/**
	 * Copy the identity function to the user module
	 */
 
	user.identity = client.identity;
	
	
	/**
	 * Expose the collection functions and pass the current instance
	 * @returns {Object}
	 */
	
	user.collection = function(){
		return require('./collection.js')(client);
	};
	
	/**
	 * Expose the wantlist functions and pass the current instance
	 * @returns {Object}
	 */
	
	user.wantlist = function(){
		return require('./wantlist.js')(client);
	};
	
	return user;
};

