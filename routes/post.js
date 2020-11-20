var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { post } = require("request");
const db = mysql.createConnection(dbconfig);

var path = require("path");
const multer = require("multer");
const multerconfig = require("../config/multer.js");
storage = multer.diskStorage(multerconfig);

router.get("/group", (req, res) => {
  var id = req.query.groupId;
  var postList = [];
  var likeList = [];
  var resultCode = 404;
  var message = "에러 발생";

  function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Post WHERE group_id = ?";
    return new Promise(function (resolve, reject) {
      db.query(sqlSelect, id, (err, result) => {
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
  async function getLikeData(list) {
    var temp_list = [];

    var sql = "SELECT * FROM homekippa.Like WHERE post_id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].id);
      temp_list.push(t);
    }
    return temp_list;
  }

  queryData()
    .then(function (data) {
      postList = data;
      return data;
    })
    .then(function (data) {
      postList = data;
      console.log("group postlist");
      console.log(postList);
      likeList = getLikeData(data);
      return likeList;
    })
    .then(function (data) {
      likeList = data;
      console.log("group likeList");
      console.log(likeList);
      resultCode = 200;
      message = "그룹 게시글 GET 성공";
      res.json({ likeData: likeList, postData: postList });
    });
});

router.get("/home", (req, res) => {
  var tab = req.query.tab_;
  var postList = [];
  var groupList = [];
  var likeList = [];
  var resultCode = 404;
  var message = "에러 발생";

  function getPostData(sql) {
    return new Promise(function (resolve, reject) {
      db.query(sql, (err, result) => {
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
  if ((tab_ = "F")) var sqlPost = "SELECT * FROM homekippa.Post";
  else {
    var sqlPost = "SELECT * FROM homekippa.Post";
  }

  //Execute
  getPostData(sqlPost)
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

router.post("/setlike", (req, res) => {
  var postid = req.body.post_id;
  var userid = req.body.user_id;
  var isliked = req.body.isLiked;

  console.log("postid" + postid);
  console.log("isliked " + isliked);

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

router.post(
  "/add/photo",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.query.groupId;
    var resultCode = 404;
    var message = "에러 발생";

    var group_id = req.body.groupId;
    var user_id = req.body.userId;
    var title = req.body.title;
    var content = req.body.content;
    var image = path.join(__dirname, "..", "images/") + req.file.filename;

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
  }
);

router.post("/add", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  var group_id = req.body.GroupId;
  var user_id = req.body.UserId;
  var title = req.body.title;
  var content = req.body.content;
  var image = path.join(__dirname, "..", "images/") + "profile.png";

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
