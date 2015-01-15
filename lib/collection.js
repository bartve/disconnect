'use strict';

var util = require('./util.js'),
	AuthError = require('./error.js').AuthError;

module.exports = function(client){
	var collection = {};
	
	/**
	 * Get metadata for a specified collection folder or list all collection folders
	 * @param {string} user - The user name
	 * @param {number|string} [folder] - An optional folder ID
	 * @param {function} [callback] - The callback
	 */
	
	collection.folders = function(user, folder, callback){
		var url = '/users/'+user+'/collection/folders';
		if((arguments.length === 2) && (typeof folder === 'function')){ // Get all folders
			client.get(url, folder);
		}else{ // Get a specific folder
			if(client.authenticated(2) || (parseInt(folder, 10) === 0)){
				url += '/'+folder;
				client.get(url, callback);
			}else{
				callback(new AuthError());
			}
		}
	};
	
	/**
	 * Add a new collection folder
	 * @param {string} user - The user name
	 * @param {string} name - The folder name
	 * @param {function} [callback] - The callback
	 */
	
	collection.addFolder = function(user, name, callback){
		client.post({url: '/users/'+util.escape(user)+'/collection/folders', authLevel: 2}, {name: name}, callback);
	};
	
	/**
	 * Change a folder name. The name of folder 0 and 1 can't be changed.
	 * @param {string} user - The user name
	 * @param {(number|string)}	folder - The folder ID
	 * @param {string} name - The new folder name
	 * @param {function} [callback] - The callback
	 */
	
	collection.editFolder = function(user, folder, name, callback){
		client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+folder, authLevel: 2}, {name: name}, callback);
	};
	
	/**
	 * Delete a folder. A folder must be empty before it can be deleted.
	 * @param {string} user - The user name
	 * @param {(number|string)}	folder - The folder ID
	 * @param {function} [callback] - The callback
	 */
	
	collection.deleteFolder = function(user, folder, callback){
		client.delete({url: '/users/'+util.escape(user)+'/collection/folders/'+folder, authLevel: 2}, callback);
	};
	
	/**
	 * Get the releases in a user's collection folder (0 = public folder)
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {object} [params] - Optional extra paging and sorting params, see url above
	 * @param {function} [callback] - The callback
	 */
	
	collection.releases = function(user, folder, params, callback){
		if(client.authenticated(2) || (parseInt(folder, 10) === 0)){
			var path = '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases';
			if((arguments.length === 3) && (typeof params === 'function')){
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
	 * Add a release instance to the given collection folder
	 * @param {string} user - The user name
	 * @param {(number|string)} [folder] - The folder ID (defaults to the "Uncategorized" folder)
	 * @param {(number|string)} release - The release ID
	 * @param {function} [callback] - The callback
	 */
	
	collection.addRelease = function(user, folder, release, callback){
		if((arguments.length === 3) && (typeof params === 'function')){
			release = folder; folder = 1; callback = release;
		}
		client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+(folder||1)+'/releases/'+release, authLevel: 2}, null, callback);
	};
	
	/**
	 * Edit a release instance in the given collection folder
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {(number|string)} release - The release ID
	 * @param {(number|string)} instance - The release instance ID
	 * @param {object} data - The instance data {rating: 4, folder_id: 1532}
	 * @param {function} [callback] - The callback
	 */
	
	collection.editRelease = function(user, folder, release, instance, data, callback){
		client.post({url: '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, authLevel: 2}, data, callback);
	};
	
	/**
	 * Delete a release instance from the given folder
	 * @param {string} user - The user name
	 * @param {(number|string)} folder - The folder ID
	 * @param {(number|string)} release - The release ID
	 * @param {(number|string)} instance - The release instance ID
	 * @param {function} [callback] - The callback
	 */
	
	collection.removeRelease = function(user, folder, release, instance, callback){
		client.delete({url: '/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, authLevel: 2}, callback);
	};
	
	return collection;
};