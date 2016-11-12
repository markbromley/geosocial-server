// Utility Library
var appConstants = require('../config/app_constants');

/**
* Looks up the item from the constants. By wrapping this in a mehtod it serves
* to reduce possible implications of future alterations.
*
* @param val {integer} the 
* @param cat {string}
*
* @method getItemFromIdAndCategory
*/
var getItemFromIdAndCategory = function(val, cat){
    return appConstants[cat][val];
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
    currentUserId = currentUserId.toString();
    if(associates){
        for (var i = 0; i < associates.length; i++) {
            if(currentUserId === associates[i].user_id){
                return getItemFromIdAndCategory(associates[i].rel_type,
                                                'relationType')
                        .toLowerCase();
            }
        }
    }
    return null;
};

/**
* Checks if the user specified by currentUserId is registered as blocked
* in the list of blocked users provided. Returns a boolean value.
*
*
* @param {array} blocks A list of blocked users
* @param {integer} currentUserId The ID of the user to be looked up
*
* @method isUserBlocked
*/
var isUserBlocked = function(blocks, currentUserId){
    currentUserId = currentUserId.toString();
    if(blocks){
        for (var i = 0; i < blocks.length; i++) {
            if(currentUserId == blocks[i].user_id.toString()){
                return true;
            }
        }
    }
    return false;
};

/**
* Creates a unique ID based on a large group of pseudo random values being
* concatenated together. A userId can be added to the unique ID, which
* can then be used in aid with indexing etc. The unique IDs always start with
* a date string, followed by the user ID if provided, followed by the pseudo
* random value concatenation.
*
* @param {integer} userId The ID of the user to be added into the unique ID
*
* @method generateUniqueId
*/
var generateUniqueId = function(userId) {

    userId = userId || '';

    var date = new Date();
    var dateString = date.getTime().toString();

    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (dateString + userId + S4() + S4() + S4() + S4()
            + S4() + S4() + S4() + S4()
            );
};

/**
* Gets the options string to be appended to a client URL request i.e. the
* client's current access token. This can be useful for returning pre-formed
* URLs to the client as part of the JSON response e.g. for profile images.
*
* @param {object} req The request object for the current connection
*
* @method getOptionsForUrl
*/
var getOptionsForUrl = function(req){
        return '?access_token=' + req.query.access_token;
};

// Expose the available APIs
exports.getItemFromIdAndCategory = getItemFromIdAndCategory;
exports.getUserFriendType = getUserFriendType;
exports.isUserBlocked = isUserBlocked;
exports.getOptionsForUrl = getOptionsForUrl;
exports.generateUniqueId = generateUniqueId;