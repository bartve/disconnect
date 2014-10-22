'use strict';

var util = require('./util.js');

module.exports = function(client){
	var database = {};

	/**
	 * Expose Discogs database status constants
	 */
 
	database.status = { accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected' };
	
	/**
	 * Get artist data
	 * @param {(number|string)} artist - The Discogs artist ID
	 * @param {object} [options] - Show releases by the artist + paging params
	 * @param {function} [callback] - Callback function
	 */

	database.artist = function(artist, callback){
		client.get('/artists/'+artist, callback);
	};

	/**
	 * Get artist release data
	 * @param {(number|string)} artist - The Discogs artist ID
	 * @param {object} [params] - Paging params
	 * @param {function} [callback] - Callback function
	 */
	database.artistReleases = function(artist, params, callback){
		var path = '/artists/'+artist+'/releases';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};

	/**
	 * Get release data
	 * @param {(number|string)} release - The Discogs release ID
	 * @param {function} [callback] - Callback function
	 */
	 
	database.release = function(release, callback){
		client.get('/releases/'+release, callback);
	};

	/**
	 * Get master release data
	 * @param {(number|string)} master - The Discogs master release ID
	 * @param {function} [callback] - Callback function
	 */

	database.master = function(master, callback){
		client.get('/masters/'+master, callback);
	};

	/**
	 * Get the release versions contained in the given master release
	 * @param {(number|string)} master - The Discogs master release ID
	 * @param {object} [params] - Paging params
	 * @param {function} [callback] - Callback function
	 */

	database.masterVersions = function(master, params, callback){
		var path = '/masters/'+master+'/versions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};

	/**
	 * Get label data
	 * @param {(number|string)} label - The Discogs label ID
	 * @param {function} [callback] - Callback function
	 */
	 
	database.label = function(label, callback){
		client.get('/labels/'+label, callback);
	};
	
	/**
	 * Get an image
	 * @param {string} file - The image file name
	 * @param {function} [callback] - Callback function
	 */
	 
	database.image = function(file, callback){
		client.get({url: '/images/'+file, encoding: 'binary', requireAuth: true}, callback);
	};

	/**
	 * Search the database
	 * @param {string} query - The search query
	 * @param {object} [params] - Search parameters as defined on http://www.discogs.com/developers/#page:database,header:database-search
	 * @param {function} [callback] - Callback function
	 */

	database.search = function(query, params, callback){
		var obj = {};
		if(arguments.length <= 2){
			if(typeof params === 'function'){ callback = params; } // No extra search params, the callback is the second function param
		}else{
			obj = params;
		}
		obj.q = util.escape(query);
		client.get({url: util.addParams('/database/search', obj), requireAuth: true}, callback);
	};
	
	return database;
};