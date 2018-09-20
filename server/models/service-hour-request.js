const mongoose = require('mongoose');

var ServiceHourRequest = mongoose.model('ServiceHourRequest', {
  serviceHours: { type: Number },
  description: { type: String },
  submittedBy: { type: String },
  submittedById: { type: String },
  submittedDate: { type: String },
  approved: { type: Number }
});

module.exports = { ServiceHourRequest };
