var http = require('http'),
	zlib = require('zlib'),
	url = require('url'),
	queryString = require('querystring'),
	OAuth = require('oauth-1.0a'),
	package = require('../package.json');

module.exports = DiscogsClient;

/**
 * Merge two objects and return the result
 * @param {Object} source
 * @param {Object} target
 */

var merge = function(target, source){
	for(var key in source){ target[key] = source[key]; }
	return target;
};

/**
 * Default configuration
 */

var config = {
	host: 'api.discogs.com',
	oauthRequestUrl: 'http://api.discogs.com/oauth/request_token',
	oauthAccessUrl: 'http://api.discogs.com/oauth/access_token',
	oauthAuthorizeUrl: 'http://www.discogs.com/oauth/authorize',
	port: 80,
	customHeaders: {
		'Accept': 'application/json',
		'Accept-Encoding': 'gzip,deflate',
		'User-Agent': 'DisConnectClient/'+package.version
	}
};

/**
 * Object constructor
 * @param {String} [userAgent] - The name of the user agent to use to make API calls
 * @param {Object} [accessObject] - Optional OAUth access token object returned by getAccessToken()
 * @returns {DiscogsClient}
 */

function DiscogsClient(userAgent, accessObject){
	// Allow the class to be called as a function, returning an instance
	if(!(this instanceof DiscogsClient)) {
        return new DiscogsClient(userAgent, accessObject);
	}
	(typeof userAgent === 'string')&&(this.userAgent = userAgent);
	// No userAgent provided, but instead we have an accessObject
	((arguments.length === 1)&&(typeof userAgent === 'object'))&&(accessObject = userAgent);
	// Set OAuth data when provided
	accessObject&&(this.oauth = merge(this.oauth, accessObject));
}

/**
 * Basic OAuth settings
 */
 
DiscogsClient.prototype.oauth = {
	version: '1.0',
	signatureMethod: 'HMAC-SHA1',
	status: null
};

/**
 * Get an OAuth request token from Discogs
 * @param {String} consumerKey
 * @param {String} consumerSecret
 * @param {String} callbackUrl
 * @param {Function} callback
 * @returns {DiscogsClient}
 */
 
DiscogsClient.prototype.getRequestToken = function(consumerKey, consumerSecret, callbackUrl, callback){
	var requestObject = merge({}, this.oauth), oa = new OAuth({consumer: {public: consumerKey, secret: consumerSecret}});
	requestObject.consumerKey = consumerKey;
	requestObject.consumerSecret = consumerSecret;
	requestObject.status = 'request';
	this._rawRequest({url: config.oauthRequestUrl+'?oauth_callback='+oa.percentEncode(callbackUrl), oauth: requestObject}, function(err, data){
		if(!err){
			data&&(data = queryString.parse(data));
			requestObject.token = data.oauth_token;
			requestObject.tokenSecret = data.oauth_token_secret;
			requestObject.authorizeUrl = config.oauthAuthorizeUrl+'?oauth_token='+data.oauth_token;
		}
		(typeof callback === 'function')&&callback(err, requestObject);
	});
	return this;
};

/**
 * Get an OAuth access token from Discogs
 * @param {Object} requestObject - The request object from getRequestToken()
 * @param {String} verifier - The OAuth 1.0a verification code returned by Discogs
 * @param {Function} callback
 * @returns {DiscogsClient}
 */
 
DiscogsClient.prototype.getAccessToken = function(requestObject, verifier, callback){
	var accessObject = requestObject, oauth = this.oauth,
		oa = new OAuth({consumer: {public: requestObject.consumerKey, secret: requestObject.consumerSecret}});
	accessObject.status = 'access';
	this._rawRequest({url: config.oauthAccessUrl+'?oauth_verifier='+oa.percentEncode(verifier), oauth: accessObject}, function(err, data){
		if(!err){
			data&&(data = queryString.parse(data));
			accessObject.token = data.oauth_token;
			accessObject.tokenSecret = data.oauth_token_secret;
			accessObject.status = 'authenticated';
			delete accessObject.authorizeUrl;
			oauth = merge({}, accessObject); // Authorize the current instance
		}
		(typeof callback === 'function')&&callback(err, accessObject);
	});
	return this;
};

/**
 * Return whether OAuth authentication is complete i.e. there is a valis access token
 * @returns {Boolean}
 */

DiscogsClient.prototype.authenticated = function(){
	return (this.oauth.status === 'authenticated');
};

/**
 * Test OAuth authentication by getting the identity resource for the authenticated user
 * @param {Function} callback
 */

DiscogsClient.prototype.identity = function(callback){
   if(this.authenticated()){
	   this.get('/oauth/identity', callback);
   }else{
	   callback(new Error('You must be authenticated in order to view the identity resource.'));
   }
};

