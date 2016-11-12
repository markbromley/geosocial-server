var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Post = new Schema({
    user_id             :       {type: String, required: true, index: true},
    category            :       {type: Number, required: true},
    loc                 :       {type: [Number], index: '2d'},
    content_string      :       {type: String},
    img_url_id          :       {type: String},
    server_timestamp    :       {type: Date, required: true, index: true},
    user_likes          :       [{
                                    user_id     :   String,
                                    timestamp   :   Date
                                }],
    user_likes_total    :       {type: Number}

});

Post.statics.getPostsNear = function getPostsNear(location, callback){

    var far_time = new Date() - 10*24*60*60*1000;

    //return 100 users within 1000km of the location that last transmitted within the last 24 hours
    return this.find({  loc :{ $near : [location.longitude,location.latitude],
                               $maxDistance : 1000000
                        },
                        server_timestamp:{
                                $gte: far_time
                        }
                    }).exec(callback);
};

Post.statics.findPostById = function findPostById(postId, callback){
    return this.findOne({_id: postId}).exec(callback);
};

Post.statics.findPostsFromSingleUser = function findPostsFromSingleUser(userId, callback){
    return this.find({user_id: userId}).limit(100).exec(callback);
};

Post.statics.getPostsFromIds = function getPostsFromIds(idArray, callback){
    this.find({
        //query
        '_id' : {
            $in: idArray
        }
    },{
        //projection
    }).exec(callback);
};

module.exports = mongoose.model('Post', Post);