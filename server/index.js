const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const util = require('util')

const { mongoose } = require('./db.js');

var { Member } = require('./models/member');

var memberController = require('./controllers/memberController.js');
var pointRequestController = require('./controllers/pointRequestController.js');
var serviceHourRequestController = require('./controllers/serviceHourRequestController.js');

var app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4200' }));

app.listen(3000, () => console.log('Server started on port 3000'));


app.use('/api/members', memberController);
app.use('/api/points', pointRequestController);
app.use('/api/hours', serviceHourRequestController);


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
