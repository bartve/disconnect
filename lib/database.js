'use strict';

var util = require('./util.js');

module.exports = function(client) {
    var database = {};

    /**
     * Expose Discogs database status constants
     */

    database.status = {accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected'};

    /**
     * Get artist data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [options] - Show releases by the artist + pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getArtist = function(artist, callback) {
        return client.get('/artists/' + artist, callback);
    };

    /**
     * Get artist release data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getArtistReleases = function(artist, params, callback) {
        var path = '/artists/' + artist + '/releases';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get release data
     * @param {(number|string)} release - The Discogs release ID
     * @param {function} [callback] - Callback 
     * @return {DiscogsClient|Promise}
     */

    database.getRelease = function(release, callback) {
        return client.get('/releases/' + release, callback);
    };

    /**
     * Get the release rating for the given user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getReleaseRating = function(release, user, callback) {
        return client.get('/releases/' + release + '/rating/' + util.escape(user), callback);
    };

    /**
     * Set (or remove) a release rating for the given logged in user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {number} rating - The new rating for a release between 1 and 5. Null = remove rating
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.setReleaseRating = function(release, user, rating, callback) {
        var url = '/releases/' + release + '/rating/' + util.escape(user);
        if (!rating) {
            return client.delete({url: url, authLevel: 2}, callback);
        } else {
            return client.put({url: url, authLevel: 2}, {rating: ((rating > 5) ? 5 : rating)}, callback);
        }
    };

    /**
     * Get master release data
     * @param {(number|string)} master - The Discogs master release ID
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getMaster = function(master, callback) {
        return client.get('/masters/' + master, callback);
    };

    /**
     * Get the release versions contained in the given master release
     * @param {(number|string)} master - The Discogs master release ID
     * @param {object} [params] - optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getMasterVersions = function(master, params, callback) {
        var path = '/masters/' + master + '/versions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get label data
     * @param {(number|string)} label - The Discogs label ID
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getLabel = function(label, callback) {
        return client.get('/labels/' + label, callback);
    };

    /**
     * Get label release data
     * @param {(number|string)} label - The Discogs label ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getLabelReleases = function(label, params, callback) {
        var path = '/labels/' + label + '/releases';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = util.addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get an image
     * @param {string} url - The full image url
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.getImage = function(url, callback) {
        return client.get({url: url, encoding: 'binary', queue: false, json: false}, callback);
    };

    /**
     * Search the database
     * @param {string} query - The search query
     * @param {object} [params] - Search parameters as defined on http://www.discogs.com/developers/#page:database,header:database-search
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */

    database.search = function(query, params, callback) {
        var obj = {};
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        }
        if (typeof params === 'object') {
            obj = params;
        } else if (typeof query === 'object') {
            obj = query;
        }
        if (typeof query === 'string') {
            obj.q = query;
        }
        return client.get({url: util.addParams('/database/search', obj), authLevel: 1}, callback);
    };

    return database;
};