// Routes for the application - provides mappings to route controllers
var routerLibrary   = require('./router_library'),
    passport        = require('passport'),
    logIn           = require('../controllers/login'),
    newPerson       = require('../controllers/users/users_create_one'),
    logOut          = require('../controllers/logout'),
    configConstants = require('../config/config_constants'),
    changePass      = require('../controllers/change_password');

/**
* Provides all routes which can be accessed without the user logging in to the
* system. Includes login, sign up and default responses.
*
* @param {object} app The express application object
*
* @method unAuthenticatedRoutes
*/
exports.unAuthenticatedRoutes = function(app){
    // For any type of request to any route
    app.all('*', function(req, res, next){
        // Clean all data from the request body
        req.body = routerLibrary.sanitiseInputData(req.body);
        // Pass the cleansed request object back into the router
        next();
    });
    // GET requests to the home route without authentication
    app.get('/', function(req, res){
        var reply = {};
            reply.appname = configConstants.APP_NAME;
            reply.response = 'Mother knows best.';
        reply = JSON.stringify(reply);
        res.write(reply);
        res.end();
    });
    // POST requests to the user login route
    app.post('/login', function(req, res, next){
        // Pass the request to the login controller
        logIn(req, res, next);
    });
    // POST requests to the sign up route
    app.post('/users', function(req, res, next){
        // Pass the request to the sign up controller
        newPerson(req, res, next);
    });
};

/**
* Provides all routes which can only be accessed with the user authenticating.
* This applies to most routes within the app.
*
* @param {object} app The express application object
*
* @method authenticatedRoutes
*/
exports.authenticatedRoutes = function(app){
    // For any type of request to any route
    // Authenticate using HTTP Bearer credentials, with
    // session support disabled.
    app.all('*'
            ,passport.authenticate('bearer', { session: false })
            ,function(req,res,next){
                res.setHeader('Content-Type', 'application/json');
        next();
    });

    // GET requests to the user logout route
    app.get('/logout', function(req, res, next){
        // Pass the request to the logout controller
        logOut(req, res, next);
    });

    // GET requests to any route 
    // Validate GPS data is in date - returns an error to user if not
    // routes can proceed if the data is valid
    app.get('*', routerLibrary.validateGpsDataNotStale);

    // All requests to any route
    // Validate this API is still in use- returns an error to user if not
    // routes can proceed if the API is still valid
    app.all('*', routerLibrary.validateApi); //end app all

    // Define all the different routes remaining As they all require the majority
    // of CRUD methods, generate the routes automatically, assuming the given
    // directory structure for controllers
    var routeNames = [ 'users',
                       'static-data',
                       'live-data',
                       'images',
                       'posts',
                       'friends',
                       'blocks',
                       'reports',
                       'likes'
                     ];
    // Create all request types for each route name
    routeNames.forEach(function(routeName){
        routerLibrary.mapRoute(app, routeName);
    });

    // POST request to user change password route
    app.post('/change-password', function(req, res, next){
        // Pass request to change password controller
        changePass(req, res, next);
    });
};