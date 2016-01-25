var wru = require('wru'),
	error = require('../lib/error.js');

var tests = module.exports = [
	{
		name: 'Error: Test DiscogsError',
		test: function(){
			var discogsError = new error.DiscogsError(403, 'Test');
			wru.assert('Instance of DiscogsError', (discogsError instanceof error.DiscogsError));
			wru.assert('Instance of Error', (discogsError instanceof Error));
			wru.assert('Status code === 403', (discogsError.statusCode === 403));
		}
	},{
		name: 'Error: Test AuthError',
		test: function(){
			var authError = new error.AuthError();
			wru.assert('Instance of AuthError', (authError instanceof error.AuthError));
			wru.assert('Instance of Error', (authError instanceof Error));
			wru.assert('Status code === 401', (authError.statusCode === 401));
		}
	}
];

if(!module.parent){ wru.test(tests); }