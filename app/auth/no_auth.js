/* eslint-env node */

// Constructor
function Auth(dbg, config) {
    this.dbg = dbg;
    this.config = config;
}


// Authentication process
Auth.prototype.verify = function(token, next) {
    next(true);
};


// Finish it
module.exports = Auth;