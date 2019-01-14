const mongoose = require('mongoose');

var Member = mongoose.model('Member', {
  name: { type: String },
  email: { type: String},
  password: { type: String },
  points: { type: Number },
  serviceHours: { type: Number },
  role: { type: String },
  absences: { type: Number },
  rushClass: { type: String },
  picture: { type: String },
  courses: { type: Array },
  linkedIn: { type: String },
  github: { type: String },
  gradSemester: { type: String },
  major: { type: String },
  description: { type: String },
  color: { type: Array }
});

module.exports = { Member };
