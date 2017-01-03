'use strict';

const DiscogsError = require('./error.js').DiscogsError,
    Util = require('./util.js');

/**
 * Default configuration
 * @type {object}
 */
const defaultConfig = {
    maxStack: 20, // Max 20 calls queued in the stack
    maxCalls: 60, // Max 60 calls per interval
    interval: 60000 // 1 minute interval
};

/**
 * Store the queue instance config privately in a WeakMap
 * @type {WeakMap}
 */
const configMap = new WeakMap();

/**
 * Store the queue instance call stack privately in a WeakMap
 * @type {WeakMap}
 */
const stackMap = new WeakMap();

/**
 * Store the queue instance call info privately in a WeakMap
 * @type {WeakMap}
 */
const callInfoMap = new WeakMap();

/**
 * Queue class definition
 */
class Queue {

    /**
     * Object constructor
     * @param {object} [customConfig] - Optional custom configuration object
     * @returns {Queue}
     */
    constructor(customConfig) {
        // Set the default configuration
        configMap.set(this, Util.merge({}, defaultConfig));
        stackMap.set(this, []);
        callInfoMap.set(this, {firstCall: 0, callCount: 0});
        if (customConfig && (typeof customConfig === 'object')) {
            this.setConfig(customConfig);
        }
    }

    /**
     * Override the default configuration
     * @param {object} customConfig - Custom configuration object
     * @returns {Queue}
     */
    setConfig(customConfig) {
        if (customConfig && (typeof customConfig === 'object')) {
            Util.merge(configMap.get(this), customConfig);
        }
        return this;
    }

    /**
     * Add a function to the queue. Usage:
     *
     * queue.add((err, freeCallsRemaining, freeStackPositionsRemaining) => {
     *     if(!err){
     *         // Do something
     *     }
     * });
     *
     * @param {function} callback - The function to schedule for execution
     * @returns {Queue}
     */
    add(callback) {
        let config = configMap.get(this),
            callInfo = callInfoMap.get(this);
        
        // No current stack? Check the call count
        if (stackMap.get(this).length === 0) {
            var now = Date.now();
            // Within call interval limits: Just execute the callback
            if (callInfo.callCount < config.maxCalls) {
                callInfo.callCount++;
                if (callInfo.callCount === 1) {
                    callInfo.firstCall = now;
                }
                setTimeout(callback, 0, null, (config.maxCalls - callInfo.callCount), config.maxStack);
            // Upon reaching the next interval: Execute callback and reset
            } else if ((now - callInfo.firstCall) > config.interval) {
                callInfo.callCount = 1;
                callInfo.firstCall = now;
                setTimeout(callback, 0, null, (config.maxCalls - callInfo.callCount), config.maxStack);
            // Within the interval exceeding call limit: Queue the call
            } else {
                pushStack.call(this, callback);
            }
        // Current stack is not empty and must be processed first, queue new calls
        } else {
            pushStack.call(this, callback);
        }
        return this;
    }

    /**
     * Get the current queue status
     * @returns {object}
     */
    getStatus() {
        let config = configMap.get(this),
            stack = stackMap.get(this),
            callInfo = callInfoMap.get(this);
    
        return {
            freeRemaining: ((callInfo.callCount >= config.maxCalls) ? 0 : (config.maxCalls - callInfo.callCount)),
            stackSize: stack.length,
            stackRemaining: (config.maxStack - stack.length)
        };
    }

    /**
     * Clear the request stack. All queued requests/callbacks will be cancelled!
     * @returns {Queue}
     */
    clear() {
        for (let item of stackMap.get(this)) {
            clearTimeout(item.timeout);
        }
        stackMap.set(this, []);
        return this;
    }
}

/**
 * Expose the Queue class
 */
module.exports = Queue;

/**
 * Push a callback on the callback stack to be executed
 * @param {function} callback
 */
function pushStack(callback) {
    let config = configMap.get(this),
        stack = stackMap.get(this),
        callInfo = callInfoMap.get(this);
    
    // Shift a function from the callback stack and call it
    let callStack = () => {
        stack.shift().callback.call(null, null, 0, (config.maxStack - stack.length));
        callInfo.callCount++;
    };
    
    // Add call to the call stack
    if (stack.length < config.maxStack) {
        let factor = (stack.length > 0) ? Math.ceil((stack.length / config.maxCalls)) : 1,
            timeout = ((callInfo.firstCall + (config.interval * factor)) - Date.now()) + (stack.length % config.maxCalls) + 1;
        stack.push({
            callback: callback,
            timeout: setTimeout(callStack, timeout)
        });
    // Queue max length exceeded: Pass an error to the callback
    } else {
        setTimeout(callback, 0, new DiscogsError(429, 'Too many requests'), 0, 0);
    }
}