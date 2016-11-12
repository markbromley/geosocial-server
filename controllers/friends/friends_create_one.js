//Add Friend

var UserModel = require('../../models/user_model');
var async = require('async');
var errHandle = require('../error_handle');
var utilities = require('../../util_lib');

//set up the manual error response for if required
var newErr = {};
    newErr.name = 'nightparty_error';

//below needs to be tested if fails use upsert, but upsert with $push operator has no validators...

var createFriend = function addFriend(req, res, next){
    async.waterfall([
            function(callback){
                if(req.user.user_id == req.body.user_id){
                    newErr.message = 'You are not permitted to friend yourself';
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

                    var isFriendAlready = utilities.getUserFriendType(user.associates, req.body.user_id);
                    console.log('Is friend already: ' + isFriendAlready);

                    var isUserBlocked = utilities.isUserBlocked(user.blocks, req.body.user_id);
                    console.log('Is this user blocked alread? ' + isUserBlocked);

                    if(isFriendAlready || isUserBlocked){
                        // Cannot add as friend, throw an error
                        newErr.message = 'Cannot add as friend';
                        callback(newErr);
                    }else{
                        var friendObj = {};
                            friendObj.user_id = req.body.user_id;
                            friendObj.rel_type = req.body.rel_type;
                            friendObj.timestamp = new Date();
                        if(user.associates){
                            user.associates.push(friendObj);
                        }else{
                            user.associates = [friendObj];
                        }

                        //save the model
                        user.save(callback);
                    }
                }else{
                    newErr.message = 'User not found.';
                    callback(newErr);
                }
            },
            function(result, numAffected, callback){
                console.log('Friend Added');
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
module.exports = createFriend;