var wru = require('wru'),
    nock = require('nock'),
    DiscogsClient = require('../lib/client.js');

var tests = module.exports = [
    {
        name: 'Database: Test search without query but with params',
        test: function(){
            nock('https://api.discogs.com').get('/database/search?artist=X&title=Y').reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            var db = client.database();
            db.search({artist: 'X', title: 'Y'}, wru.async(function(err, data){
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: function(){
            nock.cleanAll();
        }
    },{
        name: 'Database: Test search with query and params',
        test: function() {
            nock('https://api.discogs.com').get('/database/search?artist=X&title=Y&q=somequery').reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            var db = client.database();
            db.search('somequery', {artist: 'X', title: 'Y'}, wru.async(function(err, data){
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: function(){
            nock.cleanAll();
        }
    },{
        name: 'Database: Test search with query only',
        test: function() {
            nock('https://api.discogs.com').get('/database/search?q=somequery').reply(200, '{"result": "success"}');

            var client = new DiscogsClient('agent', {consumerKey: 'u', consumerSecret: 'p'});
            var db = client.database();
            db.search('somequery', wru.async(function(err, data){
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && data.result === 'success'));
            }));
        },
        teardown: function(){
            nock.cleanAll();
        }
    }
];

if(!module.parent){
    wru.test(tests);
}