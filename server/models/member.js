const mongoose = require('mongoose');

var Member = mongoose.model('Member', {
  name: { type: String },
  email: { type: String},
  password: { type: String },
  studentId: { type: String },
  points: { type: Number },
  role: { type: String }
});

module.exports = { Member };
