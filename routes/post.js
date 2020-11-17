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
  var postList = [];
  var groupList = [];
  var likeList = [];
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

  function delay(item, sql, id) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        db.query(sql, id, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resolve(result);
          }
        });
      }, 1);
    });
  }
  async function getGroupData(list) {
    var temp_list = [];
    var sql = "SELECT * FROM homekippa.Group WHERE id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].group_id);
      temp_list.push(t[0]);
    }
    return temp_list;
  }

  async function getLikeData(list) {
    var temp_list = [];
    var sql = "SELECT * FROM homekippa.Like WHERE post_id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].id);
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
      groupList = getGroupData(postList);
      return groupList;
    })
    .then(function (data) {
      groupList = data;
      likeList = getLikeData(postList);
      return likeList;
    })
    .then(function (data) {
      likeList = data;
      console.log("LIKEDATA");
      console.log(likeList);
      resultCode = 200;
      message = "data get 성공";
      res.json({
        groupData: groupList,
        postData: postList,
        likeData: likeList,
        code: resultCode,
        message: message,
      });
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

router.post("/setlike", (req, res) => {
  var postid = req.body.post_id;
  var userid = req.body.user_id;
  var isliked = req.body.isLiked;

  console.log("postid" + postid);

  if (isliked) {
    var sqlLike =
      "INSERT INTO homekippa.Like (post_id, user_id) VALUES (?, ?);";
    var sqlPost =
      "UPDATE homekippa.Post SET like_num=like_num + 1  WHERE id = ?;";
  } else {
    var sqlLike =
      "DELETE FROM homekippa.Like WHERE post_id = ? AND user_id = ? ;";
    var sqlPost =
      "UPDATE homekippa.Post SET like_num =like_num - 1 where id= ?";
  }

  async function setLikeQuery() {
    db.query(sqlLike, [postid, userid], (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        resultCode = 200;
        message = "like SET 성공";
      }
    });

    db.query(sqlPost, postid, (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        resultCode = 200;
        message = "like SET 성공";
      }
    });
  }

  setLikeQuery().then(function () {
    res.json({
      code: resultCode,
      message: message,
    });
  });

  var resultCode = 404;
  var message = "에러 발생";
});

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
  var date = req.body.date;
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
        resultCode = 200;
        message = "comment SET 성공";
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

router.post("/add", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  var group_id = req.body.GroupId;
  var user_id = req.body.UserId;
  var title = req.body.title;
  var content = req.body.content;
  var image = req.body.image;

  console.log("ㄸ호잉또잉", req.body);
  async function insertData() {
    var sqlInsert =
      "INSERT INTO homekippa.Post (group_id, user_id, title, content, image, `date`, like_num, comment_num, scope) VALUES (?, ?, ?, ?, ?, ? ,? ,?, ?);";
    db.query(
      sqlInsert,
      [group_id, user_id, title, content, image, new Date(), 0, 0, "ALL"],
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
  insertData();
  function addNewPost() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

module.exports = router;
