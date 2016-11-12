//POSTS READ ALL

var async = require('async');
var PostModel = require('../../models/post_model');
var UserModel = require('../../models/user_model');
var urlHandle = require('../../url_handle');

var utilities = require('../../util_lib');


//below @ https://github.com/nwhite89/GeoDistance
var dist = require('geo-distance-js');

//TODOS
//Convert meters to KM
//hash user IDs and image ids...

var constants = require('../../constants');


var readAll = function readAll(req, res, next){

    var newErr = {};
        newErr.name = 'nightparty_error';

    var responseList = [];
    var tmpLocation = {};
    var listOfUserProfiles = [];
    var curUserBlocks = [];


    async.waterfall([
            function(callback){
                //get the currently logged in users latest location stamp
                UserModel.findUserById(req.user.user_id, callback);
            },
            function(user, callback){
                //construct a suitable location object from the previous results array
                var loc = user.latest_loc;
                    tmpLocation.longitude = loc[0];
                    tmpLocation.latitude = loc[1];
                curUserBlocks = user.blocks;
                //execute static function to return Ids near the given lcoation
                PostModel.getPostsNear(tmpLocation, callback);
            },
            function(posts, callback){
                for( var i = 0; i < posts.length; i++){
                    var isUserBlocked = utilities.isUserBlocked(curUserBlocks, posts[i].user_id);

                    if(!isUserBlocked){
                        if(posts[i]._id != req.user.user_id){
                            var newPost = {};
                            if(posts[i].img_url_id){
                                var imUrl = constants.APP_HOST_URL + '/images/' + posts[i].img_url_id + urlHandle.getOptions(req);
                            }else{
                                var imUrl = '';
                            }
                            var userDistance = dist.getDistance(posts[i].loc[1], posts[i].loc[0], tmpLocation.latitude, tmpLocation.longitude);

                            var date = posts[i].server_timestamp.toDateString();

                            newPost.id = posts[i]._id;
                            newPost.user_id = posts[i].user_id;
                            newPost.category = posts[i].category;
                            newPost.content_string = posts[i].content_string;
                            newPost.user_likes = posts[i].user_likes_total;
                            newPost.date = date;
                            newPost.distance = userDistance;
                            newPost.img_url_id = imUrl;
                            listOfUserProfiles.push([posts[i].user_id, posts[i]._id]);
                            responseList.push(newPost);

                        }
                }
                }
                callback(null);
            },
            function(callback){

                async.each(listOfUserProfiles, function(item, eachCallback){
                    UserModel.findUserById(item[0], function(err, result){

                        var imUrl = constants.APP_HOST_URL + '/images/' + result.prof_im_url_id + urlHandle.getOptions(req);
                        var innerIndex = listOfUserProfiles.indexOf(item);

                        var curitem = responseList[innerIndex];

                            curitem.prof_im_url_id = imUrl;
                            curitem.name = result.pref_name;
    

                    var index = listOfUserProfiles.indexOf(item);

                    var hasUserBlockedCurrentUser = utilities.isUserBlocked(result.blocks, req.user.user_id);

                    if(hasUserBlockedCurrentUser){

                    // http://stackoverflow.com/questions/18347033/how-to-shorten-my-conditional-statements/18347047#answer-18347047
                    // Above link explains below code
                        if ( ~index ) responseList.splice(index, 1);
                        if ( ~index ) listOfUserProfiles.splice(index, 1);
                    }

                    // BELOW STRANGE BUG (SEE FINAL ALLBACK TOO), RESPONSELIST 
                    // TYPE CHANGES RANDOMLY THROUGH ASYNC EACH METHOD
                    if(typeof responseList != "object"){
                        responseList = JSON.parse(responseList);
                    }
                        if(err){
                            eachCallback(err);
                        }else{
                            eachCallback(null);
                        }
                    });
                }, callback);
            },
            function(callback){
                callback(null);
            },
            function(callback){
                // VERY STRANGE BUG HERE - CAUSES THIS CALLBACK TO FIRE 6 TIMES
                // CANNOT SEE WHY - RESPONSELIST TYPE CHANGES EACH TIME
                // CURRENTLY WORKS (BY LUCK THOUGH?) AS FINAL CALLBACK
                // ONLY EXECUTES ONCE - THIS SHOULD BE CHECKED AGAIN CAREFULLY
                // SEE ABOVE BUG (CONNECTED) TOO
                console.log('multiple');
                callback(null, responseList);
                
            }//end of last waterfall function
        ],function(err, responseList){
            if(err){
                res.status(500);
                res.end();
            }else{
                res.status(200);
                responseList = JSON.stringify(responseList);
                res.write(responseList);
                res.end();
            }
    });
};

module.exports = readAll;