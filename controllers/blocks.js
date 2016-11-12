//Static Data module
var constants = require('../constants');

exports.readAll = function(req, res, next){
    var blocksReadAll = require('../controllers/blocks/blocks_read_all');
        blocksReadAll(req, res, next);
};

exports.readOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.createOne = function(req, res, next){
    var blockCreateOne = require('../controllers/blocks/blocks_create_one');
        blockCreateOne(req, res, next);
};

exports.updateOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.deleteOne = function(req, res, next){
    var blockDeleteOne = require('../controllers/blocks/blocks_delete_one');
        blockDeleteOne(req, res, next);
};