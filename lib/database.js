var util = require('./util.js');

module.exports = function(client){
	var database = {};

	/**
	 * Expose Discogs database status constants
	 */
 
	database.status = { accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected' };
	
	/**
	 * Get artist data
	 * @param {Integer} artist - The Discogs artist ID
	 * @param {Object} [options] - Show releases by the artist + paging params
	 * @param {Function} [callback] - Callback function
	 */

	database.artist = function(artist, callback){
		client.get('/artists/'+artist, callback);
	};

	/**
	 * Get artist release data
	 * @param {Integer} artist - The Discogs artist ID
	 * @param {Object} [params] - Paging params
	 * @param {Function} [callback] - Callback function
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
	 * @param {Integer} release - The Discogs release ID
	 * @param {Function} [callback] - Callback function
	 */
	 
	database.release = function(release, callback){
		client.get('/releases/'+release, callback);
	};

	/**
	 * Get master release data
	 * @param {Integer} master - The Discogs master release ID
	 * @param {Function} [callback] - Callback function
	 */

	database.master = function(master, callback){
		client.get('/masters/'+master, callback);
	};

	/**
	 * Get the release versions contained in the given master release
	 * @param {Integer} master - The Discogs master release ID
	 * @param {Object} [params] - Paging params
	 * @param {Function} [callback] - Callback function
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
	 * @param {Integer} label - The Discogs label ID
	 * @param {Function} [callback] - Callback function
	 */
	 
	database.label = function(label, callback){
		client.get('/labels/'+label, callback);
	};
	
	/**
	 * Get an image
	 * @param {String} file - The image file name
	 * @param {Function} [callback] - Callback function
	 */
	 
	database.image = function(file, callback){
		if(client.authenticated()){
			client.get({url: '/image/'+file, encoding: 'binary'}, callback);
		}else{
			callback(new Error('You must be authenticated in order to retrieve an image.'));
		}
	};

	/**
	 * Search the database
	 * @param {String} query - The search query
	 * @param {Object} [params] - Search parameters as defined on http://www.discogs.com/developers/resources/database/search-endpoint.html
	 * @param {Function} [callback] - Callback function
	 */

	database.search = function(query, params, callback){
		var obj = {};
		if(arguments.length <= 2){
			(typeof params === 'function')&&(callback = params); // No extra search params, the callback is the second function param
		}else{
			obj = params;
		}
		obj.q = util.escape(query);
		client.get(util.addParams('/database/search', obj), callback);
	};
	
	return database;
};