import express from 'express';
const router = express.Router();
import passport from 'passport';
import bcrypt from 'bcryptjs';
const saltRounds = 10;
import alert from 'alert-node';

// get login page
router.get('/login', function (req, res, next) {
	res.render('login');
});

// handle login
router.post('/login', passport.authenticate('local', { failureRedirect: 'login' }), function (req, res) {
	req.flash('welcomeMsg', 'Your name was updated');
	res.redirect('profile');
});

// handle logout
router.get('/logout', function (req, res, next) {
	req.logout();
	req.session.destroy(() => {
		res.clearCookie('connect.sid');
		res.redirect('/');
	});
});

// get profile page
router.get('/profile', ensureAuthenticated(), function (req, res, next) {
	res.render('profile', { expressFlash: req.flash('welcomeMsg') });
});

// get signup page
router.get('/signup', function (req, res, next) {
	res.render('signup');
});

// handle signup
router.post('/signup', function (req, res, next) {
	const db = require('../../db');

	const fn = req.body.firstName;
	const ln = req.body.lastName;
	const un = req.body.userName;
	const email = req.body.email;
	const pw = req.body.password;

	req.checkBody('userName', 'username can not be empty').notEmpty();
	req.checkBody('email', 'email is not valid').isEmail().notEmpty();
	req.checkBody('email', 'email can not be empty').notEmpty();
	req.checkBody('password', 'password must be at least 6 chars long').isLength({
		min : 6
	});
	req.checkBody('password2', "passwords don't match").equals(pw);

	const errors = req.validationErrors();

	if (errors) {
		console.log(errors);
		//	return res.status(422).json({ errors: errors });
		return res.status(422).render('signup', {
			errors : errors,
			fn,
			ln,
			un,
			email
		});
	} else {
		bcrypt.hash(pw, saltRounds, function (err, hash) {
			// Store hash in your password DB.
			db.query(
				'INSERT INTO users (username,firstname,lastname,email,password) VALUES (?,?,?,?,?)',
				[ un, fn, ln, email, hash ],
				(error, resuslts, fields) => {
					if (error) throw error;

					db.query('SELECT LAST_INSERT_ID() as user_id', (error, results, fields) => {
						if (error) throw error;

						const user_id = results[0];
						req.login(user_id, (err) => {
							res.redirect('/');
						});
					});
				}
			);
		});
	}
});

// passport config
passport.serializeUser(function (user_id, done) {
	done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
	done(null, user_id);
});

// ensuring authentification
function ensureAuthenticated () {
	return (req, res, next) => {
		if (req.isAuthenticated()) return next();

		res.redirect('login');
	};
}
export default router;
