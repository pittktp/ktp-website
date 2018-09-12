const express = require('express');
const bcrypt = require('bcrypt');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Member } = require('../models/member');

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
      res.send(doc);
    else
      console.log('Error in Retriving Member: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST create new Member --> localhost:3000/members/
router.post('/', (req, res) => {

  bcrypt.hash(req.body.password, 10, function(err, hash) {
    var member = new Member({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      studentId: req.body.studentId,
      points: req.body.points,
      serviceHours: req.body.serviceHours,
      role: req.body.role,
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
router.delete('/:id', (req, res) => {

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
