// routes/index.js
import express from 'express';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');
/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { layout: 'layouts/layout' });
});
router.get('/home', ensureAuthenticated, function (req, res, next) {
	res.render('home');
});
export default router;
