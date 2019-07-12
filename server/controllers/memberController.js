const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const upload = require('../s3/S3Service.js');
var router = express.Router();
var AWS = require('aws-sdk');
const crypto = require('crypto');

AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, region: 'us-east-1'});

const singleUpload = upload.single('image');
//const deleteFolder = upload;

// GET all Members --> localhost:3000/members
// PROTECTED endpoint
router.get('/', /*require('../auth/auth.js'),*/ (req, res) => {

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "KtpMembers"
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

// GET all Members --> localhost:3000/members/basic
// Unprotected route to get stripped down Member with only properties name, description, email, role, and major
router.get('/basic', (req, res) => {

  // Gets all members in DB but only includes the properties "description", "email", "role", and "major"
  // Also, exludes the _id property -> since this is unprotected, someone not logged in will be able to see these properties,
  // and if they get the _id, they can access the unprotected getById member endpoint and then get that member with all the properties.

  const docClient = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: "KtpMembers"
  };
  docClient.scan(params, function(err, data) {
    if (err) {
      console.log("Error getting all members in DB");
      res.status(400).send("Error getting all members in DB");
    }
    else {
      var basicMembers = [];
      for(var i = 0; i < data.Items.length; i++) {
        var item = data.Items[i];
        basicMembers.push({ "name": item.name, "description": item.description, "email": item.email, "role": item.role, "major": item.major });
      }
      res.status(200).send(basicMembers);
    }
  });

});

// GET Member by ID --> localhost:3000/members/*id-number*
router.get('/:id', (req, res) => {
  var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

  var params = {
   TableName: 'KtpMembers',
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

// POST create new Member --> localhost:3000/members/
// Unprotected route because a user registering him/herself won't be logged in and thus wont have a JWT token yet.
router.post('/', (req, res) => {

  // First search in the DB if a member already has this email before creating the member
  var searchDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
  var params = {
    TableName : "KtpMembers",
    FilterExpression: "email = :email",
    ExpressionAttributeValues:{
        ":email": req.body.email.toLowerCase()
    }
  };

  searchDocClient.scan(params, function(err, data) {  // Scans the DB for a member with this email
    if (data.Items.length == 0) {  // Email not in use - create the member
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        var role = "";
        var admin = false;
        let id = crypto.createHash('md5').update(req.body.email).digest("hex").toString();  // Creates an MD5 hash of the member's email to be used as the primary key in the DB

        // Check the registration code for admin / brother permissions and role
        if(req.body.code == "ky1fgkqq61") { admin = true; role = "E Board"; }
        else if(req.body.code == process.env.SIGN_UP_CODE_MEMBER) { admin = false; role = "Brother"; }
        else { return res.status(401).send('Invalid code'); }

        // Create the new member in the DB
        var docClient = new AWS.DynamoDB.DocumentClient( {
            convertEmptyValues: true,
            apiVersion: '2012-08-10'
        });
        var params = {
          TableName: 'KtpMembers',
          Item: {
            '_id': id ,
            'name': req.body.name,
            'email': req.body.email.toLowerCase(),
            'password': hash,
            'points': req.body.points,
            'serviceHours': req.body.serviceHours,
            'role': role,
            'admin': admin,
            'absences':req.body.absences,
            'rushClass': req.body.rushClass,
            'picture': req.body.picture,
            'courses': req.body.courses,
            'linkedIn': req.body.linkedIn,
            'github': req.body.github,
            'gradSemester': req.body.gradSemester,
            'major': req.body.major,
            'description': req.body.description,
            'color': req.body.color,
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
    }
    else {  // Email in use! - send back a 409 Conflict error
      console.log("409 conflict - email already in use");
      res.status(409).send('Email already in use');
    }
  });

});

// localhost:3000/members/password
// User changing their own password - searches for Member by email and hashes and sets their new password if the correct reset password code is provided
// Has to be unprotected endpoint because user won't be logged in if they can't remember their password, thus they won't have a JWT token to provide
router.put('/password', (req, res) => {

  if(req.body.code == process.env.PASSWORD_RESET_CODE) {  // Check if it's a valid password reset code
    var searchDocClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    var params = {
      TableName : "KtpMembers",
      FilterExpression: "email = :email",
      ExpressionAttributeValues:{
          ":email": req.body.email
      }
    };
    searchDocClient.scan(params, function(err, data) {
      if(!data) return res.status(404).send(); // No user with this email exists -> send back a 404 NOT FOUND error

      else {   // Found a member with this email!
        bcrypt.hash(req.body.password, null, null, function(err, hash) {

          var member = data.Items[0];
          member.password = hash;

          var updateDocClient = new AWS.DynamoDB.DocumentClient( {
              convertEmptyValues: true,  // Without this, Dynamo doesn't let you have empty strings for properties
              apiVersion: '2012-08-10'
          });
          var params = {
            TableName: 'KtpMembers',
            Key: {
                "_id": member._id
            },
            UpdateExpression: "set password=:password",
            ExpressionAttributeValues: {
                ":password": hash
            },
            ReturnValues:"UPDATED_NEW"
          };

          updateDocClient.update(params, function(err, data) {
            if (err) {
              console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
              res.status(400).send('Unable to update item');
            }
            else {
              res.status(200).send({ 'message': 'Successfully updated item in the DB' });
            }
          });
        });
      }
    });
  }

});

// PUT update Member --> localhost:3000/members/*id-number*
// PROTECTED endpoint
router.put('/:id', require('../auth/auth.js'), (req, res) => {
  var admin = false;

  if(req.body.role == "Brother" || req.body.role == "Alumni" || req.body.role == "Inactive") { admin = false; }
  else { admin = true; }

  var docClient = new AWS.DynamoDB.DocumentClient( {
      convertEmptyValues: true,  // Without this, Dynamo doesn't let you have empty strings for properties
      apiVersion: '2012-08-10'
  });
  var params = {
    TableName: 'KtpMembers',
    Key: {
        "_id": req.params.id
    },
    UpdateExpression: "set #name=:n, email=:email, points=:points, serviceHours=:serviceHours, #role=:r, admin=:admin, absences=:absences, rushClass=:rushClass, picture=:picture, courses=:courses, linkedIn=:linkedIn, github=:github, gradSemester=:gradSemester, major=:major, description=:description, color=:color",
    ExpressionAttributeValues: {
        ":n": req.body.name,
        ":email": req.body.email,
        ":points": req.body.points,
        ":serviceHours": req.body.serviceHours,
        ":r": req.body.role,
        ":admin": admin,
        ":absences": req.body.absences,
        ":rushClass": req.body.rushClass,
        ":picture": req.body.picture,
        ":courses": req.body.courses,
        ":linkedIn": req.body.linkedIn,
        ":github": req.body.github,
        ":gradSemester": req.body.gradSemester,
        ":major": req.body.major,
        ":description": req.body.description,
        ":color": req.body.color
    },
    ExpressionAttributeNames: {  // A workaround because you can't use 'name' or 'role' because they're Dynamo reserved attributes
      "#role": "role",
      "#name": "name"
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

// DELETE Member --> localhost:3000/member/*id-number*
// PROTECTED endpoint
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  var documentClient = new AWS.DynamoDB.DocumentClient();
  var params = {
    TableName : 'KtpMembers',
    Key: {
      '_id': req.params.id
    }
  };

  documentClient.delete(params, function(err, data) {
    if (err) res.status(400).send('Error deleting item in the DB');
    else res.status(200).send({ 'message': 'Successfully deleted item in the DB' });
  });

});

// POST endpoint that receives a file in the body to be saved to S3 that represent's the member's new profile picture.
// Also the member's ID is sent in the body so that we can update him/her in the DB to reflect the new picture URL
router.post('/image', function(req, res) {
  //req.body.username = req.username;
  singleUpload(req, res, function(err, some) {  // Uses S3Service.js to do the actual uploading to S3
    if (err) {
      return res.status(422).send({errors: [{title: 'Image Upload Error', detail: err.message}] });
    }

    var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
    var params = {
     TableName: 'KtpMembers',
     Key: {
       '_id': req.body._id
     }
    };
    docClient.get(params, function(err, data) {  // Get Member from DB by Id
      if (err) {
        console.log("Error", err);
        res.status(404).send("Item with this id not found");
      }
      else {  // Found the Member - update their picture property
        var updateDocClient = new AWS.DynamoDB.DocumentClient( {
            convertEmptyValues: true,  // Without this, Dynamo doesn't let you have empty strings for properties
            apiVersion: '2012-08-10'
        });
        var params = {
          TableName: 'KtpMembers',
          Key: {
              "_id": data.Item._id
          },
          UpdateExpression: "set picture=:picture",
          ExpressionAttributeValues: {
              ":picture": "https://pittkappathetapi.com/s3/img/profile/" + req.body.username + "/" + req.body.newFileName  // The link to the picture in S3
          },
          ReturnValues:"UPDATED_NEW"
        };

        updateDocClient.update(params, function(err, data) {
          if (err) {
            console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(400).send('Unable to update item');
          }
          else {
            console.log("UpdateItem succeeded");
            res.status(200).send({ 'message': 'Successfully updated item in the DB' });
          }
        });
      }
    });

  });
})

module.exports = router;
