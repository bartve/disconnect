'use strict';

var queue = module.exports = {},
	DiscogsError = require('./error.js').DiscogsError,
	stack = [],
	maxItems = 10, // Max 10 items in the execution queue
	interval = 1001; // > 1 second interval between function calls

/**
 * Remove a function from the top of the queue
 * @returns {Object}
 */

function remove(){
	stack.shift();
	return this;
}

/**
 * Execute and remove a function from the top of the queue
 * @returns {Object}
 */

function execute(){
	stack.shift().callback.call(this, null, (maxItems-stack.length));
	return this;
}

/**
 * Add a function to the queue. Usage:
 * 
 * queue.add(function(err, slotsRemaining){
 *		if(!err){ myFunction(); }
 * });
 * 
 * @param {Function} callback - The function to schedule for execution
 * @returns {Object}
 */

queue.add = function(callback){
	var len = stack.length;
	if(len < maxItems){
		var item = {};
		if(len === 0){ // Immediate execution on empty queue
			callback(null, maxItems-1);
			item.timeout = setTimeout(remove, interval); // Remove from queue after interval
		}else{ // Queue
			item.callback = callback;
			item.timeout = setTimeout(execute, ((len+1)*interval));
		}
		stack.push(item);
	}else{
		callback(new DiscogsError(429, 'Too many requests'), 0);
	}
	return this;
};

/**
 * Clear the request queue. All queued requests/callbacks will be cancelled!
 * @returns {Object}
 */

queue.clear = function(){
	var item;
	while(item = stack.shift()){
		clearTimeout(item.timeout);
	}
	return this;
};

/**
 * Get the current queue length
 * @returns {Number}
 */

queue.getLength = function(){
	return stack.length;
};

/**
 * Get the maximun queue length
 * @returns {Number}
 */

queue.getMaxLength = function(){
	return maxItems;
};