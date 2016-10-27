'use strict';

var util = require('./util.js');

module.exports = function(client){
	var wantlist = {};
	
	/**
	 * Get the list of wantlisted releases for the given user name
	 * @param {string} user - The user name
	 * @param {object} [params] - Optional pagination params
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	wantlist.getReleases = function(user, params, callback){
		var path = '/users/'+util.escape(user)+'/wants';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		return client.get(path, callback);
	};
	
	/**
	 * Add a release to the user's wantlist
	 * @param {string} user - The user name
	 * @param {(number|string)} release - The release ID
	 * @param {object} [data] - Optional notes and rating 
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	wantlist.addRelease = function(user, release, data, callback){
		var _data = data;
		if((arguments.length === 3) && (typeof data === 'function')){
			callback = data;
			_data = null;
		}
		return client.put({url: '/users/'+util.escape(user)+'/wants/'+release, authLevel: 2}, _data, callback);
	};
	
	/**
	 * Edit the notes or rating on a release in the user's wantlist
	 * @param {string} user - The user name
	 * @param {(number|string)} release - The release ID
	 * @param {object} data - The notes and rating {notes: 'Test', rating: 4}
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	wantlist.editNotes = function(user, release, data, callback){
		return client.put({url: '/users/'+util.escape(user)+'/wants/'+release, authLevel: 2}, data, callback);
	};
	
	/**
	 * Remove a release from the user's wantlist
	 * @param {string} user - The user name
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 * @return {DiscogsClient|Promise}
	 */
	
	wantlist.removeRelease = function(user, release, callback){
		return client.delete({url: '/users/'+util.escape(user)+'/wants/'+release, authLevel: 2}, callback);
	};
	
	return wantlist;
};