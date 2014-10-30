'use strict';

var Errors = module.exports = {};

/**
 * Discogs generic error
 * @param {number} [statusCode] - A HTTP status code
 * @param {string} [message] - The error message
 * @returns {DiscogsError}
 */

function DiscogsError(statusCode, message){
	Error.captureStackTrace(this, this.constructor);
	this.statusCode = statusCode||404;
	this.message = message||'Unknown error.';
}
DiscogsError.prototype = Object.create(Error.prototype, {
	constructor: {value: DiscogsError},
	name: {value: 'DiscogsError'},
	toString: {value: function(){
		return this.name+': '+this.statusCode+' '+this.message;
	}}
});
Errors.DiscogsError = DiscogsError;

/**
 * Discogs authorization error
 * @returns {AuthError}
 */

function AuthError(){
	Error.captureStackTrace(this, this.constructor);
}
AuthError.prototype = Object.create(DiscogsError.prototype, {
	constructor: {value: AuthError},
	name: {value: 'AuthError'},
	message: {value: 'You must authenticate to access this resource.'},
	statusCode: {value: 401}
});
Errors.AuthError = AuthError;