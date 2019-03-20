const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
  // secretAccessKey: process.env.AWS_SECRET,
  // accessKeyId: process.env.AWS_ID,
  secretAccessKey: "TjRAoeg8OWqkXujz1I9laMT0DYtXciIxz4sFQNhL",
  accessKeyId: "AKIAJGV4ZCC5RKTFHROQ",
  region: 'us-east-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG, PNG, and GIF is allowed!'), false);
  }
}

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3: s3,
    bucket: 'pitt-ktp',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'TESTING_METADATA'});
    },
    key: function (req, file, cb) {
      console.log(req.body.username);
      console.log(req.body.newFileName);
      var fullPath = "img/profile/" + req.body.username + "/" + req.body.newFileName;
      cb(null, fullPath)
    }
  })
});

const request = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3:s3,
    bucket: 'pitt-ktp',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: 'TESTING_METADATA' });
    },
    key: function (req, file, cb) {
      console.log(req.body.submittedBy);
      console.log(req.body.newFileName);
      var fullPath = "img/requests/" + req.body.submittedBy.username + "/" + req.body.newFileName;
      cb(null, fullPath);
    }
  })
});

module.exports.upload = upload;
module.exports.request = request;
