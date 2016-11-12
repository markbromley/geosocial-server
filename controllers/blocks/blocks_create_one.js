//Add Block

var UserModel = require('../../models/user_model');
var async = require('async');
var errHandle = require('../error_handle');

//set up the manual error response for if required
var newErr = {};
    newErr.name = 'nightparty_error';

//below needs to be tested if fails use upsert, but upsert with $push operator has no validators...

var createBlock = function createBlock(req, res, next){
    async.waterfall([
            function(callback){
                if(req.user.user_id == req.body.user_id){
                    newErr.message = 'You are not permitted to block yourself.';
                    callback(newErr);
                }else{
                    callback(null);
                }
            },
            function(callback){
                UserModel.findOne({_id: req.user.user_id}, callback);
            },
            function(user, callback){
                if(user){
                    var blockObj = {};
                        blockObj.user_id = req.body.user_id;
                        blockObj.timestamp = new Date();
                    if(user.blocks){
                        user.blocks.push(blockObj);
                    }else{
                        user.blocks = [blockObj];
                    }//end inner if

                    //save the model
                    user.save(callback);
                }else{
                    newErr.message = 'User not found.';
                    callback(newErr);
                }
            },
            function(result, numAffected, callback){
                UserModel.removeFriendFromUser(req.user.user_id, req.body.user_id, callback);
            },
            function(numAffected, callback){
                console.log('User Blocked & Friend Removed');
                callback(null);
            }
        ],
        function(err, result){
            //this is generic error function
            //delegate the error to the errHandle Module
            if(err){
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else{
                res.status(200);
                res.end();
            }
    });
};

module.exports = createBlock;