// Create a like for a post

var UserModel = require('../../models/user_model');
var PostModel = require('../../models/post_model');
var async = require('async');
var errHandle = require('../error_handle');
var utilities = require('../../util_lib');

//set up the manual error response for if required
var newErr = {};
    newErr.name = 'nightparty_error';

var currentTime, user, post;

var createLike = function createLike(req, res, next){
    async.waterfall([

        function(callback){
            // req.user.user_id
            // req.body.post_id
            // new Date()
            UserModel.findOne({_id: req.user.user_id}, callback);
        },
        function(result, callback){
            user = result;
            PostModel.findOne({_id: req.body.post_id}, callback);
        },
        function(result, callback){
            post = result;

            var isUserBlocked = utilities.isUserBlocked(user.blocks, post.user_id);
            // console.log('Is user blocked?' + isUserBlocked);

            if(isUserBlocked){
                newErr.message = 'User blocked - cannot like posts for blocked users';
                callback(newErr);
            }else{
                var alreadyDone = false;
                var isCurrentUsersPost = false;
                for(i=0; i<user.item_likes.length; i++){
                    if(user.item_likes[i].post_id == req.body.post_id){
                        alreadyDone = true;
                    }
                } //End for loop

                if(req.user.user_id == post.user_id){
                    isCurrentUsersPost = true;
                }

                if(alreadyDone){
                    newErr.message= 'Already liked';
                    callback(newErr);
                }else if(isCurrentUsersPost){
                    newErr.message = 'Cannot like own post';
                    callback(newErr);
                }else{
                    callback(null);
                }
        }//end if

        },
        function(callback){
            // Ensure user is not blocked by post creator
            UserModel.findOne({_id: post.user_id}, callback);
        },
        function(result, callback){
            if(result){
                if(result.blocks){
                    var hasUserBlockedCurrentUser = utilities.isUserBlocked(result.blocks, req.user.user_id);
                    if(hasUserBlockedCurrentUser){
                        // Cover reponse to user
                        console.log('USER HAD BEEN BLCOKED CANNOT LIKE');
                        newErr.message = 'Cannot find post to like';
                        callback(newErr);
                    }else{
                        callback(null);
                    }// end innermost if
                }else{
                    callback(null);
                }//end inner if
            }else{
                newErr.message = 'No user found';
                callback(newErr);
            }
        },
        function(callback){
            if(user){
                // get the current time now so that the post record and user record match exactly
                currentTime = new Date();
                var itemLikeObj = {};
                    itemLikeObj.post_id = req.body.post_id;
                    itemLikeObj.timestamp = currentTime;
            
                if(user.item_likes){
                    user.item_likes.push(itemLikeObj)
                }else{
                    user.item_likes = [itemLikeObj]
                }//end inner if
                // Try to save the user updates
                user.save(callback);
            }else{
                newErr.message = 'User not found.';
                callback(newErr);
            }
        },
        function(result, numAffected, callback){
            if(post){
                var userLikeObj = {};
                    userLikeObj.user_id = req.user.user_id;
                    userLikeObj.timestamp = currentTime;
                if(post.user_likes){
                    post.user_likes.push(userLikeObj);
                    if (post.user_likes_total){
                        post.user_likes_total += 1;
                    }else{
                        post.user_likes_total = 1;
                    }
                }else{
                    post.user_likes = [userLikeObj]
                    post.user_likes_total = 1;
                }// End of inner if
                post.save(callback);
            }else{
                newErr.message = 'Post not found';
                callback(newErr);
            }
        }
    ], function(err, result, numAffected){
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

module.exports = createLike;