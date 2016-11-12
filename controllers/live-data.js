//Static Data module
var constants = require('../constants');
var newLive = require('../controllers/live_data/live_data_create_one');

exports.readAll = function(req, res, next){
	res.status(405).write(constants.ERROR_405_MESSAGE);
	res.end();
};

exports.readOne = function(req, res, next){
	res.status(405).write(constants.ERROR_405_MESSAGE);
	res.end();
};

exports.createOne = function(req, res, next){
	newLive(req, res, next);
};

exports.updateOne = function(req, res, next){
	res.status(405).write(constants.ERROR_405_MESSAGE);
	res.end();
};

exports.deleteOne = function(req, res, next){
	res.status(405).write(constants.ERROR_405_MESSAGE);
	res.end();
};