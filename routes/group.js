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
        resultCode = 200;
        message = "그룹 정보 GET 성공";

        res.json({
          code: resultCode,
          message: message,
          name: result[0].name,
          id: result[0].id,
          image: result[0].image,
          address: result[0].address,
          introduction: result[0].introduction,
          cover: result[0].cover,
          tag: result[0].tag,
          area: result[0].area,
        });
      }
    });
  }

  queryData().then(function () {
    console.log(id);
  });
});

router.get("/member", (req, res) => {
  var groupid = req.query.groupId;
  var memberList = [];
  var resultCode = 404;
  var message = "에러 발생";

  async function getMemberData() {
    var sql = "SELECT * FROM homekippa.User WHERE group_id = ? ";
    db.query(sql, groupid, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        memberList = result;
        resultCode = 200;
        message = "그룹 정보 GET 성공";
        res.json(result);
      }
    });
  }

  getMemberData().then(function () {
    console.log(id);
  });
});

router.post("/invite", (req, res) => {
  var from_group = req.body.from_group;
  var from_user = req.body.from_user;
  var to_user = req.body.to_user;
  var message = "그룹에서 당신을 초대하였습니다.";

  async function insertData(group, user) {
    var checksql =
      "SELECT COUNT(IF(from_group = ? AND to_user = ?, 1, null)) AS count FROM GroupInvite";
    db.query(checksql, [group, user], (err, result) => {
      if (err) {
        res.send({ result: false });
        console.log("초대 전송 실패");
      } else if (result[0].count > 0) {
        res.send({ result: true });
        console.log("초대 전송 성공");
      } else {
        var sql = "INSERT INTO GroupInvite (from_group, to_user) VALUES (?, ?)";
        db.query(sql, [group, user], (err, _) => {
          if (err) {
            console.log(err);
            res.send({ result: false });
            console.log("초대 전송 실패");
          } else {
            fcm.sendMessage(
              from_user,
              to_user,
              from_group.name + " " + message,
              from_group.id
            );
            res.send({ result: true });
            console.log("초대 전송 성공");
          }
        });
      }
    });
  }

  insertData(from_group.id, to_user.id);
});
router.post("/selectInvite", (req, res) => {
  var invitation=[];
  var result_check = "nothing";
  var from_group = req.body.from_group;
  var message = "에러";
  var resultCode = "404"
  var to_user = req.body.to_user;
  console.log(from_group.id);
  async function getData(){
    var sql="SELECT * FROM GroupInvite WHERE from_group = ? and to_user = ?";
    db.query(
      sql,
      [from_group.id, to_user.id],
      (err, result) => {
        if (err) {
          console.log("데이터 가져오기 실패", err);
        } else {
          console.log("데이터 가져오기 성공! ", result);
          resultCode = 200;
          message = " GET 성공";
          if(result[0] == undefined){
            result_check = "false";

          }else{
            result_check = "true";
          }

          console.log(result_check);

          res.json({
            code: resultCode,
            message: message,
            result: result_check
          });
        }
      }
    );
  }

  getData();
});

router.post("/invite/accept", (req, res) => {
  var from_group = req.body.from_group;
  //  var from_user = req.body.from_user;
  var to_user = req.body.to_user;
  var message = "그룹에서 당신을 초대하였습니다.";

  async function insertData(group, user) {
    var deletesql =
      "DELETE FROM GroupInvite WHERE from_group = ? and to_user = ?; ";
    var sqlUpdateUser = "UPDATE User SET group_id = ? WHERE id = ?; ";
    var sqlSelect = "SELECT * FROM homekippa.User WHERE id = ?; ";
    db.query(
      deletesql + sqlUpdateUser + sqlSelect,
      [from_group.id, to_user.id, from_group.id, to_user.id, to_user.id],
      (err, result) => {
        if (err) {
          console.log("수락 실패", err);
        } else {
          console.log("수락 성공", result);
          resultCode = 200;
          message = "유저정보 GET 성공";
          name = result[2][0].name;
          id = result[2][0].id;
          group_id = result[2][0].group_id;
          image = result[2][0].image;
          birth = result[2][0].birth;
          phone = result[2][0].phone;
          email = result[2][0].email;


          res.json({
            code: resultCode,
            message: message,
            name,
            id,
            group_id,
            image,
            birth,
            phone,
            email,
          });
        }
      }
    );
  }

  insertData(from_group.id, to_user.id);
});

router.get("/image", (req, res) => {
  console.log("api,,,,,,,,");
  console.log(req.query.apiName);
  var filePath = req.query.apiName;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      res.end(null);
    } else {
      console.log(filePath);
      console.log(data);
      res.end(data);
    }
  });
});

