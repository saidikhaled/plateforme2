"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _passport = _interopRequireDefault(require("passport"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var saltRounds = 10; // get login page

router.get('/login', function (req, res, next) {
  res.render('login');
}); // handle login

router.post('/login', _passport["default"].authenticate('local', {
  failureRedirect: 'login',
  failureFlash: true
}), function (req, res) {
  res.redirect('/home');
}); // handle logout

router.get('/logout', function (req, res, next) {
  req.logout();
  req.session.destroy(function () {
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
}); // get profile page

router.get('/profile', ensureAuthenticated(), function (req, res, next) {
  res.render('profile', {
    expressFlash: req.flash('welcomeMsg')
  });
}); // get signup page

router.get('/signup', function (req, res, next) {
  res.render('signup');
}); // handle signup

router.post('/signup', function (req, res, next) {
  var db = require('../../db');

  var fn = req.body.firstName;
  var ln = req.body.lastName;
  var un = req.body.userName;
  var email = req.body.email;
  var pw = req.body.password;
  req.checkBody('userName', 'username can not be empty').notEmpty();
  req.checkBody('email', 'email is not valid').isEmail().notEmpty();
  req.checkBody('email', 'email can not be empty').notEmpty();
  req.checkBody('password', 'password must be at least 6 chars long').isLength({
    min: 6
  });
  req.checkBody('password2', "passwords don't match").equals(pw);
  var errors = req.validationErrors();

  if (errors) {
    console.log(errors); //	return res.status(422).json({ errors: errors });

    return res.status(422).render('signup', {
      errors: errors,
      fn: fn,
      ln: ln,
      un: un,
      email: email
    });
  } else {
    _bcryptjs["default"].hash(pw, saltRounds, function (err, hash) {
      // Store hash in your password DB.
      db.query('INSERT INTO users (username,firstname,lastname,email,password) VALUES (?,?,?,?,?)', [un, fn, ln, email, hash], function (error, resuslts, fields) {
        if (error) throw error;
        db.query('SELECT LAST_INSERT_ID() as user_id', function (error, results, fields) {
          if (error) throw error;
          var user_id = results[0];
          req.login(user_id, function (err) {
            res.redirect('/home');
          });
        });
      });
    });
  }
}); // passport config

_passport["default"].serializeUser(function (user_id, done) {
  done(null, user_id);
});

_passport["default"].deserializeUser(function (user_id, done) {
  done(null, user_id);
}); // ensuring authentification


function ensureAuthenticated() {
  return function (req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('login');
  };
}

var _default = router;
exports["default"] = _default;