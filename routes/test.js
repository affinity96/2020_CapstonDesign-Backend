const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { post } = require("request");
const db = mysql.createConnection(dbconfig);

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
  });
