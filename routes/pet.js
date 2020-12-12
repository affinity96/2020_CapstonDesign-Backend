var express = require("express");
var fcm = require("../functions/firebase");
var router = express.Router();

var webdriver = require("selenium-webdriver");

var chromeCapabilities = webdriver.Capabilities.chrome();

var chromeOptions = {
  args: [
    "--headless",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-gpu",
  ],
};
chromeCapabilities.set("chromeOptions", chromeOptions);

const By = webdriver.By;

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

var path = require("path");
const multer = require("multer");
const multerconfig = require("../config/multer.js");
storage = multer.diskStorage(multerconfig);

router.get("/", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Pet WHERE group_id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        resultCode = 200;
        message = "펫 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData().then(function () {
    console.log(id);
  });
});

router.post("/add", (req, res) => {

  var reg_num = req.body.petNum;

  console.log(reg_num);
  var message = "에러 발생";
  var resultCode = 404;

  var url =
    "https://www.animal.go.kr/front/awtis/record/recordConfirmList.do?menuNo=2000000011";

  var driver = new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .setChromeOptions(chromeOptions)
    .build();
  var petName = "";
  var petGender = "";
  var petSpecies = "";
  var petNeutralization = "";

  driver.get(url);

  driver
    .findElement(
      By.xpath(
        "/html/body/div/div[5]/div[2]/div[2]/div[1]/ul/li/dl[1]/dd/input"
      )
    )
    .sendKeys(reg_num);
  try {
  } catch {}

  driver
    .findElement(
      By.xpath("/html/body/div/div[5]/div[2]/div[2]/div[1]/ul/li/dl[2]/dd/a")
    )
    .then(function (value) {
      value.click().then(function (value) {
        driver.sleep(3000).then(function (value) {
          var pet_name = driver.findElement(
            By.xpath(
              "/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[1]"
            )
          );
          pet_name
            .then(function (value) {
              value.getText().then(function (pet_name) {
                console.log(pet_name);
                petName = pet_name;
              });
            })
            .catch(error => {
              driver.quit();
              console.log(error);
              console.log(1);
            });

          var pet_gender = driver
            .findElement(
              By.xpath(
                "/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[2]/td[2]"
              )
            )
            .then(function (value) {
              value.getText().then(function (pet_gender) {
                console.log(pet_gender);
                petGender = pet_gender;
              });
            });

          var pet_species = driver
            .findElement(
              By.xpath(
                "/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[3]/td[1]"
              )
            )
            .then(function (value) {
              value.getText().then(function (pet_species) {
                console.log(pet_species);
                petSpecies = pet_species;
              });
            });

          var pet_neutralization = driver
            .findElement(
              By.xpath(
                "/html/body/div/div[5]/div[2]/div[2]/div[2]/table/tbody/tr[3]/td[2]"
              )
            )
            .then(function (value) {
              value
                .getText()
                .then(function (pet_neutralization) {
                  console.log(pet_neutralization);
                  petNeutralization = pet_neutralization;
                })
                .then(function (value) {
                  driver.quit();
                  resultCode = 200;
                  message = "반려동물 등록번호 조회 성공";

                  res.json({
                    resultCode: resultCode,
                    petName: petName,
                    petGender: petGender,
                    petSpecies: petSpecies,
                    petNeutralization: petNeutralization,
                    message: message,
                  });
                });
            });
        });
      });
    })
    .catch(error => {
      driver.quit();
      console.log(error);
      console.log("error");
    });
});

