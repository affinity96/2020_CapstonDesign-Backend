var express = require("express");
var router = express.Router();
var path = require('path');

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

router.post("/invite", (req, res) =>{
  var from_group = req.body.from_group;
  var to_user = req.body.to_user;

  async function insertData(group, user) {
    var checksql = "SELECT COUNT(IF(from_group = ? AND to_user = ?, 1, null)) AS count FROM GroupInvite";
    db.query(checksql, [group, user], (err, result) =>{
      if(err){
        res.send({ result: false });
        console.log("초대 전송 실패");
      } else if(result[0].count > 0){
        res.send({ result: true });
        console.log("초대 전송 성공");
      } else{
        var sql = "INSERT INTO GroupInvite (from_group, to_user) VALUES (?, ?)";
        db.query(sql, [group, user], (err, _) => {
          if (err) {
            res.send({ result: false });
            console.log("초대 전송 실패");
          } else {
            res.send({ result: true });
            console.log("초대 전송 성공");
          }
        });
      }
    })

  }

  insertData(from_group, to_user);
});

router.post("/add", multer({
  storage: storage
}).single('upload'), (req, res) => {
  var id = req.body.userId;
  var name = req.body.groupName;
  var tag = createTag();
  var image = '';
  var address = req.body.groupAddress;
  // 배경사진 var background = req.body.groupBackground;
  var introduction = req.body.groupIntroduction;
  var resultCode = 404;
  var message = "에러 발생";

  if (req.file) {
    image = path.join(__dirname, '..', 'images/') + req.file.filename;
  } else {
    image = path.join(__dirname, '..', 'images/') + "profile.png";
  }

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
      "INSERT INTO homekippa.Group (name, tag, image, address, introduction) VALUES (?, ?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [name, tag, image, address, introduction],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("응?")
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
        hello();
      }
    });
  }

  function hello(){
    console.log(req.file);
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  }
  checkDuplication();
  // checkDuplication().then(function () {
  //   console.log(req.file);
  //   console.log(req.body);
  //   res.json({
  //     code: resultCode,
  //     message: message,
  //   });
  // });
});

module.exports = router;
