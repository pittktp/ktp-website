const mongoose = require('mongoose');

var Request = mongoose.model('Request', {
  type: { type: String },
  value: { type: Number },
  description: { type: String },
  submittedBy: { type: String },
  submittedById: { type: String },
  submittedDate: { type: String },
  approved: { type: Number },
  excuseDate: {type: String}
});

module.exports = { Request };
