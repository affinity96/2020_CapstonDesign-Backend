const express = require('express');
var admin = require('firebase-admin');
var serviceAccount = require("./path/to/homekippa-c2f26-firebase-adminsdk-ffxqb-629c2e2eec.json");

const mysql = require('mysql');
const dbconfig = require('./config/database.js');
const db = mysql.createConnection(dbconfig);

const app = express();
const PORT = process.env.PORT = 3000;
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const multer = require('multer');
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'HOMEKIPPA_BACKEND/images/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

function handleDisconnect() {
  db.connect(function(err) {
    if(err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  db.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      return handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

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
  var birth = req.body.userBirth;
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
    var sql = 'INSERT INTO User (id, name, phone, email, birth) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [id, name, phone, email, birth], (err, result) => {
      if (err) {
        console.log(err);
        admin.auth().deleteUser(id)
      } else {
        resultCode = 200;
        message = '회원가입 성공';
      }
    });
  }
});

app.post('/group/add', (req, res) => {
  var id = req.body.userId;
  var name = req.body.groupName;
  var tag = createTag();
  // 이미지 var image = req.body.groupImage;
  var address = req.body.groupAddress;
  // 배경사진 var background = req.body.groupBackground;
  var introduction = req.body.groupIntroduction;
  var resultCode = 404;
  var message = '에러 발생';

  function createTag() {
    return randomTag = Math.floor(Math.random() * 10000);
  };

  async function checkDuplication() {
    var checkCode = true;

    while (checkCode) {
      checkCode = await searchTag();
      if(checkCode){
        tag = await createTag();
      } else {
        await insertData();
      };
    };
  };

  function searchTag() {
    var sqlSelect = 'SELECT tag FROM homekippa.Group WHERE name = ? and tag = ?';
    db.query(sqlSelect, [name, tag], (err, result) => {
      if (err) {
        console.log(err);
        return false;
      } else if (result[0]) {
        return true;
      } else {
        return false;
      };
    });
  };

  function insertData() {
    var sqlInsert = 'INSERT INTO homekippa.Group (name, tag, address, introduction) VALUES (?, ?, ?, ?)';
    db.query(sqlInsert, [name, tag, address, introduction], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        updateData(result.insertId);
      }
    });
  };

  function updateData(groupId) {
    var sqlUpdate = 'UPDATE homekippa.User SET group_id = ? WHERE id = ?';
    db.query(sqlUpdate, [groupId, id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        resultCode = 200;
        message = '그룹생성 성공';
      }
    });
  };

  checkDuplication().then(function(){
    console.log(req.body);
    res.json({
      'code': resultCode,
      'message': message
    });
  });

});

app.post('/pet/add', (req, res) => {
  var id = req.body.groupID;
  var name = req.body.petName;
  var birth = req.body.petBirth;
  // 이미지 var image = req.body.petImage;
  var species = req.body.petSpecies;
  var reg_num = req.body.petNum;
  var gender = req.body.petGender;
  var neutrality = req.body.petNeu;
  var resultCode = 404;
  var message = '에러 발생';

  insertData(() => {
    var sqlInsert = 'INSERT INTO homekippa.Pet (id, name, birth, species, reg_num, gender, neutrality) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sqlInsert, [id, name, birth, species, reg_num, gender, neutrality], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        resultCode = 200;
        message = '펫생성 성공';
      }
    });
  });

  insertData().then(function(){
    console.log(req.body);
    res.json({
      'code': resultCode,
      'message': message
    });
  });

});

// 이미지 업로드
app.post('/upload', upload.single('img'), (req, res) => {

});

app.listen(PORT, () => {
  console.log('Server is running at:', PORT);
});