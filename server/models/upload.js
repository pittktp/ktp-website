const mongoose = require('mongoose');

var Upload = mongoose.model('Upload', {
  filename: { type: String },
  submittedById: { type: String },
  submittedDate: { type: String }
});

module.exports = { Upload }