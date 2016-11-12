//Static Data module
var constants = require('../constants');

exports.readAll = function(req, res, next){
    var friendReadAll = require('../controllers/friends/friends_get_all');
        friendReadAll(req, res, next);
};

exports.readOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.createOne = function(req, res, next){
    var friendCreateOne = require('../controllers/friends/friends_create_one');
        friendCreateOne(req, res, next);
};

exports.updateOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.deleteOne = function(req, res, next){
    var friendDeleteOne = require('../controllers/friends/friends_delete_one');
        friendDeleteOne(req, res, next);
};