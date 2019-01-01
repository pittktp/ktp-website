const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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
app.use(cors({ origin: 'http://localhost:4200' }));

// Production - use when running in production in AWS
//app.use(cors({ origin: 'https://pitt-kappathetapi.com' }));

app.listen(3000, () => console.log('Server started on port 3000'));


app.use('/api/members', memberController);
app.use('/api/requests', requestsController);


// auth endpoint
app.post('/api/auth', function(req, res) {
  const body = req.body;

  var query = { 'email' : body.email };
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
