var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var LiveData = new Schema({
    user_id             :       {type: String, required: true, index: true},
    latitude            :       {type: Number, index: true},
    longitude           :       {type: Number, index: true},
    altitude            :       Number,
    altitude_accuracy   :       Number,
    lonlat_accuracy     :       Number,
    heading             :       Number,
    speed               :       Number,
    client_timestamp    :       Date,
    server_timestamp    :       Date,
    comp_heading        :       Number,
    connection_type     :       String
});

// Loop.statics.getUserIdsNear = function getUserIdsNear(location, callback){

// //BELOW USE LTE INSTEAD OF GTE... NEED A REAL TIME AND USER SUPPLIED TIME...
// //******
// //******
// //******

//  var far_time = new Date() - 24*60*60*1000;

//  //return 100 users within 1000km of the location that last transmitted within the last 24 hours
//  return this.distinct('user_id', {   loc :{ $near : [location.longitude,location.latitude],
//                             $maxDistance : 1000000
//                          },
//                          timestamp:{
//                                  $lte: far_time
//                      }
//                  }).exec(callback);
// };

// Loop.statics.getLatestLocationForId = function getLatestLocationForId(userId, callback){
//  //this needs to take into account location error models... these would not be suitable and should be ignored
//  return this.find({user_id: userId}, {latitude: 1, longitude: 1, timestamp: 1}).sort({timestamp: -1}).limit(1).lean().exec(callback);
// };


module.exports = mongoose.model('LiveData', LiveData);
