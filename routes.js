const express = require('express');
const router = express.Router();

const constants = require('./constants');

// Auth middleware
const auth = require('./middlewares/auth');

// Upload middleware
const uploadService = require('./middlewares/file-upload');

// @route   /user
// @desc    User CRUD
// User Routes -- START
const userController = require('./controllers/user');

// @access  Public - User auth
router.post('/authorize', userController.generateToken);

router.get('/getStates', userController.getState);
router.get('/getCity/:state', userController.getCity);
router.get('/getCity', userController.getCity);
router.get('/getTown/:city', userController.getTown);
router.get('/getTown', userController.getTown);

router.post('/generateOTP', userController.generateOTP);
router.post('/verifyOTP', userController.verifyOTP);
router.get('/getDirectory', userController.listUser);
router.post('/signup', userController.signup);
router.post('/request-pass', userController.requestPass);
router.post('/reset-pass', userController.resetPass);
router.post('/updatePubilicProfile', userController.findPublicAndUpdate)
const dashboardController = require('./controllers/dashboard');
router.post('/superdash', auth(constants.permissions.DASHBOARD_PERMISSION), dashboardController.superdash);

// @access  Protected - User Permission
const userRouter = express.Router();
userRouter.post('/addLocation', userController.addLocation);
userRouter.get('/getAllLocation', userController.getAllLocation);
userRouter.post('/deleteLocation', userController.deleteLoc);
userRouter.post('/list', userController.listUser);
userRouter.post('/view', userController.viewUser);
userRouter.post('/add-edit', userController.addEditUser);
userRouter.post('/edit', userController.addEditUsers);

userRouter.post('/deletedUsers', userController.getDeletedUser);
userRouter.post('/generateSecureOTP', userController.generateSecureOTP);
userRouter.post('/verifySecureOTP', userController.verifySecureOTP);
userRouter.post('/uploadbulkusers', userController.uploadxls);
router.use('/user', auth(constants.permissions.USER_PERMISSION), userRouter);
// User Routes -- END


// @route   /role
// @desc    Role CRUD
// Role Routes -- START
const roleController = require('./controllers/role');

// @access  Protected - Role Permission
const roleRouter = express.Router();
roleRouter.post('/list', roleController.listRole);
roleRouter.post('/view', roleController.viewRole);
roleRouter.post('/add-edit', roleController.addEditRole);
router.use('/role', auth(constants.permissions.ROLE_PERMISSION), roleRouter);
// Role Routes -- END


// @route   /coupon
// @desc    Coupon CRUD
// Coupon Routes -- START
const couponController = require('./controllers/coupon');

// @access  Protected - Role Permission
const couponRouter = express.Router();
couponRouter.post('/list', couponController.listCoupon);
couponRouter.post('/view', couponController.viewCoupon);
couponRouter.post('/add-edit', couponController.addEditCoupon);
router.use('/coupon', auth(constants.permissions.COUPON_PERMISSION), couponRouter);
// Role Routes -- END

// @route   /profile
// @desc    Profile CRUD
// Profile Routes -- START
const profileController = require('./controllers/profile');
router.post('/myprofile', auth(), profileController.myProfile);

// @access  Protected - Profile Permission
const profileRouter = express.Router();
profileRouter.post('/list', profileController.listProfile);
profileRouter.post('/view', profileController.viewProfile);
profileRouter.post('/add-edit', profileController.addEditProfile);
router.use('/profile', auth(constants.permissions.PROFILE_PERMISSION), profileRouter);
// Profile Routes -- END

router.get('/:urll', profileController.publicProfile);
router.get('/info', express.static('public'));
router.get('/', (req, res) => res.redirect('https://jeweldisk.com'));
router.post('/apply-coupon', auth(), profileController.applyCoupon);

// Review and Inquiry
router.post('/add-review', profileController.addReview);
router.post('/add-inquiry', profileController.addInquiry);
router.get('/urll-Test', profileController.testFunction);

// router.get('/', profileController.publicProfile);

// Uploader
router.post('/upload', uploadService.upload.array('image', 1), (req, res) => {
    res.send({ url: req.file_url });
});


router.post('/multiupload', (req, res) => {
    uploadService.uploadsBusinessGallery(req, res, (error) => {
        console.log('files', req.files);
        if (error) {
            console.log('errors', error);
            res.json({ error: error });
        } else {
            // If File not found
            if (req.files === undefined) {
                console.log('Error: No File Selected!');
                res.json('Error: No File Selected');
            } else {
                // If Success
                let fileArray = req.files,
                    fileLocation; const galleryImgLocationArray = [];
                for (let i = 0; i < fileArray.length; i++) {
                    fileLocation = "https://images.jeweldisk.com/" + fileArray[i].key;
                    console.log('filenm', fileLocation);
                    galleryImgLocationArray.push(fileLocation)
                }
                // Save the file name into databaseres.json( {
                res.send({ url: galleryImgLocationArray });
            }
        }
    });
});

module.exports = router;
