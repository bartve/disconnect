'use strict';

var https = require('https'),
	zlib = require('zlib'),
	url = require('url'),
	pkg = require('../package.json'),
	error = require('./error.js'),
	queue = require('./queue.js'),
	util = require('./util.js');

module.exports = DiscogsClient;

/**
 * Default configuration
 */

var defaultConfig = {
	host: 'api.discogs.com',
	port: 443,
	userAgent: 'DisConnectClient/'+pkg.version+' +'+pkg.homepage,
	outputFormat: 'discogs' // Possible values: 'discogs' / 'plaintext' / 'html'
};

/**
 * Object constructor
 * @param {string} [userAgent] - The name of the user agent to use to make API calls
 * @param {object} [auth] - Optional authorization data object
 * @returns {DiscogsClient}
 */

function DiscogsClient(userAgent, auth){
	// Allow the class to be called as a function, returning an instance
	if(!(this instanceof DiscogsClient)){
        return new DiscogsClient(userAgent, auth);
	}
	// Set the default configuration
	this.config = util.merge({}, defaultConfig);
	// Set the custom User Agent when provided
	if(typeof userAgent === 'string'){
		this.config.userAgent = userAgent;
	}
	// No userAgent provided, but instead we have an accessObject
	if((arguments.length === 1) && (typeof userAgent === 'object')){ auth = userAgent; }
	// Set auth data when provided
	if(auth && (typeof auth === 'object')){
		if(!auth.hasOwnProperty('method')){
			auth.method = 'discogs';
		}
		if(!auth.hasOwnProperty('level')){
			if(auth.userToken){
				auth.level = 2;
			}else if(auth.consumerKey && auth.consumerSecret){
				auth.level = 1;
			}
		}
		this.auth = util.merge({}, auth);
	}
}

/**
 * Override the default configuration
 * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
 * @returns {DiscogsClient}
 */
DiscogsClient.prototype.setConfig = function(customConfig){
	util.merge(this.config, customConfig);
	return this;
};

/**
 * Return whether the client is authenticated for the optionally given access level
 * @param {number} [level] - Optional authentication level
 * @returns {boolean}
 */

DiscogsClient.prototype.authenticated = function(level){
	level = level||0;
	return (this.auth && (this.auth.level > 0) && (this.auth.level >= level));
};

/**
 * Test authentication by getting the identity resource for the authenticated user
 * @param {function} callback - Callback function receiving the data
 */

DiscogsClient.prototype.identity = function(callback){
   this.get({url: '/oauth/identity', authLevel: 2}, callback);
};

/**
 * Get info about the Discogs API and this client
 * @param {function} callback - Callback function receiving the data
 */

DiscogsClient.prototype.about = function(callback){
	var self = this;
	this.get('', function(err, data){
		if(data){ 
			data.disconnect = {
				version: pkg.version, 
				userAgent: self.config.userAgent,
				authMethod: (self.auth ? self.auth.method : 'none'),
				authLevel: (self.auth ? self.auth.level : 0)
			};
		}
		callback(err, data);
	}); 
};

