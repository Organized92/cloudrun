/* eslint-env node */
module.exports = function(err_no) {
    var message = "Unknown error";
    switch (err_no) {
        case 1:
            message = "Authentication failed or token missing";
            break;
        case 2:
            message = "Module value missing";
            break;
        case 3:
            message = "Module not found";
            break;
        case 4:
            message = "Data missing";
            break;
        case 5:
            message = "Incorrect data format";
            break;
        case 6:
            message = "Internal module error";
            break;
        case 7:
            message = "Bad arguments given";
            break;
    }
    
    return { "error": { "code": err_no, "message": message } };
};