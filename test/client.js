'use strict';

const wru = require('wru'),
    nock = require('nock'),
    DiscogsClient = require('../lib/client.js'),
    DiscogsDatabase = require('../lib/database.js'),
    DiscogsMarketplace = require('../lib/marketplace.js'),
    DiscogsUser = require('../lib/user.js');


const tests = module.exports = [
    {
        name: 'DiscogsClient: Test authenticated()',
        test: () => {
            wru.assert('Authentication level 1 === false', (new DiscogsClient().authenticated(1) === false));
        }
    }, {
        name: 'DiscogsClient: Test sections',
        test: () => {
            let client = new DiscogsClient();
            wru.assert('client.database() returns DiscogsDatabase', (client.database() instanceof DiscogsDatabase));
            wru.assert('client.marketplace() returns DiscogsMarketplace', (client.marketplace() instanceof DiscogsMarketplace));
            let user = client.user();
            wru.assert('client.user() returns DiscogsUser', (user instanceof DiscogsUser));
            wru.assert('Subsequent client.user() calls return the same DiscogsUser instance', (client.user() === user));
        }
    }, {
        name: 'DiscogsClient: Test get()',
        test: () => {
            let client = new DiscogsClient();
            client.get({url: '/labels/1'}, wru.async((err, data) => {
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && (data.id === 1)));
            }));
        }
    }, {
        name: 'DiscogsClient: Test Promise',
        test: () => {
            let client = new DiscogsClient();
            let promise = client.about();
            let isPromise = (typeof promise.then === 'function');
            wru.assert('Returns Promise', isPromise);
            if (isPromise) {
                promise.then(wru.async((data) => {
                    wru.assert('Promis resolved', (typeof data.disconnect !== 'undefined'));
                }));
            }
        }
    }, {
        name: 'DiscogsClient: Test custom configuration',
        test: () => {
            nock('https://www.example.com').get('/labels/1').reply(200, '{"result": "success"}');

            let client = new DiscogsClient().setConfig({host: 'www.example.com'});
            client.get({url: '/labels/1'}, wru.async((err, data) => {
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: () => {
            nock.cleanAll();
        }
    }
];

if (!module.parent) {
    wru.test(tests);
}