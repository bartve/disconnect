'use strict';

const wru = require('wru'),
    nock = require('nock'),
    DiscogsClient = require('../lib/client.js');

const tests = module.exports = [
    {
        name: 'Database: Test search without query but with params',
        test: () => {
            nock('https://api.discogs.com').get('/database/search?artist=X&title=Y').reply(200, '{"result": "success"}');

            let client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            let db = client.database();
            db.search({artist: 'X', title: 'Y'}, wru.async((err, data) => {
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: () => {
            nock.cleanAll();
        }
    }, {
        name: 'Database: Test search with query and params',
        test: () => {
            nock('https://api.discogs.com').get('/database/search?artist=X&title=Y&q=somequery').reply(200, '{"result": "success"}');

            let client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            let db = client.database();
            db.search('somequery', {artist: 'X', title: 'Y'}, wru.async((err, data) => {
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: () => {
            nock.cleanAll();
        }
    }, {
        name: 'Database: Test search with query only',
        test: () => {
            nock('https://api.discogs.com').get('/database/search?q=somequery').reply(200, '{"result": "success"}');

            let client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            let db = client.database();
            db.search('somequery', wru.async((err, data) => {
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