const express = require('express');
const bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Member } = require('../models/member');

// GET all Members --> localhost:3000/members
// PROTECTED endpoint
router.get('/', require('../auth/auth.js'), (req, res) => {

  // Gets all members in DB and sends them as a list called docs
  Member.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Members for auth: ' + JSON.stringify(err, undefined, 2));
  });

});

// GET all Members --> localhost:3000/members/basic
// Unprotected route to get stripped down Member with only properties name, description, email, picture, and major
router.get('/basic', (req, res) => {

  // Gets all members in DB but only includes the properties "description", "email", "picture", and "major"
  // Also, exludes the _id property -> since this is unprotected, someone not logged in will be able to see these properties,
  // and if they get the _id, they can access the unprotected getById and then get the list of members with all the properties.
  Member.find({}, '-_id name description email picture major', (err, docs) => {
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
      if(!err) {
        return res.send(doc);
      }
      else {
        console.log('Error in Retriving Member: ' + JSON.stringify(err, undefined, 2));
      }
    });

});

// POST create new Member --> localhost:3000/members/
// Unprotected route because a user registering him/herself won't be logged in and thus wont have a JWT token.
router.post('/', (req, res) => {

  Member.findOne({'email': req.body.email}, (err, doc) => {  // Check if email is being used by another
    if(doc)  // Someone else is using this email - return 409 conflict error
      res.status(409).send('Conflict');
    else {  // If not, save new Member
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        var role = "";
        var admin = false;


        //TODO fix the role not filling in upon registration

        //Check the registration code for admin / brother permissions and role
        if(req.body.code == "ky1fgkqq61") { admin = true; role = "E Board"; }
        else if(req.body.code == "yy3dlxwiz6") { admin = false; role = "Brother"; }
        else { return res.status(401).send('Invalid code'); }

        // Create new member object
        var member = new Member({
          name: req.body.name,
          email: req.body.email.toLowerCase(),
          password: hash,
          points: req.body.points,
          serviceHours: req.body.serviceHours,
          role: role,
          admin: admin,
          absences: req.body.absences,
          rushClass: req.body.ruchClass,
          picture: req.body.picture,
          courses: req.body.courses,
          linkedIn: req.body.linkedIn,
          github: req.body.github,
          gradSemester: req.body.gradSemester,
          major: req.body.major,
          description: req.body.description,
          color: req.body.color
        });

        //Actually saves to the DB
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

// localhost:3000/members/password
// User changing their own password - searches for Member by email and hashes and sets their new password if the correct reset password code is provided
// Has to be unprotected endpoint because user won't be logged in if they can't remember their password, thus they won't have a JWT token to provide
router.put('/password', (req, res) => {
  if(req.body.code == "8tr2g5m9fe") {  // Check if it's a valid password reset code
    Member.findOne({'email': req.body.email}, (err, doc) => {
      if(!doc) {  // No user with this email exists -> send back a 404 NOT FOUND error
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
  else {  // Incorrect reset password code -> send back a 401 NOT FOUND code
    return res.status(401).send();
  }
});

// PUT update Member --> localhost:3000/members/*id-number*
// PROTECTED endpoint
router.put('/:id', require('../auth/auth.js'), (req, res) => {
  var admin = false;

  // Check if member is already in the DB -> if not, send back 404 NOT FOUND error
  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

    if(req.body.role == "Brother" || req.body.role == "Alumni" || req.body.role == "Inactive") {
        admin = false;
    } else {
        admin = true;
    }


  // Create a new member object to represent the updated member
  var member = {
    name: req.body.name,
    email: req.body.email,
    points: req.body.points,
    serviceHours: req.body.serviceHours,
    role: req.body.role,
    admin: admin,
    absences: req.body.absences,
    rushClass: req.body.rushClass,
    picture: req.body.picture,
    courses: req.body.courses,
    linkedIn: req.body.linkedIn,
    github: req.body.github,
    gradSemester: req.body.gradSemester,
    major: req.body.major,
    description: req.body.description,
    color: req.body.color
  };

  // Finds the member in the DB and updates him/her with the newly created member obj
  Member.findByIdAndUpdate(req.params.id, { $set: member }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE Member --> localhost:3000/member/*id-number*
// PROTECTED endpoint
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  // Looks for this member in the DB -> if not found send back 404 NOT FOUND error
  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  // Finds the member in the DB and deletes him/her
  Member.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST upload Member profile image --> localhost:3000/api/member/*id*/image
// Must be a POST request since files must be sent via POST
// PROTECTED endpoint
router.post('/:id/image', require('../auth/auth.js'), (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  var form = formidable.IncomingForm();
  form.parse(req, function(err, fields, file) {
    if(err) { console.error('Form failed to parse with following error: ', err); }
    res.end(util.inspect({fields: fields, file: file}))
  });

  form.on('end', function(fields, file) {
    var id = ""
    var tempPath = this.openedFiles[0].path;
    var fileExt = this.openedFiles[0].name.split('.')[1];
    Member.findById(req.params.id, function(err, member) {
      if(err) { console.error('File failed to copy with following error: ', err); }
      id = member.email.split('@')[0];
      var oldPic = member.picture;
      var newPath = `../server/public/img/${id}.${fileExt}`;
      var fileName = id + '.' + fileExt;

      fs.copyFile(tempPath, newPath, function(err) {
        if(err) { console.error('File failed to copy with following error: ', err); }
        else {
          Member.findByIdAndUpdate(req.params.id, {picture: fileName}, function(err, raw) {
            if(err) { console.error('Failed to update mmeber picture with following error: ', err); }
            console.log(raw);
          });
        }
      });

      // Remove old picture if user had one
      if(oldPic != null || oldPic != "") {
        fs.unlink(`../server/public/img/${oldPic}`, (err) => {
          if(err) { console.error('Failed to remove old image with error: ', err); }
        });
      }
    });
  });
});

// Gets a member's image given the member's ID
// PROTECTED endpoint
router.get('/:id/image', require('../auth/auth.js'), (req, res) => {
  if(!ObjectId.isValid(req.params.id)) {
    return res.status(404).send('No record with given id: ' + req.params.id);
  }

  Member.findById(req.params.id, function(err, member) {
    if(err) { console.error('Failed to find member with following error: ', err); }
    res.render('ProfileImg.pug', {
      imgSrc: '../../../img/' + member.picture
    });
  });
});

module.exports = router;
