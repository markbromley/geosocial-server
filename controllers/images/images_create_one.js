//Add new image
var errHandle = require('../error_handle');
var storeImage = require('./store_image');
var async = require('async');
var guid = require('../../guid');

var newImage = function newImage(req, res, next){
    
    var newErr = {};
        newErr.name = 'nightparty_error';

    async.waterfall([
            function(callback){

                //generate a new file id
                var newFileId = guid(req.user.user_id);

                // Wrapper function which takes care of storing any image
                // uploaded to the service including profile images, post
                // upload etc
                // Callback returns an error if anything goes wrong, otherwise null
                storeImage(req.files, req.user, req.body, newFileId, callback);
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