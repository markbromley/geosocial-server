// Error Handle - Group of methods to handle errors within the app

/**
* Capitalizes the first letter of the input string and returns the newly
* capitalized string.
*
* @param {string} string The input string
*
* @private
* @method _capitaliseFirstLetter
*/
var _capitaliseFirstLetter = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
* Picks out if the error fits into one of our model validation criteria.
* If so, tidies the response up and sends back a list of the errors as a string.
*
* @param {object} err The error object from which to identify the type of error
* @param {function} callback The callback function to execute afterwards.
*         Accepts a string as its one and only parameter and is often passed
*         on to errSendResponse
*
* @method errIdentify
*/
var errIdentify = function(err, callback){
    var assembly,
        returnMessage = [];
    if (err.name == 'ValidationError'){
        for (var key in err.errors) {
            if(err.errors[key].type === "required"){
                assembly = err.errors[key].path + ' required';
                assembly = _capitaliseFirstLetter(assembly);
                returnMessage.push(assembly);

            }else{
                assembly = err.errors[key].type;
                returnMessage.push(assembly);
            }
        }
    }
    // Check to make sure not hand written error
    if(err.name == 'nightparty_error'){
        returnMessage.push(err.message);
    }
    callback(returnMessage);
};


/**
* Usually used as callback to above and takes a preprocessed array of errors 
* returning the appropriate HTTP status code and error message for the first 
* error only.
*
* @param {object} res The response object for the current connection
* @param {array} message The string containing the error messages
*        for the client. Note that the message only returns the first error to
*        the client to avoid confusion.
*
* @method errSendResponse
*/
var errSendResponse = function(res, message){
    if(message.length < 1){
        //if the error didn't come through on the validator, it must be
        //a system error, so send a response 500
        res.status(500);
        res.end();
    }else{
        //if the error is in the validator array, it must be a client error
        res.status(400);
        var errResponse = {};
            errResponse.id = 400;
            errResponse.description = message[0];
            errResponse = JSON.stringify(errResponse);
        res.write(errResponse);
        res.end();
    }
};

// Expose the available APIs
exports.errIdentify = errIdentify;
exports.errSendResponse = errSendResponse;