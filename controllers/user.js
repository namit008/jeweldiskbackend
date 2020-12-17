const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const constants = require('../constants');
const mailer = require('../helpers/mailer');
const User = require('../models/user');
const Role = require('../models/role');
const Profile = require('../models/profile');
const Otp = require('../models/otp');
const State = require('../models/state');
const District = require('../models/city');
const Town = require('../models/town');
const mongoose = require('mongoose');
const axios = require('axios');
const config = require('../config');
var XLSX = require('xlsx');
let lodash = require('lodash');

module.exports = {
    generateToken,
    addEditUsers,
    requestPass,
    resetPass,
    signup,
    listUser,
    viewUser,
    addEditUser,
    generateOTP,
    verifyOTP,
    generateSecureOTP,
    verifySecureOTP,
    uploadxls,
    findPublicAndUpdate,
    getDeletedUser,
    addLocation,
    getAllLocation,
    getState,
    getCity,
    getTown,
    deleteLoc
}

function uploadxls(req, res) {
    var data = XLSX.read(req.body.data, {
        type: 'binary'
    });
    let sheetData = data.Sheets[data.SheetNames[0]];
    let csvArray = XLSX.utils.sheet_to_json(sheetData, {
        raw: true,
        defval: null
    });

    if (!Array.isArray(csvArray)) {
        return res.status(400).json({ status: false, message: 'Invalid Excel File' });
    } else {
        let duplicate = [], newRec = [], missingMandatory = [];
        let sanetizeData = csvArray.map((e) => ({
            password: bcrypt.hashSync("jeweldisk123" || Math.random().toString(36).slice(-8), 10),
            country: e.country,
            subscription: e.subscription.toLowerCase(),
            company_name: e.jeweller_name,
            
            identifier: e.jeweller_name,
            
            phone: e.phone,
            email:e.email,
            pincode:e.pincode,
            whatsapp:e.whatsapp,
            urll:(e.jeweller_name)+( e.phone) ,
            town: e.town ? e.town : e.district,
            city: e.district,
            state: e.state,
            industry: e.industry,
            is_active: e.is_active
        }));

        sanetizeData.forEach(async (params, index) => {
            console.log("hey para ",params);
            if (params.email) {
                console.log("hey para a",params);
                let identifir = params.identifier.replace(/\s/g, '');
                const userProfile = await Profile.find({ identifier: identifir }).exec();
                const user = await User.find({ email: params.email }).exec();
                console.log("user is ",user);
                if (user.length || userProfile.length) {
                   // console.log("user is a");
                    duplicate.push(params);
                } else {
                    try {
                        console.log("paramsis",params);
                        let newProfile = new Profile();
                        newProfile.subscription = params.subscription || 'premium';
                        newProfile.address.city = params.city;
                        newProfile.address.line2 = params.town;
                        newProfile.address.state = params.state;
                        newProfile.address.country = params.country;
                        newProfile.contact.email = params.email;
                        newProfile.contact.phone = params.phone;
                        newProfile.industry = params.industry;

                        newProfile.pincode = params.pincode;
                        newProfile.contact.whatsapp= params.whatsapp;
                        newProfile.company_name = params.company_name ? params.company_name : params.identifier;
                        newProfile.identifier = params.identifier.replace(/\s/g, '');
                        newProfile.urll =  params.company_name ? params.company_name : params.identifier ;
                        newProfile.urll = newProfile.urll.toLowerCase().replace(/\s/g, '_') + params.phone
                        console.log("new is",newProfile)
                        let profile = await newProfile.save();
                        params.profile = profile._id;
                        const searchResult = await Role.findOne({ title: 'CUSTOMER' }).exec();
                        params.assigned_role = searchResult._id;
                        params.directory = true;
                        const newUser = new User(params);
                        let result = await newUser.save();
                        newProfile.user = result._id;
                        let response = await newProfile.save();
                        await newRec.push(response);
                    } catch (e) {
                        return res.status(500).json({ status: false, err: e, message: 'Something went wrong' });
                    }
                }
            } if (params.phone) {
                let identifir = params.identifier.replace(/\s/g, '');
                const userProfile = await Profile.find({ identifier: identifir }).exec();
                const user = await User.find({ phone: params.phone }).exec();
                if (user.length || userProfile.length) {
                    duplicate.push(params);
                } else {
                    try {
                        let newProfile = new Profile();
                        newProfile.subscription = params.subscription || 'premium';
                        newProfile.address.city = params.city;
                        newProfile.address.line2 = params.town;
                        newProfile.address.state = params.state;
                        newProfile.address.country = params.country;
                        newProfile.contact.phone = params.phone;
                        newProfile.contact.email = params.email;
                        newProfile.pincode = params.pincode;
                        newProfile.contact.whatsapp = params.whatsapp;
                        newProfile.company_name = params.company_name ? params.company_name : params.identifier;
                        newProfile.identifier = params.identifier.replace(/\s/g, '');
                        newProfile.urll =  params.company_name ? params.company_name : params.identifier ;
                        newProfile.urll = newProfile.urll.toLowerCase().replace(/\s/g, '_') + params.phone                 
                        newProfile.industry = params.industry;

                        let profile = await newProfile.save();
                        params.profile = profile._id;
                        const searchResult = await Role.findOne({ title: 'CUSTOMER' }).exec();
                        params.assigned_role = searchResult._id;
                        params.directory = true;
                        const newUser = new User(params);
                        let result = await newUser.save();
                        newProfile.user = result._id;
                        let response = await newProfile.save();
                        await newRec.push(response);
                    } catch (e) {
                        return res.status(500).json({ status: false, err: e, message: 'Something went wrong' });
                    }
                }
            } else {
                await missingMandatory.push(params);
            } if (index === sanetizeData.length - 1) {
            //    console.log("missing",missingMandatory);
              //  console.log("missing",newRec);
                //console.log("missing",duplicate);

                

                return res.status(200).json({ status: true,missingMandatoryy:missingMandatory, missingMandatory: missingMandatory.length,newRecord:newRec, newRec: newRec.length,duplicated:duplicate, duplicate: duplicate.length, message: 'User Added successfully' });
            }
        });
    }
}

