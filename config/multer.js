var path = require("path");

module.exports = {
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname));
  },
}