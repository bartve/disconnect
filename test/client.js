var wru = require('wru'),
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
			client._request('/labels/1', wru.async(function(err, data){
				wru.assert('No error', !err);
				wru.assert('Correct response data', (data.id && (data.id === 1)));
			}));
		}
	}
];

(!module.parent)&&wru.test(tests);