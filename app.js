const express = require("express");
var admin = require("firebase-admin");
var serviceAccount = require("./path/to/homekippa-c2f26-firebase-adminsdk-ffxqb-629c2e2eec.json");
const AWS = require("aws-sdk");

var axios = require("axios");
var cheerio = require("cheerio");
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
const dbconfig = require("./config/database.js");
const db = mysql.createConnection(dbconfig);

const PORT = (process.env.PORT = 3000);
const bodyParser = require("body-parser");

const app = express();
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const petRouter = require("./routes/pet");
const postRouter = require("./routes/post");

app.use("/user", userRouter);
app.use("/group", groupRouter);
app.use("/pet", petRouter);
app.use("/post", postRouter);

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./images/");
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    },
  }),
});

function handleDisconnect() {
  db.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return handleDisconnect();
    } else {
      throw err;
    }
  });
}

// 일단 주석
// handleDisconnect();

const endpoint = new AWS.Endpoint("https://kr.object.ncloudstorage.com");
const region = "kr-standard";
const access_key = "C924392C47B5599B416E";
const secret_key = "0ADD8A0782AF8A09A3F3E4718AB48B2E24C5FBFB";

const S3 = new AWS.S3({
  endpoint: endpoint,
  region: region,
  credentials: {
    accessKeyId: access_key,
    secretAccessKey: secret_key,
  },
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://homekippa-c2f26.firebaseio.com",
});

app.post("/uid", (req, res) => {
  var uid = req.body.uid;
  // console.log("uid" + uid);
  admin
    .auth()
    .getUser(uid)

    .then(function () {
      res.send(200, { result: true });
      console.log(true);
    })
    .catch(function (error) {
      res.send(200, { result: false });
      console.log(false);
    });
});

app.listen(PORT, () => {
  console.log("Server is running at:", PORT);
});
