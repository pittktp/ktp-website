const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const upload = require('../s3/S3Service.js');
var router = express.Router();
var AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, region: 'us-east-1'});

//TODO Make a protected endpoint
router.get('/', /*require('../auth/auth.js'),*/ (req, res) => {

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "RushMembers"
  };
  docClient.scan(params, function(err, data) {
    if (err) {
      console.log("Error getting all members in DB");
      res.status(400).send("Error getting all members in DB");
    }
    else {
      res.status(200).send(data.Items);
    }
  });

});

router.post('/', (req, res) => {

  // First search in the DB if a member already has this email before creating the member
  var searchDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  var params = {
    TableName : "RushMembers",
    FilterExpression: "email = :email",
    ExpressionAttributeValues:{
        ":email": req.body.email
    }
  };

  searchDocClient.scan(params, function(err, data) {  // Scans the DB for a member with this email

      bcrypt.hash(req.body.email, null, null, function(err, hash) {

  //TODO      // let id = crypto.createHash('md5').update(req.body.email).digest("hex").toString();  // Creates an MD5 hash of the member's email to be used as the primary key in the DB

        // Create the new member in the DB
        var docClient = new AWS.DynamoDB.DocumentClient( {
            convertEmptyValues: true,
            apiVersion: '2012-08-10'
        });
        var params = {
          TableName: 'RushMembers',
          Item: {
            'name'  : req.body.name,
            'email' : req.body.email,
            'year'  : req.body.year,
            'major' : req.body.major,
            'ref'   : req.body.ref,
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
  });
});
