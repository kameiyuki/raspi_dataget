const express = require('express');
const mysql = require('mysql');
const ejs=require('ejs');
const bodyParser = require('body-parser');
var app = express();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'kamei',
    password: 'Pl0h4h55@',
    database: 'python_db'
  });

connection.connect((err) => {
if (err) {
    console.log('error connecting: ' + err.stack);
    return;
}
console.log('success');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
  connection.query(
    'SELECT * FROM bme280',
    (error, results) => {
        var array_time = [];
        var array_data = [];
        for(var i=0;i<Object.keys(results).length;i++){
            var day=new Date(results[i]["time"])
            array_time[i]=day.getHours()+":"+day.getMinutes();
            array_data[i]=results[i]["tem"]
            //console.log(array_time[i])

        }
      console.log(day.getDate());
      console.log(day.getMonth()+1);
      console.log(day.getMinutes());
      res.render('./hello.ejs',{
        array_time:array_time,
        array_data:array_data
      });
    }
  );
});

app.get('/login',(req,res) => {
    res.render('./login.ejs');
  });

app.post('/login',(req,res) => {
    console.log(req.body.username);
    res.redirect('/');
  })
app.listen(3000);