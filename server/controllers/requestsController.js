const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Request } = require('../models/request');

// GET all PointRequests --> localhost:3000/points
// PROTECTED endpoint
router.get('/', require('../auth/auth.js'), (req, res) => {

  // Gets all requests from DB and sends them back as a list called docs
  Request.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Requests: ' + JSON.stringify(err, undefined, 2));
  });
});

// GET PointRequest by ID --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.get('/:id', require('../auth/auth.js'), (req, res) => {

  // Not a valid ID
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  // Finds a request by ID
  Request.findById(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Retriving Request: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST create new PointRequest --> localhost:3000/points/
// PROTECTED endpoint
router.post('/', require('../auth/auth.js'), (req, res) => {

  // Creates new request obj
  var request = new Request({
    type: req.body.type,
    value: req.body.value,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    submittedDate: req.body.submittedDate,
    approved: req.body.approved
  });

  // Saves the request obj to DB
  request.save((err, doc) =>{
    if(!err)
      res.send(doc);
    else {
      console.log('Error in Request POST: ' + JSON.stringify(err, undefined, 2));
    }
  });
});

// PUT update PointRequest --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.put('/:id', require('../auth/auth.js'), (req, res) => {

  // Checks if object is in DB -> if not, can't update it so send back 404 NOT FOUND error
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  // Create new request obj
  var request = {
    value: req.body.value,
    description: req.body.description,
    submittedBy: req.body.submittedBy,
    submittedById: req.body.submittedById,
    submittedDate: req.body.submittedDate,
    approved: req.body.approved
  };

  // Finds the request in the DB by ID and replaces it with the new request obj we just made
  Request.findByIdAndUpdate(req.params.id, { $set: request }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Request UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE PointRequest --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  // Looks for this request in the DB -> if not found, send back a 404 NOT FOUND error
  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  // Finds the request in DB by ID and deletes it
  Request.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Request DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

module.exports = router;
