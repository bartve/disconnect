'use strict';

const queryString = require('querystring');

/**
 * Static utility class
 */
class Util {
    
    /**
     * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
     * @param {string} name - The Discogs artist name
     * @return {string}
     */
    static stripVariation(name) {
        return name.replace(/\s\(\d+\)$/, '');
    }
    
    /**
     * Add params to a given url or path
     * @param {string} url - The url to add the extra params to
     * @param {object} data - Data object containing the params
     * @returns {string}
     */
    static addParams(url, data) {
        if (data && (typeof data === 'object') && (Object.keys(data).length > 0)) {
            url = url + ((url.indexOf('?') === -1) ? '?' : '&') + queryString.stringify(data);
        }
        return url;
    }
    
    /**
     * Escape a string for use in a query string
     * @param {string} str - The string to escape
     * @returns {string}
     */
    static escape(str) {
        return queryString.escape(str);
    }
    
    /**
     * Deep merge two objects
     * @param {object} target - The target object (by reference!)
     * @param {object} source - The source object
     * @returns {object}
     */
    static merge(target, source) {
        for (let key in source) {
            if (source[key] && (typeof source[key] === 'object')) {
                let subTarget = target.hasOwnProperty(key) ? target[key] : (Array.isArray(source[key]) ? [] : {});
                target[key] = Util.merge(subTarget, source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }
}

/**
 * Expose the Util class
 */
module.exports = Util;