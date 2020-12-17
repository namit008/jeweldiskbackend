const Coupon = require('../models/coupon');

module.exports = {
    listCoupon,
    viewCoupon,
    addEditCoupon
}
// @route   POST coupon/list
// @desc    Fetch list of coupons
function listCoupon(req, res) {
    const pagesize = parseInt(req.body.pagesize);
    const offset = parseInt(req.body.offset);
    const search = req.body.search;
    if (req.body.search) {
        Coupon.find({ $text: { $search: search } })
            .exec(function (err, searchResult) {
                return respond(res, err, searchResult, () => {
                    res.json({ status: true, data: searchResult, message: 'Coupon Fetched Successfully' });
                });
            })
    } else {
        Coupon.find()
            .limit(pagesize)
            .skip(offset)
            .exec(function (err, result) {
                return respond(res, err, result, () => {
                    Coupon.count(function (err, count) {
                        return respond(res, err, count === 0 ? true : count, () => {
                            res.json({ total: count, data: result, message: 'Coupon Fetched Successfully', status: true });
                        });
                    });
                });
            });
    }
}

// @route   POST /coupon/view
// @desc    Fetch single Coupon by id
function viewCoupon(req, res) {
    var id = req.body._id;
    Coupon.findById(id, function (err, result) {
        return respond(res, err, result, () => {
            res.json({ data: result, message: 'Coupon Data Retrieved Successfully', status: true });
        });
    });
}

// @route   POST /coupon/add-edit
// @desc    Add and update Coupon
function addEditCoupon(req, res) {
    var id = req.body._id;
    var params = req.body;
    if (!id) {
        if (params.title) {
            Coupon.findOne({ title: params.title }, (err, coupon) => {
                if (coupon) {
                    return res.status(409).json({ status: false, message: 'Coupon already exists' });
                }
                return respond(res, err, true, () => {
                    const newCoupon = new Coupon(params);
                    newCoupon.save(function (err, result) {
                        return respond(res, err, result, () => {
                            res.json({ status: true, data: result, message: 'Coupon Added successfully' });
                        });
                    })
                });
            })
        } else {
            return res.status(400).json({ status: false, message: 'Coupon title is missing' });
        }
    } else {
        Coupon.findOneAndUpdate(
            { '_id': id },
            { "$set": params },
            { new: true },
            function (err, coupon) {
                return respond(res, err, coupon, () => {
                    res.json({ status: true, message: 'Coupon Updated successfully' });
                });
            }
        )
    }
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