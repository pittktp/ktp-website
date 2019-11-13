// Represents a member object in our database

const mongoose = require('mongoose');

var rushMember = mongoose.model('RushMember', {
  name:  { type: String },
  email: { type: String },
  year:  { type: String },
  major: { type: String },
  ref:   { type: String }

});

module.exports = { RushMember };
