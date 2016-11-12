// Read a single profile (specified by ID) controller
// Library from @ https://github.com/nwhite89/GeoDistance
var dist      = require('geo-distance-js'),
    constants = require('../../constants'),
    utilities = require('../../util_lib'),
    UserModel = require('../../models/user_model'),
    PostModel = require('../../models/post_model'),
    async     = require('async'),
    urlHandle = require('../../url_handle'),
    errHandle = require('../error_handle');

//TODOS
//Convert meters to KM
//hash user IDs and image ids...

// Set up the manual error response for if required
var newErr = {};
newErr.name = 'nightparty_error';

// Used to store the longitude and latitude of the currently logged in user
var tmpLocation = {};

// Boolean value to record whether the profile being requested is that of the
// user which is making the request
var isCurrentUser = false;

// Used to store a reference to the requested user object once found
var user = null;

// Specifies the type of relation between the logged in user and the user profile
// being requested
var friendType = null;

/**
* Returns a specific attribute value for a user profile, based on the magic
* number associated with item value (i.e. the key), within that category of
* item e.g. val = 3, cat = height => 1ft tall
*
* @param {integer} val The key number of the item to retrieve
* @param {object} cat The category in which to look for the item
*
* @method
*/
var getItemFromIdAndCategory = function(val, cat){
    return utilities.getItemFromIdAndCategory(val, cat);
};

/**
* Returns the friend type of a single specified user (based on their 
* currentUserId) by comparing to an array of associates, which should contain
* the specified user and looking up the associated friend type, based on their 
* relation. Returns a string if the associate is identified or null otherwise.
*
* @param {integer} currentUserId The ID of the specified user
* @param {array} associates The list of friends (currently of any/ all types)
*
* @method getUserFriendType
*/
var getUserFriendType = function(associates, currentUserId){
    return utilities.getUserFriendType(associates, currentUserId);
};

/**
* Finds the user specified by the userRequestedId and sets the appropriate flags
* i.e. if is the currently logged in user etc. Additionally sets the temporary
* location for this request based on the currently logged in user's location. 
*
* @param {integer} userRequestedId The ID of the user to find
* @param {object} curUser The object representing the currently logged in user
* @param {function} callback The next function to invoke, accepts error and user
         object
*
* @method getUserToFindAndSetLocation
*/
var getUserToFindAndSetLocation = function(userRequestedId, curUser, callback){       
    var currentUserHasBlockedRequestedUser = utilities
                        .isUserBlocked(curUser.blocks, 
                                       userRequestedId);
    if(currentUserHasBlockedRequestedUser){
        newErr.messsage = "You are not permitted to view blocked profiles.";
        callback(newErr);
    }else{
        var loc = curUser.latest_loc;
        tmpLocation.longitude = loc[0];
        tmpLocation.latitude = loc[1];
        //find the profile we're looking for
        if(userRequestedId == 0){
            isCurrentUser = true;
            callback(null, curUser);
        }else{
            UserModel.findUserById(userRequestedId, callback);
            // Get a list of the friends of the currently logged in user
            friendType = getUserFriendType(
                                            curUser.associates, 
                                            userRequestedId);
        }
    }
};

/**
* Iterates through a raw list of posts directly from a user profile and
* generates list appropriate for request.
*
* @param {array} posts
* @param {string} The string containing the access token etc for the currently
         logged in user, to be appended to their specific URLs
* @param {function} callback The next function to invoke, accepts error and
*
* @method createListOfUsersPosts
*/
var createListOfUsersPosts = function(posts, reqOptions, callback){
    var responseList = [];
    if(!isCurrentUser){
    var profImUrl = constants.APP_HOST_URL 
                    + '/images/'
                    + user.prof_im_url_id
                    + reqOptions;
        for( var i = 0; i < posts.length; i++){
            addPostToList(posts[i],
                          profImUrl,
                          responseList,
                          reqOptions);
        }
        callback(null, responseList);
    }else{
        callback(null, null);
    }
};

/**
* Takes a given post and details, reformats and adds to the specified list (by
* reference)
*
* @param {object} post
* @param {string} profImUrl
* @param {array} list
* @param {string} The string containing the access token etc for the currently
         logged in user, to be appended to their specific URLs
*
* @method
*/
var addPostToList = function(post, profImUrl, list, reqOptions){
    var newPost = {};
    var imUrl = constants.APP_HOST_URL
                + '/images/'
                + post.img_url_id
                + reqOptions;

    newPost.id = post._id;
    newPost.category = post.category;
    newPost.img_url_id = imUrl;
    newPost.distance = '';
    newPost.content_string = post.content_string;
    newPost.user_likes = post.user_likes_total;
    newPost.date = post.server_timestamp.toDateString();
    newPost.prof_im_url_id = profImUrl;
    newPost.name = user.pref_name;
    list.push(newPost);
};

