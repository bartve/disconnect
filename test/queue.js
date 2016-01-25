var wru = require('wru'),
	queue = require('../lib/queue.js')();

var tests = module.exports = [
	{
		name: 'Queue: Test setConfig()',
		test: function(){
			var customConfig = {
				maxStack: 2, // Max 1 call queued in the stack
				maxCalls: 5, // Max 5 calls per interval
				interval: 5000, // 5 second interval
			};
			queue.setConfig(customConfig);
			wru.assert('Custom config', customConfig.maxStack === queue.config.maxStack);
		}
	},{
		name: 'Queue: Test add() + getLength() + clear()',
		test: function(){
			var dummy = function(){ return true; };
			queue.add(dummy); //  1
			queue.add(dummy); //  2
			queue.add(dummy); //  3
			queue.add(dummy); //  4
			queue.add(wru.async(function(err, remainingFree, remainingStack){ // 5 (last free call)
				wru.assert('Remaining free positions === 0', remainingFree === 0);
				wru.assert('Remaining stack positions === 2', remainingStack === 2);
			}));
			queue.add(dummy); //  6 (first in the stack)
			queue.add(dummy); //  7 (second in the stack)
			queue.add(wru.async(function(err){ // 8! Overflow
				wru.assert('Too many requests, err.statusCode === 429', (err && (err.statusCode === 429)));
			}));
			wru.assert('Stack is full', (queue._stack.length === 2));
			queue.clear(); // Empty stack
			wru.assert('Stack has been cleared', (queue._stack.length === 0));
		}
	}
];

if(!module.parent){ wru.test(tests); }