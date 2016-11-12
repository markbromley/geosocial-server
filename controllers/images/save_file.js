var fs= require('fs');

var saveImage = function saveImage(filePath, newName, callback){
    fs.readFile(filePath, function (err, data) {
        if(err){
            callback(err);
        }else{

            var newPath = __dirname + '/uploads/' + newName;
            fs.writeFile(newPath, data, function (err) {
                if(err){
                    callback(err);
                }else{
                    callback(null, filePath);
                }
            });
        }
    });
};

module.exports = saveImage;