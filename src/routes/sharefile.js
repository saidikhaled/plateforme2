import express from 'express';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

router.get('/', (req, res) => {
	res.render('sharefile');
});

export default router;
