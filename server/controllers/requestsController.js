const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Request } = require('../models/request');

// GET all PointRequests --> localhost:3000/points
router.get('/', require('../auth/auth.js'), (req, res) => {

  Request.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Requests: ' + JSON.stringify(err, undefined, 2));
  });
});

// GET PointRequest by ID --> localhost:3000/points/*id-number*
router.get('/:id', require('../auth/auth.js'), (req, res) => {

  // Not a valid ID
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  Request.findById(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Retriving Request: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST create new PointRequest --> localhost:3000/points/
router.post('/', require('../auth/auth.js'), (req, res) => {

  var request = new Request({
    type: req.body.type,
    value: req.body.value,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    submittedDate: req.body.submittedDate,
    approved: req.body.approved
  });

  request.save((err, doc) =>{
    if(!err)
      res.send(doc);
    else {
      console.log('Error in Request POST: ' + JSON.stringify(err, undefined, 2));
    }
  });
});

// PUT update PointRequest --> localhost:3000/points/*id-number*
router.put('/:id', require('../auth/auth.js'), (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var request = {
    value: req.body.value,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    submittedDate: req.body.submittedDate,
    approved: req.body.approved
  };

  Request.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Request UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE PointRequest --> localhost:3000/points/*id-number*
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  Request.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Request DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

module.exports = router;
