'use strict';

var DiscogsError = require('./error.js').DiscogsError,
	util = require('./util.js');

module.exports = Queue;

/**
 * Default configuration
 * @type {object}
 */

var defaultConfig = {
	maxStack: 20, // Max 20 calls queued in the stack
	maxCalls: 60, // Max 60 calls per interval
	interval: 60000, // 1 minute interval
};

/**
 * Object constructor
 * @param {object} [customConfig] - Optional custom configuration object
 * @returns {Queue}
 */

function Queue(customConfig){
	// Allow the class to be called as a function, returning an instance
	if(!(this instanceof Queue)){
        return new Queue(customConfig);
	}
	// Set the default configuration
	this.config = util.merge({}, defaultConfig);
	if(customConfig && (typeof customConfig === 'object')){
		this.setConfig(customConfig);
	}
	this._stack = [];
	this._firstCall = 0;
	this._callCount = 0;
}

/**
 * Override the default configuration
 * @param {object} customConfig - Custom configuration object
 * @returns {object}
 */

Queue.prototype.setConfig = function(customConfig){
	util.merge(this.config, customConfig);
	return this;
};

/**
 * Add a function to the queue. Usage:
 * 
 * queue.add(function(err, freeCallsRemaining, freeStackPositionsRemaining){
 *     if(!err){
 *         // Do something 
 *     }
 * });
 * 
 * @param {function} callback - The function to schedule for execution
 * @returns {object}
 */

Queue.prototype.add = function(callback){
	if(this._stack.length === 0){
		var now = Date.now();
		// Within call interval limits: Just execute the callback
		if(this._callCount < this.config.maxCalls){
			this._callCount++;
			if(this._callCount === 1){
				this._firstCall = now;
			}
			setTimeout(callback, 0, null, (this.config.maxCalls - this._callCount), this.config.maxStack);
		// Upon reaching the next interval: Execute callback and reset
		}else if((now - this._firstCall) > this.config.interval){
			this._callCount = 1;
			this._firstCall = now;
			setTimeout(callback, 0, null, (this.config.maxCalls - this._callCount), this.config.maxStack);
		// Within the interval exceeding call limit: Queue the call
		}else{
			this._pushStack(callback);
		}
	// Current stack is not empty and must be processed first, queue new calls
	}else{
		this._pushStack(callback);
	}
	return this;
};

/**
 * Push a callback on the callback stack to be executed
 * @param {function} callback
 */

Queue.prototype._pushStack = function(callback){
	if(this._stack.length < this.config.maxStack){
		var factor = Math.ceil((this._stack.length / this.config.maxCalls)),
		    timeout = ((this._firstCall + (this.config.interval * factor)) - Date.now()) + (this._stack.length % this.config.maxCalls) + 1;
		this._stack.push({
			callback: callback,
			timeout: setTimeout(this._callStack, timeout, this)
		});
	}else{ // Queue max length exceeded: Pass an error to the callback
		setTimeout(callback, 0, new DiscogsError(429, 'Too many requests'), 0, 0);
	}
};

/**
 * Shift a function from the callback stack and call it
 * @param {Queue} [queue] - Async calls need the queue instance
 */

Queue.prototype._callStack = function(queue){
	queue = queue||this;
	queue._stack.shift().callback.call(queue, null, 0, (queue.config.maxStack - queue._stack.length));
	queue._callCount++;
};

/**
 * Clear the request stack. All queued requests/callbacks will be cancelled!
 * @returns {object}
 */

Queue.prototype.clear = function(){
	var item;
	while(item = this._stack.shift()){
		clearTimeout(item.timeout);
	}
	return this;
};