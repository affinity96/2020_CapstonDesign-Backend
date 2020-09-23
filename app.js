const express = require('express');
// db test
const mysql = require('mysql');
const dbconfig = require('./config/database.js');
const connection = mysql.createConnection(dbconfig);

const app = express();
const PORT = process.env.PORT = 3000;
const bodyParser= require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: '김재학'
  },
  {
    id: 2,
    name: '모현민'
  },
  {
    id: 3,
    name: '박현민'
  },
  {
    id: 4,
    name: '이시은'
  },
  {
    id: 5,
    name: '이은창'
  }
]

//첫 번째 미들웨어
app.use(function(req, res, next) {

    console.log('미들웨어 호출 됨');
    var approve ={'approve_id':'NO','approve_pw':'NO'};


    var paramId = req.body.id;
    var paramPassword = req.body.password;
    console.log('id : '+paramId+'  pw : '+paramPassword);

    //아이디 일치여부 flag json 데이터.
    for(let i = 0; i < users.length; i++){
      if(users[i]['id'] == paramId && users[i]['name'] == paramPassword){
        approve.approve_id = 'OK';
        approve.approve_pw = 'OK';
        console.log('login success');
        break;
      }
    }
    res.send(approve);

});
  
  app.get('/users', (req, res) => {
     console.log('who get in here/users');
     res.json(users)
  });

  app.get('/db', (req,res) => {
    connection.query('SELECT * from Users', (error, rows) => {
      if (error) throw error;
      console.log('User info is: ', rows);
      res.send(rows);
    });
  });

app.listen(PORT, () => {
  console.log('Server is running at:',PORT);
});
