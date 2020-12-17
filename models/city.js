var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

citySchema = new Schema({
    stateId: {
        type: Schema.Types.ObjectId,
        ref: modelTag.state
    },
    city_name: String
});

module.exports = mongoose.model(modelTag.district, citySchema);