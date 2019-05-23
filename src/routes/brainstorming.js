import express from 'express';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

router.get('/', (req, res) => {
	res.render('brainstorming');
});

router.get('/addStorm', (req, res) => {
	res.render('storm');
});

router.post('/addStorm', (req, res) => {
	const db = require('../../db');
	let name = req.body.name;
	let description = req.body.description;
	let type = req.body.type;
	let userId = req.session.passport.user.user_id;
	req.checkBody('name', 'please fill the required fields').notEmpty();
	req.checkBody('type', 'please fill the required fields2').notEmpty();
	req.checkBody('description', 'please fill the required fields3').notEmpty();

	const errors = req.validationErrors();
	if (errors) {
		console.log('validation errors', errors);

		return res.status(422).render('storm', {
			errors
		});
	} else {
		db.query(
			'INSERT INTO storm (nom,description,type,user_id) VALUES (?,?,?,?)',
			[ name, description, type, userId ],
			(error, results, fields) => {
				if (error) throw error;
				res.redirect('/brainstorming');
			}
		);
	}
});

export default router;
