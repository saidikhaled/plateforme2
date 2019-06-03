import express from 'express';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

router.get('/', ensureAuthenticated, (req, res) => {
	const db = require('../../db');

	db.query('SELECT * FROM storm', (error, results, fields) => {
		if (error) throw error;
		res.render('brainstorming', { results });
	});
});

router.get('/addStorm', ensureAuthenticated, (req, res) => {
	res.render('addS');
});

router.get('/storm', ensureAuthenticated, (req, res) => {
	res.render('addS');
});

router.post('/addStorm', ensureAuthenticated, (req, res) => {
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

		return res.status(422).render('addS', {
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

// get one storm
router.get('/getOne/:id', ensureAuthenticated, function (req, res, next) {
	const db = require('../../db');
	console.log('i get to here');
	db.query('SELECT *  FROM storm where id= ?', [ req.params.id ], (error, results, fields) => {
		if (error) throw error;
		console.log(results);
		res.render('storm', { results });
	});
});
export default router;
