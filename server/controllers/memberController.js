const express = require('express');
const bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var { Member } = require('../models/member');

//router.use('/api', require('./auth/auth.js'));

// GET all Members --> localhost:3000/members
router.get('/', require('../auth/auth.js'), (req, res) => {
  Member.find((err, docs) => {
    if(!err) {
      res.send(docs);
    }
    else
      console.log('Error in Retriving Members for auth: ' + JSON.stringify(err, undefined, 2));
  });

});

// Unprotected route to get stripped down Member with only properties name, description, email, picture, and major
router.get('/basic', (req, res) => {
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
router.post('/', (req, res) => {

  Member.findOne({'email': req.body.email}, (err, doc) => {  // Check if email is being used by another
    if(doc)  // Someone else is using this email - return 409 conflict error
      res.status(409).send('Conflict');
    else {  // If not, save new Member
      bcrypt.hash(req.body.password, null, null, function(err, hash) {
        var userRole = "";
        if(req.body.code == "ky1fgkqq61") { userRole = "admin"; }
        else if(req.body.code == "yy3dlxwiz6") { userRole = "member"; }
        else { return res.status(401).send('Incorrect code'); }

        var member = new Member({
          name: req.body.name,
          email: req.body.email.toLowerCase(),
          password: hash,
          points: req.body.points,
          serviceHours: req.body.serviceHours,
          role: userRole,
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

// User changing their own password - searches for Member by email and hashes and sets their new password if the correct reset password code is provided
router.put('/password', (req, res) => {
  if(req.body.code == "8tr2g5m9fe") {
    Member.findOne({'email': req.body.email}, (err, doc) => {
      if(!doc) {  // No user with this email exists
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
  else {  // Incorrect reset password code
    return res.status(401).send();
  }
});

// PUT update Member --> localhost:3000/members/*id-number*
router.put('/:id', require('../auth/auth.js'), (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(404).send('No record with given id: ' + req.params.id);

  var member = {
    name: req.body.name,
    email: req.body.email,
    studentId: req.body.studentId,
    points: req.body.points,
    serviceHours: req.body.serviceHours,
    role: req.body.role,
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

  Member.findByIdAndUpdate(req.params.id, { $set: member }, { new: true }, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member UPDATE: ' + JSON.stringify(err, undefined, 2));
  });
});

// DELETE Member --> localhost:3000/member/*id-number*
router.delete('/:id', require('../auth/auth.js'), (req, res) => {

  if(!ObjectId.isValid(req.params.id))
    return res.status(400).send('No record with given id: ' + req.params.id);

  Member.findByIdAndRemove(req.params.id, (err, doc) => {
    if(!err)
      res.send(doc);
    else
      console.log('Error in Member DELETE: ' + JSON.stringify(err, undefined, 2));
  });
});

// POST upload Member profile image --> localhost:3000/api/member/*id*/image
// Must be a POST request since files must be sent via POST
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
