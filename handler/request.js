/* eslint-env node */
var step = require('step');
var json_error_generator = require('../app/tools/json_error_generator');
var crypto = require('crypto');
var fs = require('fs');


exports.init = function(app, config, modules, auth, dbg) {
    app.options('/request/', function(req, res) {
        dbg.log("Incoming options request from " + req.connection.remoteAddress, 0);
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.set('Access-Control-Allow-Credentials', 'false');
        res.set('Access-Control-Max-Age', '86400');
        res.set('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
		res.set('X-Content-Type-Options', 'nosniff');
        res.end();
    });
    
    app.post('/request/', function(req, res) {
        dbg.log("Incoming request from " + req.connection.remoteAddress, 0);
        res.set('Content-Type', 'application/json');
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET POST PUT OPTIONS');
        res.set('Access-Control-Max-Age', '1000');
        res.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
		res.set('X-Content-Type-Options', 'nosniff');
        
        var hash;
        var cache_found;
        
        try {
        step(
            function start() {
                auth.verify(req.body.token, this);
            },
            function (verified) {
                if(verified) {
                    this();
                }
                else {
                    dbg.prev("Authentication failed");
                    res.json(json_error_generator(1));
                    res.end();
                }
            },
            function () {
                if(req.body.hasOwnProperty('module')) {
                    dbg.prev("module: " + req.body.module);
                    this();
                }
                else {
                    dbg.prev("Request is missing the module value");
                    res.json(json_error_generator(2));
                    res.end();
                }
            },
            function () {
                if(req.body.hasOwnProperty('data')) {
                    this();
                }
                else {
                    dbg.prev("Request is missing the data value");
                    res.json(json_error_generator(4));
                    res.end();
                }
            },
            function () {
                try {
                    cache_found = false;
                    if(config.caching.enabled) {
                        var hmac = crypto.createHmac('sha256', '');
                        hmac.update(JSON.stringify(req.body.module) + JSON.stringify(req.body.data));
                        hash = hmac.digest('hex');
                        if(fs.existsSync(config.caching.directory + "/" + hash)) {
                            cache_found = true;
                            dbg.prev("Cache version found for hash " + hash);

                            if(config.caching.refresh) {
                                fs.utimesSync(config.caching.directory + "/" + hash, Date.now() / 1000, Date.now() / 1000);
                            }

                            this(JSON.parse(fs.readFileSync(config.caching.directory + "/" + hash)));
                        }
                    }
                    
                    if(modules.has(req.body.module)) {
                        if(!cache_found) {
                            if(config.caching.enabled) {
                                dbg.prev("No cache version found for hash " + hash);
                            }
                            modules.get(req.body.module).run(req.body.data, this);
                        }
                    }
                    else {
                        dbg.prev("Module " + req.body.module + " not found");
                        res.json(json_error_generator(3));
                        res.end();
                    }
                }
                catch (e) {
                    dbg.prev("An error occured");
                    dbg.prev(e.stack);
                    res.json(json_error_generator(6));
                    res.end();
                }

            },
            function(result) {
                res.json(result);
                res.end();
                dbg.prev("done");
                
                /*if(!cache_found && config.caching.enabled) {
                    fs.writeFile(config.caching.directory + "/" + hash, JSON.stringify(result), this);
                }*/
            },
            function(err) {
                if(err) throw err;
            }
        );
        }
        catch (err) {
            console.out(err);
        }

    });
};