'use strict';

const Util = require('./util.js');

/**
 * DiscogsDatabase class definition
 */
class DiscogsDatabase {

    /**
     * Object constructor
     * @param {DiscogsClient} client - A DiscogsClient instance
     * @return {DiscogsDatabase}
     */
    constructor(client) {
        this.client = client;
        this.status = {
            accepted: 'Accepted',
            draft: 'Draft',
            deleted: 'Deleted',
            rejected: 'Rejected'
        };
    }

    /**
     * Get artist data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [options] - Show releases by the artist + pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getArtist(artist, callback) {
        return this.client.get('/artists/' + artist, callback);
    }

    /**
     * Get artist release data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getArtistReleases(artist, params, callback) {
        let path = '/artists/' + artist + '/releases';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Get release data
     * @param {(number|string)} release - The Discogs release ID
     * @param {function} [callback] - Callback
     * @return {DiscogsClient|Promise}
     */
    getRelease(release, callback) {
        return this.client.get('/releases/' + release, callback);
    }

    /**
     * Get the release rating for the given user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getReleaseRating(release, user, callback) {
        return this.client.get('/releases/' + release + '/rating/' + Util.escape(user), callback);
    }

    /**
     * Set (or remove) a release rating for the given logged in user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {number} rating - The new rating for a release between 1 and 5. Null = remove rating
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    setReleaseRating(release, user, rating, callback) {
        let url = '/releases/' + release + '/rating/' + Util.escape(user);
        if (!rating) {
            return this.client.delete({url: url, authLevel: 2}, callback);
        } else {
            return this.client.put({url: url, authLevel: 2}, {rating: ((rating > 5) ? 5 : rating)}, callback);
        }
    }

    /**
     * Get master release data
     * @param {(number|string)} master - The Discogs master release ID
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getMaster(master, callback) {
        return this.client.get('/masters/' + master, callback);
    }

    /**
     * Get the release versions contained in the given master release
     * @param {(number|string)} master - The Discogs master release ID
     * @param {object} [params] - optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getMasterVersions(master, params, callback) {
        let path = '/masters/' + master + '/versions';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    }

    /**
     * Get label data
     * @param {(number|string)} label - The Discogs label ID
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getLabel(label, callback) {
        return this.client.get('/labels/' + label, callback);
    };

    /**
     * Get label release data
     * @param {(number|string)} label - The Discogs label ID
     * @param {object} [params] - Optional pagination params
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getLabelReleases(label, params, callback) {
        let path = '/labels/' + label + '/releases';
        if ((arguments.length === 2) && (typeof params === 'function')) {
            callback = params;
        } else {
            path = Util.addParams(path, params);
        }
        return this.client.get(path, callback);
    };

    /**
     * Get an image
     * @param {string} url - The full image url
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    getImage(url, callback) {
        return this.client.get({url: url, encoding: 'binary', queue: false, json: false}, callback);
    }

    /**
     * Search the database
     * @param {string} query - The search query
     * @param {object} [params] - Search parameters as defined on http://www.discogs.com/developers/#page:database,header:database-search
     * @param {function} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    search(query, params, callback) {
        let obj = {};
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
        return this.client.get({url: Util.addParams('/database/search', obj), authLevel: 1}, callback);
    }
}

/**
 * Expose DiscogsDatabase
 */
module.exports = DiscogsDatabase;