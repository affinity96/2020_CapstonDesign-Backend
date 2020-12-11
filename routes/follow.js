var fcm = require("../functions/firebase");
var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

const multer = require("multer");
const multerconfig = require("../config/multer.js");
storage = multer.diskStorage(multerconfig);

router.get("/getFollow", (req, res) => {
  var followerList = [];
  var followingList = [];
  var group_id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";
  console.log("id", group_id);
  function getFollow(sql) {
    return new Promise(function (resolve, reject) {
      db.query(sql, group_id, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  var sqlSelect =
    "SELECT from_id FROM homekippa.Followrelation Where to_id =? order by from_id asc;";
  getFollow(sqlSelect)
    .then(function (data) {
      return data;
    })
    .then(function (data) {
      followerList = data.map(a => a.from_id);
      console.log("here");
      console.log(followerList);
      var sqlSelect =
        "SELECT to_id FROM homekippa.Followrelation Where from_id =? order by to_id asc;";
      return getFollow(sqlSelect);
    })
    .then(function (data) {
      followingList = data.map(a => a.to_id);
      console.log("here");
      console.log(followingList);

      res.json({
        follower: followerList,
        following: followingList,
      });
    });
});

router.post("/follow", (req, res) => {
  var from_id = req.body.from_id;
  var to_id = req.body.to_id;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "INSERT INTO Followrelation (from_id, to_id) VALUES (?, ?)";
    db.query(sqlSelect, [from_id, to_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = "FOLLOW 성공";
      }
    });
  }

  queryData().then(function () {
    res.json({
      code: resultCode,
      message: message,
    });
  });
});

router.post("/unfollow", (req, res) => {
  var from_id = req.body.from_id;
  var to_id = req.body.to_id;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect =
      "DELETE FROM Followrelation WHERE from_id = ? and to_id = ?; ";
    db.query(sqlSelect, [from_id, to_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = "UNFOLLOW 성공";
      }
    });
  }

  queryData().then(function () {
    res.json({
      code: resultCode,
      message: message,
    });
  });
});

module.exports = router;
