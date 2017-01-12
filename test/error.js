'use strict';

const wru = require('wru'),
    error = require('../lib/error.js');

const tests = module.exports = [
    {
        name: 'Error: Test DiscogsError',
        test: () => {
            let discogsError = new error.DiscogsError(403, 'Test');
            wru.assert('Instance of DiscogsError', (discogsError instanceof error.DiscogsError));
            wru.assert('Instance of Error', (discogsError instanceof Error));
            wru.assert('Status code === 403', (discogsError.statusCode === 403));
            wru.assert('Message === Test', (discogsError.message === 'Test'));
            wru.assert('Name === DiscogsError', (discogsError.name === 'DiscogsError'));
        }
    }, {
        name: 'Error: Test AuthError',
        test: () => {
            let authError = new error.AuthError();
            wru.assert('Instance of AuthError', (authError instanceof error.AuthError));
            wru.assert('Instance of DiscogsError', (authError instanceof error.DiscogsError));
            wru.assert('Status code === 401', (authError.statusCode === 401));
            wru.assert('Message === You must authenticate to access this resource.', (authError.message === 'You must authenticate to access this resource.'));
            wru.assert('Name === AuthError', (authError.name === 'AuthError'));
        }
    }
];

if (!module.parent) {
    wru.test(tests);
}