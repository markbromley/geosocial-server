// Return a list of all nearby users to the current user (excluding blocks)
// Library from @ https://github.com/nwhite89/GeoDistance

var async       = require('async'),
    dist        = require('geo-distance-js'),
    UserModel   = require('../../models/user_model'),
    urlHandle   = require('../../url_handle'),
    utilities   = require('../../services/util_lib'),
    constants   = require('../../config/config_constants');

//TODOS
//Convert meters to KM
//hash user IDs and image ids...

// Used to store the longitude and latitude of the currently logged in user
var tmpLocation = {};

/**
* Gets the people who are nearby to the user supplied as an argument
* as well as the people the given user has blocked. Not that the list
* of people by here is not filtered at all for any kind of block.
*
* @param {object} user The current user who wishes to see people nearby
* @param {function} callback The next function to invoke, accepts error,
          nearby users and blocks as it's three parameters
*
* @method getUsersAndBlocksNearCurrentUser
*/
var getUsersAndBlocksNearCurrentUser = function(user, callback){
    //construct a suitable location object from the previous results array
    var loc = user.latest_loc;
        tmpLocation.longitude = loc[0];
        tmpLocation.latitude = loc[1];
    //execute static function to return Ids near the given location
    UserModel.getUsersNear(tmpLocation, function(err, users){
        if(err){
            callback(err);
        }else{
            callback(null, users, user.blocks);
        }
    });
};


/**
* Creates a filtered list of people nearby to the current user, based
* on the people the current user has blocked and whether each of the nearby
* users has blocked the current user.
*
* @param {array} usersNear The list of unfiltered nearby users
* @param {array} blocks The list of people the current user has blocked
* @param {object} req The request object sent to the controller
* @param {function} callback The next function to invoke, accepts error and
          response list
*
* @method createListOfAllowedNearbyUsers
*/
var createListOfAllowedNearbyUsers = function(usersNear, blocks, req, callback){
    // Used to hold the list of users to be returned at the end of this request
    var responseList = [];
    // Should have a JSON array of users objects now
    for (var i = 0; i < usersNear.length; i++) {
        // Note list is by reference -DANGER FOR ERROR HERE
        addUserToListIfAllowed(responseList,
                                usersNear[i],
                                blocks,
                                req.user.user_id,
                                urlHandle.getOptions(req));
    }
    responseList = JSON.stringify(responseList);
    callback(null, responseList);
};

/**
* Adds the given nearby user to the supplied list if bot the current user
* has not blocked the nearby user and the nearby user has not blocked the
* current user.
*
* @param {array} The list in which to add the nearby user, if allowed
* @param {object} The nearby user object
* @param {array} The list of people blocked by the current user
* @param {integer} The ID of the currently logged in user
* @param {string} The string containing the access token etc for the currently
         logged in user, to be appended to their specific URLs
*
* @method addUserToListIfAllowed
*/
var addUserToListIfAllowed = function(list, userNear, curUserBlocks, curUserId, reqOptions){
    var currentUserHasBlockedNearby = utilities
                                      .isUserBlocked(curUserBlocks,
                                                     userNear._id),
        nearbyUserHasBlockedCurrentUser = utilities
                                          .isUserBlocked(userNear.blocks,
                                                         curUserId);
    // If neither of them have blocked one another, add the nearby user to the
    // filtered list
    if(!currentUserHasBlockedNearby &&
       !nearbyUserHasBlockedCurrentUser){
        //check we don't send back the users requesting the list
        if(userNear._id != curUserId){
            var newUser      = {},
                imUrl        = constants.APP_HOST_URL 
                                        + '/images/'
                                        + userNear.prof_im_url_id
                                        + reqOptions,
                userDistance = dist.getDistance(userNear.latest_loc[1],
                                                userNear.latest_loc[0],
                                                tmpLocation.latitude,
                                                tmpLocation.longitude);
            newUser.id             = userNear._id;
            newUser.category       = 'Users';
            newUser.name           = userNear.pref_name;
            newUser.prof_im_url_id = imUrl;
            newUser.distance       = userDistance;
            list.push(newUser);
        }
    }
};

/**
* The main controller method for returning a list of nearby users
*
* @param {object} req The request object
* @param {object} res The response object
* @param {function} next Returns control to the next matching route controller
*
* @method readAll
*/
var readAll = function(req, res, next){
    async.waterfall([
            function(callback){
                // Get the currently logged in user's details, including
                // latest location stamp
                UserModel.findUserById(req.user.user_id, callback);
            },
            function(user, callback){
                // Get an unfiltered list of nearby people and people blocked 
                // by the current user
                getUsersAndBlocksNearCurrentUser(user, callback);
            },
            function(users, blocks, callback){
                // Filter the list of nearby people based on who has blocked who
                createListOfAllowedNearbyUsers(users, blocks, req, callback);
            }//end of last waterfall function
        ],
        function(err, responseList){
            if(err){
                console.log(err);
                res.status(500);
                res.end();
            }else{
                res.status(200);
                res.write(responseList);
                res.end();
            }
    });
};

module.exports = readAll;