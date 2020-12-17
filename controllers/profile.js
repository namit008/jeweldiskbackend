const Profile = require('../models/profile');
const Coupon = require('../models/coupon');
const User = require('../models/user');

module.exports = {
    publicProfile,
    myProfile,
    applyCoupon,
    listProfile,
    viewProfile,
    addEditProfile,
    addReview,
    addInquiry,
    testFunction
}

// @route   GET /
// @desc    GET single Profile by identifier
function publicProfile(req, res) {
    // const identifier = req.subdomains.length > 0 && req.subdomains[0];
    const urll = req.params.urll;
    Profile.findOne(
        { urll: urll },
        (err, profile) => {
            if (err) {
                // console.log(err);
                // res.render('error');
                return res.status(400).json({ status: false, message: 'Error in fetching Profile', err: err });
            } else {
                res.status(200).json({ status: true, message: 'profile fetched successfully', data: profile })
            }
            // else if (profile && profile.user.is_active) {
            //     res.render('paid', profile);
            // } else {
            //     res.render('error');
            // }
        })
}

function applyCoupon(req, res) {
    Coupon.findOne({ title: req.body.title, is_active: true }, (err, coupon) => {
        if (coupon) {
            let createdAtMillis = Date.parse(coupon.createdAt);
            let durationMillis = 1000 *  60 * 60 * 24  (parseInt(coupon.duration) == NaN ? 0 : parseInt(coupon.duration));
            let expiresAt = createdAtMillis + durationMillis;
            let now = Date.now();
            if (expiresAt < now) {
                return res.status(404).json({ status: false, message: 'Promo code expired' });
            } else if (createdAt > now) {
                return res.status(404).json({ status: false, message: 'Offer has not started, invalid code' });
            } else {
                Profile.findOneAndUpdate(
                    { user: req.user._id },
                    { "$set": { subscription: "promo_" + coupon.title } },
                    { new: true },
                    function (err, profile) {
                        return respond(res, err, profile, () => {
                            res.json({ status: true, message: 'Promo code applied successfully' });
                        });
                    }
                )
            }
        } else {
            return res.status(404).json({ status: false, message: 'Promo code invalid' });
        }
    });
}

// @route   POST /profile
// @desc    Fetch my Profile
function myProfile(req, res) {
    Profile.findOne({ user: req.user._id }, function (err, result) {
        return respond(res, err, result, () => {
            res.json({ data: result, message: 'Profile Data Retrieved Successfully', status: true });
        });
    });
}

// @route   POST profile/list
// @desc    Fetch list of profiles
function listProfile(req, res) {
    const pagesize = parseInt(req.body.pagesize);
    const offset = parseInt(req.body.offset); ƒ
    const search = req.body.search;
    if (req.body.search) {
        Profile.find({ $text: { $search: search } })
            .exec(function (err, searchResult) {
                return respond(res, err, searchResult, () => {
                    res.json({ status: true, data: searchResult, message: 'Profile Fetched Successfully' });
                });
            })
    } else {
        Profile.find()
            .limit(pagesize)
            .skip(offset)
            .exec(function (err, result) {
                return respond(res, err, result, () => {
                    Profile.count(function (err, count) {
                        return respond(res, err, count === 0 ? true : count, () => {
                            res.json({ total: count, data: result, message: 'Profile Fetched Successfully', status: true });
                        });
                    });
                });
            });
    }
}

// @route   POST /profile/view
// @desc    Fetch single Profile by id
function viewProfile(req, res) {
    var id = req.body._id;
    Profile.findById(id, function (err, result) {
        return respond(res, err, result, () => {
            res.json({ data: result, message: 'Profile Data Retrieved Successfully', status: true });
        });
    });
}

