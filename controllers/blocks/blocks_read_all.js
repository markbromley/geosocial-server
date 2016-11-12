var async = require('async');
var UserModel = require('../../models/user_model');
var errHandle = require('../error_handle');
var urlHandle = require('../../url_handle');


//TODOS
//hash user IDs and image ids...

var constants = require('../../constants');

//below needs to be tested if fails use upsert, but upsert with $push operator has no validators...

var getAllBlocks = function getAllBlocks(req, res, next){

    //set up the manual error response for if required
    var newErr = {};
    newErr.name = 'nightparty_error';

    async.waterfall([
            function(callback){
                UserModel.findOne({_id: req.user.user_id}, callback);
            },
            function(user, callback){
                if(user){
                    if(user.blocks){
                        //find each user...
                        //use waterfall callback to prevent a huge pyramid...
                        callback(null, user.blocks);
                    }else{
                        newErr.message = 'No people blocked.';
                        callback(newErr);
                    }//end inner if
                }else{
                    newErr.message = 'Error - User not found.';
                    callback(newErr);
                }
            },
            function(blocksObj, callback){
                var idArray = [];
                for (var i = 0; i < blocksObj.length; i++) {
                    idArray.push(blocksObj[i].user_id);
                }
                callback(null, idArray);
            },
            function(idArray, callback){
                console.log(idArray);
                UserModel.getUsersFromIds(idArray, callback);
            },
            function(users, callback){
                if(users){
                    var responseArray = [];
                    for (var i = 0; i < users.length; i++) {

                        var imUrl = constants.APP_HOST_URL + '/images/' + users[i].prof_im_url_id + urlHandle.getOptions(req);

                        //get what we want for the response
                        var curUser = {};
                            curUser.user_id = users[i]._id;
                            curUser.pref_name = users[i].pref_name;
                            curUser.prof_im_url = imUrl;
                            console.log(curUser);
                            responseArray.push(curUser);
                    }
                    responseArray = JSON.stringify(responseArray);
                    //finally pus the response to the array
                    callback(null, responseArray);
                }else{
                    newErr.message = 'Error - blocked users not found.';
                    callback(newErr);
                }
            }
        ],
        function(err, result){
            if(err){
                //handle errs
                //this is generic error function
                //delegate the error to the errHandle Module
                errHandle.errIdentify(err, function(message){
                    errHandle.errSendResponse(res, message);
                });
            }else if(result){
                res.status(200);
                res.write(result);
                res.end();
            }else{
                console.log('err;');
                res.status(500);
                res.end();
            }//end if
    });
};

module.exports = getAllBlocks;
