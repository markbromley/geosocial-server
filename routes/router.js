// Router to direct requests for specific resources to the correct controllers
var routerLibrary   = require('./router_library'),
    routes          = require('./routes'),
    passport        = require('passport'),
    BearerStrategy  = require('passport-http-bearer').Strategy,
    Account         = require('..//models/accounts_model');

/**
* Directs all client requests to the appropriate controller. Authenticates and
* authorizes uses to access different resources.
*
* @param {object} app The express application object
*
* @method router
*/
var router = function router(app){
    // Perform basic data sanitizing
    // and allow access to routes which do not require authentication
    routes.unAuthenticatedRoutes(app);
    // Use the passport 'Bearer' strategy which requires an access token as
    // user identification (follows OAuth 2.0 specification)
    passport.use(new BearerStrategy({},function(token, done){
        // Delegate function to account model logic
        // Attempt to authenticate account
         Account.getTokenAuthenticated(token, function(err, account) {
            if(err){
                return done(null, false, {message: 'Database Error.'});
            }
            // login was successful if we have a account
            if(account) {
                // handle login success
                return done(null, account);
            }else{
                //Some sort of internal error. Log and return.
                console.error("Error - Passport authentication in user model failed");
                return done(1);
            }
        });// End Account.getTokenAuthenticated
    }));// End passport.use
    // Provide access to the authenticated routes
    routes.authenticatedRoutes(app);
};

// Expose the router from this module
module.exports = router;