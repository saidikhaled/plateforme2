"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _domain = require("domain");

var _crypto = require("crypto");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var _require = require('../../config/auth'),
    ensureAuthenticated = _require.ensureAuthenticated;
/* get forum main page */


router.get('/', ensureAuthenticated, function (req, res, next) {
  var db = require('../../db');

  db.query('SELECT * FROM forum', function (error, results, fields) {
    if (error) throw error;
    var tagsObj = {};
    results.forEach(function (result, i) {
      tagsObj[i] = result.tags.split(' ');
    });
    var tags = Object.values(tagsObj);
    res.render('FAQ', {
      results: results,
      tags: tags
    }); //res.json({ results, tags });
    //res.send(JSON.stringify({ results, tags }));
  });
}); // get one question

router.get('/getOne/:id', ensureAuthenticated, function (req, res, next) {
  var db = require('../../db'); // fetch the question


  db.query('SELECT * FROM forum where id = ?', [req.params.id], function (error, forumResults, fields) {
    if (error) throw error;
    var tags = forumResults[0].tags.split(' ');
    var comments = [];
    var question = forumResults[0]; //	const user_id = results[0].user_id;

    var commentUser = []; // fetch comments

    db.query('SELECT * FROM commentaires where forum_id = ?', [req.params.id], function (error1, commentResults, fields1) {
      if (error1) throw error; // if there is any comments

      if (commentResults.length !== 0) {
        var time = [];
        var commentUserIds = [];
        commentResults.forEach(function (result, i) {
          comments.push(result.comment);
        }); // fetch the user

        db.query('select username,id from users where id IN (select user_id from commentaires where forum_id = ?) ', [req.params.id], function (error, commentsUsernameResults, fields) {
          if (error) throw error; // console.log('first username', commentsUsernameResults[0].username);
          // console.log('commentsUsernameResults', commentsUsernameResults);
          // console.log('commentResults', commentResults);

          commentResults.forEach(function (comment, i) {
            commentsUsernameResults.forEach(function (user, i) {
              if (comment.user_id === user.id) {
                commentUser.push(commentsUsernameResults[i].username);
              }
            });
          });
          console.log(commentUser);
          res.render('question', {
            tags: tags,
            question: question,
            commentUser: commentUser,
            comments: comments
          });
        });
      } else {
        // if there is no comment
        // fetch the user
        db.query('SELECT username FROM users where id = ?', [req.session.passport.user.user_id], function (error2, results2, fields) {
          if (error2) throw error; //	console.log('user_id : ', req.session.passport.user.user_id);
          //	console.log('username : ', results2[0].username);

          var username = results2[0].username;
          res.render('question', {
            question: question,
            tags: tags,
            comments: comments,
            commentResults: commentResults
          });
        });
      }
    });
  });
}); // add a question to database

router.post('/addCom/:id', function (req, res, next) {
  var db = require('../../db');

  var comment = req.body.comment;
  var userId = req.session.passport.user.user_id;
  var forumId = req.params.id;
  req.checkBody('comment', "you can't submit an empty comment ").notEmpty();
  var errors = req.validationErrors();

  if (errors) {
    console.log('validation errors', errors);
    return res.status(422).render('addQ', {
      errors: errors
    });
  } else {
    db.query('INSERT INTO commentaires (user_id,comment,forum_id) VALUES (?,?,?)', [userId, comment, forumId], function (error, results, fields) {
      if (error) throw error; //res.redirect('/forum');

      db.query('SELECT comment FROM commentaires ORDER BY id DESC LIMIT 1', function (error, results, fields) {
        var lastComment = results[0].comment; //res.render('comment', { lastComment });

        return res.send({
          lastComment: lastComment
        }); //res.end();
      });
    });
  }
}); // get add form page

router.get('/addQ', ensureAuthenticated, function (req, res, next) {
  res.render('addQ');
}); // add a question to database

router.post('/addQ', function (req, res, next) {
  var db = require('../../db');

  var categorie = req.body.categorie;
  var titre = req.body.titre;
  var description = req.body.description;
  var tags = req.body.tags;
  var user_id = req.session.passport.user.user_id;
  var tag = tags.split(' ');
  console.log(tag);
  req.checkBody('categorie', 'categorie ne peut pas étre vide').notEmpty();
  req.checkBody('titre', 'titre ne peut pas étre vide').notEmpty();
  req.checkBody('description', 'description ne peut pas étre vide').notEmpty();
  var errors = req.validationErrors();

  if (errors) {
    console.log(errors); //	return res.status(422).json({ errors: errors });

    return res.status(422).render('addQ', {
      errors: errors,
      categorie: categorie,
      titre: titre,
      description: description,
      tags: tags
    });
  } else {
    db.query('INSERT INTO forum (categorie,titre,description,tags,user_id) VALUES (?,?,?,?,?)', [categorie, titre, description, tags, user_id], function (error, results, fields) {
      if (error) throw error;
      res.redirect('/forum');
    });
  }
});
var _default = router;
exports["default"] = _default;