'use strict';

var util = require('./util.js'),
	deprecate = require('depd')('disconnect');

module.exports = function(client){
	var database = {};

	/**
	 * Expose Discogs database status constants
	 */
 
	database.status = { accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected' };
	
	/**
	 * Get artist data
	 * @param {(number|string)} artist - The Discogs artist ID
	 * @param {object} [options] - Show releases by the artist + pagination params
	 * @param {function} [callback] - Callback function
	 */

	database.getArtist = function(artist, callback){
		client.get('/artists/'+artist, callback);
	};
	
	database.artist = deprecate.function(database.getArtist, 
		'database.artist: Use database.getArtist instead');

	/**
	 * Get artist release data
	 * @param {(number|string)} artist - The Discogs artist ID
	 * @param {object} [params] - Optional pagination params
	 * @param {function} [callback] - Callback function
	 */
	database.getArtistReleases = function(artist, params, callback){
		var path = '/artists/'+artist+'/releases';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	database.artistReleases = deprecate.function(database.getArtistReleases, 
		'database.artistReleases: Use database.getArtistReleases instead');

	/**
	 * Get release data
	 * @param {(number|string)} release - The Discogs release ID
	 * @param {function} [callback] - Callback function
	 */
	 
	database.getRelease = function(release, callback){
		client.get('/releases/'+release, callback);
	};
	
	database.release = deprecate.function(database.getRelease, 
		'database.release: Use database.getRelease instead');
	
	/**
	 * Get the release rating for the given user
	 * @param {(number|string)} release - The Discogs release ID
	 * @param {string} user - The Discogs user name
	 * @param {function} [callback] - Callback function
	 */
	 
	database.getReleaseRating = function(release, user, callback){
		client.get('/releases/'+release+'/rating/'+util.escape(user), callback);
	};
	
	/**
	 * Set (or remove) a release rating for the given logged in user
	 * @param {(number|string)} release - The Discogs release ID
	 * @param {string} user - The Discogs user name
	 * @param {number} rating - The new rating for a release between 1 and 5. Null = remove rating
	 * @param {function} [callback] - Callback function
	 */
	 
	database.setReleaseRating = function(release, user, rating, callback){
		var url = '/releases/'+release+'/rating/'+util.escape(user);
		if(!rating){
			client.delete({url: url, authLevel: 2}, callback);
		}else{
			client.put({url: url, authLevel: 2}, {rating: ((rating > 5) ? 5 : rating)}, callback);
		}
	};

	/**
	 * Get master release data
	 * @param {(number|string)} master - The Discogs master release ID
	 * @param {function} [callback] - Callback function
	 */

	database.getMaster = function(master, callback){
		client.get('/masters/'+master, callback);
	};
	
	database.master = deprecate.function(database.getMaster, 
		'database.master: Use database.getMaster instead');

	/**
	 * Get the release versions contained in the given master release
	 * @param {(number|string)} master - The Discogs master release ID
	 * @param {object} [params] - optional pagination params
	 * @param {function} [callback] - Callback function
	 */

	database.getMasterVersions = function(master, params, callback){
		var path = '/masters/'+master+'/versions';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	database.masterVersions = deprecate.function(database.getMasterVersions, 
		'database.masterVersions: Use database.getMasterVersions instead');

	/**
	 * Get label data
	 * @param {(number|string)} label - The Discogs label ID
	 * @param {function} [callback] - Callback function
	 */
	 
	database.getLabel = function(label, callback){
		client.get('/labels/'+label, callback);
	};
	
	database.label = deprecate.function(database.getLabel, 
		'database.label: Use database.getLabel instead');

	/**
	 * Get label release data
	 * @param {(number|string)} label - The Discogs label ID
	 * @param {object} [params] - Optional pagination params
	 * @param {function} [callback] - Callback function
	 */
	
	database.getLabelReleases = function(label, params, callback){
		var path = '/labels/'+label+'/releases';
		if((arguments.length === 2) && (typeof params === 'function')){
			callback = params;
		}else{
			path = util.addParams(path, params);
		}
		client.get(path, callback);
	};
	
	database.labelReleases = deprecate.function(database.getLabelReleases, 
		'database.labelReleases: Use database.getLabelReleases instead');
	
	/**
	 * Get an image
	 * @param {string} url - The full image url
	 * @param {function} [callback] - Callback function
	 */
	 
	database.getImage = function(url, callback){
		client.get({url: url, encoding: 'binary', queue: false, json: false}, callback);
	};
	
	database.image = deprecate.function(database.getImage, 
		'database.image: Use database.getImage instead');

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
		if(query){ obj.q = query; }
		client.get({url: util.addParams('/database/search', obj), authLevel: 1}, callback);
	};
	
	return database;
};