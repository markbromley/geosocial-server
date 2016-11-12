//UNBLOCK USERS FACILITY
var UserModel = require('../../models/user_model');
var async = require('async');
var errHandle = require('../error_handle');

//set up the manual error response for if required
var newErr = {};
    newErr.name = 'nightparty_error';

var deleteBlock = function deleteBlock(req, res, next){
    async.waterfall([
        function(callback){
            UserModel.removeBlockFromUser(req.user.user_id, req.params.id, callback);
        },
        function(numAffected, callback){
            callback(null);
        }
        ], function(err){
            if(err){
                //handle errs
                //this is generic error function
                //delegate the error to the errHandle Module
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else{
                res.status(200);
                // res.write(result);
                res.end();
            }
        });
};

module.exports = deleteBlock;