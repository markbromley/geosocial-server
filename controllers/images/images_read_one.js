//read one image
var async = require('async');

var readOneImage = function readOneImage(req, res, next){
    var fileName = __dirname + '/uploads/' + req.params.id +'-1.jpg';
    res.sendfile(fileName, {}, function(err){
        if(err){
            res.status(500);
            res.end();
        }else{
            res.status(200);
            res.end();
        }
    });
};

module.exports = readOneImage;