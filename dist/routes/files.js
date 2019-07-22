"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _multer = _interopRequireDefault(require("multer"));

var _path2 = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var router = _express["default"].Router();

var _require = require('../../config/auth'),
    ensureAuthenticated = _require.ensureAuthenticated; // Set The Storage Engine


var storage = _multer["default"].diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'C:/Users/ASUS/Desktop/workspace/plateforme2/public/uploads');
  },
  filename: function filename(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + _path2["default"].extname(file.originalname));
  }
}); // Init Upload


var upload = (0, _multer["default"])({
  storage: storage,
  // limits     : { fileSize: 1000000 },
  fileFilter: function fileFilter(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('my_file'); // Check File Type

function checkFileType(file, cb) {
  // Allowed ext
  var filetypes = /jpeg|jpg|png|gif|docx|vnd.openxmlformats-officedocument.wordprocessingml.document|pdf/; // Check ext

  var extname = filetypes.test(_path2["default"].extname(file.originalname).toLowerCase()); // Check mime

  var mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

router.get('/', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  db.query('SELECT givenname,filename,path,description,id,mimetype FROM files', function (error, results, fields) {
    if (error) throw error;
    var Files = {};
    var Imgs = {};
    var namesFiles = [];
    var namesImgs = [];
    var descriptions = [];
    var pathsImgs = [];
    var pathsFiles = [];
    var idsImgs = [];
    var idsFiles = [];
    results.forEach(function (element, i) {
      descriptions[i] = element.description; //paths[i] = element.path.slice(50).replace(/\\/g, '/');

      var ext = element.mimetype.slice(element.mimetype.lastIndexOf('/') + 1); //console.log(ext1);

      if (ext === 'jpeg' | ext === 'jpg' | ext === 'png' | ext === 'gif') {
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
      descriptions: descriptions,
      Files: Files,
      Imgs: Imgs
    });
  });
});
router.get('/upload', ensureAuthenticated, function (req, res) {
  res.render('sharefile');
});
router.post('/upload', ensureAuthenticated, function (req, res) {
  var db = require('../../db');

  upload(req, res, function (err) {
    if (err) {
      res.render('sharefile', {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render('sharefile', {
          msg: 'please select a file'
        });
      } else {
        var fieldname = req.file.fieldname;
        var originalname = req.file.originalname;
        var mimetype = req.file.mimetype;
        var destination = req.file.destination;
        var filename = req.file.filename;
        var _path = req.file.path;
        var size = req.file.size;
        var updated_by = req.session.passport.user.user_id;
        var name = req.body.name;
        var description = req.body.description;
        var type = req.body.selectpicker;
        db.query('INSERT INTO files (fieldname,originalname,mimetype,destination,filename,path,size,updated_by,givenname,description,type) VALUES (?,?,?,?,?,?,?,?,?,?,?)', [fieldname, originalname, mimetype, destination, filename, _path, size, updated_by, name, description, type], function (error, results, fields) {
          if (error) throw error;
          res.render('sharefile', {
            msg: 'File Uploaded!',
            file: "/uploads/".concat(req.file.filename)
          });
        });
      }
    }
  });
});
router.get('/download/:id', function (req, res) {
  var db = require('../../db');

  console.log('id : ', req.params.id);
  db.query('SELECT path,filename FROM files where id=?', [req.params.id], function (error, results, fields) {
    if (error) throw error;
    var filename = results[0].filename;
    console.log('name' + filename);
    var path = results[0].path.replace(/\\/g, '/');
    res.download(path, filename);
  });
});
var _default = router;
exports["default"] = _default;