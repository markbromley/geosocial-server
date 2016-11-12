// Delete a like
var UserModel = require('../../models/user_model');
var PostModel = require('../../models/post_model');
var async = require('async');
var errHandle = require('../error_handle');

//set up the manual error response for if required
var newErr = {};
    newErr.name = 'nightparty_error';

var user, post;

var deleteLike = function deleteLike(req, res, next){
    async.waterfall([
        function(callback){
            UserModel.findOne({_id: req.user.user_id}, callback);
        },
        function(result, callback){
            user = result;
            PostModel.findOne({_id: req.body.post_id}, callback);
        },
        function(result, callback){
            post = result;
            for(i=0; i<user.item_likes.length; i++){
                if(user.item_likes[i].post_id == req.body.post_id){
                    console.log(user.item_likes[i].post_id);
                    user.item_likes.splice(i, 1);
                    callback(null);
                }
            }
        },
        function(callback){
            for(i=0; i<post.user_likes.length; i++){
                if(post.user_likes[i].user_id == req.user.user_id){
                    post.user_likes.splice(i, 1);
                    post.user_likes_total -= 1;
                    callback(null);
                }
            }
        },
        function(callback){
            console.log(user);
            user.save(callback);
        },
        function(result, numAffected, callback){
            post.save(callback);
        }
    ], function(err, result){
        //this is generic error function
        //delegate the error to the errHandle Module
        if(err){
            console.log('ERROR: ' + err);
            errHandle.errIdentify(err, function(message){
                errHandle.errSendResponse(res, message);
            });
        }else{
            res.status(200);
            res.end();
        }
    });
};

module.exports = deleteLike;