/* eslint-env node */
var VERSION = "1.0.0";

exports.result = function(data) {
	return { "result": data.toUpperCase() };
};

exports.version = function() {
    return VERSION;
};