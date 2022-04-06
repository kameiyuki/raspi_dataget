const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const ejs=require('ejs');
const bodyParser = require('body-parser');
var app = express();
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;


const sess = {
    secret: 'secretsecretsecret',
    cookie: { maxAge: 60 * 1000 },
    resave: false,
    saveUninitialized: false, 
  }
  
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
app.use(session(sess));

passport.use(new LocalStrategy(
    (username, password, done) => {
      if(username !== "kamei"){
        // Error
        return done(null, false);
      } else if(password !== "kamechan") {
        // Error
        return done(null, false);
      } else {
        console.log('success');
        // Success and return user information.
        return done(null, { username: username, password: password});
        
      }
    }
  ));
  
app.use(passport.initialize());
app.use(passport.session());
  
passport.serializeUser((user, done) => {
    console.log('Serialize ...');
    done(null, user);
  });
  
passport.deserializeUser((user, done) => {
    console.log('Deserialize ...');
    done(null, user);
});
  

app.get('/', isAuthenticated,(req, res) => {
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
  



  app.post('/login',
    passport.authenticate('local',{
      failureRedirect: "/login"
    }),
    (req,res) => {
    console.log(req.body);
    res.redirect('./');  
  });
  app.listen(3000);

  


  function isAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
      // 認証済みの場合の処理へ.
      return next();
    }
  
    // 認証していない場合の処理.
    console.warn("not authenticated.");
    response.redirect('./login');
  }