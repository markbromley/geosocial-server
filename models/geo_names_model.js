var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var geoData = new Schema({
    geonames_id         :       {type: Number, required: true, unique: true},
    location            :       {type : [Number], required:true, index: '2d'},
    name                :       {type: String, required: true}
});

geoData.statics.getNearestLocation = function getNearestLocation(location, callback){

    //return 100 users within 1000km of the location that last transmitted within the last 24 hours
    return this.find({location :{ $near : [location.longitude,location.latitude],
                                   $maxDistance : 1
                            }
                    }).exec(callback);
};

module.exports = mongoose.model('geoData', geoData);
