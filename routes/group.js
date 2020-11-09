var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

const multer = require("multer");

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname));
  },
});

router.get("/", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Group WHERE id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = "그룹 정보 GET 성공";

        res.json({
          code: resultCode,
          message: message,
          groupName: result[0].name,
          groupId: result[0].id,
          groupImage: result[0].image,
          groupAddress: result[0].address,
          groupIntro: result[0].introduction,
          groupBackground: result[0].background,
          groupTag: result[0].tag,
        });
      }
    });
  }

  queryData().then(function () {
    console.log(id);
  });
});

router.post("/add", (req, res) => {
  var id = req.body.userId;
  var name = req.body.groupName;
  var tag = createTag();
  // var image = req.body.groupProfileImage;
  var address = req.body.groupAddress;
  // 배경사진 var background = req.body.groupBackground;
  var introduction = req.body.groupIntroduction;
  var resultCode = 404;
  var message = "에러 발생";

  function createTag() {
    return (randomTag = Math.floor(Math.random() * 10000));
  }

  async function checkDuplication() {
    var checkCode = true;

    while (checkCode) {
      checkCode = searchTag();
      if (checkCode) {
        tag = createTag();
      } else {
        insertData();
      }
    }
  }

  function searchTag() {
    var sqlSelect =
      "SELECT tag FROM homekippa.Group WHERE name = ? and tag = ?";
    db.query(sqlSelect, [name, tag], (err, result) => {
      if (err) {
        console.log(err);
        return false;
      } else if (result[0]) {
        return true;
      } else {
        return false;
      }
    });
  }

  function insertData() {
    var sqlInsert =
      "INSERT INTO homekippa.Group (name, tag, address, introduction) VALUES (?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [name, tag, address, introduction],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          updateData(result.insertId);
        }
      }
    );
  }

  function updateData(groupId) {
    var sqlUpdate = "UPDATE homekippa.User SET group_id = ? WHERE id = ?";
    db.query(sqlUpdate, [groupId, id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        resultCode = 200;
        message = "그룹생성 성공";
      }
    });
  }

  checkDuplication().then(function () {
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  });
});

router.post("/add/images", multer({
  storage: storage
}).single('upload'), (req, res) => {
  console.log(req.file);
  console.log(req.filename);
  console.log(req.body);

  var resultCode = 404;
  var message = "에러 발생";

  if (err) {
    console.log(err);
  } else {
    resultCode = 200;
    message = "그룹생성 성공";
  }
});

module.exports = router;
