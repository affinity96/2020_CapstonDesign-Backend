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

app.get('/user', (req, res) => {
  console.log('who get in here/users');
  res.json(users)
});

app.post('/user/add', (req, res) => {
  var age = req.body.userAge;
  var name = req.body.userName;
  var idToken = req.body.userIdToken;
  var uid = '';

  console.log("age : " + age + " , name : " + name + " , idToken : " + idToken);

  insertData();

  async function insertData() {
    await admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
        uid = decodedToken.uid;
        console.log("uid : " + uid);
      }).catch(function (error) {
        console.log(error);
      })

    var sql = 'INSERT INTO User (age, name, id) VALUES (?, ?, ?)';
    await connection.query(sql, [age, name, uid], (err, result) => {
      var resultCode = 404;
      var message = '에러 발생';

      if (err) {
        console.log(err);
      } else {
        resultCode = 200;
        message = '회원가입 성공';
      }
      res.json({
        'code': resultCode,
        'message': message
      });
    })
  }
});

app.listen(PORT, () => {
  console.log('Server is running at:', PORT);
});