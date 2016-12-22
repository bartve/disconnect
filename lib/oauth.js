'use strict';

const queryString = require('querystring'),
    OAuth = require('oauth-1.0a'),
    Util = require('./util.js'),
    Client = require('./client.js'),
    oauthData = new WeakMap();

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
 * DiscogsOAuth class definition
 */
class DiscogsOAuth {

    /**
     * Object constructor
     * @param {object} [auth] - Authentication object
     * @returns {DiscogsOAuth}
     */
    constructor(auth) {
        this.config = Util.merge({}, defaultConfig);
        this.auth = {method: 'oauth', level: 0};
        oauthData.set(this, {
            config: Util.merge({}, defaultConfig),
            auth: {method: 'oauth', level: 0}
        });
        if (auth && (typeof auth === 'object') && (auth.method === 'oauth')) {
            Util.merge(this.auth, auth);
            Util.merge(oauthData.get(this).auth, auth);
        }
    }

    /**
     * Override the default configuration
     * @param {object} customConfig - Custom configuration object for Browserify/CORS/Proxy use cases
     * @returns {DiscogsOAuth}
     */
    setConfig(customConfig) {
        Util.merge(this.config, customConfig);
        Util.merge(oauthData.get(this).config, customConfig);
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
        var auth = this.auth, config = this.config;
        auth.consumerKey = consumerKey;
        auth.consumerSecret = consumerSecret;
        new Client(auth).get({url: config.requestTokenUrl + '?oauth_callback=' + OAuth.prototype.percentEncode(callbackUrl), queue: false, json: false}, function(err, data) {
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
        var auth = this.auth;
        new Client(auth).get({url: this.config.accessTokenUrl + '?oauth_verifier=' + OAuth.prototype.percentEncode(verifier), queue: false, json: false}, function(err, data) {
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
     * Generic function to return the auth object
     * @returns {object}
     */
    export() {
        return this.auth;
        //return oauthData.get(this).auth;
    }
    
    /**
     * Parse the OAuth HTTP header content
     * @param {string} requestMethod - The upper case HTTP request method (GET, POST, etc)
     * @param {string} url - The url that is to be accessed
     * @returns {string}
     */
    toHeader(requestMethod, url) {
        var oAuth = new OAuth({
                consumer: {key: this.auth.consumerKey, secret: this.auth.consumerSecret},
                signature_method: this.config.signatureMethod, version: this.config.version
            }),
            authObj = oAuth.authorize({method: requestMethod, url: url}, {key: this.auth.token, secret: this.auth.tokenSecret});
        return oAuth.toHeader(authObj).Authorization;
    }
}

/**
 * Expose the DiscogsOAuth class
 */
module.exports = DiscogsOAuth;