
exports.readAll = function(req, res, next){
};

exports.readOne = function(req, res, next){
};

exports.createOne = function(req, res, next){
    var createOne = require('./likes/likes_create_one');
        createOne(req, res, next);
};

exports.updateOne = function(req, res, next){
};

exports.deleteOne = function(req, res, next){
    console.log('DELETE A LIKE');
    var deleteOne = require('./likes/likes_delete_one');
        deleteOne(req,res,next);
};