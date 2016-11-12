var async = require('async');
var errHandle = require('../error_handle');
var PostModel = require('../../models/post_model');
var UserModel = require('../../models/user_model');

var newPost = function newPost(req,res,next){

    //set up the manual error response for if required
    var newErr = {};
        newErr.name = 'nightparty_error';

    var tmpLocation = [];

    async.waterfall([
        function(callback){
            UserModel.findOne({_id: req.user.user_id}, callback);
        },
        function(user, callback){
            if(user){
            //construct a suitable location object from the previous results array
            var loc = user.latest_loc;
                tmpLocation[0] = loc[0];
                tmpLocation[1] = loc[1];
                callback(null);
            }else{
                newErr.message = 'Error - User not found.';
                callback(newErr);
            }
        },
        function(callback){
            //finally add the new post record
            var postObj = {};
                postObj.user_id = req.user.user_id;
                postObj.category = 2;
                postObj.loc = tmpLocation;
                postObj.content_string = req.body.firstComment;
                postObj.server_timestamp = new Date();

            var post = new PostModel(postObj);
                post.save(callback);
        }
        ],
        function(err){
            //this is generic error function
            //delegate the error to the errHandle Module
            if(err){
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else{
                res.status(200);
                res.end();
            }
        });
}

module.exports = newPost;