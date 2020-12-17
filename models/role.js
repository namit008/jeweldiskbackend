var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

roleSchema = new Schema({
    title: String,
    permissions: [String]
});

module.exports = mongoose.model(modelTag.role, roleSchema);