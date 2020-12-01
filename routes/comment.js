var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { post } = require("request");
const db = mysql.createConnection(dbconfig);

router.get("/getComment", (req, res) => {
  var postId = req.query.postId;

  var commentList = [];
  var userList = [];
  var groupList = [];

  var resultCode = 404;
  var message = "에러 발생";

  function getCommentData() {
    return new Promise(function (resolve, reject) {
      var sqlSelect = "SELECT * FROM homekippa.Comment WHERE post_id = ?";
      db.query(sqlSelect, postId, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function delay(item, sqlselect, id) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        db.query(sqlselect, id, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resolve(result);
          }
        });
      }, 1);
    });
  }
  async function getUserData(list) {
    var temp_list = [];
    var sqlSelectUser = "SELECT * FROM homekippa.User WHERE id = ?";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sqlSelectUser, list[i].user_id);
      temp_list.push(t[0]);
    }
    return temp_list;
  }
  async function getGroupData(list) {
    var temp_list = [];
    var sqlSelectGroup = "SELECT * FROM homekippa.Group WHERE id = ?";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sqlSelectGroup, list[i].group_id);
      temp_list.push(t[0]);
    }
    return temp_list;
  }

  //Execute
  getCommentData()
    .then(function (data) {
      return data;
    })
    .then(function (data) {
      commentList = data;
      return getUserData(data);
    })
    .then(function (data) {
      userList = data;
      console.log(userList);
      return getGroupData(data);
    })
    .then(function (data) {
      groupList = data;
      resultCode = 200;
      message = "comment Get 성공";
      console.log(commentList, userList, groupList);
      res.json({
        comment: commentList,
        groups: groupList,
        users: userList,
        code: resultCode,
        message: message,
      });
    });
});

router.post("/setComment", (req, res) => {
  var postid = req.body.post_id;
  var userid = req.body.user_id;
  var content = req.body.content;
  var date = new Date();

  var resultCode = 404;
  var message = "에러 발생";

  console.log("Comment postID " + postid);

  var sqlComment =
    "INSERT INTO homekippa.Comment (post_id, user_id, content, date) VALUES (?, ?, ?, ?);";
  async function setCommentQuery() {
    db.query(sqlComment, [postid, userid, content, date], (err, result) => {
      if (err) {
        console.log(err);
      } else {
      }
    });
  }

  function setCommentNum() {
    return new Promise(function (resolve, reject) {
      var sqlCommentNum =
        "UPDATE homekippa.Post SET comment_num=comment_num + 1  WHERE id = ?;";
      db.query(sqlCommentNum, postid, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "comment SET 성공";
          resolve(resultCode);
        }
      });
    });
  }

  setCommentQuery()
    .then(function () {})
    .then(function () {
      return setCommentNum();
    })
    .then(function (data) {
      res.json({
        code: data,
        message: message,
      });
    });
});

router.get("/deleteComment", (req, res) => {
  var commentid = req.query.commentId;

  var resultCode = 404;
  var message = "에러 발생";

  var sqlDeleteComment = "DELETE FROM homekippa.Comment WHERE id = ? ";
  async function setCommentQuery() {
    db.query(sqlDeleteComment, commentid, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        setCommentNum();
        resultCode = 200;
        message = "comment SET 성공";
      }
    });
  }

  var sqlCommentNum =
    "UPDATE homekippa.Post SET comment_num=comment_num - 1  WHERE id = ?;";
  async function setCommentNum() {
    db.query(sqlCommentNum, postid, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        resultCode = 200;
        message = "comment SET 성공";
      }
    });
  }

  setCommentQuery().then(function () {
    res.json({
      code: resultCode,
      message: message,
    });
  });
});

module.exports = router;
