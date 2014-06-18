var queryString = require('querystring');

var util = module.exports = {};

/**
 * Strip the trailing number from a Discogs artist name Artist (2) -> Artist
 * @param {String} name
 * @return {String}
 */

util.stripVariation = function(name){
	return name.replace(/\s\(\d+\)$/, '');
};

/**
 * Add params to a given url or path
 * @param {String} url
 * @param {Object} data
 * @returns {String}
 */

util.addParams = function(url, data){
	if((typeof data === 'object') && (Object.keys(data).length > 0)){
		url = url+((url.indexOf('?')===-1) ? '?' : '&')+queryString.stringify(data);
	}
	return url;
};

/**
 * Escape a string for use in a query string
 * @param {String} str
 * @returns {String}
 */

util.escape = function(str){
	return queryString.escape(str);
};