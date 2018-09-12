const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { ServiceHourRequest } = require('../models/service-hour-request');

// GET all service hour requests --> localhost:3000/hours
router.get('/', (req, res) => {

  ServiceHourRequest.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving ServiceHourRequest: ' + JSON.stringify(err, undefined, 2));
  });
});

// GET ServiceHourRequest by ID --> localhost:3000/hours/*id-number*
router.get('/:id', (req, res) => {

  // Not a valid ID
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  ServiceHourRequest.findById(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Retriving ServiceHourRequest: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST create new ServiceHourRequest --> localhost:3000/hours/
router.post('/', (req, res) => {

  var request = new ServiceHourRequest({
    serviceHours: req.body.serviceHours,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    approved: req.body.approved
  });

  request.save((err, doc) => {
    if(!err)
      res.send(doc);
    else {
      console.log('Error in ServiceHourRequest POST: ' + JSON.stringify(err, undefined, 2));
    }
  });
});

// PUT update ServiceHourRequest --> localhost:3000/hours/*id-number*
router.put('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var request = {
    serviceHours: req.body.serviceHours,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    approved: req.body.approved
  };

  ServiceHourRequest.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in ServiceHourRequest UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE ServiceHourRequest --> localhost:3000/hours/*id-number*
router.delete('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  ServiceHourRequest.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in ServiceHourRequest DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

module.exports = router;
