const express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.AWS_ACCESS_KEY_SECRET;
AWS.config.region = "us-east-1";


var { Request } = require('../models/request');

// GET all PointRequests --> localhost:3000/points
// PROTECTED endpoint
router.get('/', /*require('../auth/auth.js'),*/ (req, res) => {

  // Gets all requests from DB and sends them back as a list called docs
  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "KtpRequests"
  };
  docClient.scan(params, function(err, data) {
    if (err) {
      console.log("Error getting all requests in DB");
      res.status(400).send("Error getting all requests in DB");
    }
    else {
      res.status(200).send(data.Items);
    }
  });

});

// GET PointRequest by ID --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.get('/:id', /*require('../auth/auth.js'),*/ (req, res) => {

  var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

  var params = {
   TableName: 'KtpRequests',
   Key: {'_id': req.params.id}
  };

  docClient.get(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      res.status(404).send("Item with this id not found");
    }
    else {
      res.status(200).send(data.Item);
    }
  });

});

// POST create new PointRequest --> localhost:3000/points/
// PROTECTED endpoint
router.post('/', /*require('../auth/auth.js'),*/ (req, res) => {

  var docClient = new AWS.DynamoDB.DocumentClient( {
      convertEmptyValues: true,
      apiVersion: '2012-08-10'
  });

  let id = crypto.createHash('md5').update(req.body.submittedDate).digest("hex").toString();  // Creates an MD5 hash of the request's timestamp since it'll be unique to be used as the primary key in the DB
  console.log(req.body)
  var params = {
    TableName: 'KtpRequests',
    Item: {
      '_id': id,
      'type': req.body.type,
      'value': req.body.value,
      'description': req.body.description,
      'submittedBy': req.body.submittedBy,
      'submittedById': req.body.submittedById,
      'submittedDate': req.body.submittedDate,
      'approved': req.body.approved,
    }
  };

  // Call DynamoDB to create the item in the table
  docClient.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      res.status(400).send('Error creating item in the DB')
    } else {
      res.status(200).send({'message': 'Successfully create item in the DB' });
    }
  });

});

// PUT update PointRequest --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.put('/:id', /*require('../auth/auth.js'),*/ (req, res) => {

  var docClient = new AWS.DynamoDB.DocumentClient( {
      convertEmptyValues: true,  // Without this, Dynamo doesn't let you have empty strings for properties
      apiVersion: '2012-08-10'
  });
  var params = {
    TableName: 'KtpRequests',
    Key: {
        "_id": req.params.id
    },
    UpdateExpression: "set #type=:t, #value=:v, description=:description, submittedBy=:submittedBy, submittedById=:submittedById, submittedDate=:submittedDate, approved=:approved",
    ExpressionAttributeValues: {
        ":t": req.body.type,
        ":v": req.body.value,
        ":description": req.body.description,
        ":submittedBy": req.body.submittedBy,
        ":submittedById": req.body.submittedById,
        ":submittedDate": req.body.submittedDate,
        ":approved": req.body.approved
    },
    ExpressionAttributeNames: {  // A workaround because you can't use 'name' or 'role' because they're Dynamo reserved attributes
      "#type": "type",
      "#value": "value"
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.update(params, function(err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      res.status(400).send('Unable to update item');
    }
    else {
      res.status(200).send({ 'message': 'Successfully updated item in the DB' });
    }
  });

});

// DELETE PointRequest --> localhost:3000/points/*id-number*
// PROTECTED endpoint
router.delete('/:id', /*require('../auth/auth.js'),*/ (req, res) => {

  var documentClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName : 'KtpRequests',
    Key: {
      '_id': req.params.id
    }
  };

  documentClient.delete(params, function(err, data) {
    if (err) res.status(400).send('Error deleting item in the DB');
    else res.status(200).send({ 'message': 'Successfully deleted item in the DB' });
  });

});

module.exports = router;
