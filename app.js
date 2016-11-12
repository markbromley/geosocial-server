var express         = require('express'),
    mongoose        = require('mongoose'),
    http            = require('http'),
    passport        = require('passport'),
    configConstants = require('./config/config_constants'),
    router          = require('./routes/router');

// Create the server
var app = express();

// Configure the server using the connect middleware dependency
app.configure(function() {
  app.set('title', configConstants.APP_NAME);
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.limit(configConstants.MAX_FILE_UPLOAD_SIZE));
  app.use(passport.initialize());
  app.use(app.router);
  app.use(express.logger());
});

// Remove 'powered by express' logo
app.disable('x-powered-by');

// Connect to the Mongo database
mongoose.connect(configConstants.DB_CONNECTION_STRING, function(err){
    // Kill the whole server as the database is inaccessible
    if(err){
        console.error("Error - Could not connect to database");
        process.exit();
    }
});

// Initialise the router
router(app);

//assign a port to listen to
var server = http.createServer(app);

// Set the server listening to the correct port
server.listen(configConstants.APP_HOST_PORT, function () {
  console.log('Server listening at %s');
});