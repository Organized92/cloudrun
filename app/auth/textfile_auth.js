/* eslint-env node */
// Getting dependencies
var fs = require('fs');
var flatconfig = require('flatconfig');
var path = require('path');


// Constructor
function Auth(dbg, config) {
    this.dbg = dbg;
    this.sys_cfg = config;
    dbg.prev("textfile config file: " + this.sys_cfg['auth']['config'] + ".ini");
    
    this.auth_cfg = flatconfig.load(
        path.resolve(process.cwd() + "/config/config_defaults", "textfile_auth.json"),
        path.resolve(process.cwd() + "/config", this.sys_cfg['auth']['config'] + ".ini"));
    
    var tokenfile = fs.readFileSync(this.auth_cfg['file']).toString();
    this.tokens = tokenfile.split(/[\r\n]+/);
    dbg.prev("token file: " + this.auth_cfg['file']);
    dbg.prev("total number of tokens: " + this.tokens.length);
}


// Authentication process
Auth.prototype.verify = function(token, next) {
    if(this.tokens.indexOf(token) !== -1) {
        next(true);
    }
    else {
        next(false);
    }
};


// Finish it
module.exports = Auth;