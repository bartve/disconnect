'use strict';

var util = require('./util.js'),
	AuthError = require('./error.js').AuthError;

module.exports = function(client){
	var collection = {};
	
	/**
	 * Get metadata for a specified collection folder or list all collection folders
	 * @param {String} user - The user name
	 * @param {Integer} [folder] - An optional folder ID
	 * @param {Function} [callback] - The callback
	 */
	
	collection.folders = function(user, folder, callback){
		var url = '/users/'+user+'/collection/folders';
		if((arguments.length === 2) && (typeof folder === 'function')){
			callback = folder;
		}else{
			url += '/'+folder;
		}
		client.get(url, callback);
	};
	
	/**
	 * Add a new collection folder
	 * @param {String} user - The user name
	 * @param {String} name - The folder name
	 * @param {Function} [callback] - The callback
	 */
	
	collection.addFolder = function(user, name, callback){
		if(client.authenticated()){
			client.post('/users/'+util.escape(user)+'/collection/folders', {name: name}, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Change a folder name. The name of folder 0 and 1 can't be changed.
	 * @param {String} user - The user name
	 * @param {Integer}	folder - The folder ID
	 * @param {String} name - The new folder name
	 * @param {Function} [callback] - The callback
	 */
	
	collection.editFolder = function(user, folder, name, callback){
		if(client.authenticated()){
			client.post('/users/'+util.escape(user)+'/collection/folders/'+folder, {name: name}, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Delete a folder. A folder must be empty before it can be deleted.
	 * @param {String} user - The user name
	 * @param {Integer}	folder - The folder ID
	 * @param {Function} [callback] - The callback
	 */
	
	collection.deleteFolder = function(user, folder, callback){
		if(client.authenticated()){
			client.delete('/users/'+util.escape(user)+'/collection/folders/'+folder, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Get the releases in a user's collection folder
	 * http://www.discogs.com/developers/resources/user/collection.html#list-releases-in-folder
	 * @param {String} user - The user name
	 * @param {Integer} folder - The folder ID
	 * @param {Object} [params] - Optional extra paging and sorting params, see url above
	 * @param {Function} [callback] - The callback
	 */
	
	collection.releases = function(user, folder, params, callback){
		if(client.authenticated() || folder === 0){
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
	 * @param {String} user - The user name
	 * @param {Integer} folder - The folder ID
	 * @param {Integer} release - The release ID
	 * @param {Function} [callback] - The callback
	 */
	
	collection.addRelease = function(user, folder, release, callback){
		if(client.authenticated()){
			folder = folder||1;
			client.post('/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release, null, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Edit a release instance in the given collection folder
	 * @param {String} user - The user name
	 * @param {Integer} folder - The folder ID
	 * @param {Integer} release - The release ID
	 * @param {Instance} instance - The release instance ID
	 * @param {Object} data - The instance data {rating: 4, folder_id: 1532}
	 * @param {Function} [callback] - The callback
	 */
	
	collection.editRelease = function(user, folder, release, instance, data, callback){
		if(client.authenticated()){
			client.post('/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, data, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	/**
	 * Delete a release instance from the given folder
	 * @param {String} user - The user name
	 * @param {Integer} folder - The folder ID
	 * @param {Integer} release - The release ID
	 * @param {Instance} instance - The release instance ID
	 * @param {Function} [callback] - The callback
	 */
	
	collection.removeRelease = function(user, folder, release, instance, callback){
		if(client.authenticated()){
			client.delete('/users/'+util.escape(user)+'/collection/folders/'+folder+'/releases/'+release+'/instances/'+instance, callback);
		}else{
			callback(new AuthError());
		}
	};
	
	return collection;
};