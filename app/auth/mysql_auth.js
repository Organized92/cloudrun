/* eslint-env node */
// Getting dependencies
/*globals verified:true taccept:true*/
var mysql = require('mysql');
var flatconfig = require('flatconfig');
var path = require('path');
var connection;
var pool;
var prefix;

// Constructor
function Auth(dbg, config) {
    this.dbg = dbg;
    this.sys_cfg = config;
    dbg.prev("mysql config file: " + this.sys_cfg['auth']['config'] + ".ini");
    
    this.auth_cfg = flatconfig.load(
        path.resolve(process.cwd() + "/config/config_defaults", "mysql_auth.json"),
        path.resolve(process.cwd() + "/config", this.sys_cfg['auth']['config'] + ".ini")
    );
    
    pool = mysql.createPool({
        connectionLimit : this.auth_cfg['connectionLimit'],
        host : this.auth_cfg['host'].toString(),
        user     : this.auth_cfg['user'].toString(),
        password : this.auth_cfg['password'].toString(),
        database : this.auth_cfg['database'].toString(),
        port     : this.auth_cfg['port'],
        debug : false   
    });
    
    prefix = this.auth_cfg['prefix'];
    
   
    
}

// Authentication process
Auth.prototype.verify = function(token, next) {
    pool.getConnection(function(err, connection){    
		debug = 'SELECT enabled FROM '+prefix+'token WHERE token = '+connection.escape(token)+' AND enabled = 1 LIMIT 1';
		console.log(debug);
		connection.query('SELECT enabled FROM '+prefix+'token WHERE token = '+connection.escape(token)+' AND enabled = 1 LIMIT 1', function (error, result) {
            try {
            connection.release();
            if(!error) {
                if(result.length > 0) {
                    next(true);
                }
                else {
                    next(false);
                }
            }
            else {
                next(false);
            }
            }
            catch (e) { throw e; }

       });
    });
};


// Finish it
module.exports = Auth;