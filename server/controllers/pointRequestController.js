const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { PointRequest } = require('../models/point-request');

// GET all PointRequests --> localhost:3000/points
router.get('/', (req, res) => {

  PointRequest.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving PointRequests: ' + JSON.stringify(err, undefined, 2));
  });
});

// GET PointRequest by ID --> localhost:3000/points/*id-number*
router.get('/:id', (req, res) => {

  // Not a valid ID
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  PointRequest.findById(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Retriving PointRequest: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST create new PointRequest --> localhost:3000/points/
router.post('/', (req, res) => {

  var request = new PointRequest({
    points: req.body.points,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    approved: req.body.approved
  });

  request.save((err, doc) =>{
    if(!err)
      res.send(doc);
    else {
      console.log('Error in PointRequest POST: ' + JSON.stringify(err, undefined, 2));
    }
  });
});

// PUT update PointRequest --> localhost:3000/points/*id-number*
router.put('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var request = {
    points: req.body.points,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    approved: req.body.approved
  };

  PointRequest.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in PointRequest UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE PointRequest --> localhost:3000/points/*id-number*
router.delete('/:id', (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  PointRequest.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in PointRequest DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

module.exports = router;
