//Static Data module
var constants = require('../constants');

exports.readAll = function(req, res, next){
    var readAll = require('./posts/posts_read_all');
        readAll(req, res, next);
};

exports.readOne = function(req, res, next){
    console.log('boo');
    var readOne = require('./posts/posts_read_one');
        readOne(req, res, next);
};

exports.createOne = function(req, res, next){
    console.log('\n\n\n\n\n\n\n\n\n\nHELLO');
    var createOne = require('./posts/posts_create_one');
        createOne(req, res, next);
};

exports.updateOne = function(req, res, next){
};

exports.deleteOne = function(req, res, next){
};