var getOptions = function getOptions(req){
        return '?access_token=' + req.query.access_token;
};

exports.getOptions = getOptions;