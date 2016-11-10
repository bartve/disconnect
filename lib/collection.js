'use strict';

var util = require('./util.js'),
	AuthError = require('./error.js').AuthError;

module.exports = function(client){
	var collection = {};
	
	/**
	 * Get a list of all collection folders for the given user
	 * @param {string} user - The user name
	 * @param {function} callback - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.getFolders = function(user, callback){
		return client.get('/users/'+util.escape(user)+'/collection/folders', callback);
	};
	
	/**
	 * Get metadata for a specified collection folder
	 * @param {string} user - The Discogs user name
	 * @param {number|string} folder - A folder ID (0 = public folder)
	 * @param {function} callback - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.getFolder = function(user, folder, callback){
		if(client.authenticated(2) || (parseInt(folder, 10) === 0)){
			return client.get('/users/'+util.escape(user)+'/collection/folders/'+folder, callback);
		}else if(typeof callback === 'function'){
			callback(new AuthError());
			return client;
		}else{
			return Promise.reject(new AuthError());
		}
	};
	
	/**
	 * Add a new collection folder
	 * @param {string} user - The user name
	 * @param {string} name - The folder name
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.addFolder = function(user, name, callback){
		return client.post({url: '/users/'+util.escape(user)+'/collection/folders', authLevel: 2}, {name: name}, callback);
	};
	
	/**
	 * Change a folder name. The name of folder 0 and 1 can't be changed.
	 * @param {string} user - The user name
	 * @param {(number|string)}	folder - The folder ID
	 * @param {string} name - The new folder name
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.setFolderName = function(user, folder, name, callback){
		return client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+folder, authLevel: 2}, {name: name}, callback);
	};
	
	/**
	 * Delete a folder. A folder must be empty before it can be deleted.
	 * @param {string} user - The user name
	 * @param {(number|string)}	folder - The folder ID
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.deleteFolder = function(user, folder, callback){
		return client.delete({url: '/users/'+util.escape(user)+'/collection/folders/'+folder, authLevel: 2}, callback);
	};
	
	/**
	 * Get the releases in a user's collection folder (0 = public folder)
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {object} [params] - Optional extra pagination and sorting params, see url above
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.getReleases = function(user, folder, params, callback){
		if(client.authenticated(2) || (parseInt(folder, 10) === 0)){
			var path = '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases';
			if((arguments.length === 3) && (typeof params === 'function')){
				callback = params;
			}else{
				path = util.addParams(path, params);
			}
			return client.get(path, callback);
		}else if(typeof callback === 'function'){
			callback(new AuthError());
			return client;
		}else{
			return Promise.reject(new AuthError());
		}
	};
	
	/**
	 * Get the instances of a release in a user's collection
	 * @param {string} user - The user name
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.getReleaseInstances = function(user, release, callback){
		return client.get('/users/'+util.escape(user)+'/collection/releases/'+release, callback);
	};
	
	/**
	 * Add a release instance to the (optionally) given collection folder
	 * @param {string} user - The user name
	 * @param {(number|string)} [folder] - The folder ID (defaults to the "Uncategorized" folder)
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.addRelease = function(user, folder, release, callback){
		if((arguments.length === 3) && (typeof release === 'function')){
			callback = release; release = folder; folder = 1;
		}
		return client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+(folder||1)+'/releases/'+release, authLevel: 2}, null, callback);
	};
	
	/**
	 * Edit a release instance in the given collection folder
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {(number|string)} release - The release ID
	 * @param {(number|string)} instance - The release instance ID
	 * @param {object} data - The instance data {rating: 4, folder_id: 1532}
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.editRelease = function(user, folder, release, instance, data, callback){
		return client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, authLevel: 2}, data, callback);
	};
	
	/**
	 * Delete a release instance from the given folder
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {(number|string)} release - The release ID
	 * @param {(number|string)} instance - The release instance ID
	 * @param {function} [callback] - The callback
	 * @returns {DiscogsClient|Promise}
	 */
	
	collection.removeRelease = function(user, folder, release, instance, callback){
		return client.delete({url: '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, authLevel: 2}, callback);
	};
	
	return collection;
};