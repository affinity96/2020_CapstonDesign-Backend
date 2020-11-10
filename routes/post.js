var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { post } = require("request");
const db = mysql.createConnection(dbconfig);

router.get("/group", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Post WHERE group_id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        // console.log(result);
        resultCode = 200;
        message = "그룹 게시글 GET 성공";

        res.json(result);
      }
    });
  }

  queryData().then(function () {
    // console.log(id);
  });
});

router.get("/location", (req, res) => {
  // var id = req.query.groupId;
  var postList = [];
  var groupList = [];
  var resultCode = 404;
  var message = "에러 발생";

  function getPostData() {
    return new Promise(function (resolve, reject) {
      var sqlSelect = "SELECT * FROM homekippa.Post";
      db.query(sqlSelect, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          // postList = result;
          resolve(result);
        }
      });
    });
  }

  function delay(item) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        var sqlSelect1 = "SELECT * FROM homekippa.Group WHERE id = ?";
        db.query(sqlSelect1, item.group_id, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            // groupList.push(result);
            resolve(result);
          }
        });
      }, 0);
    });
  }
  async function getGroupData(list) {
    var temp_list = [];
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i]);
      temp_list.push(t);
    }
    return temp_list;
  }

  //Execute
  getPostData()
    .then(function (data) {
      return data;
    })
    .then(function (data) {
      postList = data;
      groupList = getGroupData(data);
      return groupList;
    })
    .then(function (data) {
      groupList = data;
      console.log("post data");
      console.log(postList);
      console.log("group data");
      console.log(groupList);
      return res.json(groupList);
    });
});

router.get("/follwer", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Post WHERE group_id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        console.log(result);
        resultCode = 200;
        message = "그룹 게시글 GET 성공";

        res.json(result);
      }
    });
  }
  queryData().then(function () {
    console.log(id);
  });
});
module.exports = router;
