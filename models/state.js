var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

stateSchema = new Schema({
    state_name: String
});

module.exports = mongoose.model(modelTag.state, stateSchema);