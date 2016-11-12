//NEW Current Location Model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var CurrentLocation = new Schema({
    user_id             :       {type: String, required: true, index: true},
    loc                 :       {type: [Number], required: true, index: '2d'},
    server_timestamp    :       {type: Date, required: true, index: true}
});

//methods
//find by user_id
//find users near Location
//find records from array of user_ids

//Statics
CurrentLocation.statics.getUsersFromIds = function getUsersFromIds(idArray, callback){
    return this.find({
        //query
        'user_id' : {
            $in: idArray
        }
    },{
    //projection
    }).lean().exec(callback);
};


CurrentLocation.statics.findUserById = function findUserById(userId, callback){
    return this.findOne({user_id: userId}).exec(callback);
};

CurrentLocation.statics.getUsersNear = function getUsersNear(location, callback){

    var far_time = new Date() - 24*60*60*1000;

    //return 100 users within 1000km of the location that last transmitted within the last 24 hours
    return this.find({  loc :{ $near : [location.longitude,location.latitude],
                               $maxDistance : 1000000
                        },
                        server_timestamp:{
                                $gte: far_time
                        }
                    }).exec(callback);
};

module.exports = mongoose.model('CurrentLocation', CurrentLocation);