'use strict';

/**
 * DiscogsError class definition
 */
class DiscogsError extends Error {

    /**
     * Object constructor
     * @param {number} [statusCode] - A HTTP status code
     * @param {string} [message] - The error message
     * @returns {DiscogsError}
     */
    constructor(statusCode, message) {
        super((message || 'Unknown error.'));
        Error.captureStackTrace(this, this.constructor);
        this.statusCode = statusCode || 404;
        this.name = this.constructor.name;
    }
    
    /**
     * Error to string
     * @returns {string}
     */
    toString() {
        return this.name + ': ' + this.statusCode + ' ' + this.message;
    }
}

/**
 * Discogs authorization error class definition
 */
class AuthError extends DiscogsError {

    /**
     * Object constructor
     * @returns {AuthError}
     */
    constructor() {
        super(401, 'You must authenticate to access this resource.');
    }
}

/**
 * Expose the Discogs custom error classes
 */
module.exports = {
    DiscogsError: DiscogsError,
    AuthError: AuthError
};