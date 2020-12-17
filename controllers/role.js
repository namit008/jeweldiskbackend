const Role = require('../models/role');

module.exports = {
    listRole,
    viewRole,
    addEditRole
}
// @route   POST role/list
// @desc    Fetch list of roles
function listRole(req, res) {
    const pagesize = parseInt(req.body.pagesize);
    const offset = parseInt(req.body.offset);
    const search = req.body.search;
    if (req.body.search) {
        Role.find({ $text: { $search: search } })
            .exec(function (err, searchResult) {
                return respond(res, err, searchResult, () => {
                    res.json({ status: true, data: searchResult, message: 'Role Fetched Successfully' });
                });
            })
    } else {
        Role.find()
            .limit(pagesize)
            .skip(offset)
            .exec(function (err, result) {
                return respond(res, err, result, () => {
                    Role.count(function (err, count) {
                        return respond(res, err, count === 0 ? true : count, () => {
                            res.json({ total: count, data: result, message: 'Role Fetched Successfully', status: true });
                        });
                    });
                });
            });
    }
}

// @route   POST /role/view
// @desc    Fetch single Role by id
function viewRole(req, res) {
    var id = req.body._id;
    Role.findById(id, function (err, result) {
        return respond(res, err, result, () => {
            res.json({ data: result, message: 'Role Data Retrieved Successfully', status: true });
        });
    });
}

// @route   POST /role/add-edit
// @desc    Add and update Role
function addEditRole(req, res) {
    var id = req.body._id;
    var params = req.body;
    if (!id) {
        if (params.title) {
            Role.findOne({ title: params.title }, (err, role) => {
                if (role) {
                    return res.status(409).json({ status: false, message: 'Role already exists' });
                }
                return respond(res, err, true, () => {
                    const newRoleData = {
                        title: params.title,
                        permissions: params.permissions
                    }
                    const newRole = new Role(newRoleData);
                    newRole.save(function (err, result) {
                        return respond(res, err, result, () => {
                            res.json({ status: true, data: result, message: 'Role Added successfully' });
                        });
                    })
                });
            })
        } else {
            return res.status(400).json({ status: false, message: 'Role title is missing' });
        }
    } else {
        Role.findOneAndUpdate(
            { '_id': id },
            { "$set": params },
            { new: true },
            function (err, role) {
                return respond(res, err, role, () => {
                    res.json({ status: true, message: 'Role Updated successfully' });
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