function generateSecureOTP(req, res) {
    let randomotp = { otp: Math.floor(100000 + Math.random() * 900000) }
    const otp = new Otp(randomotp);
    otp.save(function (err, result) {
        if (err) {
            return res.status(400).json({ status: false, message: 'Error in saving OTP' });
        } else {
            let postData = {
                "listsms": [
                    {
                        "sms": "Please enter your OTP " + randomotp.otp + " for verification",
                        "mobiles": req.body.phone,
                        "senderid": config.smsGatewayApi.senderid,
                        "clientSMSID": config.smsGatewayApi.clientSMSID,
                        "accountusagetypeid": config.smsGatewayApi.accountusagetypeid
                    }
                ],
                "password": config.smsGatewayApi.password,
                "user": config.smsGatewayApi.user
            }
            axios.post(config.smsGatewayApi.url, postData)
                .then(function (response) {
                    res.status(200).json({ status: true, message: 'OTP sent successfully', id: result.id })
                })
                .catch(function (error) {
                    return res.status(400).json({ status: false, message: 'Something went wrong', err: error });
                });
        }
    })
}

function verifySecureOTP(req, res) {
    Otp.findOne({ _id: req.body.id }, function (err, profile) {
        return respond(res, err, profile, () => {
            Otp.findOneAndRemove({ _id: req.body.id }, function (err, resp) {
                if (err) {
                    return res.status(400).json({ status: false, message: 'Something Went Wrong' });
                } else {
                    return res.status(200).json({ status: true, message: 'OTP Verified Successfully' });
                }
            });
        }, 'OTP Not Valid')
    })
}

// @route   POST authorize
// @desc    User login
function generateOTP(req, res) {
    var params = req.body;
    if (params.email) {
        User.findOne({ phone: params.email, is_active: true }).select('+password').populate('assigned_role').exec((err, user) => {
            return respond(res, err, user, () => {
                let randomotp = { otp: Math.floor(100000 + Math.random() * 900000) }
                const otp = new Otp(randomotp);
                otp.save(function (err, result) {
                    if (err) {
                        return res.status(400).json({ status: false, message: 'Error in saving OTP' });
                    } else {
                        let postData = {
                            "listsms": [
                                {
                                    "sms": "Please enter you OTP " + randomotp.otp + "  for Jeweldisk verification",
                                    "mobiles": params.email,
                                    "senderid": config.smsGatewayApi.senderid,
                                    "clientSMSID": config.smsGatewayApi.clientSMSID,
                                    "accountusagetypeid": config.smsGatewayApi.accountusagetypeid
                                }
                            ],
                            "password": config.smsGatewayApi.password,
                            "user": config.smsGatewayApi.user
                        }
                        axios.post(config.smsGatewayApi.url, postData)
                            .then(function (response) {
                                res.status(200).json({ status: true, message: 'OTP sent successfully', id: result.id, email: user.phone })
                            })
                            .catch(function (error) {
                                return res.status(400).json({ status: false, message: 'Something went wrong', err: error });
                            });
                    }
                })
            }, 'not_found');
        })
    } else {
        return res.status(400).json({ status: false, message: 'Mobile Number is missing' });
    }
}

