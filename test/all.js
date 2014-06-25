var wru = require('wru'),
	tests = [],
	files = ['error','queue','util','client'];
	
for(var i in files){
	tests = tests.concat(require('./'+files[i]+'.js'));
}

wru.test(tests);