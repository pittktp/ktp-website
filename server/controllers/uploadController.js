const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Upload } = require('../models/upload');

// Post Profile Picture Upload --> localhost:3000/upload/
router.post('/', (req, res) => {
  var upload = new Upload({
    filename: req.body.filename,
    submittedById: req.body.submittedById,
    submittedDate: req.body.submittedDate
  });

  // Update User picture
});
