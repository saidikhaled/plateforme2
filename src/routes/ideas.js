import express from 'express';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

router.get('/', ensureAuthenticated, (req, res) => {
	const db = require('../../db');

	db.query('SELECT * FROM idées', (error, ideas, fields) => {
		if (error) throw error;

		res.render('ideas');
	});
});

router.get('/getCategory/:id', ensureAuthenticated, (req, res) => {
	const db = require('../../db');
	let category_number = req.params.id;
	let category = '';

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

	db.query('SELECT * FROM idées where categorie= ?', [ category ], (error, ideas, fields) => {
		if (error) throw error;
		res.render('categoryIdeas', { ideas });
	});
});
router.get('/category', ensureAuthenticated, (req, res) => {
	res.render('categoryIdeas');
});
router.get('/addIdea', ensureAuthenticated, (req, res) => {
	res.render('addIdea');
});
router.post('/addIdea', ensureAuthenticated, (req, res) => {
	const db = require('../../db');

	const title = req.body.title;
	const category = req.body.selectpicker;
	const content = req.body.content.toLowerCase();

	req.checkBody('title', 'Title can not be empty').notEmpty();
	req.checkBody('category', 'Category can not be empty').notEmpty();
	req.checkBody('content', 'Content can not be empty').notEmpty();

	// title = title.toLowerCase().charAt(0).toUpperCase();
	// category = category.toLowerCase().charAt(0).toUpperCase();
	// content = content.toLowerCase().charAt(0).toUpperCase();
	const errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		//	return res.status(422).json({ errors: errors });
		return res.status(422).render('addIdea', {
			errors   : errors,
			title,
			category,
			content
		});
	} else {
		db.query(
			'INSERT INTO idées (titre,categorie,contenu) VALUES (?,?,?)',
			[ title, category, content ],
			(error, resuslts, fields) => {
				if (error) throw error;
				res.render('Ideas');
			}
		);
	}
});
export default router;
