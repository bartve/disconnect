'use strict';

var util = require('./util.js');

module.exports = function(client){
	var user = {};
	
	/**
	 * Get the profile for the given user
	 * @param {string} user - The user name
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */

	user.getProfile = function(user, callback){
		return client.get('/users/'+util.escape(user), callback);
	};
	
	/**
	 * Get the inventory for the given user
	 * @param {string} user - The user name
	 * @param {object} [params] - Extra params like status, sort and sort_order, pagination
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */

	user.getInventory = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/inventory';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add pagination params when present
			path = util.addParams(path, params);
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
	
	user.collection = function(){
		return require('./collection.js')(client);
	};
	
	/**
	 * Expose the wantlist functions and pass the client instance
	 * @returns {object}
	 */
	
	user.wantlist = function(){
		return require('./wantlist.js')(client);
	};
	
	/**
	 * Expose the list functions and pass the client instance
	 * @returns {object}
	 */
	
	user.list = function(){
		return require('./list.js')(client);
	};
	
	/**
	 * Get the contributions for the given user
	 * @param {string} user - The user name
	 * @param {object} [params] - Optional pagination and sorting params
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	user.getContributions = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/contributions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add pagination params when present
			path = util.addParams(path, params);
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
	
	user.getSubmissions = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/submissions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add pagination params when present
			path = util.addParams(path, params);
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
	
	user.getLists = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/lists';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add pagination params when present
			path = util.addParams(path, params);
		}
		return client.get(path, callback);
	};
	
	return user;
};