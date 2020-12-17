var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const modelTag = require("../config").modelTag;

profileSchema = new Schema({
    identifier: {
        type: String,
        index: {
            
            partialFilterExpression: { identifier: { $type: 'string' } },
        },
    },
    urll:String,
    pincode:Number,
    email:String,
    whatsapp_no:Number,
    subscription: { type: String, default: 'free' },
    company_name: String,
    business_type: String,
    industry: String,
    company_logo: String,
    address: {
        type: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
            url: String,
        }, default: {}
    },
    contact: {
        type: {
            email: String,
            whatsapp: String,
            phone: {
                type: String
            },
            website: String,
        }, default: {}
    },
    social: {
        type: {
            facebook: String,
            instagram: String,
            youtube: String,
            twitter: String,
            pinterest: String,
        }, default: {}
    },
    owner_info: [{
        name: String,
        image: String,
        phone_no: String,
        whatsapp_no: String,
    }],
    about_us: String,
    services: [{ name: String, image: String }],
    gallery: { images: [String], videos: [String] },
    reviews: [{
        rating: Number,
        desc: String,
        name: String,
    }],
    hideReviews: {
        type: Boolean,
        default: false
    },
    inquiries: [{
        name: String,
        email: String,
        phone_no: String,
        desc: String
    }],
    slider: [String],
    payment_mode: {
        type: {
            bank_name: String,
            acc_name: String,
            acc_no: String,
            ifsc: String,
            gst_pan: String,
            qr_codes: [
                {
                    method: String,
                    owner_name: String,
                    qr_image: String
                }
            ]
        }, default: { qr_codes: [] }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: modelTag.user
    },
    offer: String,
    business_card_type: { type: String, default: '1' },
    belongs_to: {
        type: Schema.Types.ObjectId,
        ref: modelTag.user
    },
    views: { type: Number, default: 0 },
}, { minimize: false });

profileSchema.post('save', function (doc) {
    Profile.findByIdAndUpdate(doc._id, { belongs_to: doc.user }).exec((err, result) => { })
});

module.exports = Profile = mongoose.model(modelTag.profile, profileSchema);