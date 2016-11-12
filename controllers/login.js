//login function
var AccountModel = require ('../models/accounts_model')
    , errHandle = require('./error_handle')
    , jwt = require('jwt-simple')
    , guid = require('../guid')
    , async = require('async');


var logIn = function logIn(req, res, next){

    //assemble initial token object
    var token_outline = {}
        token_outline.payload = guid();
        token_outline.token_payload = {id: token_outline.payload};
        token_outline.secret = 'XXX' //THIS MUST BE MORE SECURE AND ADDED TO THE CONSTANTS OR SOEMTHING!!!!
    // encode
    var token = jwt.encode(token_outline.token_payload, token_outline.secret);
    var token_expire = Date.now() + 100000000;

    var newErr = {};
        newErr.name = 'nightparty_error';

    async.waterfall([
        function(callback){
            AccountModel.getAuthenticated(req.body.email, req.body.password, callback);
        },
        function(account, errorReason, callback){
            if(account){
                account['token'] = token;
                account['token_expire'] = token_expire;
                account.save(callback);
            }else{
                if(errorReason === 0 || errorReason === 1){
                    newErr.message = 'Email/ password combination incorrect.';
                }else if(errorReason === 2){
                    newErr.message = 'Account locked. Please try again later.';
                }else{
                    newErr.message = 'Email/ password combination incorrect.';
                }//end inner if
                callback(newErr);
            }
        },
        function(result, numAffected, callback){
            var response = {}
                response.token = token;
                response.token_expire = token_expire;

            response = JSON.stringify(response);
            res.write(response);
            res.status(200);
            res.end();
        }//end of function waterfall
        ], function(err){
            //this is generic error function
            //delegate the error to the errHandle Module
            console.log('ERROR');
            errHandle.errIdentify(err, function(message){
                errHandle.errSendResponse(res, message);
            });
        });
};

module.exports = logIn;