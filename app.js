const express = require('express');
var admin = require('firebase-admin');
var serviceAccount = require("./path/to/homekippa-c2f26-firebase-adminsdk-ffxqb-629c2e2eec.json");
const AWS = require('aws-sdk');

var axios = require("axios");
var cheerio = require('cheerio');
var webdriver = require('selenium-webdriver');

var chromeCapabilities = webdriver.Capabilities.chrome();

var chromeOptions = {'args': ['--headless', '--disable-dev-shm-usage','--no-sandbox', '--disable-gpu']};
chromeCapabilities.set('chromeOptions',chromeOptions);




const By = webdriver.By;

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
  db.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  db.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      return handleDisconnect();
    } else {
      throw err;
    }
  });
}

// 일단 주석
// handleDisconnect();

const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const access_key = 'C924392C47B5599B416E';
const secret_key = '0ADD8A0782AF8A09A3F3E4718AB48B2E24C5FBFB';

const S3 = new AWS.S3({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_key
  }
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://homekippa-c2f26.firebaseio.com"
});

app.post('/uid', (req, res) => {
  var uid = req.body.uid;

  console.log("uid" + uid);
  admin.auth().getUser(uid)
    .then(function () {
      res.send(200, { "result": true });
      console.log(true);
    })
    .catch(function (error) {
      res.send(200, { "result": false });
      console.log(false);
    });
});

app.get('/user', (req, res) => {
  var id = req.query.userId;
  var name = '';
  var group_id = '';
  var image = '';
  var birth = '';
  var phone = '';
  var email = '';
  var resultCode = 404;
  var message = '에러 발생';

  async function queryData() {
    var sqlSelect = 'SELECT * FROM homekippa.User WHERE id = ?';
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = '유저정보 GET 성공';
        name = result[0].name;
        group_id = result[0].group_id;
        image = result[0].image;
        birth = result[0].birth;
        phone = result[0].phone;
        email = result[0].email;

        res.json({
          'code': resultCode,
          'message': message,
          'userName': name,
          'userId': id,
          'groupId': group_id,
          'userImage': image,
          'userBirth': birth,
          'userPhone': phone,
          'userEmail': email
        });
      }
    });
  };

  queryData().then(function () {
    console.log(req.query.userId);
/*    res.json({
      'code': resultCode,
      'message': message,
      'userName': name,
      'userId': id,
      'groupId': group_id,
      'userImage': image,
      'userBirth': birth,
      'userPhone': phone,
      'userEmail': email
    });*/
  });
});

app.post('/user/add', (req, res) => {
  var name = req.body.userName;
  var id = req.body.userId;
  var phone = "+82" + req.body.userPhone;
  var email = req.body.userEmail;
  var birth = req.body.userBirth;
  var resultCode = 404;
  var message = '에러 발생';

  insertData().then(function () {
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


app.get('/group', (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = '에러 발생';

  async function queryData() {
    var sqlSelect = 'SELECT * FROM homekippa.Group WHERE id = ?';
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = '그룹 정보 GET 성공';

        res.json({
          'code': resultCode,
          'message': message,
          'groupName': result[0].name,
          'groupId': result[0].id,
          'groupImage': result[0].image,
          'groupAddress': result[0].address,
          'groupIntro': result[0].introduction,
          'groupBackground': result[0].background,
          'groupTag': result[0].tag
        });
      }
    });
  };

  queryData().then(function () {
    console.log(id);
  });
});


app.post('/group/add', (req, res) => {
  var id = req.body.userId;
  var name = req.body.groupName;
  var tag = createTag();
  var image = req.body.groupProfileImage;
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
      checkCode = searchTag();
      if(checkCode){
        tag = createTag();
      } else {
        insertData();
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
    var sqlInsert = 'INSERT INTO homekippa.Group (name, tag, address, image, introduction) VALUES (?, ?, ?, ?, ?)';
    db.query(sqlInsert, [name, tag, address, image, introduction], (err, result) => {
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

  checkDuplication().then(function () {
    console.log(req.body);
    res.json({
      'code': resultCode,
      'message': message
    });
  });

});


app.get('/pets', (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = '에러 발생';

  async function queryData() {
    var sqlSelect = 'SELECT * FROM homekippa.Pet WHERE group_id = ?';
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        resultCode = 200;
        message = '그룹 정보 GET 성공';

        res.json(result);
      }
    });
  };

  queryData().then(function () {
    console.log(id);
  });
});


app.post('/pet/add', (req, res) => {


    var reg_num =req.body.petNum;

    console.log(reg_num);
    var message = '에러 발생';

    var url = 'https://www.animal.go.kr/front/awtis/record/recordConfirmList.do?menuNo=2000000011';

    var driver = new webdriver.Builder().withCapabilities(chromeCapabilities).setChromeOptions(chromeOptions).build();
    var petName = '';

    console.log(1);

    driver.get(url);

    driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[1]/ul/li/dl[1]/dd/input")).sendKeys(reg_num);
    console.log(2);

    driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[1]/ul/li/dl[2]/dd/a")).then(function(value){
      console.log(3);
      value.click().then(function(value){
        console.log(4);
        driver.sleep(3000).then(function(value){
          var pet_name = driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[1]"));
          pet_name.then(function(value){
            value.getText().then(function(pet_name){
              console.log(5);
              console.log(pet_name);
            });
          });

          var pet_gender = driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]")).then(function(value){
            value.getText().then(function(pet_gender){
              console.log(6);
              console.log(pet_gender);
            });
          });

          var pet_species = driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[3]/td[1]")).then(function(value){
            value.getText().then(function(pet_species){
              console.log(7);
              console.log(pet_species);
            });
          });

          var pet_neutralization = driver.findElement(By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[3]/td[2]")).then(function(value){
            value.getText().then(function(pet_neutralization){
              console.log(5);
              console.log(pet_neutralization);
            }).then(function(value){
              driver.quit();
            });
          });
        });
      });


//   var id = req.body.groupId;
//   var name = req.body.petName;
//   var birth = req.body.petBirth;
//   // 이미지 var image = req.body.petImage;
//   var species = req.body.petSpecies;
//   var reg_num = req.body.petNum;
//   var gender = req.body.petGender;
//   var neutrality = req.body.petNeu;
//   var resultCode = 404;
//   var message = '에러 발생';

//   insertData(() => {
//     var sqlInsert = 'INSERT INTO homekippa.Pet (id, name, birth, species, reg_num, gender, neutrality) VALUES (?, ?, ?, ?, ?, ?, ?)';
//     db.query(sqlInsert, [id, name, birth, species, reg_num, gender, neutrality], (err, result) => {
//       if (err) {
//         console.log(err);
//       } else {
//         resultCode = 200;
//         message = '펫생성 성공';
//       }
//     });
//   });

//   insertData().then(function () {
//     console.log(req.body);
//     res.json({
//       'code': resultCode,
//       'message': message

    }).catch((error) => {
      console.log(error);
      console.log("error");
     });
});

// 이미지 업로드
app.post('/upload', upload.single('img'), (req, res) => {

});

app.listen(PORT, () => {
  console.log('Server is running at:', PORT);
});