router.post(
  "/add/des/photo",
  multer({
  storage: storage,
  }).single("upload"), (req, res) => {

  var group_id = req.body.GroupId;
  var name = req.body.petName;
  var birth = req.body.petBirth; //
  var image = "./images/" + req.file.filename;
  var species = req.body.petSpecies; // 종
  var reg_num = req.body.petRegNum; // 등록번호
  var gender = req.body.petGender; // 성
  var neutrality = req.body.petNeutralization; // 중성
  var resultCode = 404;
  var message = "에러 발생";

  if(neutrality == '중성'){
    console.log("here");
    neutrality = 1;
  }else{
    console.log("here2");
    neutrality = 0;
  }

  if(gender == '수컷'){
    console.log("here3");
    gender = 1;
  }else{
    console.log("here4");
    gender =0;
  }

  async function insertData(){
    var sqlInsert =
      "INSERT INTO homekippa.Pet (group_id, name, birth, image, species, reg_num, gender, neutrality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [group_id, name, birth, image, species, reg_num, gender, neutrality],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "펫생성 성공";
          addNewPet();
        }
      }
    );
  }

  insertData();
  function addNewPet()
  {
    console.log(req.file);
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.post("/add/des", (req, res) => {
  console.log(req.body);

  var group_id = req.body.GroupId;
  var name = req.body.petName;
  var birth = req.body.petBirth; //
  var image = "./images/" + "pet_profile_default.jpg";
  var species = req.body.petSpecies; // 종
  var reg_num = req.body.petRegNum; // 등록번호
  var gender = req.body.petGender; // 성
  var neutrality = req.body.petNeutralization; // 중성
  var resultCode = 404;
  var message = "에러 발생";

  if(neutrality == '중성'){
    console.log("here");
    neutrality = 1;
  }else{
    console.log("here2");
    neutrality = 0;
  }

  if(gender == '수컷'){
    console.log("here3");
    gender = 1;
  }else{
    console.log("here4");
    gender =0;
  }

  async function insertData(){
    var sqlInsert =
      "INSERT INTO homekippa.Pet (group_id, name, birth, image, species, reg_num, gender, neutrality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [group_id, name, birth, image, species, reg_num, gender, neutrality],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "펫생성 성공";
          addNewPet();
        }
      }
    );
  }

  insertData();
  function addNewPet()
  {
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.get("/reports", (req, res) => {
  var reportList = [];
  var resultCode = 404;
  var message = "에러 발생";
  var pet_id = req.query.petId;
  console.log("잉?", req.query);
  function getDailyWorkData() {
    return new Promise(function (resolve, reject) {
      var sqlSelect = "SELECT * FROM homekippa.Report WHERE pet_id = ? ORDER BY time ASC";
      db.query(sqlSelect,  pet_id, (err, result) => {

        if (err) {
          console.log(err);
        } else { 
          console.log("ㅣㄹ절트", result);
          resolve(result);
        }
      });
    });
  }


  //Execute
  getDailyWorkData()
    .then(function (data) {
      return data;
    })
    .then(function (data) {
      reportList = data;
      console.log("잉", reportList);
      res.json( reportList );
    });
})

router.post("/reports/add", (req, res) => {

  var group_id = req.body.GroupId;
  var pet_id = req.body.PetId;
  var title = req.body.dailyWorkName;
  var done = false;
  var alarm = req.body.dailyWorkAlarm;
  var desc = req.body.dailyWorkDesc;
  var time = req.body.dailyWorkTime;
  var resultCode = 404;
  var message = "에러 발생";

  async function insertData() {
    var sqlInsert =
      "INSERT INTO homekippa.Report (group_id, pet_id, title, alarm, `desc`, `time`, done) VALUES (?, ?, ?, ?, ?, ?, ?);";
    db.query(
      sqlInsert,
      [group_id, pet_id, title, alarm, desc, time, done],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "그룹추가성공";
          addNewReport();
        }
      }
    );
  }
  insertData();
  function addNewReport() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.put("/reports/done", (req, res) => {

  var id = req.query.id;
  console.log("이게..", id);
  var curTime = new Date();
  var hour = curTime.getHours();
  var min = curTime.getMinutes();
  var done_user_id = req.query.done_user_id;
  var done_user_image = req.query.done_user_image;
  console.log("시가아안", hour, min);
  async function updateData() {
    var sqlUpdate =
      "UPDATE homekippa.Report SET `done` = 1 WHERE `id` = " + id + ";";
    var sqlUpadte2 = 
      "UPDATE homekippa.Report SET `done_time` = '" + hour + ":"+ min + "' WHERE `id` = "+id + ";";
    var sqlUpdate3 = 
      "UPDATE homekippa.Report SET `done_user_id` = '" +done_user_id + "' WHERE `id` = " + id + ";";
    var sqlUpdate4 = 
      "UPDATE homekippa.Report SET `done_user_image` = '" +done_user_image + "' WHERE `id` = " + id + ";";


     
    db.query(
      sqlUpdate + sqlUpadte2 + sqlUpdate3 + sqlUpdate4,
      (err, result) => {
        if (err) {
          console.log(err);
          console.log("에러?")
          doneReport(404, "에러 발생");
        } else {
          console.log("성공?")
          doneReport(200, "일과완료성공");
        }
      }
    );
  }
  updateData().then(() => {
    var sqlGroup = "SELECT title, group_id FROM homekippa.Report WHERE id = ?"
    db.query(sqlGroup, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        
        fcm.sendMessageToGroup(
          result[0].group_id,
          "예정된 " + result[0].title + " 일과가 완료되었습니다!",
          result[0].group_id
        );

        console.log("to firebase");
      }
    })
  });

  function doneReport(resultCode, message) {
    res.json({
      code: resultCode,
      message: message,
    })
  }
});

router.post(
  "/modify/photo",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.body.petId;
    var image = path.join(__dirname, "..", "images/") + req.file.filename;
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET image = ? WHERE id = ?";
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
    var id = req.query.petId;
    var image = path.join(__dirname, "..", "images/") + "pet_profile_default.jpg";
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET image = ? WHERE id = ?";
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
    var id = req.query.petId;
    var name = req.query.name;
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET name = ? WHERE id = ?";
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

  router.post("/modify/species", (req, res) => {
    var id = req.query.petId;
    var species = req.query.species;
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET species = ? WHERE id = ?";
      db.query(sqlUpdate, [species, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "종변경 성공";
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

  router.post("/modify/gender", (req, res) => {
    var id = req.query.petId;
    var gender = req.query.gender;
    var resultCode = 404;
    var message = "에러 발생";    

    if(gender == '수컷'){
      gender = 1;
    } else {
      gender = 0;
    }

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET gender = ? WHERE id = ?";
      db.query(sqlUpdate, [gender, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "성별변경 성공";
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

  router.post("/modify/neutering", (req, res) => {
    var id = req.query.petId;
    var neutrality = req.query.neutering;
    var resultCode = 404;
    var message = "에러 발생";

    if(neutrality == '중성'){
      neutrality = 1;
    } else {
      neutrality = 0;
    }

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET neutrality = ? WHERE id = ?";
      db.query(sqlUpdate, [neutrality, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "중성화 여부 변경 성공";
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

  router.post("/modify/birth", (req, res) => {
    var id = req.query.petId;
    var birth = req.query.birth;
    var resultCode = 404;
    var message = "에러 발생";

    function updateData() {
      var sqlUpdate = "UPDATE homekippa.Pet SET birth = ? WHERE id = ?";
      db.query(sqlUpdate, [birth, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "생일 변경 성공";
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

module.exports = router;
