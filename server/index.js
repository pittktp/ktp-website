const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const util = require('util')

const { mongoose } = require('./db.js');

var { Member } = require('./models/member');

var memberController = require('./controllers/memberController.js');
var requestsController = require('./controllers/requestsController.js');

var app = express();
app.use(bodyParser.json());


// Test - use when running this locally
//app.use(cors({ origin: 'http://localhost:4200' }));

// Production - use when running in production in AWS
app.use(cors({ origin: ['https://pitt-kappathetapi.com', 'https://www.pitt-kappathetapi.com'] }));


// Port the server is listening for requests on
app.listen(3000, () => console.log('Server started on port 3000'));

// Tells the server to forward requests to the controllers
app.use('/api/members', memberController);
app.use('/api/requests', requestsController);


// Auth endpoint -> takes email and password and checks to see if a member exists with this email and checks if the hash of the passwords are the same.
// Send back a JWT token that expires in 3 hours if the login info is valid
app.post('/api/auth', function(req, res) {
  const body = req.body;

  var query = { 'email' : body.email.toLowerCase() };
  Member.findOne(query, function(err, item) {
    if(!item) return res.sendStatus(401);

    else {
      bcrypt.compare(body.password, item.password, function(err, match) {
        if(match) {
          var token = jwt.sign({userID: item._id}, 'ktp-secret', {expiresIn: '3h'});
          res.send({token});
        }
        else return res.sendStatus(401);
      });
    }

  });
});
