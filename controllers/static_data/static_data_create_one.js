var StaticDataModel = require('../../models/static_data_model');

var newStatic = function newStatic(req, res, next){
    var staticObj = {};
        staticObj.user_id = req.user.user_id;
        staticObj.device_platform = req.body.dev_platform;
        staticObj.device_uuid = req.body.dev_uuid;
        staticObj.device_model = req.dev_model;
        staticObj.device_version = req.body.dev_version;
        staticObj.pref_lang = req.body.pref_lang;
        staticObj.pref_lang_err = req.body.pref_lang_err;
        staticObj.locale = req.body.locale;
        staticObj.locale_err = req.body.locale_err;
        staticObj.navigator_platform = req.body.nav_platform;
        staticObj.navigator_ua_string = req.body.nav_ua;
        staticObj.server_timestamp = new Date();

    var stat = new StaticDataModel(staticObj);

        stat.save(function(err){
            if(err){
                console.log(err);
                res.status(500);
                res.end();
            }else{
                console.log(stat);
                res.status(200);
                res.end();
            }
        });
};

module.exports = newStatic;