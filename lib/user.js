'use strict';

var util = require('./util.js'),
	deprecate = require('depd')('disconnect');

module.exports = function(client){
	var user = {};
	
	/**
	 * Get the profile for the given user
	 * @param {string} user - The user name
	 * @param {function} [callback] - The callback
	 */

	user.getProfile = function(user, callback){
		client.get('/users/'+util.escape(user), callback);
	};
	
	user.profile = deprecate.function(user.getProfile, 
		'user.profile: Use user.getProfile instead');
	
	/**
	 * Get the inventory for the given user
	 * @param {string} user - The user name
	 * @param {object} [params] - Extra params like status, sort and sort_order, pagination
	 * @param {function} [callback] - The callback
	 */

	user.getInventory = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/inventory';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add paging params when present
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	user.inventory = deprecate.function(user.getInventory, 
		'user.inventory: Use user.getInventory instead');
	
	/**
	 * Copy the client getIdentity function to the user module
	 */
 
	user.getIdentity = client.getIdentity;
	
	user.identity = deprecate.function(user.getIdentity, 
		'user.identity: Use user.getIdentity instead');
	
	/**
	 * Expose the collection functions and pass the current instance
	 * @returns {object}
	 */
	
	user.collection = function(){
		return require('./collection.js')(client);
	};
	
	/**
	 * Expose the wantlist functions and pass the current instance
	 * @returns {object}
	 */
	
	user.wantlist = function(){
		return require('./wantlist.js')(client);
	};
	
	/**
	 * Get the contributions for the given user
	 * @param {string} user - The user name
	 * @param {object} [params] - Optional pagination params
	 * @param {function} [callback] - The callback
	 */
	
	user.getContributions = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/contributions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add paging params when present
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	user.contributions = deprecate.function(user.getContributions, 
		'user.contributions: Use user.getContributions instead');
	
	/**
	 * Get the submissions for the given user
	 * @param {string} user - The user name
	 * @param {object} [params] - Optional pagination params
	 * @param {function} [callback] - The callback
	 */
	
	user.getSubmissions = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/submissions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{ // Add paging params when present
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	user.submissions = deprecate.function(user.getSubmissions, 
		'user.submissions: Use user.getSubmissions instead');
	
	return user;
};