/**
 * Send a raw request
 * @param {Object} options - Request options 
 * {
 *		url: '', // May be a relative path when accessing the discogs API
 *		method: '', // Defaults to GET
 *		data: {} // POST?PUT data as an object
 * }
 * @param {Function} [callback] - Callback function receiving the data
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype._rawRequest = function(options, callback){
	var data = options.data||null, 
		method = options.method||'GET',  
		urlParts = url.parse(options.url),
		oauth = options.oauth||this.oauth;
	
	// Build request headers
	var headers = { 
		'Host': config.host,
		'Connection': 'close'
	};
	headers = merge(headers, config.customHeaders);
	// Set custom user agent when present
	this.userAgent&&(headers['User-Agent'] = this.userAgent);
	
	// Add content headers for requests containing data (PUT/POST)
	if(data){
		data = (typeof data === 'string') ? data : JSON.stringify(data);
		headers['Content-Type'] = 'application/json'; // Discogs accepts data in JSON format
		headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
	}else{
		headers['Content-Length'] = 0;
	}
	// Add Authorization header when authenticated or in the process of authenticating
	if(oauth.status){
		var oa = new OAuth({consumer: {public: oauth.consumerKey, secret: oauth.consumerSecret}}),
			fullUrl = (urlParts.protocol && urlParts.host) ? urlParts.href : 'http://'+config.host+urlParts.path,
			authObj = oa.authorize({method: method, url: fullUrl}, {public: oauth.token, secret: oauth.tokenSecret});
		headers['Authorization'] = oa.toHeader(authObj).Authorization;
	}
	
	// Set the HTTP request options
	var options = {
		host: urlParts.host||config.host,
		port: urlParts.port||config.port,
		path: urlParts.path,
		method: method,
		headers: headers
	};
	
	// Build the HTTP request			
	var req = http.request(options, function(res){
		var data = '',
			add = function(chunk){ data += chunk.toString(); },
			parse = function(){ (typeof callback === 'function')&&callback(null, data); };
		switch(res.headers['content-encoding']){
			case 'gzip':
				var gunzip = zlib.createGunzip().on('data', add).on('end', parse);
				res.pipe(gunzip);
				break;
			case 'deflate':
				var inflate = zlib.createInflate().on('data', add).on('end', parse);
				res.pipe(inflate);
				break;
			default:
				res.on('data', add).on('end', parse);
		}
	}).on('error', function(err){
		(typeof callback === 'function')&&callback(err);
	});
	data&&req.write(data); // Write data when present
	req.end();
	return this;
};

/**
 * Send a request and parse the JSON response data
 * @param {Object|String} options - Request options or just the URL as a string for a quick GET
 * {
 *		url: '', // May be a relative path when accessing the discogs API
 *		method: '', // Defaults to GET
 *		data: {} // POST/PUT data as an object
 * }
 * @param {Function} [callback] - Callback function receiving the data
 */

DiscogsClient.prototype._request = function(options, callback){
	(typeof options === 'string')&&(options = {url: options});
	return this._rawRequest(options, function(err, data){
		(typeof callback === 'function')&&callback(err, (data ? JSON.parse(data) : null));
	});
};

/**
 * Perform a GET request against the Discogs API
 * @param {String} path
 * @param {Function} [callback]
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.get = function(path, callback){
	return this._request(path, callback);
};

/**
 * Perform a POST request against the Discogs API
 * @param {String} path
 * @param {Object} data
 * @param {Function} [callback]
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.post = function(path, data, callback){
	return this._request({url: path, method: 'POST', data: data}, callback);
};

/**
 * Perform a PUT request against the Discogs API
 * @param {String} path
 * @param {Object} data
 * @param {Function} [callback]
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.put = function(path, data, callback){
	return this._request({url: path, method: 'PUT', data: data}, callback);
};

/**
 * Perform a DELETE request against the Discogs API
 * @param {String} path
 * @param {Function} [callback]
 * @returns {DiscogsClient}
 */

DiscogsClient.prototype.delete = function(path, callback){
	return this._request({url: path, method: 'DELETE'}, callback);
};

/**
 * Expose the database functions and pass the current instance
 * @returns {Object}
 */
 
DiscogsClient.prototype.database = function(){
	return require('./database.js')(this);
};

/**
 * Expose the marketplace functions and pass the current instance
 * @returns {Object}
 */
 
DiscogsClient.prototype.marketplace = function(){
	return require('./marketplace.js')(this);
};

/**
 * Expose the user functions and pass the current instance
 * @returns {Object}
 */
 
DiscogsClient.prototype.user = function(){
	return require('./user.js')(this);
};