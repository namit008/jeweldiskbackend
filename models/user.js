const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

// Create Schema
const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  verification_code: Number,
  password: { type: String, select: false },
  email: String,
  referral_code: String,
  phone: {
    type: String
  },
  assigned_role: {
    type: Schema.Types.ObjectId,
    ref: modelTag.role
  },
  profile: {
    type: Schema.Types.ObjectId,
    ref: modelTag.profile
  },
  is_active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  belongs_to: {
    type: Schema.Types.ObjectId,
    ref: modelTag.user
  },
  directory:{
    type: Boolean,
    default: true
  }
});

UserSchema.post('save', function (doc) {
  User.findByIdAndUpdate(doc._id, { belongs_to: doc._id }).exec((err, result) => { })
});
module.exports = User = mongoose.model(modelTag.user, UserSchema);
