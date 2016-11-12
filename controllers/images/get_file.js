var fs = require('fs');

var getImage = function getImage(fileName, callback){
    console.log("filename: " + fileName)
    var filePath = __dirname + '/uploads/' + fileName;
    fs.readFile(filePath, callback);
};