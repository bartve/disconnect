var wru = require('wru'),
	util = require('../lib/util.js');

var tests = module.exports = [
	{
		name: 'Util: Test stripVariation()',
		test: function(){
			var stripped = util.stripVariation('Artist (2)');
			wru.log('Artist name "Artist (2)" becomes: '+stripped);
			wru.assert('Strip artist variation', stripped === 'Artist');
		}
	},{
		name: 'Util: Test escape()',
		test: function(){
			var escaped = util.escape('!@#$%^&*()+');
			wru.log('Escaped string: '+escaped);
			wru.assert('Escape string "!@#$%^&*()+"', (escaped === '!%40%23%24%25%5E%26*()%2B'));
		}
	},{
		name: 'Util: Test addParams()',
		test: function(){
			wru.assert('URL with no query string', util.addParams('http://an-url.com', {foo: 'bar', baz: 1}) === 'http://an-url.com?foo=bar&baz=1');
			wru.assert('URL with existing query string', util.addParams('http://an-url.com?y=5', {foo: 'bar', baz: 1}) === 'http://an-url.com?y=5&foo=bar&baz=1');
		}
	}
];

if(!module.parent){ wru.test(tests); }