// NOT YET CHECKED
// Create new user (signup route) controller
var UserModel       = require('../../models/user_model'),
    AccountModel    = require ('../../models/accounts_model'),
    errHandle       = require('../error_handle'),
    PostModel       = require('../../models/post_model'),
    jwt             = require('jwt-simple'),
    guid            = require('../../guid'),
    async           = require('async'),
    utilities       = require('../../services/util_lib'),
    configConstants = require('../../config/config_constants'),
    storeImage      = require('../images/store_image');

/**
* Check that the request body contains some values at least for the fields
* requried to set up an Account and a User Model.
*
* @param {object} req The request object sent to the controller
* @param {object} res The response object sent to the controller
*
* @method validateBodyContainsParameters
*/
var validateBodyContainsParameters = function(req, res){
    // Check that the upload is correct
    if(!(req.body.name
       && req.body.gender
       && req.body.dob_year
       && req.body.dob_month
       && req.body.dob_day
       && req.body.email
       && req.body.password))
    {
        // There are some details missing- send an error
        res.write("Please complete all fields");
        res.status(400);
        res.end();
    }
};

/**
* Creates a new user object, ready to be added to the User model, before saving
* to the database. Adds the name, gender and date of birth from the request
* body attributes.
*
* @param {object} req The request object sent to the controller
*
* @method createUserObject
*/
var createUserObject = function(req){
    newUserObj = {};
    newUserObj.name = req.body.name;
    newUserObj.prof_im_url_id = utilities.generateUniqueId();
    newUserObj.pref_name = req.body.name;
    newUserObj.gender = req.body.gender;
    newUserObj.dob = new Date(req.body.dob_year,
                              req.body.dob_month,
                              req.body.dob_day,
                              0,0,0,0);
    return newUserObj;
};

/**
* Creates a token with a unique ID as its payload and the server token secret.
*
* @method createTokenOutline
*/
var createTokenOutline = function(){
    var token_outline = {};
    token_outline.payload = utilities.generateUniqueId();
    token_outline.token_payload = {id: token_outline.payload};
    token_outline.secret =  configConstants.TOKEN_OUTLINE_SECRET;
    return token_outline;
};// end createTokenOutline method

/**
* Creates a new Account object, ready to be added to the Account model, before
* saving to the database. Adds the Email and password from the request body
* attributes as well as the token and its expiry time.
*
* @param {object} req The request object sent to the controller
* @param {string} token The authentication token string
* @param {date} token_expire The time at which the token will expire
*
* @method createAccountObject
*/
var createAccountObject = function(req, token, token_expire){
    newAccountObj = {};
    newAccountObj.email = req.body.email;
    newAccountObj.password = req.body.password;
    newAccountObj.token = token;
    newAccountObj.token_expire = token_expire;
    return newAccountObj;
};

/**
* Creates a new Post object, ready to be added to the Post model, before
* saving to the database. Adds the category, timestamp and a deault message.
*
* @method createPostObject
*/
var createPostObject = function(){
    newPostObj = {};
    newPostObj.category = 1;
    newPostObj.content = 'Just signed up to SERVICENAME. Check me out! :p';
    newPostObj.server_timestamp = new Date();
    return newPostObj;
};

/**
* Checks if the Email provided in the request body has already been registered
* by another user and if the password is between the minimum and maximum length
* constraints. If either of these validations fails or if an internal server
* error occurs an eror is passed to the callback.
*
* @param {function} callback The callback function, accepts only one parameter
*        which represents an error. Any value other than null will divert control
*        to the error handler
* @param {object} req The request object sent to the controller
*
* @method validateEmailAndPassword
*/
var validateEmailAndPassword = function(req, callback){
    // Prepare an error response
    var newErr = {};
        newErr.name = 'nightparty_error';
    // Check if the Email has already been registered
    AccountModel.checkEmailExist(req.body.email, function(err, user){
        if(err)
        {
            // If there was an error pass it to the callback
            callback(err);
        }
        else if(user)
        {
            // If a user was retrieved we already have that Email registered
            // so create an error and pass it to the callback
            newErr.message = 'Email already registered.';
            callback(newErr);
        }
        else
        {
            // There was no error and the Email is not already registered
            // Check the password is the correct length
            if(req.body.password.length > 4
                && req.body.password.length < 101){
                callback(null);
            }
            else
            {
                newErr.message = 'Password must be between 5 and 100 characters.';
                callback(newErr);
            }
        }
    });
};

/**
* The main controller method for creating a new user. Validates request, and
* consequently generates a new Account, User and initial Post.
*
* @param {object} req The request object
* @param {object} res The response object
* @param {function} next Returns control to the next matching route controller
*
* @method newPerson
*/
var newPerson = function newPerson(req, res, next){
    // Check the body actually has the parameters required
    validateBodyContainsParameters(req, res);

        // Assemble the new user object
    var newUserObj = createUserObject(req),
        // Assemble initial token object
        token_outline = createTokenOutline(),
        // Encode the token outline and add the expiry date
        token = jwt.encode(token_outline.token_payload, token_outline.secret),
        token_expire = Date.now() + configConstants.TOKEN_VALIDITY_TIME,
        // Assemble the new account object
        newAccountObj = createAccountObject(req, token, token_expire),
        // Assemble the new post object
        newPostObj = createPostObject(),
        // A temporary variable for holding the account - should be removed
        accountSpace;

    // Carry out the following procedures sequentially (still asynchronous),
    // diverting to the error callback if an error occurs
    async.waterfall([
        function(callback){
            validateEmailAndPassword(req, callback);
        },
        function(callback){
            var user = new UserModel(newUserObj);
                user.save(callback);
        },
        function(result, numAffected, callback){
            // Append the newly generated ID of the user to the Account object
            newAccountObj.user_id = result._id;
            // Create the Account from the model definition
            var account = new AccountModel(newAccountObj);
            //Save to the database
            account.save(callback);
        },
        function(result, numAffected, callback){
            // Stash the account in a variable for login later on
            accountSpace = result;
            newPostObj.user_id = result._id;
            var post = new PostModel(newPostObj);
                post.save(callback);
        },
        function(result, numAffected, callback){
            // As the user wasn't originally logged in on this request (as they
            // have only just been created in the system), add the user ID to
            // the request to show that they are now logged in for the rest of
            // this request
            req.user = {};
            req.user.user_id = accountSpace._id;
            // Wrapper function which takes care of storing any image
            // uploaded to the service
            storeImage(req.files,
                       req.user,
                       req.body,
                       newUserObj.prof_im_url_id,
                       callback);
        },
        function(){
            // Prepare the JSON response for the client, to pass them their new
            // authentication token and its time 'till expiry
            var response = {}
                response.token = token;
                response.token_expire = token_expire;
            response = JSON.stringify(response);
            res.write(response);
            res.status(200);
            res.end();
        }// end last anonymous function in async.waterfall
    ],
    function(err, results){
        // This is generic error function
        // delegate the error to the errHandle Module
        errHandle.errIdentify(err, function(message){
            errHandle.errSendResponse(res, message);
        });
    });
};

module.exports = newPerson;
