const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const util = require('util')
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
//const { mongoose } = require('./db.js');

/* The class that runs the nodejs backend server - run this file when starting the server */


var { Member } = require('./models/member');

var memberController = require('./controllers/memberController.js');
var requestsController = require('./controllers/requestsController.js');

var app = express();
app.use(bodyParser.json());


// Test - use when running this locally
//app.use(cors({ origin: 'http://localhost:4200' }));

// Production - use when running in production in AWS
app.use(cors({ origin: ['https://pittkappathetapi.com', 'https://www.pittkappathetapi.com'] }));


// Port that the server is listening for requests on
app.listen(3000, () => console.log('Server started on port 3000'));

// Tells the server to forward requests to the respective controllers
app.use('/api/members', memberController);
app.use('/api/requests', requestsController);


// Auth endpoint -> takes email and password and checks to see if a member exists with this email and checks if the hash of the passwords are the same.
// Send back a JWT token that expires in 3 hours if the login info is valid
app.post('/api/auth', function(req, res) {
  const body = req.body;

  var searchDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  var params = {
    TableName : "KtpMembers",
    FilterExpression: "email = :email",
    ExpressionAttributeValues:{
        ":email": req.body.email
    }
  };
  searchDocClient.scan(params, function(err, data) {
    if(!data) return res.sendStatus(401);  // A member with this email doesn't exist in DB - return 401 UNAUTHORIZED error
    //console.log(data)
    else {   // Found a member with this email!
      bcrypt.compare(body.password, data.Items[0].password, function(err, match) {  // bcrypt hashes the supplied password and compares it to the hash of the member's password in the DB
        if(match) {  // Hashes of passwords match -> send a JWT token back to the frontend sayin "you all good homie you can talk to me"
          var token = jwt.sign({userID: data.Items[0]._id}, 'ktp-secret', {expiresIn: '3h'});
          res.send({token});
        }
        else return res.sendStatus(401);  // The passwords don't match for this member -> return 401 UNAUTHORIZED error
      });
    }
  });


  // var query = { 'email' : body.email.toLowerCase() };
  // Member.findOne(query, function(err, item) {
  //   if(!item) return res.sendStatus(401);  // A member with this email doesn't exist in DB - return 401 UNAUTHORIZED error
  //
  //   else {   // Found a member with this email!
  //     bcrypt.compare(body.password, item.password, function(err, match) {  // bcrypt hashes the supplied password and compares it to the hash of the member's password in the DB
  //       if(match) {  // Hashes of passwords match -> send a JWT token back to the frontend sayin "you all good homie you can talk to me"
  //         var token = jwt.sign({userID: item._id}, 'ktp-secret', {expiresIn: '3h'});
  //         res.send({token});
  //       }
  //       else return res.sendStatus(401);  // The passwords don't match for this member -> return 401 UNAUTHORIZED error
  //     });
  //   }
  //
  // });
});
