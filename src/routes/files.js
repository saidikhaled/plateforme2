import express from 'express';
import multer from 'multer';
import path from 'path';
const router = express.Router();
const { ensureAuthenticated } = require('../../config/auth');

// Set The Storage Engine
const storage = multer.diskStorage({
	destination : function (req, file, cb) {
		cb(null, 'C:/Users/ASUS/Desktop/workspace/plateforme2/public/uploads');
	},
	filename    : function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

// Init Upload
const upload = multer({
	storage    : storage,
	// limits     : { fileSize: 1000000 },
	fileFilter : function (req, file, cb) {
		checkFileType(file, cb);
	}
}).single('my_file');

// Check File Type
function checkFileType (file, cb) {
	// Allowed ext
	const filetypes = /jpeg|jpg|png|gif|docx|vnd.openxmlformats-officedocument.wordprocessingml.document|pdf/;
	// Check ext
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	// Check mime
	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) {
		return cb(null, true);
	} else {
		cb('Error: Images Only!');
	}
}

router.get('/', ensureAuthenticated, (req, res) => {
	const db = require('../../db');
	db.query('SELECT givenname,filename,path,description,id,mimetype FROM files', (error, results, fields) => {
		if (error) throw error;
		let Files = {};
		let Imgs = {};

		let namesFiles = [];
		let namesImgs = [];
		let descriptions = [];

		let pathsImgs = [];
		let pathsFiles = [];

		let idsImgs = [];
		let idsFiles = [];

		results.forEach((element, i) => {
			descriptions[i] = element.description;

			//paths[i] = element.path.slice(50).replace(/\\/g, '/');
			let ext = element.mimetype.slice(element.mimetype.lastIndexOf('/') + 1);
			//console.log(ext1);
			if ((ext === 'jpeg') | (ext === 'jpg') | (ext === 'png') | (ext === 'gif')) {
				pathsImgs.push(element.path.slice(50).replace(/\\/g, '/'));
				idsImgs.push(element.id);
				namesImgs.push(element.givenname);
			} else {
				pathsFiles.push(element.path.slice(50).replace(/\\/g, '/'));
				idsFiles.push(element.id);
				namesFiles.push(element.givenname);
			}
		});

		Imgs.pathsImgs = pathsImgs;
		Imgs.idsImgs = idsImgs;
		Imgs.namesImgs = namesImgs;

		Files.pathsFiles = pathsFiles;
		Files.idsFiles = idsFiles;
		Files.namesFiles = namesFiles;
		console.log(Files);
		console.log('this is the the path', Imgs.idsImgs[0]);
		res.render('files', {
			descriptions,
			Files,
			Imgs
		});
	});
});

router.get('/upload', ensureAuthenticated, (req, res) => {
	res.render('sharefile');
});
router.post('/upload', ensureAuthenticated, (req, res) => {
	const db = require('../../db');
	upload(req, res, (err) => {
		if (err) {
			res.render('sharefile', {
				msg : err
			});
		} else {
			if (req.file == undefined) {
				res.render('sharefile', {
					msg : 'please select a file'
				});
			} else {
				let fieldname = req.file.fieldname;
				let originalname = req.file.originalname;
				let mimetype = req.file.mimetype;
				let destination = req.file.destination;
				let filename = req.file.filename;
				let path = req.file.path;
				let size = req.file.size;
				let updated_by = req.session.passport.user.user_id;
				let name = req.body.name;
				let description = req.body.description;
				let type = req.body.selectpicker;
				db.query(
					'INSERT INTO files (fieldname,originalname,mimetype,destination,filename,path,size,updated_by,givenname,description,type) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
					[
						fieldname,
						originalname,
						mimetype,
						destination,
						filename,
						path,
						size,
						updated_by,
						name,
						description,
						type
					],
					(error, results, fields) => {
						if (error) throw error;
						res.render('sharefile', {
							msg  : 'File Uploaded!',
							file : `/uploads/${req.file.filename}`
						});
					}
				);
			}
		}
	});
});

router.get('/download/:id', (req, res) => {
	const db = require('../../db');
	console.log('id : ', req.params.id);
	db.query('SELECT path,filename FROM files where id=?', [ req.params.id ], (error, results, fields) => {
		if (error) throw error;
		let filename = results[0].filename;
		console.log('name' + filename);
		let path = results[0].path.replace(/\\/g, '/');
		res.download(path, filename);
	});
});

export default router;
