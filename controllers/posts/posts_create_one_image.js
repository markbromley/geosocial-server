//Add new image
var fs = require('fs');

var async = require('async');
var ExifImage = require('exif').ExifImage;
var gm = require('gm');
var sanitize = require('validator').sanitize;


var saveFile = require('../images/save_file');
var guid = require('../../guid');
var ImageModel = require('../../models/image_model');
var errHandle = require('../error_handle');
var PostModel = require('../../models/post_model');
var UserModel = require('../../models/user_model');
var storeImage = require('../images/store_image');


var newImage = function newImage(req, res, next){

    var smallImageName, newImageName, smallFilePath, newImagePath;
    
    //generate a new file id
    var newFileId = guid(req.user.user_id);

    //*********
    //*********
    //*********
    //STILL TO DO   -- CHECK FILE FORMAT AS JPEG
    //ADITIONAL VALIDATION/ SANITISATION?!


    //N.B. -0 indicates the original file
    //-1 indicates the thumbnail file

    //set up the manual error response for if required
    var newErr = {};
        newErr.name = 'nightparty_error';

    var tmpLocation = [];

    async.waterfall([
            function(callback){
                if(req.files){
                    console.log('There\'s a picture!');
                }else{
                    console.log('No pictures here.');
                    console.log(req.body.firstComment);
                }
                // Wrapper function which takes care of storing any image
                // uploaded to the service including profile images, post
                // upload etc
                // Callback returns an error if anything goes wrong, otherwise null
                storeImage(req.files, req.user, req.body, newFileId, callback);
            },
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
                var cat;
                if(req.body.firstComment){
                    cat = 5;
                }else{
                    cat = 3;
                }
                //finally add the new post record
                var postObj = {};
                    postObj.user_id = req.user.user_id;
                    postObj.category = cat;
                    postObj.loc = tmpLocation;
                    postObj.content_string = req.body.firstComment;
                    postObj.img_url_id = newFileId;
                    postObj.server_timestamp = new Date();
                //PostModel.findOne({user_id: req.user.user_id}, callback);
                var post = new PostModel(postObj);
                    post.save(callback);
            }
        ],
        function(err, results){
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

module.exports = newImage;