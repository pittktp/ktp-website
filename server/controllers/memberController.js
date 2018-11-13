const express = require('express');
const bcrypt = require('bcrypt');
const formidable = require('formidable');
const util = require('util');
const fs = require('fs');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Member } = require('../models/member');

// GET all Members --> localhost:3000/api/members
router.get('/', (req, res) => {

  Member.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Members for auth: ' + JSON.stringify(err, undefined, 2));
  });

});

// GET Member by ID --> localhost:3000/api/members/*id-number*
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

// POST create new Member --> localhost:3000/api/members/
router.post('/', (req, res) => {

  bcrypt.hash(req.body.password, 10, function(err, hash) {
    var member = new Member({
      name: req.body.name,
      email: req.body.email,
      password: hash,
      points: req.body.points,
      serviceHours: req.body.serviceHours,
      role: req.body.role,
      absences: req.body.absences,
      rushClass: req.body.ruchClass,
      picture: req.body.picture,
      courses: req.body.courses,
      linkedIn: req.body.linkedIn,
      github: req.body.github,
      gradSemester: req.body.gradSemester,
      major: req.body.major,
      description: req.body.description
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

// PUT update Member --> localhost:3000/api/members/*id-number*
router.put('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var member = {
    name: req.body.name,
    email: req.body.email,
    points: req.body.points,
    serviceHours: req.body.serviceHours,
    role: req.body.role,
    absences: req.body.absences,
    rushClass: req.body.ruchClass,
    picture: req.body.picture,
    courses: req.body.courses,
    linkedIn: req.body.linkedIn,
    github: req.body.github,
    gradSemester: req.body.gradSemester,
    major: req.body.major,
    description: req.body.description
  };

  Member.findByIdAndUpdate(req.params.id, { $set: member }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE Member --> localhost:3000/api/member/*id-number*
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

// POST upload Member profile image --> localhost:3000/api/members/*id*/set-image
// Must be a POST request since files must be sent via POST
router.post('/:id/image', (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  var form = formidable.IncomingForm();
  form.parse(req, function(err, fields, file) {
    if(err) { console.error('Form failed to parse with following error: ', err); }
    res.end(util.inspect({fields: fields, file: file}))
  });

  form.on('end', function(fields, file) {
    var tempPath = this.openedFiles[0].path;
    var fileName = this.openedFiles[0].name;
    var newPath = '../public/img/';

    fs.copy(tempPath, newPath + fileName, function(err) {
      if(err) { console.error('File failed to copy with following error: ', err); }
      else {
        Member.findByIdAndUpdate(req.params.id, {picture: fileName}, function(err, raw) {
          if(err) { console.error('Failed to update mmeber picture with following error: ', err); }
          console.log(raw);
        });
      }
    });
  });
});

// PUT update Member description --> localhost:3000/api/members/*id*/desc
router.put('/:id/desc', (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  Member.findByIdAndUpdate(req.params.id, {description: req.body.desc}, function(err, raw) {
    if(err) { console.error('Failed to update desc with following error: ', err); }
    console.log(raw);
  });
});

// PUT update Member major --> localhost:3000/api/members/*id*/major
router.put('/:id/major', (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  Member.findByIdAndUpdate(req.params.id, {major: req.body.major}, function(err, raw) {
    if(err) { console.error('Failed to update major with following error: ', err); }
    console.log(raw);
  });
});

// PUT update member gradSemester --> localhost:3000/api/members/*id*/gradSemester
router.put('/:id/gradSemester', (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  Member.findByIdAndUpdate(req.params.id, {gradSemester: req.body.gradSemester}, function(err, raw) {
    if(err) { console.error('Failed to update gradSemester with following error: ', errr); }
    console.log(raw);
  });
});

module.exports = router;
