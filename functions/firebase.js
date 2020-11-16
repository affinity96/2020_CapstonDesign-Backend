var admin = require("firebase-admin");
var serviceAccount = require("../path/to/homekippa-c2f26-firebase-adminsdk-ffxqb-629c2e2eec.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://homekippa-c2f26.firebaseio.com",
});

var messaging = admin.messaging();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

// message_code: GROUP_INVITE
const TITLE = "홈키파";

async function sendMessage(from, to, content) {
    let query = "SELECT token FROM homekippa.User WHERE id = ?"

    db.query(query, to, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("result: ", result[0].token);

          messaging.send({
              notification: {
                  title: TITLE,
                  body: content
              },
              token: result[0].token
          }).then((response) => {
              console.log("message sent", response);
          }).catch((error) => {
              console.log("message error", error);
          });
        }
    });
}

exports.sendMessage = sendMessage;