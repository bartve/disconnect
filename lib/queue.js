var queue = module.exports = {},
	DiscogsError = require('./error.js').DiscogsError,
	stack = [],
	maxItems = 10, // Max 10 items in the execution queue
	interval = 1001; // > 1 second interval between function calls

/**
 * Remove a function from the top of the queue
 */

function remove(){
	stack.shift();
}

/**
 * Execute and remove a function from the top of the queue
 */

function execute(){
	stack.shift().call(this, null, (maxItems-stack.length)-1);
}

/**
 * Add a function to the queue. Usage:
 * 
 * queue.add(function(err, slotsRemaining){
 *		if(!err){ myFunction(); }
 * });
 * 
 * @param {Function} callback - The function to schedule for execution
 */

queue.add = function(callback){
	var len = stack.length;
	if(len < maxItems){
		stack.push(callback);
		if(stack.length === 1){ // Immediate execution on empty queue
			callback(null, (maxItems-len)-1);
			setTimeout(remove, interval); // Remove from queue after interval
		}else{ // Queue
			setTimeout(execute, (len*interval));
		}
	}else{
		callback(new DiscogsError(429, 'Too many requests'), 0);
	}
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