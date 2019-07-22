"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _httpErrors = _interopRequireDefault(require("http-errors"));

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _expressEjsLayouts = _interopRequireDefault(require("express-ejs-layouts"));

var _expressValidator = _interopRequireDefault(require("express-validator"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _passport = _interopRequireDefault(require("passport"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _connectFlash = _interopRequireDefault(require("connect-flash"));

var _index = _interopRequireDefault(require("./routes/index"));

var _users = _interopRequireDefault(require("./routes/users"));

var _forum = _interopRequireDefault(require("./routes/forum"));

var _brainstorming = _interopRequireDefault(require("./routes/brainstorming"));

var _files = _interopRequireDefault(require("./routes/files"));

var _ideas = _interopRequireDefault(require("./routes/ideas"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var LocalStrategy = require('passport-local').Strategy;

var MySQLStore = require('express-mysql-session')(_expressSession["default"]);

var app = (0, _express["default"])();

require('dotenv').config(); //static folders


app.use(_express["default"]["static"](_path["default"].join(__dirname, '../public')));
app.use('/jquery', _express["default"]["static"](_path["default"].join(__dirname, '../node_modules/jquery/dist'))); // redirect bootstrap JS

app.use('/js', _express["default"]["static"](_path["default"].join(__dirname, '../node_modules/bootstrap/dist/js'))); // redirect bootstrap JS

app.use('/css', _express["default"]["static"](_path["default"].join(__dirname, '../node_modules/bootstrap/dist/css'))); // redirect CSS bootstrap

app.use('/fontawesome', _express["default"]["static"](_path["default"].join(__dirname, '../node_modules/@fortawesome/fontawesome-free'))); // redirect CSS bootstrap
// view engine setup

app.use(_expressEjsLayouts["default"]);
app.set('views', _path["default"].join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/mainLayout');
app.use((0, _morgan["default"])('dev'));
app.use(_express["default"].json());
app.use(_bodyParser["default"].urlencoded({
  extended: false
}));
app.use((0, _expressValidator["default"])());
app.use((0, _cookieParser["default"])());
var options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
var sessionStore = new MySQLStore(options); // Express session

app.use((0, _expressSession["default"])({
  secret: 'secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
})); // intialize passport

app.use(_passport["default"].initialize());
app.use(_passport["default"].session());
app.use((0, _connectFlash["default"])());
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});
app.use('/', _index["default"]);
app.use('/users', _users["default"]);
app.use('/forum', _forum["default"]);
app.use('/brainstorming', _brainstorming["default"]);
app.use('/files', _files["default"]);
app.use('/ideas', _ideas["default"]); // passport local

_passport["default"].use(new LocalStrategy(function (username, password, done) {
  var db = require('../db');

  db.query('SELECT id, password FROM users WHERE username = ?', [username], function (error, resuslts, fields) {
    if (error) {
      done(error);
    }

    if (resuslts.length === 0) {
      done(null, false);
    } else {
      var hash = resuslts[0].password.toString();

      _bcryptjs["default"].compare(password, hash, function (err, response) {
        if (response === true) {
          return done(null, {
            user_id: resuslts[0].id
          });
        } else {
          return done(null, false);
        }
      });
    }
  });
})); // catch 404 and forward to error handler


app.use(function (req, res, next) {
  next((0, _httpErrors["default"])(404));
}); // error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // render the error page

  res.status(err.status || 500);
  res.render('error');
});
var _default = app;
exports["default"] = _default;