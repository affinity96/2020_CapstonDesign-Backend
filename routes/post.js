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
            console.log("in delay");
            console.log(result);
            resolve(result);
          }
        });
      }, 1);
    });
  }
  async function getGroupData(list) {
    var temp_list = [];
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i]);
      temp_list.push(t[0]);
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
      console.log({ groupData: groupList, postData: postList });
      res.json({ groupData: groupList, postData: postList });
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

router.post("/add", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  var group_id = req.body.GroupId;
  var user_id = req.body.UserId;
  var title = req.body.title;
  var content = req.body.content;
  var image = req.body.image;
  

  console.log("ㄸ호잉또잉", req.body)
  async function insertData() {
    var sqlInsert =  "INSERT INTO homekippa.Post (group_id, user_id, title, content, image, `date`, like_num, comment_num, scope) VALUES (?, ?, ?, ?, ?, ? ,? ,?, ?);";
    db.query(
      sqlInsert,
      [group_id, user_id, title, content, image, new Date(), 0, 0,'ALL' ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "게시글추가성공";
          addNewPost();
        }
      }
    );
  }
  insertData()
  function addNewPost() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

module.exports = router;
