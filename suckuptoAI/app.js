var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var session = require('express-session');
var mongoose = require('mongoose');

var routes = require('./routes/index');

//var index = require('./routes/index');
//var users = require('./routes/users');

//ローカル環境でのデータベース
//mongoose.connect('mongodb://localhost/IsuckuptoAI-user');
//本番環境でのデータベース
mongoose.connect('mongodb://heroku_0djp0wx6:18q4oge6ka0m7vams6mp5qt1c3@ds023902.mlab.com:23902/heroku_0djp0wx6');

var app = express();


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

app.set('trust proxy', 1);
//セッションを使用する
app.use(session({
  secret:'secret',
  resave: true,
  saveUninitialized: true,
  cookie:{
    maxAge:null
  }
}));

//ユーザースキーマ定義
var Schema = mongoose.Schema;
//modelの定義
var UserSchema = new Schema({
    name  :String,
    password:String
},{collection:'info'});
mongoose.model('User',UserSchema);
var User = mongoose.model('User');

//認証用のバリデーター関数
var loginCheck = function(req,res,next){
    if(req.session.user){
      next();
    }else{
      res.redirect('/top');
    }
};

//ルーティング
//loginCheckをかまして認証済みかどうかを判断している
//トップページへ------//ログイン機能//------------>
app.get('/',loginCheck,routes.mypage);
app.get('/top',function (req,res){

  var name = req.query.name;
  var password = req.query.password;
  var query = { 'name':name,'password':password};
  User.find(query,function(err,data){
  if(err){
    console.log(err);
  }
  if(data == ''){
    res.render('index');
    console.log("ログインエラ-");
  }else{
    req.session.user = name;
    res.send(true);
  }
  });
});

//ユーザー登録機能
app.post('/add',function(req,res){
  var User = mongoose.model('User');
  user = new User();

  var name = req.body.name;
  var password = req.body.password;

  var query = { 'name':name,'password':password};
  User.find(query,function(err,data){

    if(err){
      console.log(err);
    }

    if(data == ''){
      user.name = req.body.name;
      user.password = req.body.password;
      user.save(function(err){
        if(err){
          console.log(err);
          res.redirect('back');
        }else{
          res.send(true);
        }
      });
    }else{
      res.send(false);
    }
  });
});

app.get('/logout', function(req,res){
  req.session.destroy();
  console.log('deleted session');
  res.redirect('/');
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
