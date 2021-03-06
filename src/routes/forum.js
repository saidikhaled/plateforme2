import express from 'express';
import { create } from 'domain';
import { createDecipher } from 'crypto';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

/* get forum main page */
router.get('/', ensureAuthenticated, function (req, res, next) {
	const db = require('../../db');

	db.query('SELECT * FROM forum', (error, results, fields) => {
		if (error) throw error;
		let tagsObj = {};
		results.forEach((result, i) => {
			tagsObj[i] = result.tags.split(' ');
		});

		let tags = Object.values(tagsObj);
		res.render('FAQ', { results, tags });
		//res.json({ results, tags });
		//res.send(JSON.stringify({ results, tags }));
	});
});

// get one question
router.get('/getOne/:id', ensureAuthenticated, function (req, res, next) {
	const db = require('../../db');

	// fetch the question
	db.query('SELECT * FROM forum where id = ?', [ req.params.id ], (error, forumResults, fields) => {
		if (error) throw error;

		let tags = forumResults[0].tags.split(' ');
		let comments = [];
		let question = forumResults[0];
		//	const user_id = results[0].user_id;
		let commentUser = [];
		// fetch comments
		db.query(
			'SELECT * FROM commentaires where forum_id = ?',
			[ req.params.id ],
			(error1, commentResults, fields1) => {
				if (error1) throw error;
				// if there is any comments
				if (commentResults.length !== 0) {
					const time = [];

					let commentUserIds = [];
					commentResults.forEach((result, i) => {
						if (commentUserIds[i] === result.user_id) {
							console.log('twice');
						} else {
							commentUserIds.push(result.user_id);
						}
						comments.push(result.comment);
					});

					// fetch the user
					db.query(
						'SELECT username FROM users where id = ?',
						[ req.session.passport.user.user_id ],
						(error2, userResults, fields) => {
							if (error2) throw error;

							let username = userResults[0].username;

							commentUserIds.forEach((comment, i) => {
								db.query(
									'SELECT username FROM users where id = ?',
									[ comment ],
									(error3, commentUserResults, fields) => {
										if (error3) throw error;

										//console.log('username ' + i + ': ' + commentUserResults[0].username);
										commentUser.push(commentUserResults[0].username);
										console.log('from the array', commentUser);
									}
								);
							});

							res.render('question', {
								question,
								tags,
								comments,
								time,
								username,
								commentUser,
								commentResults
							});
						}
					);
				} else {
					// if there is no comment
					// fetch the user
					db.query(
						'SELECT username FROM users where id = ?',
						[ req.session.passport.user.user_id ],
						(error2, results2, fields) => {
							if (error2) throw error;
							//	console.log('user_id : ', req.session.passport.user.user_id);
							//	console.log('username : ', results2[0].username);
							let username = results2[0].username;

							res.render('question', {
								question,
								tags,
								username,
								comments,
								commentResults
							});
						}
					);
				}
			}
		);
	});
});

// add a question to database
router.post('/addCom/:id', function (req, res, next) {
	const db = require('../../db');
	let comment = req.body.comment;
	let userId = req.session.passport.user.user_id;
	let forumId = req.params.id;

	req.checkBody('comment', "you can't submit an empty comment ").notEmpty();
	const errors = req.validationErrors();
	if (errors) {
		console.log('validation errors', errors);

		return res.status(422).render('addQ', {
			errors
		});
	} else {
		db.query(
			'INSERT INTO commentaires (user_id,comment,forum_id) VALUES (?,?,?)',
			[ userId, comment, forumId ],
			(error, results, fields) => {
				if (error) throw error;
				//res.redirect('/forum');
				db.query('SELECT comment FROM commentaires ORDER BY id DESC LIMIT 1', (error, results, fields) => {
					let lastComment = results[0].comment;

					//res.render('comment', { lastComment });
					return res.send({ lastComment });
					//res.end();
				});
			}
		);
	}
});

// get add form page
router.get('/addQ', ensureAuthenticated, function (req, res, next) {
	res.render('addQ');
});

// add a question to database
router.post('/addQ', function (req, res, next) {
	const db = require('../../db');

	const categorie = req.body.categorie;
	const titre = req.body.titre;
	const description = req.body.description;
	const tags = req.body.tags;
	const user_id = req.session.passport.user.user_id;

	const tag = tags.split(' ');
	console.log(tag);
	req.checkBody('categorie', 'categorie ne peut pas étre vide').notEmpty();
	req.checkBody('titre', 'titre ne peut pas étre vide').notEmpty();
	req.checkBody('description', 'description ne peut pas étre vide').notEmpty();

	const errors = req.validationErrors();
	if (errors) {
		console.log(errors);
		//	return res.status(422).json({ errors: errors });
		return res.status(422).render('addQ', {
			errors,
			categorie,
			titre,
			description,
			tags
		});
	} else {
		db.query(
			'INSERT INTO forum (categorie,titre,description,tags,user_id) VALUES (?,?,?,?,?)',
			[ categorie, titre, description, tags, user_id ],
			(error, results, fields) => {
				if (error) throw error;
				res.redirect('/forum');
			}
		);
	}
});

export default router;
