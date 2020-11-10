var express = require("express");
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

router.post("/add/des", (req, res) => {
  var id = req.body.groupId;
  var name = req.body.petName;
  var birth = req.body.petBirth; //
  // 이미지 var image = req.body.petImage;
  var species = req.body.petSpecies; // 종
  var reg_num = req.body.petRegNum; // 등록번호
  var gender = req.body.petGender; // 성
  var neutrality = req.body.petNeutralization; // 중성
  var resultCode = 404;
  var message = "에러 발생";

  insertData(() => {
    var sqlInsert =
      "INSERT INTO homekippa.Pet (id, name, birth, species, reg_num, gender, neutrality) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sqlInsert,
      [id, name, birth, species, reg_num, gender, neutrality],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "펫생성 성공";
        }
      }
    );
  });

  insertData().then(function () {
    console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  });
});

router.post("/reports/add", (req, res) => {
  var group_id = req.body.GroupId;
  var pet_id = req.body.PetId;
  var title = req.body.dailyWorkName;

  var alarm = req.body.dailyWorkAlarm;
  var desc = req.body.dailyWorkDesc;
  var time = req.body.dailyWorkTime;
  var resultCode = 404;
  var message = "에러 발생";

  async function insertData() {
    var sqlInsert =
      "INSERT INTO homekippa.Report (group_id, pet_id, title, alarm, `desc`, `time`) VALUES (?, ?, ?, ?, ?, ?);";
    db.query(
      sqlInsert,
      [group_id, pet_id, title, alarm, desc, time],
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

module.exports = router;
