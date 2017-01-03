'use strict';

const queryString = require('querystring'),
    OAuth = require('oauth-1.0a'),
    Util = require('./util.js'),
    Client = require('./client.js');

/**
 * Default configuration
 */
const defaultConfig = {
    requestTokenUrl: 'https://api.discogs.com/oauth/request_token',
    accessTokenUrl: 'https://api.discogs.com/oauth/access_token',
    authorizeUrl: 'https://www.discogs.com/oauth/authorize',
    version: '1.0',
    signatureMethod: 'PLAINTEXT' // Or HMAC-SHA1
};

/**
 * Store the oauth instance config privately in a WeakMap
 * @type {WeakMap}
 */
const configMap = new WeakMap();

/**
 * Store the authentication data privately in a WeakMap
 * @type {WeakMap}
 */
const authMap = new WeakMap();

/**
 * DiscogsOAuth class definition
 */
class DiscogsOAuth {

    /**
     * Object constructor
     * @param {object} [authData] - Authentication object
     * @returns {DiscogsOAuth}
     */
    constructor(authData) {
        configMap.set(this, Util.merge({}, defaultConfig));
        authMap.set(this, {method: 'oauth', level: 0});
        if (authData && (typeof authData === 'object') && (authData.method === 'oauth')) {
            Util.merge(authMap.get(this), authData);
        }
    }

    /**
     * Override the default configuration
     * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
     * @returns {DiscogsOAuth}
     */
    setConfig(customConfig) {
        if (customConfig && (typeof customConfig === 'object')) {
            Util.merge(configMap.get(this), customConfig);
        }
        return this;
    }

    /**
     * Get an OAuth request token from Discogs
     * @param {string} consumerKey - The Discogs consumer key
     * @param {string} consumerSecret - The Discogs consumer secret
     * @param {string} callbackUrl - The url for redirection after obtaining the request token
     * @param {function} [callback] - Callback function receiving the data
     * @returns {DiscogsOAuth}
     */
    getRequestToken(consumerKey, consumerSecret, callbackUrl, callback) {
        let auth = authMap.get(this),
            config = configMap.get(this);
        auth.consumerKey = consumerKey;
        auth.consumerSecret = consumerSecret;
        new Client(auth).get({url: config.requestTokenUrl + '?oauth_callback=' + OAuth.prototype.percentEncode(callbackUrl), queue: false, json: false}, (err, data) => {
            if (!err && data) {
                data = queryString.parse(data);
                auth.token = data.oauth_token;
                auth.tokenSecret = data.oauth_token_secret;
                auth.authorizeUrl = config.authorizeUrl + '?oauth_token=' + data.oauth_token;
            }
            if (typeof callback === 'function') {
                callback(err, auth);
            }
        });
        return this;
    }

    /**
     * Get an OAuth access token from Discogs
     * @param {string} verifier - The OAuth 1.0a verification code returned by Discogs
     * @param {function} [callback] - Callback function receiving the data
     * @returns {DiscogsOAuth}
     */
    getAccessToken(verifier, callback) {
        let auth = authMap.get(this);
        new Client(auth).get({url: configMap.get(this).accessTokenUrl + '?oauth_verifier=' + OAuth.prototype.percentEncode(verifier), queue: false, json: false}, (err, data) => {
            if (!err && data) {
                data = queryString.parse(data);
                auth.token = data.oauth_token;
                auth.tokenSecret = data.oauth_token_secret;
                auth.level = 2;
                delete auth.authorizeUrl;
            }
            if (typeof callback === 'function') {
                callback(err, auth);
            }
        });
        return this;
    }

    /**
     * Generic function to return a copy the auth object
     * @returns {object}
     */
    export() {
        return Util.merge({}, authMap.get(this));
    }
    
    /**
     * Parse the OAuth HTTP header content
     * @param {string} requestMethod - The upper case HTTP request method (GET, POST, etc)
     * @param {string} url - The url that is to be accessed
     * @returns {string}
     */
    toHeader(requestMethod, url) {
        let auth = authMap.get(this), 
            config = configMap.get(this),
            oAuth = new OAuth({
                consumer: {key: auth.consumerKey, secret: auth.consumerSecret},
                signature_method: config.signatureMethod, version: config.version
            }),
            authObj = oAuth.authorize({method: requestMethod, url: url}, {key: auth.token, secret: auth.tokenSecret});
    
        return oAuth.toHeader(authObj).Authorization;
    }
}

/**
 * Expose the DiscogsOAuth class
 */
module.exports = DiscogsOAuth;