// @route   POST /profile/add-edit
// @desc    Add and update Profile
function addEditProfile(req, res) {
    var id = req.body._id;
    var params = req.body;
    if (!id) {
        if (params.urll) {
            Profile.findOne({ urll: params.urll }, (err, profile) => {
                if (profile) {
                    return res.status(409).json({ status: false, message: 'Profile already exists' });
                }
                return respond(res, err, true, () => {
                    const newProfile = new Profile(params);
                    newProfile.save(function (err, result) {
                        return respond(res, err, result, () => {
                            res.json({ status: true, message: 'Profile Added successfully' });
                        });
                    })
                });
            })
        } else {
            return res.status(400).json({ status: false, message: 'Profile identifier is missing' });
        }
    } else {
        User.findOne({ phone: params.contact.phone, is_active: true }, function (err, result) {
            if (result.length && (result.id !== req.user._id)) {
                return res.status(409).json({ status: false, message: 'Mobile Number already exists' });
            } else {
                if (params.contact.email) {
                    User.findOne({ email: params.contact.email, is_active: true }, function (err, user) {
                        if (user.length && (user.id !== req.user._id)) {
                            return res.status(409).json({ status: false, message: 'Email already exists' });
                        } else {
                            findAndUpdate(req, res, params);
                        }
                    })
                } else {
                    findAndUpdate(req, res, params);
                }
            }
        })

    }
}

function findAndUpdate(req, res, params) {
    User.findOneAndUpdate(
        { '_id': req.user._id },
        { "$set": { email: params.contact.email, phone: params.contact.phone } },
        { new: true }, function (err, resultSet) {
            return respond(res, err, resultSet, () => {
                Profile.findOneAndUpdate(
                    { '_id': req.body._id },
                    { "$set": params },
                    { new: true },
                    function (err, profile) {
                        return respond(res, err, profile, () => {
                            res.json({ status: true, message: 'Profile Updated successfully' });
                        });
                    }
                )
            })
        });
}

// @route   POST /profile/add-review
// @desc    Add Review
function addReview(req, res) {
    const { urll, review } = req.body;
    if (urll) {
        Profile.findOneAndUpdate(
            { 'urll': urll },
            { $push: { reviews: review } },
            function (err, result) {
                return respond(res, err, result, () => {
                    res.json({ status: true, message: 'Successful' });
                });
            }
        )
    }
    else {
        return res.status(400).json({ status: false, message: 'Profile identifier is missing' });
    }
}

// @route   POST /profile/add-review
// @desc    Add Review
function addInquiry(req, res) {
    const { urll, inquiry } = req.body;

    if (urll) {
        Profile.findOneAndUpdate(
            { 'urll': urll },
            { $push: { inquiries: inquiry } },
            { new: true },
            function (err, result) {
                return respond(res, err, result, () => {
                    res.json({ status: true, message: 'Successful' });
                });
            }
        )
    }
    else {
        return res.status(400).json({ status: false, message: 'Profile identifier is missing' });
    }
}

function respond(res, err, data, next) {
    if (err) {
        if (err.code === 11000) {
            return res.status(409).json({ status: false, message: 'Identifier already exists' });
        }
        console.log(err);
        return res.status(500).json({ status: false, message: 'Something Went Wrong' });
    } else if (data) {
        return next();
    } else {
        return res.status(404).json({ status: false, message: 'No data found' });
    }
}

function testFunction(req, res) {   
    console.log("hello");
        Profile.find({urll: { $exists: false}},
           async function (err, result) {          
               console.log(result.length);
               await Promise.all(result.map(item => updateFunction(item)) );
               
            }
        )
   
}

function updateFunction(params) {   
    let full_name = (params.company_name != null) ? params.company_name.replace(/\s/g, '_') : (params.identifier != null) ? params.identifier.replace(/\s/g, '_') : '';
   //  if(params.contact.phone!= null && params.contact.phone != undefined && full_name != null){
    params.contact.phone = (params.contact.phone != null && params.contact.phone != undefined) ? params.contact.phone : '';
    let full1 = '';
    if(full_name != '' || params.contact.phone != '') {
        full1 = full_name.toLowerCase() +"_"+params.contact.phone;
        Profile.findOneAndUpdate({_id:params._id},{ $set: {urll:full1}},
            function (err, result) {

               /*  Profile.findOneAndUpdate(
                   { 'urll': urll },
             { $push: { inquiries: inquiry } },
            { new: true },
            function (err, result) {

             });*/
          //   console.log(result.length);
            }
         )
    }else {
        full1 = params._id;
        console.log(full1);
       
    }
     
   //  }
    
   // console.log(data.);
        // Profile.findOneAndUpdate({_id:data._id},{ $set: {urll:}}
        //     function (err, result) {

        //         // Profile.findOneAndUpdate(
        //         //     { 'urll': urll },
        //         //     { $push: { inquiries: inquiry } },
        //         //     { new: true },
        //         //     function (err, result) {

        //         //     });
        //        console.log(result.length);
        //     }
        // )
   
}