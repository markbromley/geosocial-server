var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Report = new Schema({
    user_id             :       {type: String, required: true, index: true},
    reported_id         :       {type: String, required: true, index: true},
    server_timestamp    :       {type: Date, required: true, index: true}
});


module.exports = mongoose.model('Report', Report);