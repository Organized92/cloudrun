/* eslint-env node */
var fs = require('fs');

// Constructor
function DebugOutput(config) {
    this.enabled = config['enabled'];
    this.dbg_output = config['output'];
    this.dbg_level = config['level'];
    this.dbg_file = config['file'];
    
    this.prev_level = 0;
}


// Debug level to text
var dbg_level_text = ["debug", "info", "warn", "error"];


// Log function
DebugOutput.prototype.log = function(message, level) {
    if(this.enabled) {
        var log_text = new Date().toISOString();
        log_text = log_text + " " + dbg_level_text[level] + ":\t" + message;
        
        fs.open(this.dbg_file, 'a', function(err, fd) {
            if(!err) {
                fs.write(fd, log_text + "\n", function() {});
            }
            else {
                console.log("Error writing to file " + this.dbg_file);
            }
        });

        if(this.dbg_output) {
            if(level >= this.dbg_level) {
                console.log(log_text);
            }
        }
    }

    this.prev_level = level;
};

// Add to previous log function
DebugOutput.prototype.prev = function(message) {
    if(this.enabled) {
        var log_text = new Date().toISOString();
        log_text = log_text + "\t" + message;
        
        fs.open(this.dbg_file, 'a', function(err, fd) {
            if(!err) {
                fs.write(fd, log_text + "\n", function() {});
            }
            else {
                console.log("Error writing to file " + this.dbg_file);
            }
        });
        
        if(this.dbg_output) {
            if(this.prev_level >= this.dbg_level) {
                console.log(log_text);
            }
        }
    }
};


// Finish it
module.exports = DebugOutput;