function verifyOTP(req, res) {
    Otp.findOneAndRemove({ _id: req.body.id, otp: req.body.otp.value }, function (err, resp) {
        if (err) {
            return res.status(400).json({ status: false, message: 'Wrong OTP Entered' });
        } else {
            if (resp) {
                var params = req.body;
                User.findOne({ phone: params.email, is_active: true }, function (err, user) {
                    if (err) {
                        return res.status(400).json({ status: false, message: 'Something Wrong happen. We will look into this.' });
                    } else {
                        let permissions = (user.assigned_role && user.assigned_role.permissions) || [];
                        let userData = { email: user.email, name: user.first_name + ' ' + user.last_name };
                        Profile.findOne({ user: user._id }, function (err, profile) {
                            if (err) {
                                return res.status(400).json({ status: false, message: 'Something Wrong happen. We will look into this.' });
                            } else {
                                const token = jwt.sign({ _id: user.id, permissions: permissions, user: user, subscription: profile.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
                                res.json({ status: true, token: token, message: 'Login successful', id: user.id, subscription: profile.subscription, permissions: permissions })
                            }
                        })
                    }
                })
            } else {
                return res.status(400).json({ status: false, message: 'Wrong OTP Entered.' });
            }
        }
    });
}

function generateToken(req, res) {
    var params = req.body;
    if (params.email) {
        User.findOne({ email: params.email, is_active: true }).select('+password').populate('assigned_role').exec((err, user) => {
            return respond(res, err, user, () => {
                bcrypt.compare(params.password, user.password, function (err, result) {
                    return respond(res, err, result, () => {
                        let permissions = (user.assigned_role && user.assigned_role.permissions) || [];
                        let userData = { email: user.email, name: user.first_name + ' ' + user.last_name };
                        Profile.findOne({ user: user._id }, function (err, profile) {
                            return respond(res, err, result, () => {
                                const token = jwt.sign({ _id: user.id, permissions: permissions, user: userData, subscription: profile.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
                                res.json({ status: true, token: token, message: 'Login successful', id: user.id, subscription: profile.subscription, permissions: permissions })
                            });
                        });
                    }, 'invalid_pass');
                });
            }, 'not_found');
        })
    } else {
        return res.status(400).json({ status: false, message: 'Email is missing' });
    }
}

// @route   POST request-pass
// @desc    Request password
function requestPass(req, res) {
    var params = req.body;
    if (params.email) {
        User.findOne({ email: params.email, is_active: true }).exec((err, user) => {
            return respond(res, err, user, () => {
                const token = jwt.sign({ email: params.email }, constants.TOKEN_SECRET, { expiresIn: '30m' });
                // TODO:: send token via mail here
                mailer.send(
                    params.email,
                    'Reset Password - Jewel Disk',
                    `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="x-ua-compatible" content="ie=edge"><title>Password Reset</title><meta name="viewport" content="width=device-width, initial-scale=1"><style type="text/css">@media screen{@font-face{font-family:'Source Sans Pro';font-style:normal;font-weight:400;src:local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff')}@font-face{font-family:'Source Sans Pro';font-style:normal;font-weight:700;src:local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff')}}body,table,td,a{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}table,td{mso-table-rspace:0pt;mso-table-lspace:0pt}img{-ms-interpolation-mode:bicubic}a[x-apple-data-detectors]{font-family:inherit !important;font-size:inherit !important;font-weight:inherit !important;line-height:inherit !important;color:inherit !important;text-decoration:none !important}div[style*="margin: 16px 0;"]{margin:0 !important}body{width:100% !important;height:100% !important;padding:0 !important;margin:0 !important}table{border-collapse:collapse !important}a{color:#1a82e2}img{height:auto;line-height:100%;text-decoration:none;border:0;outline:none}</style></head><body style="background-color: #e9ecef;"><div class="preheader" style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;"> A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.</div><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#e9ecef"> <!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tr><td align="center" valign="top" width="600"> <![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"><tr><td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;"><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">Reset Your Password</h1></td></tr></table> <!--[if (gte mso 9)|(IE)]></td></tr></table> <![endif]--></td></tr><tr><td align="center" bgcolor="#e9ecef"> <!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tr><td align="center" valign="top" width="600"> <![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"><tr><td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"><p style="margin: 0;">Tap the button below to reset your Jewel Disk Account password. If you did not request a new password, kindly ignore this email.</p></td></tr><tr><td align="left" bgcolor="#ffffff"><table border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" bgcolor="#ffffff" style="padding: 12px;"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#1a82e2" style="border-radius: 6px;"> <a href="https://admin.jeweldisk.com/auth/login?token=${token}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a></td></tr></table></td></tr></table></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;"><p style="margin: 0;">If that doesn't work please contact at support@jeweldisk.com</p></td></tr><tr><td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf"><p style="margin: 0;">Regards,<br>Jewel Disk</p></td></tr></table> <!--[if (gte mso 9)|(IE)]></td></tr></table> <![endif]--></td></tr><tr><td align="center" bgcolor="#e9ecef" style="padding: 24px;"> <!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tr><td align="center" valign="top" width="600"> <![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;"><tr><td align="center" bgcolor="#e9ecef" style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;"><p style="margin: 0;">You received this email because we received a request for password reset for your account. If you didn't request you can safely delete this email.</p></td></tr></table> <!--[if (gte mso 9)|(IE)]></td></tr></table> <![endif]--></td></tr></table></body></html>`
                );
                res.json({ status: true, message: 'Request password successful' });
            });
        }, 'not_found');
    } else {
        return res.status(400).json({ status: false, message: 'Email is missing' });
    }
}

// @route   PUT reset-pass
// @desc    Reset password
function resetPass(req, res) {
    var params = req.body;
    if (params.token == null) {
        return res.status(401).send('Unauthorized');
    }
    jwt.verify(params.token, constants.TOKEN_SECRET, (err, data) => {
        if (err) {
            console.log(err);
            return res.status(401).send('Unauthorized');
        } else if (data.email) {
            bcrypt.hash(params.password, 10, function (err, hash) {
                if (err) {
                    return res.status(500).json({ status: false, message: 'Something went wrong' });
                }
                User.findOneAndUpdate(
                    { 'email': data.email },
                    { "$set": { password: hash } },
                    { new: true },
                    function (err, user) {
                        return respond(res, err, user, () => {
                            return res.json({ status: true, message: 'Password Updated successfully' });
                        });
                    }
                )
            });
        } else {
            return res.status(401).send('Unauthorized');
        }
    });
}

// @route   POST signup
// @desc    User signup
function signup(req, res, next) {
    const names = req.body.fullName.split(' ');
    req.body.first_name = names[0] || '';
    req.body.last_name = names[1] || '';
    addEditUser(req, res, next, true);
}

// @route   POST user/list
// @desc    Fetch list of users
function listUser(req, res) {
    const pagesize = parseInt(req.body.pagesize);
    const offset = parseInt(req.body.offset);
    const search = req.body.search;
    if (req.body.search) {
        User.find({ $text: { $search: search } })
            .populate('profile')
            .populate('assigned_role')
            .exec(function (err, searchResult) {
                return respond(res, err, searchResult, () => {
                    return res.json({ status: true, data: searchResult, message: 'User Fetched Successfully' });
                });
            })
    } else {
        User.find({ is_active: true })
            .limit(pagesize)
            .skip(offset)
            .populate('profile')
            .populate('assigned_role')
            .exec(function (err, result) {
                return respond(res, err, result, () => {
                    User.count(function (err, count) {
                        return respond(res, err, count === 0 ? true : count, () => {
                            return res.json({ total: count, data: result, message: 'User Fetched Successfully', status: true });
                        });
                    });
                });
            });
    }
}

// @route   POST /user/view
// @desc    Fetch single User by id
function viewUser(req, res) {
    var id = req.body._id;
    User.findById(id, function (err, result) {
        return respond(res, err, result, () => {
            return res.json({ data: result, message: 'User Data Retrieved Successfully', status: true });
        });
    });
}

// @route   POST /user/add-edit
// @desc    Add and update User
function addEditUser(req, res, next, isSignup = false) {
    var id = req.body._id;
    var params = req.body;
    if (!id) {
        if (params.phone) {
            User.findOne({ phone: params.phone, is_active: true }, (err, user) => {
                if (user) {
                    return res.status(409).json({ status: false, message: 'Mobile Number already exists' });
                }
                return respond(res, err, true, () => {
                    if (params.email) {
                        User.findOne({ email: params.email }, (err, emailUser) => {
                            if (emailUser) {
                                return res.status(409).json({ status: false, message: 'Email already exists' });
                            } else {
                                insertData(params, isSignup, res)
                            }
                        })
                    } else {
                        insertData(params, isSignup, res)
                    }
                });
            });
        }
        // else if (params.email) {
        //     User.findOne({ email: params.email }, (err, user) => {
        //         if (user) {
        //             return res.status(409).json({ status: false, message: 'Email already exists' });
        //         }
        //         return respond(res, err, true, () => {
        //             let identifir = params.identifier.replace(/\s/g, '');
        //             Profile.findOne({ identifier: identifir }, (err, userData) => {
        //                 if (userData) {
        //                     return res.status(409).json({ status: false, message: 'Jeweler Name Already Exists' });
        //                 } else {
        //                     let randomotp = { otp: Math.floor(100000 + Math.random() * 900000) };
        //                     params.password = params.password ? params.password : randomotp.otp.toString();
        //                     bcrypt.hash(params.password, 10, function (err, hash) {
        //                         if (err) {
        //                             return res.status(500).json({ status: false, message: 'Something went wrong' });
        //                         }
        //                         params.password = hash;
        //                         const newProfile = new Profile();
        //                         newProfile.subscription = params.subscription || 'premium';
        //                         newProfile.address.line2 = params.line2;
        //                         newProfile.address.city = params.city;
        //                         newProfile.address.state = params.state;
        //                         newProfile.address.country = params.country ? params.country : 'India';
        //                         newProfile.contact.email = params.email;
        //                         newProfile.contact.phone = params.phone;
        //                         newProfile.company_name = params.company_name ? params.company_name : params.identifier;
        //                         newProfile.identifier = params.identifier.replace(/\s/g, '');
        //                         newProfile.save(function (err, profile) {
        //                             if (err) {
        //                                 console.log(err);
        //                                 return res.status(500).json({ status: false, message: 'Something went wrong' });
        //                             }
        //                             params.profile = profile._id;
        //                             if (isSignup) {
        //                                 Role.findOne({ title: 'CUSTOMER' })
        //                                     .exec(function (err, searchResult) {
        //                                         if (searchResult) {
        //                                             params.assigned_role = searchResult._id;
        //                                             params.directory = true;
        //                                             const newUser = new User(params);
        //                                             newUser.save(function (err, result) {
        //                                                 return respond(res, err, result, () => {
        //                                                     newProfile.user = result._id;
        //                                                     newProfile.save((err, response) => {
        //                                                         if (err) {
        //                                                             return res.status(500).json({ status: false, message: 'Something went wrong' });
        //                                                         } else {
        //                                                             let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
        //                                                             const token = jwt.sign({ _id: result.id, permissions: [], user: userData, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
        //                                                             return res.json({ status: true, permissions: [], id: result.id, subscription: response.subscription, token: token, message: 'User Added successfully' });
        //                                                         }
        //                                                     });
        //                                                 });
        //                                             });
        //                                         } else {
        //                                             const newRole = new Role({ title: 'CUSTOMER', permissions: [] });
        //                                             newRole.save(function (err, result) {
        //                                                 if (result) {
        //                                                     params.assigned_role = result._id;
        //                                                     params.directory = true;
        //                                                     const newUser = new User(params);
        //                                                     newUser.save(function (err, result) {
        //                                                         return respond(res, err, result, () => {
        //                                                             newProfile.user = result._id;
        //                                                             newProfile.save((err, result) => { });
        //                                                             let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
        //                                                             const token = jwt.sign({ _id: result._id, permissions: [], user: userData, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '24h' });
        //                                                             return res.json({ status: true, token: token, message: 'User Added successfully' });
        //                                                         });
        //                                                     });
        //                                                 }
        //                                             })
        //                                         }
        //                                     });
        //                             } else {
        //                                 const newUser = new User(params);
        //                                 newUser.save(function (err, result) {
        //                                     return respond(res, err, result, () => {
        //                                         newProfile.user = result._id;
        //                                         newProfile.industry = params.industry;
        //                                         newProfile.save((err, result) => { });
        //                                         return res.json({ status: true, data: result, message: 'User Added successfully' });
        //                                     });
        //                                 });
        //                             }
        //                         })
        //                     });
        //                 }
        //             });
        //         });
        //     });
        // }

        else {
            return res.status(400).json({ status: false, message: 'Email is missing' });
        }
    } else {
        if (params.phone) {
            if (!params.directory && !params.is_active) {
                findAndUpdate(req, res, params);
            } else {
                User.findOne({ phone: params.phone, is_active: true }, (err, user) => {
                    if (user) {
                        return res.status(409).json({ status: false, message: 'Mobile Number already exists' });
                    }
                    return respond(res, err, true, () => {
                        if (params.email) {
                            User.findOne({ email: params.email }, (err, emailUser) => {
                                if (emailUser) {
                                    return res.status(409).json({ status: false, message: 'Email already exists' });
                                } else {
                                    findAndUpdate(req, res, params);
                                }
                            });
                        } else {
                            findAndUpdate(req, res, params);
                        }
                    });
                });
            }
        }
    }
}



function addEditUsers(req, res, next, isSignup = false) {
    var id = req.body._id;
    var params = req.body;
    if (!id) {
        // if (params.email) {
        User.findOne({ email: params.email }, (err, user) => {
            if (user) {
                return res.status(409).json({ status: false, message: 'Email already exists' });
            }
            return respond(res, err, true, () => {
                let identifir = params.identifier.replace(/\s/g, '');
                Profile.findOne({ identifier: identifir }, (err, userData) => {
                    if (userData) {
                        return res.status(409).json({ status: false, message: 'Jeweler Name Already Exists' });
                    } else {
                        let randomotp = { otp: Math.floor(100000 + Math.random() * 900000) };
                        params.password = params.password ? params.password : randomotp.otp.toString();
                        bcrypt.hash(params.password, 10, function (err, hash) {
                            if (err) {
                                return res.status(500).json({ status: false, message: 'Something went wrong' });
                            }
                            params.password = hash;
                            const newProfile = new Profile();
                            newProfile.subscription = params.subscription || 'premium';
                            newProfile.address.line2 = params.line2;
                            newProfile.address.city = params.city;
                            newProfile.address.state = params.state;
                            newProfile.address.country = params.country ? params.country : 'India';
                            newProfile.contact.email = params.email;
                            newProfile.contact.phone = params.phone;
                            newProfile.company_name = params.company_name ? params.company_name : params.identifier;
                            newProfile.identifier = params.identifier.replace(/\s/g, '');
                            newProfile.save(function (err, profile) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({ status: false, message: 'Something went wrong' });
                                }
                                params.profile = profile._id;
                                if (isSignup) {
                                    Role.findOne({ title: 'CUSTOMER' })
                                        .exec(function (err, searchResult) {
                                            if (searchResult) {
                                                params.assigned_role = searchResult._id;
                                                params.directory = true;
                                                const newUser = new User(params);
                                                newUser.save(function (err, result) {
                                                    return respond(res, err, result, () => {
                                                        newProfile.user = result._id;
                                                        newProfile.save((err, response) => {
                                                            if (err) {
                                                                return res.status(500).json({ status: false, message: 'Something went wrong' });
                                                            } else {
                                                                let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
                                                                const token = jwt.sign({ _id: result.id, permissions: [], user: userData, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
                                                                return res.json({ status: true, permissions: [], id: result.id, subscription: response.subscription, token: token, message: 'User Added successfully' });
                                                            }
                                                        });
                                                    });
                                                });
                                            } else {
                                                const newRole = new Role({ title: 'CUSTOMER', permissions: [] });
                                                newRole.save(function (err, result) {
                                                    if (result) {
                                                        params.assigned_role = result._id;
                                                        params.directory = true;
                                                        const newUser = new User(params);
                                                        newUser.save(function (err, result) {
                                                            return respond(res, err, result, () => {
                                                                newProfile.user = result._id;
                                                                newProfile.save((err, result) => { });
                                                                let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
                                                                const token = jwt.sign({ _id: result._id, permissions: [], user: userData, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '24h' });
                                                                return res.json({ status: true, token: token, message: 'User Added successfully' });
                                                            });
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                } else {
                                    const newUser = new User(params);
                                    newUser.save(function (err, result) {
                                        return respond(res, err, result, () => {
                                            newProfile.user = result._id;
                                            newProfile.industry = params.industry;
                                            newProfile.save((err, result) => { });
                                            return res.json({ status: true, data: result, message: 'User Added successfully' });
                                        });
                                    });
                                }
                            })
                        });
                    }
                });
            });
        });
       
    } else {
        User.findByIdAndUpdate(id,
            { "$set": params },
            { new: true },
            function (err, user) {
                return respond(res, err, user, () => {
                    Profile.findOneAndUpdate(
                        { 'user': id },
                        {
                            "$set": {
                                assigned_role: params.assigned_role,
                                company_name: params.company_name,
                                directory: params.directory,
                                'contact.email': params.email,
                                industry: params.industry,
                                subscription: params.subscription || 'premium',
                                identifier: params.identifier,
                                'contact.phone': params.phone,
                                'address.state': params.state,
                                'address.city': params.city,
                                'address.line2': params.line2,
                                hideReviews: params.hideReviews
                            }
                        },
                        { new: true },
                        function (err, user) {
                            return respond(res, err, user, () => {
                                return res.json({ status: true, message: 'User Updated successfully' });
                            });
                        }
                    )
                });
            }
        )
    }
}




function findAndUpdate(req, res, params) {
    User.findByIdAndUpdate(req.body._id,
        { "$set": params },
        { new: true },
        function (err, user) {
            return respond(res, err, user, () => {
                Profile.findOneAndUpdate(
                    { 'user': req.body._id },
                    {
                        "$set": {
                            assigned_role: params.assigned_role,
                            company_name: params.company_name,
                            directory: params.directory,
                            'contact.email': params.email,
                            industry: params.industry,
                            subscription: params.subscription || 'premium',
                            identifier: params.identifier,
                            'contact.phone': params.phone,
                            'address.state': params.state,
                            'address.city': params.city,
                            'address.line2': params.line2,
                            hideReviews: params.hideReviews
                        }
                    },
                    { new: true },
                    function (err, user) {
                        return respond(res, err, user, () => {
                            return res.json({ status: true, message: 'User Updated successfully' });
                        });
                    }
                )
            });
        }
    )
}



function updatedata(params, isSignup, res)  {
    let _id =params._id
    User.findByIdAndUpdate({_id:_id}, {
        $set: req.body
    }, {
        new: true
    }).then((result) => {
        console.log("result",result);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
    }, (err) => next(err)
    ).catch((err) =>
    
    next(err));
};






function insertData(params, isSignup, res) {
    let identifir = params.identifier.replace(/\s/g, '');
    Profile.findOne({ }, (err, userData) => {
        // if (userData) {
        //     return res.status(409).json({ status: false, message: 'Jeweler Name Already Exists' });
        // } else {
            bcrypt.hash(params.password, 10, function (err, hash) {
                if (err) {
                    return res.status(500).json({ status: false, message: 'Something went wrong' });
                }
                params.password = hash;
                const newProfile = new Profile();
                newProfile.urll =  params.company_name ? params.company_name : params.identifier ;
                newProfile.urll = newProfile.urll.toLowerCase().replace(/\s/g, '_') + params.phone
                newProfile.subscription = params.subscription || 'premium';
                newProfile.address.line2 = params.line2;
                newProfile.address.city = params.city;
                newProfile.address.state = params.state;
                newProfile.address.country = params.country;
                newProfile.contact.phone = params.phone;
                newProfile.company_name = params.company_name ? params.company_name : params.identifier;
                newProfile.identifier = params.identifier.replace(/\s/g, '');
                newProfile.save(function (err, profile) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ status: false, message: 'Something went wrong' });
                    }
                    params.profile = profile._id;
                    if (isSignup) {
                        Role.findOne({ title: 'CUSTOMER' })
                            .exec(function (err, searchResult) {
                                if (searchResult) {
                                    params.assigned_role = searchResult._id;
                                    params.directory = true;
                                    const newUser = new User(params);
                                    newUser.save(function (err, result) {
                                        return respond(res, err, result, () => {
                                            newProfile.user = result._id;
                                            newProfile.save((err, response) => {
                                                if (err) {
                                                    return res.status(500).json({ status: false, message: 'Something went wrong' });
                                                } else {
                                                    let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
                                                    const token = jwt.sign({ _id: result.id, permissions: [], user: result, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
                                                    return res.json({ status: true, permissions: [], id: response.id, subscription: response.subscription, token: token, message: 'User Added successfully' });
                                                }
                                            });
                                        });
                                    });
                                } else {
                                    const newRole = new Role({ title: 'CUSTOMER', permissions: [] });
                                    newRole.save(function (err, result) {
                                        if (result) {
                                            params.assigned_role = result._id;
                                            params.directory = true;
                                            const newUser = new User(params);
                                            newUser.save(function (err, result) {
                                                return respond(res, err, result, () => {
                                                    newProfile.user = result._id;
                                                    newProfile.save((err, result) => { });
                                                    let userData = { email: result.email, name: result.first_name + ' ' + result.last_name };
                                                    const token = jwt.sign({ _id: result._id, permissions: [], user: userData, subscription: params.subscription }, constants.TOKEN_SECRET, { expiresIn: '30d' });
                                                    return res.json({ status: true, token: token, message: 'User Added successfully' });
                                                });
                                            });
                                        }
                                    })
                                }
                            });
                    } else {
                        const newUser = new User(params);
                        newUser.save(function (err, result) {
                            return respond(res, err, result, () => {
                                newProfile.user = result._id;
                                newProfile.save((err, result) => { });
                                return res.json({ status: true, data: result, message: 'User Added successfully' });
                            });
                        });
                    }
                })
            });
        
    });
}

function getDeletedUser(req, res) {
    const pagesize = parseInt(req.body.pagesize);
    const offset = parseInt(req.body.offset);
    User.find({ is_active: false })
        .limit(pagesize)
        .skip(offset)
        .populate('profile')
        .populate('assigned_role')
        .exec(function (err, result) {
            return respond(res, err, result, () => {
                User.count(function (err, count) {
                    return respond(res, err, count === 0 ? true : count, () => {
                        return res.json({ total: count, data: result, message: 'User Fetched Successfully', status: true });
                    });
                });
            });
        });
}

// async function addLocation(req, res) {
//     let country = req.body.country;
//     let state = req.body.state ? req.body.state : "";
//     let district = req.body.district;
//     let town = req.body.town;
//     try {
//         let cityResp = await District.find({ city_name: district });
//         if (cityResp.length) {
//             let townData = new Town();
//             townData.cityId = cityResp[0].id;
//             townData.town_name = town;
//             let townRes = await townData.save();
//             console.log(townRes);
//         } else {
//             let city = new District();
//             city.city_name = district;
//             let result = await city.save();
//             let townData = new Town();
//             townData.cityId = result[0].id;
//             townData.town_name = town;
//             let townRes = await townData.save();
//             console.log(townRes);
//         }
//         return res.status(200).json({ status: true, message: 'Record Added successfully' });
//     } catch (err) {
//         return res.status(404).json({ status: false, message: 'Record Addon Failed', error: err });
//     }

// }


function addLocation(req, res) {
    var data = XLSX.read(req.body.data, {
        type: 'binary'
    });
    
    let sheetData = data.Sheets[data.SheetNames[0]];
    let csvArray = XLSX.utils.sheet_to_json(sheetData, {
        raw: true,
        defval: null
    });

    if (!Array.isArray(csvArray)) {
        return res.status(400).json({ status: false, message: 'Invalid Excel File' });
    } else {
        let  newRec = [];
        let sanetizeData = csvArray.map((e) => ({
            

            cityId:e.cityId,
            town_name:e.town_name
        }));

        console.log("sanetizeData is ",sanetizeData);

        sanetizeData.forEach(async (params, index) => {
            console.log("hey para ",params);
        
                console.log("hey para a",params);
           
                    try {
                        console.log("paramsis",params);
                        let newProfile = new Town();
                        newProfile.town_name=params.town_name;
                        newProfile.cityId=params.cityId;
                        console.log("new is",newProfile)
                        let profile = await newProfile.save();
                        params.profile = profile._id;
                  
                        let response = await newProfile.save();
                        await newRec.push(response);
                    } catch (e) {
                        return res.status(500).json({ status: false, err: e, message: 'Something went wrong' });
                    }
                
              
            
            if (index === sanetizeData.length - 1) {
                
                return res.status(200).json({ status: true,newLocation:newRec,  message: 'Location Added successfully' });
            }
        });
    }
}


async function getAllLocation(req, res) {
    try {
        let location = [];

        let stateData = await State.find({}).exec();
        let cityData = await District.find({}).exec();
        let townData = await Town.find({}).exec();
        let countr = 1;
        stateData.forEach((stateEle) => {
            cityData.forEach((cityEle) => {
                let city_id = cityEle.stateId.toString()
                if (stateEle.id === city_id) {
                    townData.forEach((townEle, index) => {
                        let town_id = townEle.cityId.toString();
                        if (cityEle.id === town_id) {
                            location.push({ id: countr, country: 'India', state: stateEle.state_name, cityName: cityEle.city_name, townName: townEle.town_name });
                            countr++;
                        }
                    })
                }
            })
        })

        return res.status(200).json({ status: true, message: 'Records Fetched successfully', data: location });
    } catch (err) {
        return res.status(404).json({ status: false, message: 'Record Fetched Failed', error: err });
    }
}

async function getState(req, res) {
    try {
        let data = await State.find({}).exec();
        return res.status(200).json({ status: true, message: 'Records Fetched successfully', data: data });
    } catch (err) {
        return res.status(404).json({ status: false, message: 'Record Fetched Failed', error: err });
    }
}

async function getCity(req, res) {
    try {
        var sheetData = [];
     if (req.params.state) {
        var sort = { city_name: 1 }
            sheetData = await District.find({ stateId: req.params.state }).sort(sort).exec();
        } else {
            var sort = { city_name: 1 }

            sheetData = await District.find({}).sort(sort).exec();
        }
        return res.status(200).json({ status: true, message: 'Records Fetched successfully', data: sheetData });
    } catch (err) {
        return res.status(404).json({ status: false, message: 'Record Fetched Failed', error: err });
    }
}

async function getTown(req, res) {
    try {
        let townData = [];
        if (req.params.city) {
            townData = await Town.find({ cityId: req.params.city }).exec();
        } else {
            townData = await Town.find({}).exec();
        }
        return res.status(200).json({ status: true, message: 'Records Fetched successfully', data: townData });
    } catch (err) {
        return res.status(404).json({ status: false, message: 'Record Fetched Failed', error: err });

    }

}

async function deleteLoc(req, res) {
    try {
        let townName = req.body.townName;
        let deleteTown = await Town.findOneAndDelete({ town_name: townName }).exec();
        return res.status(200).json({ status: true, message: 'Record Deleted Successfully' });
    } catch (err) {
        return res.status(404).json({ status: false, message: 'Record Fetched Failed', error: err });
    }
}

async function findPublicAndUpdate(req, res) {
    try {
        let doc = await Profile.findOneAndUpdate({ identifier: req.body.identifier }, { views: req.body.views }, { new: true });
        if (doc) {
            return res.json({ status: true, data: doc, message: 'User Updated successfully' });
        }
    } catch (error) {
        return res.json({ status: false, message: 'User Not Updated successfully' });
    }
}

function respond(res, err, data, next, type) {
    if (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: 'Something Went Wrong' });
    } else if (data) {
        next();
    } else {
        switch (type) {
            case 'not_found': return res.status(404).json({ status: false, message: 'User not found' });
            case 'invalid_pass': return res.status(401).json({ status: false, message: 'Invalid credentials' });
            default: return res.status(404).json({ status: false, message: 'No data found' });
        }
    }
}
