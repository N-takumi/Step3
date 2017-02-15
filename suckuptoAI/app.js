var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var index = require('./routes/index');
var users = require('./routes/users');

//ログイン認証ミドルウェア
var passport = require('passport');

var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended:true}));

//認証ミドルウェアの設定
app.use(passport.initialize());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//ログイン機能
var LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(function(username,password,done){
  //ここでユーザー名とパスワードを確認して結果を返す
  if(username == 'takumi' &&  password == '12'){
    console.log('success!');
  }else{
    console.log('bad!');
    res.render('index');
  }
}));

app.post('/login',
passport.authenticate('local',{session:false}),
  function(req, res) {
  // 認証に施工すると、この関数が呼び出される。
  // 認証されたユーザーは `req.user` に含まれている。
  res.render('mypage',{username:req.user.username});
});


//ルーティング

//// '/'にGETアクセスで、Topページ
app.get('/',function (req,res){
  res.render('index');
});


//// '/game' にGETアクセスで、Gameページ
app.get('/game',function (req,res){
  res.render('game');
});

//  '/mypage:username'にGETアクセスで、各MYページ


// '/getMessageAI' にGETアクセスで、AIの返信を返す
app.get('/getMessageAI',function(req,res){

  var sendData = {
    app_key:'',
    text:'こんにちは',
    study:0,
    persona:2
  };

  var options = {
    //リクエスト内容
    url:'https://www.cotogoto.ai/webapi/noby.json',
    dataType:'json',
    data: sendData
  }

  request.get(options,function(error,responce,body){
    res.send(body);
  });

});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
