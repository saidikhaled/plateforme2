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

  db.query('SELECT * FROM idées', function (error, ideas, fields) {
    if (error) throw error;
    res.render('ideas');
  });
});
router.get('/getCategory/:id', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  var category_number = req.params.id;
  var category = '';

  switch (category_number) {
    case '1':
      category = 'school';
      break;

    case '2':
      category = 'extra-school';
      break;

    case '3':
      category = 'events';
      break;

    case '4':
      category = 'games';
      break;

    case '5':
      category = 'methods';
      break;

    case '6':
      category = 'other';
      break;

    default:
      category = 'other';
  }

  db.query('SELECT * FROM idées where categorie= ?', [category], function (error, ideas, fields) {
    if (error) throw error;
    res.render('categoryIdeas', {
      ideas: ideas
    });
  });
});
router.get('/category', ensureAuthenticated, function (req, res) {
  res.render('categoryIdeas');
});
router.get('/addIdea', ensureAuthenticated, function (req, res) {
  res.render('addIdea');
});
router.post('/addIdea', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  var title = req.body.title;
  var category = req.body.selectpicker;
  var content = req.body.content.toLowerCase();
  req.checkBody('title', 'Title can not be empty').notEmpty();
  req.checkBody('category', 'Category can not be empty').notEmpty();
  req.checkBody('content', 'Content can not be empty').notEmpty(); // title = title.toLowerCase().charAt(0).toUpperCase();
  // category = category.toLowerCase().charAt(0).toUpperCase();
  // content = content.toLowerCase().charAt(0).toUpperCase();

  var errors = req.validationErrors();

  if (errors) {
    console.log(errors); //	return res.status(422).json({ errors: errors });

    return res.status(422).render('addIdea', {
      errors: errors,
      title: title,
      category: category,
      content: content
    });
  } else {
    db.query('INSERT INTO idées (titre,categorie,contenu) VALUES (?,?,?)', [title, category, content], function (error, resuslts, fields) {
      if (error) throw error;
      res.render('Ideas');
    });
  }
});
var _default = router;
exports["default"] = _default;