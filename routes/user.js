var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

router.get("/", (req, res) => {
  var id = req.query.userId;
  var name = "";
  var group_id = "";
  var image = "";
  var birth = "";
  var phone = "";
  var email = "";
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.User WHERE id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result[0]);
        resultCode = 200;
        message = "유저정보 GET 성공";
        name = result[0].name;
        group_id = result[0].group_id;
        image = result[0].image;
        birth = result[0].birth;
        phone = result[0].phone;
        email = result[0].email;

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
    });
  }

  queryData();
});

router.post("/add", (req, res) => {
  var name = req.body.userName;
  var id = req.body.userId;
  var phone = "+82" + req.body.userPhone;
  var email = req.body.userEmail;
  var birth = req.body.userBirth;
  var resultCode = 404;
  var message = "에러 발생";

  insertData().then(function () {
    //  console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  });

  async function insertData() {
    var sql =
      "INSERT INTO User (id, name, phone, email, birth) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [id, name, phone, email, birth], (err, result) => {
      if (err) {
        //console.log(err);
        admin.auth().deleteUser(id);
      } else {
        resultCode = 200;
        message = "회원가입 성공";
      }
    });
  }
});

router.get("/group", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.User WHERE group_id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        resultCode = 200;
        message = "사용자 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData();
});

router.get("/list/filter", (req, res) => {
  var filter = '%' + req.query.searchFilter + '%';
  var resultCode = 404;
  var message = "에러 발생";

  console.log(filter);
  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.User WHERE ((name LIKE ?) OR (phone LIKE ?) OR (email LIKE ?)) AND (group_id is NULL)";
    db.query(sqlSelect, [filter, filter, filter], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        resultCode = 200;
        message = "사용자 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData();
});

module.exports = router;
