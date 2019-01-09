const express = require('express');
const bcrypt = require('bcryptjs');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Member } = require('../models/member');

//router.use('/api', require('./auth/auth.js'));

// GET all Members --> localhost:3000/members
router.get('/', (req, res) => {

  Member.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Members for auth: ' + JSON.stringify(err, undefined, 2));
  });

});

// GET Member by ID --> localhost:3000/members/*id-number*
router.get('/:id', (req, res) => {

    // Not a valid ID
    if(!ObjectId.isValid(req.params.id))
      return res.status(404).send('No record with given id: ' + req.params.id);

    Member.findById(req.params.id, (err, doc) => {
      if(!err)
        return res.send(doc);
      else
        console.log('Error in Retriving Member: ' + JSON.stringify(err, undefined, 2));
    });

});

// POST create new Member --> localhost:3000/members/
router.post('/', (req, res) => {

  Member.findOne({'email': req.body.email}, (err, doc) => {  // Check if email is being used by another
    if(doc)  // Someone else is using this email - return 409 conflict error
      res.status(409).send('Conflict');
    else {  // If not, save new Member
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        var userRole = "";
        if(req.body.code == "ky1fgkqq61") { userRole = "admin"; }
        else if(req.body.code == "yy3dlxwiz6") { userRole = "member"; }
        else { return res.status(401).send('Incorrect code'); }

        var member = new Member({
          name: req.body.name,
          email: req.body.email,
          password: hash,
          points: req.body.points,
          serviceHours: req.body.serviceHours,
          role: userRole,
          absences: req.body.absences
        });

        member.save((err, doc) =>{
          if(!err)
            res.send(doc);
          else {
            console.log('Error in Member POST: ' + JSON.stringify(err, undefined, 2));
          }
        });

      });
    }
  });

});

// User changing their own password - searches for Member by email and hashes and sets their new password if the correct reset password code is provided
router.put('/password', (req, res) => {
  if(req.body.code == "8tr2g5m9fe") {
    Member.findOne({'email': req.body.email}, (err, doc) => {
      if(!doc) {  // No user with this email exists
        return res.status(404).send();
      }
      else {
        bcrypt.hash(req.body.password, 10, function(err, hash) {

          var member = doc;
          member.password = hash;

          Member.findByIdAndUpdate(member._id, { $set: member }, { new: true }, (err, doc) => {
            if(!err)
              res.send(doc);
            else
              console.log('Error in Member UPDATE: ' + JSON.stringify(err, undefined, 2));
          });
        });
      }
    });
  }
  else {  // Incorrect reset password code
    return res.status(401).send();
  }
});

// PUT update Member --> localhost:3000/members/*id-number*
router.put('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var member = {
    name: req.body.name,
    email: req.body.email,
    studentId: req.body.studentId,
    points: req.body.points,
    serviceHours: req.body.serviceHours,
    role: req.body.role,
    absences: req.body.absences
  };

  Member.findByIdAndUpdate(req.params.id, { $set: member }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE Member --> localhost:3000/member/*id-number*
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  Member.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

module.exports = router;
