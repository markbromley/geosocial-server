var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// Validators need to be added

var Static = new Schema({
    user_id             :       {type: String, required: true, index: true},
    device_platform     :       String,
    device_uuid         :       String,
    device_model        :       String,
    device_version      :       String,
    pref_lang           :       String,
    pref_lang_err       :       String,
    locale              :       String,
    locale_err          :       String,
    navigator_platform  :       String,
    navigator_ua_string :       String,
    server_timestamp    :       Date

});

module.exports = mongoose.model('StaticData', Static);
