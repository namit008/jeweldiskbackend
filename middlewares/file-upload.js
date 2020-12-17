const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const dotenv = require('dotenv');
dotenv.config();

aws.config.update({
  secretAccessKey: 'qINclMn6xihHvlDssuSXp/a1RuF25K5YYcgbr6NO',
  accessKeyId: 'AKIA2GIOOEIKOTYCGEE4',
  region: 'ap-south-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

const upload = multer({
  fileFilter: fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'images.plzvisit.com',
    key: function (req, file, cb) {
      const fileName = getFileName(req, file);
      req.file_url = "https://images.jeweldisk.com/" + fileName;
      cb(null, fileName);
    },
    onError: function (err, next) {
      console.log('error', err);
      next(err);
    }
  })
});

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype); if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const uploadsBusinessGallery = multer({
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'images.plzvisit.com',
    key: function (req, file, cb) {
      const fileName = getFileName(req, file);
      req.file_url = "https://images.jeweldisk.com/" + fileName;
      cb(null, fileName);
    }
  }),
  // limits: { fileSize: 20000000 }, // In bytes: 2000000 bytes = 2 MB
  fileFilter: fileFilter
}).array('image', 7);

function getFileName(req, file) {
  return Date.now() + "." + file.mimetype.split('/')[1];
}

module.exports = { upload, uploadsBusinessGallery };
