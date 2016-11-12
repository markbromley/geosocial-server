//Change password module
var AccountModel = require ('../models/accounts_model')
    , errHandle = require('./error_handle')
    , async = require('async');


var changePass = function changePass(req, res, next){

var newErr = {};
    newErr.name = 'nightparty_error';

async.waterfall([
        function(callback){
            if(req.body.new_password === req.body.confirm_new_password){
                callback(null);
            }else{
                newErr.message = 'new passwords do not match.'
                callback(newErr);
            }
        },
        function(callback){
            AccountModel.findAccountByToken(req.query.access_token, callback);
        },
        function(account, callback){
            if(account){
                callback(null, account.email);
            }else{
                newErr.message = 'No user found.';
                callback(newErr);
            }
        },
        function(email, callback){
            AccountModel.getAuthenticated(email, req.body.current_password, callback);
        },
        function(account, errorReason, callback){
            if(account){
                account.password = req.body.new_password;
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

module.exports = changePass;