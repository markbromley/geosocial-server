//NEW Statistics Model

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Statistic = new Schema({
    error_group     :   {type: String},
    error_type      :   {type: Number, index: true},
    error_message   :   {type: String},
    count           :   {type: Number}
});

//methods add new error
    //find by type
    //increment counter

Statistic.statics.findStatByTypeAndGroup = function findStatByTypeAndGroup(type, group, callback){
    return this.findOne({error_group: group, error_type: type}).exec(callback);
};

module.exports = mongoose.model('Statistic', Statistic);