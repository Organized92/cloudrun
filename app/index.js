/* eslint-env node */

// Checking if NodeJS in in production mode
if (process.env.NODE_ENV !== "production") {
	console.log("===========================================");
	console.log(" WARNING! NODEJS IS NOT IN PRODUCTION MODE ");
	console.log("===========================================");
	console.log("        DO NOT USE THIS INSTANCE");
	console.log("       IN A PRODUCTIVE ENVIRONMENT");
	console.log("===========================================");
	console.log("    SET ENV_NODE TO \"production\" TO PUT");
	console.log("        NODEJS INTO PRODUCTION MODE");
	console.log("===========================================\n\n");
}

// Getting dependencies
try {
    var express = require('express');
    var bodyParser = require('body-parser');
    var fs = require('fs');
    var hashmap = require('hashmap');
    var flatconfig = require('flatconfig');
    var path = require('path');
    var logger = require('./tools/logger');
}
catch (err) {
    console.log("An error occurred loading the dependencies");
    console.log(err.toString());
    console.log("CloudRun will perform an emergency exit"); 
    process.exit(1);
}


// Initializing flatconfig
try {
    console.log("start:\tLoading main config file");
    var config = flatconfig.load(
        path.resolve(process.cwd() + "/config/config_defaults", "main.json"),
        path.resolve(process.cwd() + "/config", "main.ini"));
}
catch (err) {
    console.log("An error occurred loading the main config file");
    console.log(err.toString());
    console.log("CloudRun will perform an emergency exit");
    process.exit(1);
}


// Initializing debug output
var dbg = new logger(config.logging);
if(config['logging']['enabled']) {
    console.log("start:\tLogging enabled");
    console.log("\toutput: " + config["logging"]["output"]);
    console.log("\tlevel: " + config["logging"]["level"]);
    console.log("\tfile: " + config["logging"]["file"]);
}
else {
    console.log("start:\tLogging disabled");
}


// Load available modules
dbg.log("Loading modules", 1);
var modules = new hashmap();
try {
    var files = fs.readdirSync(process.cwd() + "/modules/");
    for (var i = 0, len = files.length; i < len; i++) {
        var module_name = files[i].replace(/\.[^/.]+$/, ""); // remove ".js"
        modules.set(module_name, require("../modules/" + files[i]));
        dbg.prev("loaded: " + module_name);    
    }
    dbg.prev("total: " + files.length);
}
catch (err) {
    dbg.log("An error occurred loading the modules", 3);
    dbg.prev(err);
    dbg.prev("CloudRun will perform an emergency exit");
    process.exit(1);
}


// Loading authentication
dbg.log("Loading authentication", 1);
dbg.prev("module: " + config['auth']['module']);
try {
    var authModule = require('./auth/' + config['auth']['module']);
    var auth = new authModule(dbg, config);
}
catch (err) {
    dbg.log("An error occurred loading the authentication module", 3);
    dbg.prev(err);
    dbg.prev("CloudRun will perform an emergency exit");
    process.exit(1);
}


// Initializing cache cleaner
if(config.caching.enabled) {
    dbg.log("Initializing cache cleaner", 1);
    dbg.prev("cache directory: " + config.caching.directory);
    try {
        var cleanup_interval = config.caching.clean_interval * 1000;
        if(cleanup_interval > 2147483000 || cleanup_interval < 1) {
            cleanup_interval = 2147483000;
            dbg.log("Caching cleanup interval is too big or too small! It is now 2.147.483 seconds.", 2);
        }
            
        setInterval(function(config) {
            fs.readdir(config.caching.directory, function(err, files) {
                if(!err) {
                    files.forEach(function(current) {
                        var d = new Date();
                        fs.stat(config.caching.directory + "/" + current, function(err, stats) {
                            if(!err && stats.mtime.getTime() < d.getTime() - config.caching.lifetime * 1000) {
                                fs.unlink(config.caching.directory + "/" + current, function() { });
                            }
                        });
                    });
                }
            });
        }, cleanup_interval, config);
    }
    catch (err) {
        dbg.log("An error occurred within the cache cleaner", 3);
        dbg.prev(err);
    }
}


// Initializing express
dbg.log("Initializing express", 1);
var app = express();
app.use(bodyParser.json({limit: '50mb'})); // JSON Parser for Express
app.set('json spaces', 0);


// Initializing API requests
dbg.log("Initializing API request handlers", 1);
try {
    files = fs.readdirSync(process.cwd() + "/handler/");
    for (i = 0, len = files.length; i < len; i++) {
        var handler_name = files[i].replace(/\.[^/.]+$/, ""); // remove ".js"
        require("../handler/" + files[i]).init(app, config, modules, auth, dbg);
        dbg.prev("loaded: " + handler_name);
    }
    dbg.prev("total: " + files.length);
}
catch (err) {
    dbg.log("An error occurred loading the API request handlers", 3);
    dbg.prev(err);
    dbg.prev("CloudRun will perform an emergency exit");
    process.exit(1);
}


// Start the server
dbg.log("Starting server on " + config['server']['listen'] + ":" + config['server']['port'], 1);
var server = app.listen(config['server']['port'], config['server']['listen'], function() {
    dbg.prev("Server running");
});