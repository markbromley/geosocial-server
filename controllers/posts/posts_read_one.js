//get individual post

var UserModel = require('../../models/user_model');
var PostModel = require('../../models/post_model');
var async = require('async');
var urlHandle = require('../../url_handle');
var utilities = require('../../util_lib');
var errHandle = require('../error_handle');

//below @ https://github.com/nwhite89/GeoDistance
var dist = require('geo-distance-js');

//TODOS
//Convert meters to KM
//hash user IDs and image ids...

var constants = require('../../constants');


var readOne = function readOne(req, res, next){

    //set up the manual error response for if required
    var newErr = {};
    newErr.name = 'nightparty_error';

    var tmpLocation = {};
    var exportPost = {};
    var alreadyLikedPost = false;
    var isCurrentUsersPost = false;
    var curUserBlocks = [];

    async.waterfall([
            function(callback){
                //get the currently logged in users latest location stamp
                UserModel.findUserById(req.user.user_id, callback);
            },
            function(curUser, callback){
                if(curUser){
                    var loc = curUser.latest_loc;
                    tmpLocation.longitude = loc[0];
                    tmpLocation.latitude = loc[1];
                    curUserBlocks = curUser.blocks;
                    //find the profile we're looking for
                    PostModel.findPostById(req.params.id, callback);
                }else{
                    newErr.message = 'Error - User not found.';
                    callback(newErr);
                }
            },
            function(post, callback){
                if(post){
                    var isUserBlocked = utilities.isUserBlocked(curUserBlocks, post.user_id);
                    // console.log('Is user blocked? ' + isUserBlocked);
                    if(isUserBlocked){
                        // Pretend post could not be found
                        newErr.message = 'Could not find post';
                        callback(newErr);
                    }else{
                        console.log(post);

                        var postDistance = dist.getDistance(post.loc[1], post.loc[0], tmpLocation.latitude, tmpLocation.longitude);

                        var date = post.server_timestamp.toDateString();

                        for(i=0; i<post.user_likes.length; i++){
                            if(post.user_likes[i].user_id == req.user.user_id){
                                console.log('This user has already liked this post.');
                                alreadyLikedPost = true;
                            }
                        }
                        
                        if(post.user_id == req.user.user_id){
                            isCurrentUsersPost = true;
                        }
                        exportPost.id = post._id;
                        exportPost.user_id = post.user_id;
                        exportPost.content_string = post.content_string;
                        exportPost.category = post.category;
                        exportPost.user_likes = post.user_likes_total;
                        exportPost.user_already_liked = alreadyLikedPost;
                        exportPost.is_current_users_post = isCurrentUsersPost;
                        exportPost.distance = postDistance;
                        exportPost.date = date;
                        if(post.img_url_id){
                            console.log("Image: " + post.img_url_id);
                            exportPost.img_url_id = constants.APP_HOST_URL + '/images/' + post.img_url_id + urlHandle.getOptions(req);
                        }else{
                            exportPost.img_url_id = '';
                        }
                        callback(null);
                    }
                }
            },
            function(callback){
                //get user details and append
                UserModel.findUserById(exportPost.user_id, callback);
            },
            function(postUser, callback){
                var hasUserBlockedCurrentUser = utilities.isUserBlocked(postUser.blocks, req.user.user_id);

                if(hasUserBlockedCurrentUser){
                    newErr.message = 'Post not found.';
                    callback(newErr);
                }else{
                    exportPost.name = postUser.pref_name;
                    exportPost.prof_im_url = constants.APP_HOST_URL + '/images/' + postUser.prof_im_url_id + urlHandle.getOptions(req);
                    

                    exportPost = JSON.stringify(exportPost);

                    callback(null, exportPost);
                }
            }
        ],//end waterfall array
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

module.exports = readOne;