var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

townSchema = new Schema({
    // cityId: {
    //     type: Schema.Types.ObjectId,
    //     ref: modelTag.district
    // },
    cityId:String,
    town_name: String
});

module.exports = mongoose.model(modelTag.town, townSchema);