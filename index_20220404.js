const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const ejs=require('ejs');
const bodyParser = require('body-parser');
var app = express();
const passport=require('passport');
const { download } = require('express/lib/response');
const LocalStrategy=require('passport-local').Strategy;
const cron = require('node-cron');

var error_id=0;

const sess = {
    secret: 'secretsecretsecret',
    cookie: { maxAge: 60 * 1000 * 10},
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

cron.schedule('0 0 0,6,12,18 * * *', () => connection.query(`select 1`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(sess));
app.use(express.static('public'));

passport.use(new LocalStrategy(
    (username, password, done) => {
        connection.query(`select * from users where username=\"${username}\"`,
        (error,results)=>{
            console.log(`usernme = ${username}`);
            console.log(`password = ${password}`);
            console.log(results[0]);
            console.log(`error=${error}`);
            if(error || !results || typeof results[0]=="undefined"){ 
                return done(null,false);
            } else if(password !== `${results[0]["password"]}`){
                console.log("password miss")
                return done(null,false);
            } else{
                console.log('success');
                // Success and return user information.
                return done(null, { username: username, password: password});
            }
        })
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
    var today=new Date();
    var today_year=today.getFullYear();
    var today_month=("00"+(today.getMonth()+1)).slice(-2);
    var today_day=("00"+today.getDate()).slice(-2);
    var today_time=""+today_year+today_month+today_day
    console.log(`session_username=${req.user.username}`)
    console.log(`select * from ${req.user.username}_${today_time}`);
    connection.query(
    `select * from ${req.user.username}_${today_time}`,
    (error, results) => {
      if(error){
        console.log(error);
        res.render('./error.ejs');
      }
      else{
        var array_time = [];
        var array_data = [];
        for(var i=0;i<Object.keys(results).length;i++){
            var day=new Date(results[i]["time"])
            array_time[i]=day.getHours()+":"+day.getMinutes();
            array_data[i]=results[i]["tem"]
            //console.log(array_time[i])
        }
        
        //console.log(day.getDate());
        //console.log(day.getMonth()+1);
        //console.log(day.getMinutes());
        res.render('./hello.ejs',{
          array_time:array_time,
          array_data:array_data
        });
      }
    }
  );
});


app.post('/', isAuthenticated,(req, res) => {
  var today_time=req.body["day"];
  console.log(`select * from ${req.user.username}_${today_time}`);
  connection.query(
  `select * from ${req.user.username}_${today_time}`,
  (error, results) => {
    if(error){
      console.log(error);
      res.render('./error.ejs');
    }
    else{
      var array_time = [];
      var array_data = [];
      for(var i=0;i<Object.keys(results).length;i++){
          var day=new Date(results[i]["time"])
          array_time[i]=day.getHours()+":"+day.getMinutes();
          array_data[i]=results[i]["tem"]
          //console.log(array_time[i])
      }
      //console.log(day.getDate());
      //console.log(day.getMonth()+1);
      //console.log(day.getMinutes());
      res.render('./hello.ejs',{
        array_time:array_time,
        array_data:array_data
      });
    }
  }
);
});

app.get('/login',(req,res) => {
    error_id=0;
    console.log(`errorid=${error_id}`);
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

  app.get('/signup',(req,res) => {
    console.log(`errorid=${error_id}`);
    res.render('./signup.ejs',{
        error_id:error_id
    });
  });

  app.post('/signup',(req,res) => {
    error_id=0;
    console.log(`errorid=${error_id}`);
    console.log(req.body);
    for(var key in req.body){
        console.log(req.body[key]);
        if(req.body[key]==""){
            console.log("空白です");
            error_id=1; 
        }
    }
    if(error_id==1){
        res.redirect('/signup');
    }
    else{
        connection.query(
            `select * from users where username = \"${req.body["username"]}\"`,
            (error, results) => {
                console.log(results[0]);
                if(typeof results[0]!="undefined"){
                    console.log("既に登録済みです")
                    error_id=2;
                }
                if(error_id==2){
                    res.redirect('/signup');
                }
                else{
                    connection.query(
                        `create user ${req.body["username"]}@\"%\" identified with mysql_native_password by \"${req.body["password"]}\";`,
                        (error,results) =>{
                            console.log(`createuser=${results}`)
                            console.log(`createuser=${error}`)
                            connection.query(
                                `grant create,insert on python_db.\* to ${req.body["username"]}@\"%\"`,
                                (error,results) =>{
                                    console.log(`grant=${results}`)
                                    console.log(`grant=${error}`)        
                                    console.log(`error_id_grant=${error_id}`);
                                    if(error){
                                        res.redirect('/signup');
                                    }
                                    else{
                                        connection.query(
                                            `insert into users (username,password,lastname,firstname) 
                                            values(\"${req.body["username"]}\",\"${req.body["password"]}\",\"${req.body["lastname"]}\",\"${req.body["firstname"]}\")`,
                                            (error, results) => {
                                                if(error){
                                                    res.redirect('/signup');
                                                }
                                                else{
                                                    res.redirect('/signupok');
                                                }
                                            }
                                        )
                                    }                
                                }
                            )
                        }
                    )
                }        
            });
    }
  });

  app.get('/signupok',(req,res) => {
    res.render('./signupok.ejs');
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