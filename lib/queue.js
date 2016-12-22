'use strict';

const DiscogsError = require('./error.js').DiscogsError,
    Util = require('./util.js'),
    queueData = new WeakMap();

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
        queueData.set(this, {
            config: Util.merge({}, defaultConfig), 
            stack: [], 
            firstCall: 0, 
            callCount: 0
        });
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
        Util.merge(queueData.get(this).config, customConfig);
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
        let data = queueData.get(this);
        if (data.stack.length === 0) {
            var now = Date.now();
            // Within call interval limits: Just execute the callback
            if (data.callCount < data.config.maxCalls) {
                data.callCount++;
                if (data.callCount === 1) {
                    data.firstCall = now;
                }
                setTimeout(callback, 0, null, (data.config.maxCalls - data.callCount), data.config.maxStack);
            // Upon reaching the next interval: Execute callback and reset
            } else if ((now - data.firstCall) > data.config.interval) {
                data.callCount = 1;
                data.firstCall = now;
                setTimeout(callback, 0, null, (data.config.maxCalls - data.callCount), data.config.maxStack);
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
        let data = queueData.get(this);
        return {
            freeRemaining: ((data.callCount >= data.config.maxCalls) ? 0 : (data.config.maxCalls - data.callCount)),
            stackSize: data.stack.length,
            stackRemaining: (data.config.maxStack - data.stack.length)
        };
    }

    /**
     * Clear the request stack. All queued requests/callbacks will be cancelled!
     * @returns {Queue}
     */
    clear() {
        let item;
        while ((item = queueData.get(this).stack.shift())) {
            clearTimeout(item.timeout);
        }
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
    let data = queueData.get(this);
    // Shift a function from the callback stack and call it
    let callStack = () => {
        data.stack.shift().callback.call(null, null, 0, (data.config.maxStack - data.stack.length));
        data.callCount++;
    };
    if (data.stack.length < data.config.maxStack) {
        let factor = (data.stack.length > 0) ? Math.ceil((data.stack.length / data.config.maxCalls)) : 1,
            timeout = ((data.firstCall + (data.config.interval * factor)) - Date.now()) + (data.stack.length % data.config.maxCalls) + 1;
        data.stack.push({
            callback: callback,
            timeout: setTimeout(callStack, timeout)
        });
    // Queue max length exceeded: Pass an error to the callback
    } else {
        setTimeout(callback, 0, new DiscogsError(429, 'Too many requests'), 0, 0);
    }
}