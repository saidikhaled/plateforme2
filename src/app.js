import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser';
import expressLayouts from 'express-ejs-layouts';
import expressValidator from 'express-validator';
import session from 'express-session';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import flash from 'connect-flash';

const LocalStrategy = require('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import forumRouter from './routes/forum';
import brainstormingRouter from './routes/brainstorming';
import filesRouter from './routes/files';
import ideasRouter from './routes/ideas';

const app = express();

require('dotenv').config();

//static folders
app.use(express.static(path.join(__dirname, '../public')));
app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist'))); // redirect bootstrap JS
app.use('/js', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/js'))); // redirect bootstrap JS
app.use('/css', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/css'))); // redirect CSS bootstrap
app.use('/fontawesome', express.static(path.join(__dirname, '../node_modules/@fortawesome/fontawesome-free'))); // redirect CSS bootstrap

// view engine setup
app.use(expressLayouts);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/mainLayout');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());

const options = {
	host     : process.env.DB_HOST,
	user     : process.env.DB_USER,
	password : process.env.DB_PASSWORD,
	database : process.env.DB_NAME
};
const sessionStore = new MySQLStore(options);
// Express session
app.use(
	session({
		secret            : 'secret',
		store             : sessionStore,
		resave            : false,
		saveUninitialized : false
	})
);
// intialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.isAuthenticated();
	next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/forum', forumRouter);
app.use('/brainstorming', brainstormingRouter);
app.use('/files', filesRouter);
app.use('/ideas', ideasRouter);

// passport local
passport.use(
	new LocalStrategy(function (username, password, done) {
		const db = require('../db');

		db.query('SELECT id, password FROM users WHERE username = ?', [ username ], (error, resuslts, fields) => {
			if (error) {
				done(error);
			}
			if (resuslts.length === 0) {
				done(null, false);
			} else {
				const hash = resuslts[0].password.toString();

				bcrypt.compare(password, hash, (err, response) => {
					if (response === true) {
						return done(null, { user_id: resuslts[0].id });
					} else {
						return done(null, false);
					}
				});
			}
		});
	})
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

export default app;
