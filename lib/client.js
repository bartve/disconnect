'use strict';

var https = require('https'),
	zlib = require('zlib'),
	url = require('url'),
	queryString = require('querystring'),
	OAuth = require('oauth-1.0a'),
	pkg = require('../package.json'),
	error = require('./error.js'),
	queue = require('./queue.js');

module.exports = DiscogsClient;

/**
 * Deep merge two objects and return the result
 * @param {object} target - The target object (by reference!)
 * @param {object} source - The source object
 */

var merge = function(target, source){
	for(var key in source){
		if(source[key] && (typeof source[key] === 'object')){
			target[key] = merge((Array.isArray(source[key]) ? [] : {}), source[key]);
		}else{
			target[key] = source[key];
		}
	}
	return target;
};

/**
 * Default configuration
 */

var defaultConfig = {
	host: 'api.discogs.com',
	oauthRequestUrl: 'https://api.discogs.com/oauth/request_token',
	oauthAccessUrl: 'https://api.discogs.com/oauth/access_token',
	oauthAuthorizeUrl: 'https://www.discogs.com/oauth/authorize',
	port: 443,
	customHeaders: {
		'Accept': 'application/json; application/octet-stream',
		'Accept-Encoding': 'gzip,deflate',
		'User-Agent': 'DisConnectClient/'+pkg.version+' +'+pkg.homepage
	}
};

/**
 * Object constructor
 * @param {string} [userAgent] - The name of the user agent to use to make API calls
 * @param {object} [oauth] - Optional OAuth data object
 * @returns {DiscogsClient}
 */

function DiscogsClient(userAgent, oauth){
	// Allow the class to be called as a function, returning an instance
	if(!(this instanceof DiscogsClient)){
        return new DiscogsClient(userAgent, oauth);
	}
	// Set the custom UserAgent when provided
	if(typeof userAgent === 'string'){ this.userAgent = userAgent; }
	// No userAgent provided, but instead we have an accessObject
	if((arguments.length === 1) && (typeof userAgent === 'object')){ oauth = userAgent; }
	// Set OAuth data when provided by making a shallow copy of the oauth parameter
	this.oauth = (typeof oauth === 'object') ? merge({}, oauth) : {version: '1.0', signatureMethod: 'PLAINTEXT', status: null};
}

/**
 * Override the default configuration
 * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
 * @returns {DiscogsClient}
 */
DiscogsClient.prototype.setConfig = function(customConfig){
	this.customConfig = merge(merge({}, defaultConfig), customConfig);
	return this;
};

/**
 * Get an OAuth request token from Discogs
 * @param {string} consumerKey - The Discogs consumer key
 * @param {string} consumerSecret - The Discogs consumer secret
 * @param {string} callbackUrl - The url for redirection after obtaining the request token
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */
 
DiscogsClient.prototype.getRequestToken = function(consumerKey, consumerSecret, callbackUrl, callback){
	var oauth = this.oauth, config = (this.customConfig||defaultConfig), oa = new OAuth({consumer: {public: consumerKey, secret: consumerSecret}, signature_method: oauth.signatureMethod});
	oauth.consumerKey = consumerKey;
	oauth.consumerSecret = consumerSecret;
	this._rawRequest({url: config.oauthRequestUrl+'?oauth_callback='+oa.percentEncode(callbackUrl)}, function(err, data){
		if(!err && data){
			data = queryString.parse(data);
			oauth.token = data.oauth_token;
			oauth.tokenSecret = data.oauth_token_secret;
			oauth.authorizeUrl = config.oauthAuthorizeUrl+'?oauth_token='+data.oauth_token;
			oauth.status = 'request';
		}
		if(typeof callback === 'function'){ callback(err, oauth); }
	});
	return this;
};

/**
 * Get an OAuth access token from Discogs
 * @param {string} verifier - The OAuth 1.0a verification code returned by Discogs
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */
 
