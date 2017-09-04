'use strict';

var https = require('https'),
    zlib = require('zlib'),
    url = require('url'),
    pkg = require('../package.json'),
    error = require('./error.js'),
    util = require('./util.js');

module.exports = DiscogsClient;

/**
 * Default configuration
 */

var defaultConfig = {
    host: 'api.discogs.com',
    port: 443,
    userAgent: 'DisConnectClient/' + pkg.version + ' +' + pkg.homepage,
    apiVersion: 'v2',
    outputFormat: 'discogs',    // Possible values: 'discogs' / 'plaintext' / 'html'
    requestLimit: 25,           // Maximum number of requests to the Discogs API per interval
    requestLimitAuth: 60,       // Maximum number of requests to the Discogs API per interval when authenticated
    requestLimitInterval: 60000 // Request interval in milliseconds
};

/**
 * The request queue, shared by all DiscogsClient instances
 * @type {Queue}
 */

var queue = require('./queue.js')({
    maxCalls: defaultConfig.requestLimit,
    interval: defaultConfig.requestLimitInterval
});

/**
 * Object constructor
 * @param {string} [userAgent] - The name of the user agent to use to make API calls
 * @param {object} [auth] - Optional authorization data object
 * @return {DiscogsClient}
 */

function DiscogsClient(userAgent, auth) {
    // Allow the class to be called as a function, returning an instance
    if (!(this instanceof DiscogsClient)) {
        return new DiscogsClient(userAgent, auth);
    }
    // Set the default configuration
    this.config = util.merge({}, defaultConfig);
    // Set the custom User Agent when provided
    if (typeof userAgent === 'string') {
        this.config.userAgent = userAgent;
    }
    // No userAgent provided, but instead we have an accessObject
    if ((arguments.length === 1) && (typeof userAgent === 'object')) {
        auth = userAgent;
    }
    // Set auth data when provided
    if (auth && (typeof auth === 'object')) {
        queue.setConfig({maxCalls: this.config.requestLimitAuth});
        if (!auth.hasOwnProperty('method')) {
            auth.method = 'discogs';
        }
        if (!auth.hasOwnProperty('level')) {
            if (auth.userToken) {
                auth.level = 2;
            } else if (auth.consumerKey && auth.consumerSecret) {
                auth.level = 1;
            }
        }
        this.auth = util.merge({}, auth);
    // Unauthenticated new client instances will decrease the shared request limit
    } else {
        queue.setConfig({maxCalls: this.config.requestLimit});
    }
}

/**
 * Override the default configuration
 * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
 * @return {DiscogsClient}
 */
DiscogsClient.prototype.setConfig = function(customConfig) {
    util.merge(this.config, customConfig);
    queue.setConfig({
        maxCalls: (this.authenticated() ? this.config.requestLimitAuth : this.config.requestLimit),
        interval: this.config.requestLimitInterval
    });
    return this;
};

/**
 * Return whether the client is authenticated for the optionally given access level
 * @param {number} [level] - Optional authentication level
 * @return {boolean}
 */

DiscogsClient.prototype.authenticated = function(level) {
    level = level || 0;
    return (!(typeof this.auth === 'undefined') && (this.auth.level > 0) && (this.auth.level >= level));
};

/**
 * Test authentication by getting the identity resource for the authenticated user
 * @param {function} callback - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype.getIdentity = function(callback) {
    return this.get({url: '/oauth/identity', authLevel: 2}, callback);
};

/**
 * Get info about the Discogs API and this client
 * @param {function} callback - Callback function receiving the data
 */

