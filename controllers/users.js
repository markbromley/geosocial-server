//USERS module

var constants = require('../constants');

exports.readAll = function(req, res, next){
    var readAll = require('./users/users_read_all');
        readAll(req, res, next);
};

exports.readOne = function(req, res, next){
    var readOne = require('./users/users_read_one');
        readOne(req, res, next);
};

//DO NOT USE BELOW ROUTE - THIS ROUTE IS ALREADY OCCUPIED AT THE ROUTER LEVEL, BECAUSE AUTHENTICATION IS NOT REQUIRED****** DO NOT USE BELOW!!!!
exports.createOne = function(req, res, next){//DO NOT USE!!!****
//DO NOT USE!!!!!!!*****    
};//DO NOT USE!!!!!! ****
//DO NOT USE ABOVE!!!!****

exports.updateOne = function(req, res, next){
    var updateOne = require('./users/users_update_one');
        updateOne(req, res, next);
};

exports.deleteOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};