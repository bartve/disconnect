const wru = require('wru'),
    Queue = require('../lib/queue.js');

const tests = module.exports = [
    {
        name: 'Queue: Test add() + getStatus() + clear()',
        test: () => {
            let queue = new Queue({
                maxStack: 2, // Max 1 call queued in the stack
                maxCalls: 5, // Max 5 calls per interval
                interval: 5000, // 5 second interval
            });
            let dummy = function() { return true; };
            queue.add(dummy); //  1
            queue.add(dummy); //  2
            queue.add(dummy); //  3
            queue.add(dummy); //  4
            queue.add(wru.async((err, freeRemaining, stackRemaining) => { // 5 (last free call)
                wru.assert('Remaining free positions === 0', freeRemaining === 0);
                wru.assert('Remaining stack positions === 2', stackRemaining === 2);
            }));
            queue.add(dummy); //  6 (first in the stack)
            queue.add(dummy); // 7 (last stacked call)
            queue.add(wru.async((err) => { // 8! Overflow
                wru.assert('Too many requests, err.statusCode === 429', (err && (err.statusCode === 429)));
            }));
            wru.assert('Stack is full', (queue.getStatus().stackRemaining === 0));
            queue.clear(); // Empty stack
            wru.assert('Stack has been cleared', (queue.getStatus().stackSize === 0));
        }
    }
];

if (!module.parent) {
    wru.test(tests);
}