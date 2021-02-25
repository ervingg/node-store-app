const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
   destination: function(req, file, cb) {
      cb(null, './images/');
   },
   filename: function(req, file, cb) {
      cb(null, `${Math.round(Math.random())}-${file.originalname}`);
   }
});

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(null, false);
   }
};

module.exports = multer({
   storage,
   fileFilter
});