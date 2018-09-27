// The "main method" that connects to our MongoDB database

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/KtpDB', { useNewUrlParser: true }, (err) => {
  if(!err)
    console.log('MongoDB connection successful');
  else
    console.log('Error connecting to DB: ' + JSON.stringify(err, undefined, 2));
});

module.exports = mongoose;
