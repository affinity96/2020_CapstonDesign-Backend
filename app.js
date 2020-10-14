const express = require('express');
var admin = require('firebase-admin');
var serviceAccount = require("./path/to/homekippa-c2f26-firebase-adminsdk-ffxqb-629c2e2eec.json");

const mysql = require('mysql');
const dbconfig = require('./config/database.js');
const connection = mysql.createConnection(dbconfig);

const app = express();
const PORT = process.env.PORT = 3000;
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://homekippa-c2f26.firebaseio.com"
});

app.post('/uid', (req, res) => {
  var uid = req.body.uid;

  console.log("uid" + uid);
  admin.auth().getUser(uid)
    .then(function(){
      res.send(200, {"result": true});
      console.log(true);
    })
    .catch(function(error){
      res.send(200, {"result": false});
      console.log(false);
  });
});

app.get('/user', (req, res) => {
  console.log('who get in here/users');
  res.json(users)
});

app.post('/user/add', (req, res) => {
  var name = req.body.userName;
  var id = req.body.userId;
  var phone = "+82" + req.body.userPhone;
  var email = req.body.userEmail;
  var pw = req.body.userPW;

  var resultCode = 404;
  var message = '에러 발생';

  insertData().then(function(){
    console.log(req.body);
    res.json({
      'code': resultCode,
      'message': message
    });
  });

  async function insertData() {
    admin.auth().createUser({
      uid: id,
      email,
      phoneNumber: phone,
      password: pw,
    })
      .then(function(userRecord){
        console.log('User 생성 성공:', userRecord.uid);
        var sql = 'INSERT INTO User (id, name, phone, email) VALUES (?, ?, ?, ?)';
        connection.query(sql, [id, name, phone, email], (err, result) => {
          if (err) {
            console.log(err);
            admin.auth().deleteUser(id)
          } else {
            resultCode = 200;
            message = '회원가입 성공';
          }
        })
      })
      .catch(function(error){
        console.log('User 생성 실패:', error);
      })
  }
});

app.listen(PORT, () => {
  console.log('Server is running at:', PORT);
});