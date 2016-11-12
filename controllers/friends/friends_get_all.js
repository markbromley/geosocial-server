var async = require('async');
var UserModel = require('../../models/user_model');
var errHandle = require('../error_handle');
var urlHandle = require('../../url_handle');

var utilities = require('../../util_lib');


//below @ https://github.com/nwhite89/GeoDistance
var dist = require('geo-distance-js');

//TODOS
//Convert meters to KM
//hash user IDs and image ids...

var constants = require('../../constants');


function getItemFromIdAndCategory(val, cat){
    return utilities.getItemFromIdAndCategory(val, cat);
}

function getUserFriendType(associates, currentUserId){
    return utilities.getUserFriendType(associates, currentUserId);
}// end method getUserFriendType


//below needs to be tested if fails use upsert, but upsert with $push operator has no validators...

var getAllFriends = function getAllFriends(req, res, next){

    var tmpLocation = {};

    //set up the manual error response for if required
    var newErr = {};
    newErr.name = 'nightparty_error';

    // var userRelTypeArray = []

    async.waterfall([
            function(callback){
                UserModel.findOne({_id: req.user.user_id}, callback);

            },
            function(user, callback){
                if(user){
                //construct a suitable location object from the previous results array
                var loc = user.latest_loc;
                    tmpLocation.longitude = loc[0];
                    tmpLocation.latitude = loc[1];

                    if(user.associates){
                        //find each user...
                        //use waterfall callback to prevent a huge pyramid...
                        callback(null, user);
                    }else{
                        newErr.message = 'No friends added.';
                        callback(newErr);
                    }
                }else{
                    newErr.message = 'Error - User not found.';
                    callback(newErr);
                }
            },
            function(user, callback){
                var friendsObj = user.associates;
                var idArray = [];
                for (var i = 0; i < friendsObj.length; i++) {
                    idArray.push(friendsObj[i].user_id);
                }
                callback(null, idArray, user);
            },
            function(idArray, curUser, callback){
                UserModel.getUsersFromIds(idArray, function(err, users){
                    if(err){
                        callback(err);
                    }else{
                        callback(null, users, curUser)
                    }
                });
            },
            function(users, requestingUser, callback){
                if(users){
                    var responseArray = [];
                    for (var i = 0; i < users.length; i++) {
                        var isUserBlocked = utilities.isUserBlocked(requestingUser.blocks, users[i]._id);

                        var hasUserBlockedCurrentUser = utilities.isUserBlocked(users[i].blocks, req.user.user_id);

                        // console.log('Is user blocked? ' + isUserBlocked);
                        if(!isUserBlocked && !hasUserBlockedCurrentUser){
                            // console.log('User id: ' + users[i]._id);
                            // console.log('User length: ' + users.length + i);
                            var rel_type = getUserFriendType(requestingUser.associates, users[i]._id);

                            var imUrl = constants.APP_HOST_URL + '/images/' + users[i].prof_im_url_id + urlHandle.getOptions(req);

                            var userDistance = dist.getDistance(users[i].latest_loc[1], users[i].latest_loc[0], tmpLocation.latitude, tmpLocation.longitude);

                            // console.log('Relation type in loop: ' + rel_type);

                            //get what we want for the response
                            var curUser = {};
                                curUser.user_id = users[i]._id;
                                curUser.pref_name = users[i].pref_name;
                                curUser.rel_type = rel_type;
                                curUser.distance = userDistance;
                                curUser.prof_im_url_id = imUrl;
                                responseArray.push(curUser);
                        }
                    }//end for
                    responseArray = JSON.stringify(responseArray);
                    //finally pus the response to the array
                    callback(null, responseArray);
                }else{
                    newErr.message = 'Error - friends not found';
                    callback(newErr);
                }
            }
        ],
        function(err, result){
            if(err){
                //handle errs
                //this is generic error function
                //delegate the error to the errHandle Module
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else if(result){
                res.status(200);
                res.write(result);
                res.end();
            }else{
                res.status(500);
                res.end();
            }
    });
};

module.exports = getAllFriends;