const express = require('express');
const session = require('express-session');
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;

const app = express();
const port = 3000;
app.use(session({
    secret: 'secret_key',
    cookie: { maxAge: 1000 * 30 },
    resave: false,
    saveUninitialized: false

}));
app.get('/', (req, res) => {
    // req.sessionにセッションの値が保存されるされる
    // 値が存在しない場合は、初期値を与える
    console.log(req.session.views);
    if (!req.session.views) {
        req.session.views = 0;
    }
    console.log(req.session.views);
    // カウントアップ
    req.session.views++;
    // アクセス回数を表示
    res.send('Hello World! Count:' + req.session.views);
});
app.listen(port, () => {
 console.log(`Example app listening at http://localhost:${port}`);
});