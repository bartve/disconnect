'use strict';

const wru = require('wru'),
    Util = require('../lib/util.js');

const tests = module.exports = [
    {
        name: 'Util: Test stripVariation()',
        test: () => {
            let stripped = Util.stripVariation('Artist (2)');
            wru.log('Artist name "Artist (2)" becomes: ' + stripped);
            wru.assert('Strip artist variation', stripped === 'Artist');
        }
    }, {
        name: 'Util: Test addParams()',
        test: () => {
            wru.assert('URL with no query string', Util.addParams('http://an-url.com', {foo: 'bar', baz: 1}) === 'http://an-url.com?foo=bar&baz=1');
            wru.assert('URL with existing query string', Util.addParams('http://an-url.com?y=5', {foo: 'bar', baz: 1}) === 'http://an-url.com?y=5&foo=bar&baz=1');
        }
    }, {
        name: 'Util: Test escape()',
        test: () => {
            let escaped = Util.escape('!@#$%^&*()+');
            wru.log('Escaped string: ' + escaped);
            wru.assert('Escape string "!@#$%^&*()+"', (escaped === '!%40%23%24%25%5E%26*()%2B'));
        }
    }, {
        name: 'Util: Test merge()',
        test: () => {
            let obj1 = {prop1: [1,2,5]}, obj2 = {prop1: [3,4], prop2: true};
            Util.merge(obj1, obj2);
            wru.assert('Merge array', (obj1.prop1[1] === 4));
            wru.assert('Has merged property', obj1.hasOwnProperty('prop2'));
            wru.assert('Merged property has value', (obj1.prop2 === true));
        }
    }
];

if (!module.parent) {
    wru.test(tests);
}