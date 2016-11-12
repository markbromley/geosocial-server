//constants

// Standard error 405 message
exports.ERROR_405_MESSAGE = 'This method is not allowed.';

// The base url for the app
exports.APP_HOST_URL = 'http://127.0.0.1:8080';

// The App host port
exports.APP_HOST_PORT = 8080;

// Database connection string
exports.DB_CONNECTION_STRING = "mongodb://127.0.0.1:27017/sky";

// The name of the application
exports.APP_NAME = "THE APP NAME";

// Maximum file upload size
exports.MAX_FILE_UPLOAD_SIZE = "100mb";

// Maximum time since the currently logged in user last sent a GPS update
exports.MAX_TIME_SINCE_GPS_TRANSMISSION = 60 * 60 * 1000;

// Time from issuing a token can be used to access an account before it expires
exports.TOKEN_VALIDITY_TIME = 100000000;

exports.TOKEN_OUTLINE_SECRET = "XXX";


//Below all the password constants
exports.SALT_WORK_FACTOR = 10,
// max of 15 attempts, resulting in a 2 hour lock
exports.MAX_LOGIN_ATTEMPTS = 15,
exports.LOCK_TIME = 2 * 60 * 60 * 1000;
