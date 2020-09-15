const express = require('express');

const app = express();
const PORT = process.env.PORT = 3000;

app.use(express.static('public'));

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
  
  app.get('/users', (req, res) => {
     console.log('who get in here/users');
     res.json(users)
  });
  
  app.post('/post', (req, res) => {
     console.log('who get in here post /users');
     var inputData;
  
     req.on('data', (data) => {
       inputData = JSON.parse(data);
     });
  
     req.on('end', () => {
       console.log("user_id : "+inputData.user_id + " , name : "+inputData.name);
     });
  
     res.write("OK!");
     res.end();
  });

app.listen(PORT, () => {
  console.log('Server is running at:',PORT);
});