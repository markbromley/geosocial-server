//Utility Library
var appConstants = require('./app_constants');

var getItemFromIdAndCategory = function getItemFromIdAndCategory(val, cat){
    return appConstants[cat][val];
};

var getUserFriendType = function getUserFriendType(associates, currentUserId){
    currentUserId = currentUserId.toString();
    if(associates){
        for (var i = 0; i < associates.length; i++) {

            if(currentUserId === associates[i].user_id){
                console.log('This is a friend of type: ' + associates[i].rel_type);
                return getItemFromIdAndCategory(associates[i].rel_type, 'relationType').toLowerCase();
            }
        }
    }
    return null;
};

var isUserBlocked = function isUserBlocked(blocks, currentUserId){
    currentUserId = currentUserId.toString();
    if(blocks){
        for (var i = 0; i < blocks.length; i++) {
            if(currentUserId == blocks[i].user_id.toString()){
                console.log('This is a blocked user. ' + currentUserId + ' and ' + blocks[i].user_id.toString());
                return true;
            }
        }
    }
    return false;
};


exports.getItemFromIdAndCategory = getItemFromIdAndCategory;
exports.getUserFriendType = getUserFriendType;
exports.isUserBlocked = isUserBlocked;