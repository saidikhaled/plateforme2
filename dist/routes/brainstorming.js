"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var _require = require('../../config/auth'),
    ensureAuthenticated = _require.ensureAuthenticated;

router.get('/', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  db.query('SELECT * FROM storm', function (error, results, fields) {
    if (error) throw error;
    res.render('brainstorming', {
      results: results
    });
  });
});
router.get('/addStorm', ensureAuthenticated, function (req, res) {
  res.render('addS');
});
router.get('/storm', ensureAuthenticated, function (req, res) {
  res.render('addS');
});
router.post('/addStorm', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  var name = req.body.name;
  var description = req.body.description;
  var type = req.body.type;
  var userId = req.session.passport.user.user_id;
  req.checkBody('name', 'please fill the name field').notEmpty();
  req.checkBody('type', 'please fill the type field').notEmpty();
  req.checkBody('description', 'please fill the description field').notEmpty();
  var errors = req.validationErrors();

  if (errors) {
    console.log('validation errors', errors);
    return res.status(422).render('addS', {
      errors: errors
    });
  } else {
    db.query('INSERT INTO storm (nom,description,type,user_id) VALUES (?,?,?,?)', [name, description, type, userId], function (error, results, fields) {
      if (error) throw error;
      res.redirect('/brainstorming');
    });
  }
}); // get one storm

router.get('/getOne/:id', ensureAuthenticated, function (req, res, next) {
  var db = require('../../db');

  console.log('i get to here');
  db.query('SELECT *  FROM storm where id= ?', [req.params.id], function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    res.render('storm', {
      results: results
    });
  });
});
var _default = router;
exports["default"] = _default;