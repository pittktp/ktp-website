const mongoose = require('mongoose');

var PointRequest = mongoose.model('PointRequest', {
  points: { type: Number },
  description: { type: String },
  submittedBy: { type: String },
  submittedById: { type: String },
  submittedDate: { type: String },
  approved: { type: Number }
});

module.exports = { PointRequest };
