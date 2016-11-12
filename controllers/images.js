//Static Data module
var constants = require('../constants');
var imCreateOne = require('./images/images_create_one');

exports.readAll = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.readOne = function(req, res, next){
    //res.sendfile(__dirname + '/images/uploads/1379171418319b8c12e89b0bda836205ed215dfdbec0d-1.jpg');
    //Make sure it is cached forever below :)
        if (!res.getHeader('Cache-Control') || !res.getHeader('Expires')) {
        res.setHeader("Cache-Control", "public, max-age=345600"); // ex. 4 days in seconds.
        res.setHeader("Expires", new Date(Date.now() + 345600000).toUTCString());  // in ms.
    }

    var readOneImage = require('./images/images_read_one');
        readOneImage(req, res, next);
};

exports.createOne = function(req, res, next){
    imCreateOne(req, res, next);
};

exports.updateOne = function(req, res, next){
};

exports.deleteOne = function(req, res, next){
};