DiscogsClient.prototype.getAccessToken = function(verifier, callback){
	var oauth = this.oauth, oa = new OAuth({consumer: {public: oauth.consumerKey, secret: oauth.consumerSecret}, signature_method: oauth.signatureMethod});
	this._rawRequest({url: (this.customConfig||defaultConfig).oauthAccessUrl+'?oauth_verifier='+oa.percentEncode(verifier)}, function(err, data){
		if(!err && data){
			data = queryString.parse(data);
			oauth.token = data.oauth_token;
			oauth.tokenSecret = data.oauth_token_secret;
			oauth.status = 'access';
			delete oauth.authorizeUrl;
		}
		if(typeof callback === 'function'){ callback(err, oauth); }
	});
	return this;
};

/**
 * Return whether OAuth authentication is complete i.e. there is a valis access token
 * @returns {boolean}
 */

DiscogsClient.prototype.authenticated = function(){
	return (this.oauth.status === 'access');
};

/**
 * Test OAuth authentication by getting the identity resource for the authenticated user
 * @param {function} callback - Callback function receiving the data
 */

DiscogsClient.prototype.identity = function(callback){
   this.get({url:'/oauth/identity', requireAuth: true}, callback);
};

/**
 * Get info about the Discogs API and this client
 * @param {function} callback - Callback function receiving the data
 */

DiscogsClient.prototype.about = function(callback){
	var self = this;
	this.get('', function(err, data){
		if(data){ data.disconnect = { version: pkg.version, userAgent: (self.userAgent||(self.customConfig||defaultConfig).customHeaders['User-Agent']) }; }
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
		encoding = options.encoding||'utf8',
		config = (this.customConfig||defaultConfig);
	
	// Build request headers
	var headers = {
		'Host': config.host,
		'Connection': 'close',
		'Content-Length': 0
	};
	headers = merge(headers, config.customHeaders);
	// Set custom user agent when present
	if(this.userAgent){ headers['User-Agent'] = this.userAgent; }
	
	// Add content headers for POST/PUT requests that contain data
	if(data){
		if(typeof data === 'object'){ data = JSON.stringify(data); } // Convert data to a JSON string when data is an object/array
		headers['Content-Type'] = 'application/json'; // Discogs accepts data in JSON format
		headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
	}
	
	// Add Authorization header when authenticated or in the process of authenticating
	if(this.oauth.consumerKey){
		var oa = new OAuth({consumer: {public: this.oauth.consumerKey, secret: this.oauth.consumerSecret}, signature_method: this.oauth.signatureMethod}),
			fullUrl = (urlParts.protocol && urlParts.host) ? urlParts.href : 'https://'+config.host+urlParts.path,
			authObj = oa.authorize({method: method, url: fullUrl}, {public: this.oauth.token, secret: this.oauth.tokenSecret});
		headers['Authorization'] = oa.toHeader(authObj).Authorization;
	}
	
	// Set the HTTPS request options
	var options = {
		host: urlParts.host||config.host,
		port: urlParts.port||config.port,
		path: urlParts.path,
		method: method,
		headers: headers
	};
	
	// Build the HTTPS request			
	var req = https.request(options, function(res){
		var data = '',
			rateLimit = null,
			add = function(chunk){ data += chunk.toString(); };
		
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
	var self = this, hasCb = (typeof callback === 'function');
	// Check whether authentication is required
	if(!options.requireAuth || this.authenticated()){
		queue.add(function(err){ // Add API request to the execution queue
			if(!err){
				self._rawRequest(options, function(err, data, rateLimit){
					if(data && ((typeof options === 'string') || (options.encoding !== 'binary'))){
						data = JSON.parse(data);
					}
					if(hasCb){ callback(err, data, rateLimit); }
				});
			}else{ // Can't add to the queue because it's full
				if(hasCb){ callback(err); }
			}
		});
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
	return this._request(merge(options, {method: 'POST', data: data}), callback);
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
	return this._request(merge(options, {method: 'PUT', data: data}), callback);
};

/**
 * Perform a DELETE request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.delete = function(options, callback){
	if(typeof options === 'string'){ options = {url: options}; }
	return this._request(merge(options, {method: 'DELETE'}), callback);
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
