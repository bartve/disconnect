var wru = require('wru'),
    nock = require('nock'),
    DiscogsClient = require('../lib/client.js');

var tests = module.exports = [
    {
        name: 'DiscogsClient: Test instance',
        test: function(){
            wru.assert('Instance of DiscogsClient', (new DiscogsClient() instanceof DiscogsClient));
        }
    },{
        name: 'DiscogsClient: Test authenticated()',
        test: function(){
            wru.assert('Authentication level 1 === false', (new DiscogsClient().authenticated(1) === false));
        }
    },{
        name: 'DiscogsClient: Test get()',
        test: function(){
            var client = new DiscogsClient();
            client.get({url: '/labels/1'}, wru.async(function(err, data){
                wru.assert('No error', !err);
                wru.assert('Correct response data', (data && (data.id === 1)));
            }));
        }
    },{
        name: 'DiscogsClient: Test Promise',
        test: function(){
            var client = new DiscogsClient();
            var promise = client.about();
            var isPromise = (typeof promise.then === 'function');
            wru.assert('Returns Promise', isPromise);
            if(isPromise){
                promise.then(wru.async(function(data){
                    wru.assert('Promis resolved', (typeof data.disconnect !== 'undefined'));
                }));
            }
        }
    },{
        name: 'DiscogsClient: Test custom configuration',
        test: function(){
            nock('https://www.example.com').get('/labels/1').reply(200, '{"result": "success"}');

            var client = new DiscogsClient().setConfig({host: 'www.example.com'});
            client.get({url: '/labels/1'}, wru.async(function(err, data){
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