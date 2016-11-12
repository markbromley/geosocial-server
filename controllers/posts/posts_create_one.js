var postImg = require('./posts_create_one_image');
var postTxt = require('./posts_create_one_text');

var postCreateOne = function postCreateOne(req, res, next){
    if(req.files){
        console.log('Picture found.');
        postImg(req, res, next);
    }else{
        console.log('Picture not found.');
        postTxt(req, res, next);
    }
};

module.exports = postCreateOne;