/**
 * Send a raw request
 * @param {object} options - Request options 
 * {
 *		url: '', // May be a relative path when accessing the discogs API
 *		method: '', // Defaults to GET
 *		data: {} // POST/PUT data as an object
 * }
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype._rawRequest = function(options, callback){
	var data = options.data||null,
		method = options.method||'GET',
		urlParts = url.parse(options.url),
		encoding = options.encoding||'utf8';
	
	// Build request headers
	var headers = {
		'User-Agent': this.config.userAgent,
		'Accept': 'application/json,application/vnd.discogs.v2.'+this.config.outputFormat+'+json,application/octet-stream',
		'Accept-Encoding': 'gzip,deflate',
		'Host': this.config.host,
		'Connection': 'close',
		'Content-Length': 0
	};
	
	// Add content headers for POST/PUT requests that contain data
	if(data){
		if(typeof data === 'object'){ data = JSON.stringify(data); } // Convert data to a JSON string when data is an object/array
		headers['Content-Type'] = 'application/json'; // Discogs accepts data in JSON format
		headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
	}
	
	// Add Authorization header when authenticated (or in the process of authenticating)
	if(this.auth && (this.auth.consumerKey || this.auth.userToken)){
		var authHeader = '';
		if(this.auth.method === 'oauth'){
			var OAuth = require('./oauth.js'),
				fullUrl = (urlParts.protocol && urlParts.host) ? urlParts.href : 'https://'+this.config.host+urlParts.path;
			authHeader = new OAuth(this.auth).toHeader(method, fullUrl);
		}else if(this.auth.method === 'discogs'){
			authHeader = 'Discogs';
			if(this.auth.userToken){
				authHeader += ' token='+this.auth.userToken;
			}else if(this.auth.consumerKey){
				authHeader += ' key='+this.auth.consumerKey+', secret='+this.auth.consumerSecret;
			}
		}
		headers['Authorization'] = authHeader;
	}
	
	// Set the HTTPS request options
	var options = {
		host: urlParts.host||this.config.host,
		port: urlParts.port||this.config.port,
		path: urlParts.path,
		method: method,
		headers: headers
	};
	
	// Build the HTTPS request			
	var req = https.request(options, function(res){
		var data = '', rateLimit = null, add = function(chunk){ data += chunk.toString(); };
		
		// Pass the data to the callback and pass an error on unsuccessful HTTP status
		var passData = function(){
			if(typeof callback === 'function'){
				var err = null, status = parseInt(res.statusCode, 10);
				if(status > 399){ // Unsuccessful HTTP status? Then pass an error to the callback
					var match = data.match(/^\{"message": "(.+)"\}/i);
					err = new error.DiscogsError(status, ((match&&match[1]) ? match[1] : null));
				}
				callback(err, data, rateLimit);
			}
		};
		
		// Find and add rate limiting when present
		if(res.headers['x-ratelimit-type']){
			rateLimit = {
				type: res.headers['x-ratelimit-type'],
				limit: res.headers['x-ratelimit-limit'],
				reset: res.headers['x-ratelimit-reset'],
				remaining: res.headers['x-ratelimit-remaining']
			};
		}
		
		// Get the response content and pass it to the callback
		switch(res.headers['content-encoding']){
			case 'gzip':
				var gunzip = zlib.createGunzip().on('data', add).on('end', passData);
				res.pipe(gunzip);
				break;
			case 'deflate':
				var inflate = zlib.createInflate().on('data', add).on('end', passData);
				res.pipe(inflate);
				break;
			default:
				// Set encoding when provided
				res.setEncoding(encoding);
				res.on('data', add).on('end', passData);
		}
	}).on('error', function(err){
		if(typeof callback === 'function'){ callback(err); }
	});
	
	// When present, write the data to the request
	if(data){ req.write(data); }
	
	req.end();
	return this;
};

/**
 * Send a request and parse text response to JSON
 * @param {object} options - Request options
 * {
 *		url: '', // May be a relative path when accessing the discogs API
 *		method: '', // Defaults to GET
 *		data: {} // POST/PUT data as an object
 * }
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype._request = function(options, callback){
	var self = this, hasCb = (typeof callback === 'function'),
		doRequest = function(){
			self._rawRequest(options, function(err, data, rateLimit){
				if(data && ((typeof options === 'string') || options.json)){
					data = JSON.parse(data);
				}
				if(hasCb){ callback(err, data, rateLimit); }
			});
		};
	// By default, queue requests
	if(!options.hasOwnProperty('queue')){
		options.queue = true;
	}
	// By default, expect responses to be JSON
	if(!options.hasOwnProperty('json')){
		options.json = true;
	}
	// Check whether authentication is required
	if(!options.authLevel || this.authenticated(options.authLevel)){
		if(options.queue){ // Add API request to the execution queue
			queue.add(function(err){
				if(!err){
					doRequest();
				}else{ // Can't add to the queue because it's full
					if(hasCb){ callback(err); }
				}
			});
		}else{ // Don't queue, just do the request
			doRequest();
		}
	}else{
		if(hasCb){ callback(new error.AuthError()); }
	}
	return this;
};

/**
 * Perform a GET request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.get = function(options, callback){
	if(typeof options === 'string'){ options = {url: options}; }
	return this._request(options, callback);
};

/**
 * Perform a POST request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {object} data - POST data
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.post = function(options, data, callback){
	if(typeof options === 'string'){ options = {url: options}; }
	return this._request(util.merge(options, {method: 'POST', data: data}), callback);
};

/**
 * Perform a PUT request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {object} data - PUT data
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.put = function(options, data, callback){
	if(typeof options === 'string'){ options = {url: options}; }
	return this._request(util.merge(options, {method: 'PUT', data: data}), callback);
};

/**
 * Perform a DELETE request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.delete = function(options, callback){
	if(typeof options === 'string'){ options = {url: options}; }
	return this._request(util.merge(options, {method: 'DELETE'}), callback);
};

/**
 * Get an instance of the Discogs OAuth class
 * @returns {DiscogsOAuth}
 */

DiscogsClient.prototype.oauth = function(){
	var OAuth = require('./oauth.js');
	return new OAuth(this.auth);
};

/**
 * Expose the database functions and pass the current instance
 * @returns {object}
 */
 
DiscogsClient.prototype.database = function(){
	return require('./database.js')(this);
};

/**
 * Expose the marketplace functions and pass the current instance
 * @returns {object}
 */
 
DiscogsClient.prototype.marketplace = function(){
	return require('./marketplace.js')(this);
};

/**
 * Expose the user functions and pass the current instance
 * @returns {object}
 */
 
DiscogsClient.prototype.user = function(){
	return require('./user.js')(this);
};