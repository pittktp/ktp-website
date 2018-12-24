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
var requestsController = require('./controllers/requestsController.js');

var app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:4200' }));
//app.use(cors({ origin: 'http://52.6.239.231:4200' }));

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');
app.set('views', __dirname+'/views');

app.use(express.static(__dirname + '/public', {maxAge: 0}));
app.use('/img', express.static(__dirname + '/public/img', {maxAge: 0}));

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
