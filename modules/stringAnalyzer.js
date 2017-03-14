/* eslint-env node */
var hashmap = require('hashmap');

var VERSION = "1.0.0";

exports.run = function(data, next) {
    var table = new hashmap();
    for (var i = 0, len = data.length; i < len; i++) {
        if(table.has(data[i])) {
            table.set(data[i], table.get(data[i]) + 1);
        }
        else {
            table.set(data[i], 1);
        }
    }
    
    var letter_count = {};
	table.forEach(function(value, key) {
	    letter_count[key] = value;
	});
	
	var output = { length: data.length, letter_count: letter_count };
	
	next(output);
};

exports.version = function() {
    return VERSION;
};