/**
*
*
* @param
* @param
* @param {string} The string containing the access token etc for the currently
         logged in user, to be appended to their specific URLs
*
* @method
*/
var getOutputUserObject = function(user, postList, reqOptions){
    var userDistance = dist.getDistance(user.latest_loc[1],
                                        user.latest_loc[0],
                                        tmpLocation.latitude,
                                        tmpLocation.longitude);
    var imUrl = constants.APP_HOST_URL
                + '/images/'
                + user.prof_im_url_id
                + reqOptions;
    var exportUser = {};
        exportUser.id = user._id;
        exportUser.category = 'profile';
        exportUser.name = user.pref_name;
        exportUser.description = user.description;
        exportUser.distance = userDistance;
        exportUser.prof_im_url_id = imUrl;
        exportUser.likes_1 = getItemFromIdAndCategory(user.likes_1, 'likes');
        exportUser.likes_2 = getItemFromIdAndCategory(user.likes_2, 'likes');
        exportUser.likes_3 = getItemFromIdAndCategory(user.likes_3, 'likes');
        exportUser.height = getItemFromIdAndCategory(user.height, 'height');
        exportUser.weight = getItemFromIdAndCategory(user.weight, 'weight');
        exportUser.rel_status = getItemFromIdAndCategory(user.rel_status,
                                                         'relStatus');
        exportUser.sexuality = getItemFromIdAndCategory(user.sexuality,
                                                        'sexuality');
        exportUser.ethnicity = getItemFromIdAndCategory(user.ethnicity,
                                                        'ethnicity');
        exportUser.eye_color = getItemFromIdAndCategory(user.eye_color,
                                                        'eyeColor');
        exportUser.hair_color = getItemFromIdAndCategory(user.hair_color,
                                                        'hairColor');
        exportUser.political_views = getItemFromIdAndCategory(user.political_views,
                                                              'politicalViews');
        exportUser.religous_views = getItemFromIdAndCategory(user.religous_views,
                                                             'religousViews');
        exportUser.education = getItemFromIdAndCategory(user.education,
                                                        'education');
        exportUser.pets = getItemFromIdAndCategory(user.pets, 'pets');
        exportUser.work_status = getItemFromIdAndCategory(user.work_status,
                                                          'workStatus');
        exportUser.rel_type = friendType;
        if(user.latest_loc_name){
            exportUser.latest_loc_name = user.latest_loc_name;
        }
        if(postList){
            exportUser.posts = postList;
        }
        return exportUser;
};

/**
*
*
* @param
* @param
*
* @method
*/
var validateAndGetUser = function(curUser, requestedUserId, callback){
    if(curUser){
        getUserToFindAndSetLocation(requestedUserId,
                                    curUser,
                                    callback);
    }else{
        newErr.message = 'Error - User not found.';
        callback(newErr);
    }
};

/**
*
*
* @param
* @param
*
* @method
*/
var validateAndGetPosts = function(userObj, requestedUserId, callback){
    // If a user was found store a reference to it
    if(userObj){
        user = userObj;
    }

    // If the user is not the current user get their posts
    if(!isCurrentUser){
        PostModel.findPostsFromSingleUser(requestedUserId, callback);
    }else{
        callback(null, null);
    }
};

/**
*
*
* @param
* @param
* @param {string} The string containing the access token etc for the currently
         logged in user, to be appended to their specific URLs
*
* @method
*/
var validateAndGetOutputUserObject = function(responseList, curUserId, reqOptions, callback){
    if(user){
        var hasUserBlockedCurrentUser = utilities.isUserBlocked(user.blocks,
                                                                curUserId);
        if(hasUserBlockedCurrentUser){
            // Really the user is blocked but do not allow them to know this
            newErr.message = 'Cannot find user';
            callback(newErr);
        }else{
            exportUser = getOutputUserObject(user,
                                            responseList,
                                            reqOptions
                                            );
            exportUser = JSON.stringify(exportUser);

            callback(null, exportUser);
        }
    }
};

/**
*
*
* @param
* @param
*
* @method
*/
var readOne = function readOne(req, res, next){
    async.waterfall([
            function(callback){
                //get the currently logged in users latest location stamp
                UserModel.findUserById(req.user.user_id, callback);
            },
            function(curUser, callback){
                validateAndGetUser(curUser,
                                   req.params.id,
                                   callback);
            },
            function(userObj, callback){
                validateAndGetPosts(userObj,
                                    req.params.id,
                                    callback);
            },
            function(posts, callback){
                createListOfUsersPosts(posts,
                                       urlHandle.getOptions(req),
                                       callback);
            },
            function(responseList, callback){
                validateAndGetOutputUserObject(responseList,
                                               req.user.user_id,
                                               urlHandle.getOptions(req),
                                               callback);
            }
        ],//end waterfall array
        function(err, result){
            if(err){
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else if(result){
                res.status(200);
                console.log("\n\n\n\n\n\nHere:\n");
                console.log(result);
                res.write(result);
                res.end();
            }else{
                res.status(500);
                res.end();
            }
    });// end async waterfall
};// end method

module.exports = readOne;