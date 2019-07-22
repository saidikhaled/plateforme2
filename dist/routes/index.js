"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// routes/index.js
var router = _express["default"].Router();

var _require = require('../../config/auth'),
    ensureAuthenticated = _require.ensureAuthenticated;
/* GET home page. */


router.get('/', function (req, res, next) {
  res.render('index', {
    layout: 'layouts/layout'
  });
});
router.get('/home', ensureAuthenticated, function (req, res, next) {
  res.render('home');
});
var _default = router;
exports["default"] = _default;