DiscogsClient.prototype.about = function(callback) {
    var clientInfo = {
        version: pkg.version,
        userAgent: this.config.userAgent,
        authMethod: (this.auth ? this.auth.method : 'none'),
        authLevel: (this.auth ? this.auth.level : 0)
    };
    if (typeof callback === 'function') {
        return this.get('', function(err, data) {
            data && (data.disconnect = clientInfo);
            callback(err, data);
        });
    }
    return this.get('').then(function(data) {
        data && (data.disconnect = clientInfo);
        return data;
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
 * @param {function} callback - Callback function receiving the data
 * @return {DiscogsClient}
 */

DiscogsClient.prototype._rawRequest = function(options, callback) {
    var data = options.data || null,
        method = options.method || 'GET',
        urlParts = url.parse(options.url),
        encoding = options.encoding || 'utf8';

    // Build request headers
    var headers = {
        'User-Agent': this.config.userAgent,
        'Accept': 'application/json,application/vnd.discogs.' + this.config.apiVersion + '.' + this.config.outputFormat + '+json,application/octet-stream',
        'Accept-Encoding': 'gzip,deflate',
        'Host': urlParts.host || this.config.host,
        'Connection': 'close',
        'Content-Length': 0
    };

    // Add content headers for POST/PUT requests that contain data
    if (data) {
        if (typeof data === 'object') {
            data = JSON.stringify(data);
        } // Convert data to a JSON string when data is an object/array
        headers['Content-Type'] = 'application/json'; // Discogs accepts data in JSON format
        headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
    }

    // Add Authorization header when authenticated (or in the process of authenticating)
    if (this.auth && (this.auth.consumerKey || this.auth.userToken)) {
        var authHeader = '';
        if (this.auth.method === 'oauth') {
            var fullUrl = (urlParts.protocol && urlParts.host) ? urlParts.href : 'https://' + this.config.host + urlParts.path;
            authHeader = this.oauth().toHeader(method, fullUrl);
        } else if (this.auth.method === 'discogs') {
            authHeader = 'Discogs';
            if (this.auth.userToken) {
                authHeader += ' token=' + this.auth.userToken;
            } else if (this.auth.consumerKey) {
                authHeader += ' key=' + this.auth.consumerKey + ', secret=' + this.auth.consumerSecret;
            }
        }
        headers['Authorization'] = authHeader;
    }

    // Set the HTTPS request options
    var requestOptions = {
        host: urlParts.host || this.config.host,
        port: urlParts.port || this.config.port,
        path: urlParts.path,
        method: method,
        headers: headers
    };

    // Build the HTTPS request	
    var req = https.request(requestOptions, function(res) {
        var data = '', rateLimit = null, add = function(chunk) {
            data += chunk.toString();
        };

        // Pass the data to the callback and pass an error on unsuccessful HTTP status
        var passData = function() {
            var err = null, status = parseInt(res.statusCode, 10);
            if (status > 399) { // Unsuccessful HTTP status? Then pass an error to the callback
                var match = data.match(/^\{"message": "(.+)"\}/i);
                err = new error.DiscogsError(status, ((match && match[1]) ? match[1] : null));
            }
            callback(err, data, rateLimit);
        };

        // Find and add rate limiting when present
        if (res.headers['x-discogs-ratelimit']) {
            rateLimit = {
                limit: parseInt(res.headers['x-discogs-ratelimit'], 10),
                used: parseInt(res.headers['x-discogs-ratelimit-used'], 10),
                remaining: parseInt(res.headers['x-discogs-ratelimit-remaining'], 10)
            };
        }

        // Get the response content and pass it to the callback
        switch (res.headers['content-encoding']) {
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
    }).on('error', function(err) {
        callback(err);
    });

    // When present, write the data to the request
    if (data) {
        req.write(data);
    }

    req.end();
    return this;
};

/**
 * Send a request and parse text response to JSON
 * @param {object} options - Request options
 * {
 *		url: '', // May be a relative path when accessing the Discogs API
 *		method: '', // Defaults to GET
 *		data: {} // POST/PUT data as an object
 * }
 * @param {function} [callback] - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype._request = function(options, callback) {
    var client = this,
            doRequest = function() {
                client._rawRequest(options, function(err, data, rateLimit) {
                    if (data && options.json && (data.indexOf('<!') !== 0)) {
                        data = JSON.parse(data);
                    }
                    callback(err, data, rateLimit);
                });
            },
            prepareRequest = function() {
                // Check whether authentication is required
                if (!options.authLevel || client.authenticated(options.authLevel)) {
                    if (options.queue) { // Add API request to the execution queue
                        queue.add(function(err) {
                            if (!err) {
                                doRequest(callback);
                            } else { // Can't add to the queue because it's full
                                callback(err);
                            }
                        });
                    } else { // Don't queue, just do the request
                        doRequest(callback);
                    }
                } else {
                    callback(new error.AuthError());
                }
            };

    // By default, queue requests
    if (!options.hasOwnProperty('queue')) {
        options.queue = true;
    }
    // By default, expect responses to be JSON
    if (!options.hasOwnProperty('json')) {
        options.json = true;
    }

    if (typeof callback === 'function') {
        prepareRequest();
        return this;
    }
    // No callback provided? Return a Promise
    return new Promise(function(resolve, reject) {
        callback = function(err, data) {
            (err && reject(err)) || resolve(data);
        };
        prepareRequest();
    });
};

/**
 * Perform a GET request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {function} [callback] - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype.get = function(options, callback) {
    if (typeof options === 'string') {
        options = {url: options};
    }
    return this._request(options, callback);
};

/**
 * Perform a POST request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {object} data - POST data
 * @param {function} [callback] - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype.post = function(options, data, callback) {
    if (typeof options === 'string') {
        options = {url: options};
    }
    return this._request(util.merge(options, {method: 'POST', data: data}), callback);
};

/**
 * Perform a PUT request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {object} data - PUT data
 * @param {function} [callback] - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype.put = function(options, data, callback) {
    if (typeof options === 'string') {
        options = {url: options};
    }
    return this._request(util.merge(options, {method: 'PUT', data: data}), callback);
};

/**
 * Perform a DELETE request against the Discogs API
 * @param {(object|string)} options - Request options object or an url
 * @param {function} [callback] - Callback function receiving the data
 * @return {DiscogsClient|Promise}
 */

DiscogsClient.prototype.delete = function(options, callback) {
    if (typeof options === 'string') {
        options = {url: options};
    }
    return this._request(util.merge(options, {method: 'DELETE'}), callback);
};

/**
 * Get an instance of the Discogs OAuth class
 * @return {DiscogsOAuth}
 */

DiscogsClient.prototype.oauth = function() {
    var OAuth = require('./oauth.js');
    return new OAuth(this.auth);
};

/**
 * Expose the database functions and pass the current instance
 * @return {object}
 */

DiscogsClient.prototype.database = function() {
    return require('./database.js')(this);
};

/**
 * Expose the marketplace functions and pass the current instance
 * @return {object}
 */

DiscogsClient.prototype.marketplace = function() {
    return require('./marketplace.js')(this);
};

/**
 * Expose the user functions and pass the current instance
 * @return {object}
 */

DiscogsClient.prototype.user = function() {
    return require('./user.js')(this);
};