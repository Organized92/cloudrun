/* eslint-env node */
var exec = require('child_process').exec;
var json_error_generator = require('../app/tools/json_error_generator');
var VERSION = "1.0.0";

exports.run = function(data, next) {
    const convert = exec('convert '+data.source_mime.toString()+': '+data.parameter.toString()+' '+data.target_mime.toString()+':', { encoding: "latin1", maxBuffer: 1024 * 1024 * 50 }, function(err, stdout, stderr) {
        if(!err) {
            var output = { image: Buffer.from(stdout, "binary").toString('base64') };  
            if(output.image==="") {
                next(json_error_generator(7));
            } 
            else {
                next(output);
            }
        }
        else {
            next(json_error_generator(7));
        }
    });
    
    convert.stdin.resume();
    var dataIn = new Buffer(data.image, 'base64');
    //convert.stdin.write(dataIn);
    convert.stdin.end(dataIn);
};

exports.version = function() {
    return VERSION;
};