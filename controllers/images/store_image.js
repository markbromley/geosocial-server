//Add new image
var fs = require('fs');

var async = require('async');
var ExifImage = require('exif').ExifImage;
var gm = require('gm');
var sanitize = require('validator').sanitize;


var saveFile = require('./save_file');
var ImageModel = require('../../models/image_model');
var UserModel = require('../../models/user_model');

// Accepts as input req.files as 'files'
// req.user as 'user'
// req.body as 'body'
var storeImage = function storeImage(files, user, body, newFileId, finalCallback){
    var smallImageName, newImageName, smallFilePath, newImagePath;

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

    async.waterfall([
            function(callback){
                //check there is a file
                if(files.file){
                    //first of all filter the image of xss attacks
                    files.file.path = sanitize(files.file.path).xss(true);
                    callback(null);
                }else{
                    newErr.message = 'No file uploaded.';
                    callback(newErr);
                }
            },
            function(callback){
                //check if the file format is JPEG

                    //below to be implemented once client updated
                        // if(req.files.file.type === 'image/jpeg'){
                        //  callback(null);
                        // }else{
                        //  newErr.message = 'Invalid file format.';
                        //  callback(newErr);
                        // }

                    callback(null);
            },
            function(callback){
                //save the basic file
                newImageName = newFileId + '-0.jpg';
                saveFile(files.file.path, newImageName, callback);
            },
            function(filePath, callback){
                //new name
                smallImageName = newFileId + '-1.jpg';
                smallFilePath = '/tmp/' + smallImageName;
                //resize the original file to the required App size
                //needs updating below to make more secure and only allow switch case statements...
                var rot = body.rotate * 90;
                gm(filePath).resize(300, 300).rotate('black', rot).write(smallFilePath, callback);
            },
            function(stdout, stderr, command, callback){
                //permanently save the new small image as well
                saveFile(smallFilePath, smallImageName, callback);
            },
            function(filePath,callback){
                //extract the exif data
                try {
                    new ExifImage({ image : files.file.path }, function(err){
                        if(err){
                            console.log('Image Exif Error 1');
                            console.log(err);
                        }
                        callback(null, null);
                    });
                } catch (err) {
                    console.log('Image Exif Error 2');
                    console.log(err);
                    callback(null, null);
                }//end of try/ catch block
            },
            function(exifData, callback){
                //save to database
                //create the database object
                var imgObj = {};
                    imgObj.user_id = user.user_id;
                    imgObj.exif = exifData;
                    imgObj.url_id = newImageName;
                    imgObj.url_small_id = smallImageName;
                    imgObj.server_timestamp = new Date();

                //instantiate the model
                var image = new ImageModel(imgObj);

                //attempt to save
                image.save(callback);
            },
            function(result, numAffected, callback){
                //delete the large file from the temporary folder
                fs.unlink(files.file.path, callback);
            },
            function(callback){
                //delete the small file from the temporary folder
                fs.unlink(smallFilePath, callback);
            },
            function(callback){
                //finally check if this is an UPDATED profile picture and update profile accordingly
                if(body.pictureType == 2){
                // if(true === true){
                    console.log(user.user_id);
                    console.log(body);
                    UserModel.findOne({_id: user.user_id}, callback);
                    //update user object accordingly
                }else{
                    callback(null, null);
                }
            },
            function(user, callback){
                if(user){
                    user.prof_im_url_id = newFileId;
                    user.save(callback)
                }else if(!user && body.pictureType == 2){
                    //should be a user for id, if not serious problem
                    console.log('ERROR - cannot find logged in user');
                    newErr.message = 'Unknown Error. Please log in again.';
                    callback(newErr);
                }else{
                    callback(null, null, null);
                }
            },
            function(result, numAffected, callback){
                console.log('Image Uploaded. :)');
                callback(null);
            }
        ],
        function(err, results){
            //this is generic error function
            //delegate the error to the errHandle Module
            if(err){
                finalCallback(err);                 
            }else{
                finalCallback(null);
            }
    });
}// end of storeImage function

module.exports = storeImage;