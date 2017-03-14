/* eslint-env node */
var step = require('step');
var json_error_generator = require('../app/tools/json_error_generator');


exports.init = function(app, config, modules, auth, dbg) {
    app.post('/server_info/', function(req, res) {
        dbg.log("Incoming server_info from " + req.connection.remoteAddress, 0);
        res.set('Content-Type', 'application/json');
            
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
                try {
                    var module_array = {};
                    modules.forEach(function(value, key) {
    	               module_array[key] = value.version();
    	            });
    	            
    	            var auth_required = true;
    	            if (config['auth']['module'] === "no_auth")
    	               auth_required = false;
    	            
    	            var response = { auth_required: auth_required, modules: module_array };
    	            res.json(response);
    	        }
    	        catch (e) {
    	            dbg.prev("An error occured");
                    dbg.prev(e.stack);
                    res.json(json_error_generator(6));
    	        }
                res.end();
            }
        );
    });
};