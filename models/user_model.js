var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var validate = require('mongoose-validator').validate;
var appConstants = require('../app_constants');

//Validators
var nameValidator = [   validate({
                            message: 'Name length must be between 3 and 70 characters.'
                        },'len', 3, 70)
                        // validate({
                        //  message: 'First name and second name should be separated by a space.'
                        // }, 'contains', ' ')
                    ];

var genderValidator = [
                        validate({
                            message: 'Invalid gender type.'
                        }, 'isInt')
                    ];

var profImUrlValidator = [
                        validate({
                            message: 'Invalid profile image.',
                            passIfEmpty: true
                        },'isUrl')
                    ];

var prefNameValidator = [validate({
                            message: 'Name length must be between 3 and 70 characters.'
                            },'len', 3, 70)

                        ];

//Schema
var User = new Schema({
    name                :       {type: String, required: true, validate: nameValidator},
    gender              :       {type: Number, required: true},
    prof_im_url_id      :       {type: String},
    pref_name           :       {type: String},
    distance_format     :       {type: Number, min: 0, max: 2},
    description         :       {type: String},
    dob                 :       {type: Date, required: true},
    height              :       {type: Number, min: 0, max: 121},
    weight              :       {type: Number, min: 0, max: 351},
    rel_status          :       {type: Number, min: 0, max: 11},
    sexuality           :       {type: Number, min: 0, max: 4},
    likes_1             :       {type: Number, min: 0, max: 89},
    likes_2             :       {type: Number, min: 0, max: 89},
    likes_3             :       {type: Number, min: 0, max: 89},
    ethnicity           :       {type: Number, min: 0, max: 9},
    eye_color           :       {type: Number, min: 0, max: 6},
    hair_color          :       {type: Number, min: 0, max: 8},
    political_views     :       {type: Number, min: 0, max: 7},
    religous_views      :       {type: Number, min: 0, max: 15},
    education           :       {type: Number, min: 0, max: 8},
    pets                :       {type: Number, min: 0, max: 9},
    work_status         :       {type: Number, min: 0, max: 6},
    
    item_likes          :       [{
                                    post_id     :       String,
                                    timestamp   :       Date
                                }],
    associates          :       [{
                                    user_id     :       String,
                                    rel_type    :       {type: Number, min: 0, max: 4},
                                    timestamp   :       Date
                                }],

    blocks              :       [{
                                    user_id     :       String,
                                    timestamp   :       Date
                                }],
    //below would be better as nested doc but can't due to current issue
    //https://jira.mongodb.org/browse/SERVER-8699?page=com.atlassian.jira.plugin.system.issuetabpanels:all-tabpanel
    latest_loc          :       {type : [Number], index: '2d'},
    latest_loc_name     :       {type: String},
    latest_server_timestamp :   {type: Date, index: true}
});

//Statics
User.statics.getUsersFromIds = function getUsersFromIds(idArray, callback){
    return this.find({
        //query
        '_id' : {
            $in: idArray
        }
    },{
        //projection
    }).lean().exec(callback);
};


User.statics.removeFriendFromUser = function removeFriendFromUser(userId, friendId, callback){

    return this.update({_id: userId},{$pull: {"associates":{user_id: friendId}}}).exec(callback);
};

User.statics.removeBlockFromUser = function removeBlockFromUser(userId, blockId, callback){

    return this.update({_id: userId},{$pull: {"blocks":{user_id: blockId}}}).exec(callback);
};

User.statics.findUserById = function findUserById(userId, callback){
    return this.findOne({_id: userId}).exec(callback);
};

User.statics.getFriends = function getFriends(userId, callback){
    return this.findOne({_id: userId}, 'associates', {lean:true}).exec(callback);
};

User.statics.getBlocks = function getBlocks(id){
    return this.findOne({_id: userId}, 'blocks', {lean:true}).exec(callback);
};

User.statics.updateProfile = function updateProfile(userId, profileObj, callback){

    return this.update({_id: userId}, profileObj).exec(callback);

    //  The callback function receives (err, numberAffected, rawResponse).
    // err is the error if any occurred
    // numberAffected is the count of updated documents Mongo reported
    // rawResponse is the full response from Mongo
};

// User.statics.isLatestUpdateRecentEnough = function isLatestUpdateRecentEnough(){
//  var far_time = new Date() - 10*60*1000;

//  return this.find({latest_server_timestamp:{ $gte: far_time}}).exec(callback);
// };

User.statics.getUsersNear = function getUsersNear(location, callback){

    var far_time = new Date() - 100*24*60*60*1000;
    //return 100 users within 1000km of the location that last transmitted within the last 24 hours
    return this.find({latest_loc :{ $near : [location.longitude,location.latitude],
                                   $maxDistance : 1000000
                            },
                            latest_server_timestamp:{
                                    $gte: far_time
                            }//end here
                    }).exec(callback);
};

// User.methods.validateName = function validateName(){
//  this.name
// };

module.exports = mongoose.model('User', User);;
