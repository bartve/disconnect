'use strict';

const wru = require('wru'),
    files = ['error', 'queue', 'util', 'client', 'database'];
let tests = [];

files.forEach((file) => {
    tests = tests.concat(require('./' + file + '.js'));
});

wru.test(tests);