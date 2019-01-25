// The "main method" that connects to our MongoDB database

const mongoose = require('mongoose');

// Production database in AWS
const url = "mongodb://database:27017/KtpDB";

// Dev database
//onst url = "mongodb://localhost:27017/KtpDB";

mongoose.connect(url, { useNewUrlParser: true }, (err) => {
  if(!err)
    console.log('MongoDB connection successful');
  else
    console.log('Error connecting to DB: ' + JSON.stringify(err, undefined, 2));
});

module.exports = mongoose;
