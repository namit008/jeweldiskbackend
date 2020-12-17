var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

otpSchema = new Schema({
    otp: String
});

module.exports = mongoose.model(modelTag.otp, otpSchema);