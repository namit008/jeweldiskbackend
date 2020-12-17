const Coupon = require('../models/coupon');

module.exports = {
    superdash
}

// @route   POST /superdash
// @desc    Fetch admin dashboard data
function superdash(req, res) {
    let data = {};
    User.count(function (err, count) {
        data.userCount = count;
        return respond(res, err, data, () => {
            User.count({createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) }}, function (err, count) {
                return respond(res, err, data, () => {
                    data.userCountSevenDays = count;
                    User.count({createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) }}, function (err, count) {
                        return respond(res, err, data, () => {
                            data.userCountThirtyDays = count;
                            Profile.aggregate([ 
                                {$match: { 'address.state' : { $ne: null } } },
                                {$group:{ _id: "$address.state", count: {$sum: 1}}},
                                {$sort : {count : -1}},
                                {$limit : 1 }
                                ], function (err, state) {
                                    return respond(res, err, data, () => {
                                    data.topState = state && state[0];
                                    Profile.aggregate([
                                        {$match: { 'address.city' : { $ne: null } } },
                                        {$group:{ _id: "$address.city", count: {$sum: 1}}}, 
                                        {$sort : {count : -1}}, 
                                        {$limit : 1 }
                                        ], function (err, city) {
                                        data.topCity = city && city[0];
                                        User.count({is_active: true}, function (err, count) {
                                            return respond(res, err, data, () => {
                                                data.activeUserCount = count;
                                                Profile.aggregate([
                                                    {$group:{ _id: "$subscription", count: {$sum: 1}}},
                                                    ], function (err, subscriptions) {
                                                    data.subscriptions = subscriptions;
                                                    res.json({ data: data, message: 'Dashboard loaded successfully', status: true }); 
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// @route   POST /dashboard
// @desc    Fetch dashboard data
function dashboard(req, res) {
    let data = {};
    return respond(res, err, data, () => {
        res.json({ data: data, message: 'Dashboard loaded successfully', status: true });
    });
}

function respond(res, err, data, next) {
    if (err) {
        console.log(err);
        res.status(500).json({ status: false, message: 'Something Went Wrong' });
    } else if (data) {
        next();
    } else {
        res.status(404).json({ status: false, message: 'No data found' });
    }
}