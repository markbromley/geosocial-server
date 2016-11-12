//Static Data module
var constants = require('../constants');

exports.readAll = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.readOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.createOne = function(req, res, next){
    var reportCreateOne = require('../controllers/reports/report_create_one');
        reportCreateOne(req, res, next);
};

exports.updateOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};

exports.deleteOne = function(req, res, next){
    res.status(405).write(constants.ERROR_405_MESSAGE);
    res.end();
};