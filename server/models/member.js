const mongoose = require('mongoose');

var Member = mongoose.model('Member', {
  name: { type: String },
  email: { type: String},
  password: { type: String },
  points: { type: Number },
  serviceHours: { type: Number },
  role: { type: String },
  code: { type: String },
  absences: { type: Number }
});

module.exports = { Member };
