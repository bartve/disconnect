var wru = require('wru'),
	nock = require('nock'),
	DiscogsClient = require('../lib/client.js'),
	queue = require('../lib/queue.js');

var tests = module.exports = [
	{
		name: 'Test DiscogsClient instance',
		test: function(){
			wru.assert('Instance of DiscogsClient', (new DiscogsClient() instanceof DiscogsClient));
		}
	},{
		name: 'Test DiscogsClient.authenticated()',
		test: function(){
			wru.assert('Instance of DiscogsClient', (new DiscogsClient().authenticated() === false));
		}
	},{
		name: 'Test DiscogsClient._request()',
		test: function(){
			var client = new DiscogsClient();
			client._request({url: '/labels/1'}, wru.async(function(err, data){
				wru.assert('No error', !err);
				wru.assert('Correct response data', (data.id && (data.id === 1)));
			}));
		}
	},{
		name: 'Test DiscogsClient options parameter sets default host',
		test: function(){
			nock('https://www.example.com')
				.get('/labels/1')
				.reply(200, '{"result": "success"}');

			var client = new DiscogsClient(null, null, {host: 'www.example.com'});
			client._request({url: '/labels/1'}, wru.async(function(err, data){
				nock.cleanAll();
				wru.assert('No error', !err);
				wru.assert('Correct response data', (data && data.result === "success"));
			}));
		}
	}
];

(!module.parent)&&wru.test(tests);