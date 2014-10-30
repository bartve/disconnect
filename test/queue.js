var wru = require('wru'),
	queue = require('../lib/queue.js');

var tests = module.exports = [
	{
		name: 'Test queue.add() + queue.getLength() + queue.clear()',
		test: function(){
			var dummy = function(){ return true; };
			queue.add(dummy); //  1
			queue.add(wru.async(function(err, remaining){ //  2
				wru.assert('Remaining positions === 2', remaining === 2);
				// We've done the assertions, the remaining queue items will only be in the way
				queue.clear();
				wru.assert('Cleared queue', (queue.getLength() === 0));
			}));
			queue.add(dummy); //  3
			queue.add(dummy); //  4
			queue.add(dummy); //  5
			queue.add(dummy); //  6
			queue.add(dummy); //  7
			queue.add(dummy); //  8
			queue.add(dummy); //  9
			queue.add(dummy); // 10
			queue.add(wru.async(function(err){ // 11!
				wru.assert('Too many requests, err.statusCode === 429', (err.statusCode === 429));
			}));
			wru.assert('Queue length === 10', (queue.getLength() === 10));
		}
	},{
		name: 'Test queue.getMaxLength()',
		test: function(){
			wru.assert('Maxumum queue length === 10', queue.getMaxLength() === 10);
		}
	}
];

if(!module.parent){ wru.test(tests); }