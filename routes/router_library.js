// Router Auxiliary methods
var sanitize            = require('validator').sanitize,
    UserModel           = require('../models/user_model'),
    configConstants     = require('../config/config_constants'),
    async               = require('async');

/**
* Performs basic sanitizing of the data received in the request object of the
* client. This is not to be relied upon, but acts to increase the security-
* in-depth of the application only.
*
* @param inputObj {object} The input object to be cleansed (typically req.body)
*
* @method sanitiseInputData
*/
exports.sanitiseInputData = function(inputObj){
    // An object to hold the cleansed version of the input object
    var response = {};
    if(inputObj){
        for(var attr in inputObj){
            //sanitize with sanitize.js library
            response[attr] = sanitize(inputObj[attr]).xss().trim();
        }
    }
    //pass back the new cleansed version of the object
    return response;
};

/**
* Checks to see if the currently logged in users has transmitted GPS data
* recently. If they have, the 'next' method is invoked and the router can
* continue. If they haven't an error 402 (Payment required) is sent to the
* client, to request GPS data be transmitted first.
*
* @param {object} req The client request object
* @param {object} res The response object to be sent to the client
* @param {function} next The next method which passes the request to the next
*        matching route
*
* @method validateGpsDataNotStale
*/
exports.validateGpsDataNotStale = function(req, res, next){
    // Prepare the error object
    var newErr = {};
        newErr.id = 402;
    // Connect to the currently logged in user's document and check last update
    // timestamp
    async.waterfall([
            function(callback){
                // Make sure that before returning any data we 
                // have a decent location record for the user
                UserModel.findUserById(req.user.user_id, callback);
            },
            function(user, callback){
                if(user.latest_server_timestamp){
                    var actualDate = new Date(user.latest_server_timestamp);
                    var maxDate = new Date() - configConstants.MAX_TIME_SINCE_GPS_TRANSMISSION;
                    if(actualDate < maxDate){
                        newErr.description = ' GPS data stale.';
                        callback(newErr);
                    }else{
                        callback(null);
                    }// end inner if
                }else{
                    newErr.description = 'No GPS data for user.';
                    callback(newErr);
                }
            }
        ],
        function(err){
            // If the data could not be checked or was out of date, send a
            // 402 payment required error, otherwise return control to the router
            if(err){
                res.status(402);
                res.end();
            }else{
                next();
            }
        });
};

/**
* Checks if the API being used is currently accepted by the server. Currently
* this method always allows the API to be used as this is the first and only
* version.
*
* @param {object} req The client request object
* @param {object} res The response object to be sent to the client
* @param {function} next The next method which passes the request to the next
*        matching route
*
* @method validateApi
*/
exports.validateApi = function(req, res, next){
    // Can be used to disable version of the app using this API
    if(false){
        // kill code
        res.status(403);
        res.end();
    }else{
        next();
    }
};

/**
* Maps a single route to all the associate CRUD methods (get single, get all,
* post, delete, put) i.e to associated controllers. Assumes that route
* controllers are located in 'controllers/routeName'.
*
* @param {object} app The express application object
* @param {string} routeName The name of the route to be mapped. This is also the
*        name of the associated controller directory and the URL route
*
* @method mapRoute
*/
exports.mapRoute = function(app, routeName){

    objectController = require('../controllers/' + routeName);

    routeName= '/' + routeName;

    // Create specific
    app.post(routeName, objectController.createOne);

    // Delete all (currently used as hack for likes... needs to be removed)
    app.delete(routeName, objectController.deleteOne);

    // Read all
    app.get(routeName, objectController.readAll);

    // Read specific
    app.get(routeName + '/:id', objectController.readOne);

    // Update specific
    app.put(routeName + '/:id', objectController.updateOne);

    // Destroy specific
    app.delete(routeName + '/:id', objectController.deleteOne);

};