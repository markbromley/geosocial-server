var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var Image = new Schema({
    user_id             :       {type: String, required: true, index: true},
    exif                :       {
                                    image               :       {},
                                    thumbnail           :       {},
                                    exif                :       {},
                                    gps                 :       {},
                                    interoperability    :       {},
                                    makernote           :       {}
                                },
    url_id              :       {type: String, required: true},
    server_timestamp    :       {type: Date, required: true}    
});

//export all functions
module.exports = mongoose.model('Image', Image);