var LiveModel = require('../../models/live_data_model')
    ,StatisticModel = require('../../models/statistics_model')
    ,UserModel = require('../../models/user_model')
    ,async = require('async')
    ,errHandle = require('../error_handle');

var geoModel = require('../../models/geo_names_model');


var newLive = function newLive(req, res, next){

    //assemble an object based on the body content
    newLiveObject = {};
    newUserLocationObject = {};
    newStatisticModel = {};

    async.waterfall([
            function(callback){
                //check if the data sensors responded with an error
                if(req.body.comp_error_code || req.body.geo_error_code || req.body.geo_error_message){
                    newStatisticModel.errror_group = 'LiveModel';
                    //set up liveModel Error
                    if(req.body.geo_error_code || req.body.geo_error_message){
                        newStatisticModel.errror_type = req.body.geo_error_code;
                        newStatisticModel.error_message = req.body.geo_error_message;
                    }else if(req.body.comp_error_code){
                        newStatisticModel.error_message = req.body.comp_error_code;
                    }//end of LiveModel if statement
                    //save the model
                    StatisticModel.update(
                        {errror_group: newStatisticModel.errror_group, error_type: newStatisticModel.errror_type},
                        {$inc: {count: 1}},
                        {multi: false, safe: true, upsert: true},
                        callback
                        );
                }else{
                    callback(null, null, null);
                }//end of error check statement
            },
            function(numAffected, rawResponse, callback){
                if(req.body.longitude && req.body.latitude){
                    newLiveObject.user_id = req.user.user_id;
                    newLiveObject.latitude = req.body.latitude;
                    newLiveObject.longitude = req.body.longitude;
                    newLiveObject.altitude = req.body.altitude;
                    newLiveObject.altitude_accuracy = req.body.altitude_accuracy;
                    newLiveObject.lonlat_accuracy = req.body.accuracy;
                    newLiveObject.heading = req.body.heading;
                    newLiveObject.speed = req.body.speed;
                    newLiveObject.client_timestamp = req.body.timestamp;
                    newLiveObject.comp_heading = req.body.comp_heading;
                    newLiveObject.connection_type = req.body.connection;

                    newLiveObject.server_timestamp = new Date();

                    //save the model
                    var live = new LiveModel(newLiveObject);
                        live.save(callback);
                }else{
                    callback(null, null, null);
                }
            },
            function(rawResult, numAffected, callback){
                var loc = {}
                    loc.longitude = req.body.longitude;
                    loc.latitude = req.body.latitude;
                geoModel.getNearestLocation(loc, function(err, res){
                    if(err){
                        callback(err);
                    }else{
                        if(res.length>=1){
                            callback(null, res[0].name);
                        }else{
                            callback(null, null);

                        }//end innermost if
                    }
                });
            },
            function(name, callback){
                if(req.body.longitude && req.body.latitude){
                    newUserLocationObject.loc = [req.body.longitude, req.body.latitude];
                    newUserLocationObject.server_timestamp = new Date();
                    //update the user model
                    if(name){
                        UserModel.update(
                            {_id: req.user.user_id},
                            {latest_loc: newUserLocationObject.loc, latest_loc_name: name,latest_server_timestamp: newUserLocationObject.server_timestamp},
                            {multi: false, upsert: false, safe: true},
                            callback
                            );  
                    }else{
                        UserModel.update(
                            {_id: req.user.user_id},
                            {latest_loc: newUserLocationObject.loc,latest_server_timestamp: newUserLocationObject.server_timestamp},
                            {multi: false, upsert: false, safe: true},
                            callback
                        );
                    }//end if
                }else{
                    callback(null);
                }
            }
        ],
        function(err, results){
            if(err){
                res.status(500);
                res.end();
            }else{
                res.status(200);
                res.end();
            }
    });
};

module.exports = newLive;