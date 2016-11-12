//logout function
var AccountModel = require ('../models/accounts_model')
    , errHandle = require('./error_handle')
    , async = require('async');

var logOut = function logOut(req, res, next){

    var token_outline = {};
        token_outline.expire_time = Date.now() - 1000000;
        token_outline.token = '';

    var newErr = {};
        newErr.name = 'nightparty_error';

    async.waterfall([
        function(callback){
            AccountModel.findAccountByToken(req.query.access_token, callback);
        },
        function(account, callback){
            if(account){
                account['token'] = token_outline.token;
                account['token_expire'] = token_outline.expire_time;
                account.save(callback);
            }else{
                newErr.message = 'No user found.';
                callback(newErr);
            }
        },
        function(){
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

module.exports = logOut;