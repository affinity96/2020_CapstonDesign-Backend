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
const ALARM_CODE = "GROUP_INVITE";

async function sendMessage(from, to, content, extra) {
    let query = "SELECT token FROM User WHERE id = ?"

    db.query(query, to.id, (err, result) => {
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

    let insertquery = "INSERT INTO Alarm (from_name, to_id, title, content, alarm_code, extra) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(insertquery, [from.name, to.id, TITLE, content, ALARM_CODE, extra], (err, _) => {
      if (err) {
        console.log(err);
      } else {
        console.log("New Alarm Inserted");
      }
    });
}

async function sendMessageToGroup(to, content, extra) {
  let query = "SELECT token FROM User WHERE group_id = ?"
  console.log(content);

  db.query(query, to, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);

        var tokens = [];
        for(i = 0; i < result.length; i++){
          tokens[i] = result[i].token;
        }

        messaging.sendMulticast({
            notification: {
                title: TITLE,
                body: content
            },
            tokens
        }).then((response) => {
            console.log("message sent", response);
        }).catch((error) => {
            console.log("message error", error);
        });
      }
  });

/*  let insertquery = "INSERT INTO Alarm (from_name, to_id, title, content, alarm_code, extra) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(insertquery, [from.name, to.id, TITLE, content, ALARM_CODE, extra], (err, _) => {
    if (err) {
      console.log(err);
    } else {
      console.log("New Alarm Inserted");
    }
  });*/
}

exports.sendMessage = sendMessage;
exports.sendMessageToGroup = sendMessageToGroup;
exports.admin = admin;