router.post(
  "/add/cover",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.body.groupId;
    var cover = "./images/" + req.file.filename;
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Group SET cover = ? WHERE id = ?";
      db.query(sqlUpdate, [cover, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "커버변경 성공";
          send();
        }
      });
    }

    function send() {
      console.log(req.file);
      console.log(req.body);
      res.json({
        code: resultCode,
        message: message,
      });
    }

    updateData();
  });

  router.post("/reset/cover", (req, res) => {
    var id = req.query.groupId;
    var cover = "./images/" + "group_cover_default.jpeg";
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Group SET cover = ? WHERE id = ?";
      db.query(sqlUpdate, [cover, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "커버변경 성공";
          send();
        }
      });
    }

    function send() {
      console.log(req.query);
      res.json({
        code: resultCode,
        message: message,
      });
    }

    updateData();
  });

  router.post(
    "/modify/photo",
    multer({
      storage: storage,
    }).single("upload"),
    (req, res) => {
      var id = req.body.groupId;
      var image = "./images/" + req.file.filename;
      var resultCode = 404;
      var message = "에러 발생";

      function updateData() {
        var sqlUpdate = "UPDATE homekippa.Group SET image = ? WHERE id = ?";
        db.query(sqlUpdate, [image, id], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "이미지변경 성공";
            send();
          }
        });
      }

      function send() {
        console.log(req.file);
        console.log(req.body);
        res.json({
          code: resultCode,
          message: message,
        });
      }

      updateData();
    });

    router.post("/reset/photo", (req, res) => {
      var id = req.query.groupId;
      var image = "./images/" + "group_profile_default.jpg";
      var resultCode = 404;
      var message = "에러 발생";

      function updateData() {
        var sqlUpdate = "UPDATE homekippa.Group SET image = ? WHERE id = ?";
        db.query(sqlUpdate, [image, id], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "이미지변경 성공";
            send();
          }
        });
      }

      function send() {
        console.log(req.query);
        res.json({
          code: resultCode,
          message: message,
        });
      }

      updateData();
    });

    router.post("/modify/name", (req, res) => {
      var id = req.query.groupId;
      var name = req.query.Name;
      var resultCode = 404;
      var message = "에러 발생";

      function updateData() {
        var sqlUpdate = "UPDATE homekippa.Group SET name = ? WHERE id = ?";
        db.query(sqlUpdate, [name, id], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "이름변경 성공";
            send();
          }
        });
      }

      function send() {
        console.log(req.query);
        res.json({
          code: resultCode,
          message: message,
        });
      }

      updateData();
    });

    router.post("/modify/intro", (req, res) => {
      var id = req.query.groupId;
      var intro = req.query.Intro;
      var resultCode = 404;
      var message = "에러 발생";

      function updateData() {
        var sqlUpdate = "UPDATE homekippa.Group SET introduction = ? WHERE id = ?";
        db.query(sqlUpdate, [intro, id], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "설명변경 성공";
            send();
          }
        });
      }

      function send() {
        console.log(req.query);
        res.json({
          code: resultCode,
          message: message,
        });
      }

      updateData();
    });

    router.post("/modify/address", (req, res) => {
      var id = req.query.groupId;
      var address = req.query.Address;
      var area = req.query.Area;
      var resultCode = 404;
      var message = "에러 발생";

      function updateData() {
        var sqlUpdate = "UPDATE homekippa.Group SET address = ?, area = ? WHERE id = ?";
        db.query(sqlUpdate, [address, area, id], (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "이름변경 성공";
            send();
          }
        });
      }

      function send() {
        console.log(req.query);
        res.json({
          code: resultCode,
          message: message,
        });
      }

      updateData();
    });

router.post(
  "/add/photo",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.body.userId;
    var name = req.body.groupName;
    var area = req.body.area;
    var tag = createTag();
    var image = "./images/" + req.file.filename;
    var address = req.body.groupAddress;
    var cover = "./images/" + "group_cover_default.jpeg";
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
        "INSERT INTO homekippa.Group (name, tag, image, address, introduction, cover, area) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        sqlInsert,
        [name, tag, image, address, introduction, cover, area],
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
          send();
        }
      });
    }

    function send() {
      console.log(req.file);
      console.log(req.body);
      res.json({
        code: resultCode,
        message: message,
      });
    }

    checkDuplication();
  }
);

router.post("/add", (req, res) => {
  var id = req.body.userId;
  var name = req.body.groupName;
  var area = req.body.area;
  var tag = createTag();
  var image =
  "./images/" + "group_profile_default.jpg";
  var address = req.body.groupAddress;
  var cover = "./images/" + "group_cover_default.jpeg";
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
      "INSERT INTO homekippa.Group (name, tag, image, address, introduction, cover, `area`) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [name, tag, image, address, introduction, cover, area],
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
        send();
      }
    });
  }

  function send() {
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  }

  checkDuplication();
});

router.get("/list/filter", (req, res) => {
  var filter = '%' + req.query.searchFilter + '%';
  var resultCode = 404;
  var message = "에러 발생";

  console.log(filter);
  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Group WHERE (name LIKE ?)";
    db.query(sqlSelect, filter, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        resultCode = 200;
        message = "그룹 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData();
});

module.exports = router;
