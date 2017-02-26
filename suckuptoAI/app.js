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
mongoose.connect('mongodb://localhost/IsuckuptoAI-user');
//本番環境でのデータベース
//mongoose.connect('mongodb://heroku_0djp0wx6:18q4oge6ka0m7vams6mp5qt1c3@ds023902.mlab.com:23902/heroku_0djp0wx6');

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
    name  :String,//名前
    password:String,//パスワード
    highScore:{type:Number,default:0},//ハイスコア
    highScore_createDate:{type:Date,default:Date.now},//ハイスコア更新日時
    sumBattle:{type:Number,default:0},//総対戦数
    sumWin:{type:Number,default:0},//勝利数
    sumLose:{type:Number,default:0},//敗北数
    sumDraw:{type:Number,default:0},//引き分け数
    sumScore:{type:Number,default:0}//総合スコア
},{collection:'info'});
mongoose.model('User',UserSchema);
var User = mongoose.model('User');

//認証用のバリデーター関数
var loginCheck = function(req,res,next){
    if(req.session.userName){
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
  //入力された名前・パスワードを見て認証済みか存在するかを判断
  var query = { 'name':name,'password':password};
  User.find(query,function(err,data){
  if(err){
    console.log(err);
  }
  if(data == ''){
    res.render('index');
    console.log("ログインエラ-");
  }else{
    req.session.userName = name;
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

  var query = { 'name':name};
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
app.get('/game/:name',function (req,res){
  if(req.params.name){
    name = req.params.name;
  }
  //res.render('game',{name:userName});
  res.render('game',{name:name});
});

//ユーザーの情報取得API(データベース)//_idで取得
app.get('/userInfo/:name',function (req,res){
  var name = req.params.name;
  var User = mongoose.model('User');
  User.find({name:name},function(err,resUser){
    res.send({resUser:resUser});
  });
});

//ユーザーの情報をアップデート
app.post('/userUpdate',function(req,res){
  var User = mongoose.model('User');
  User.update({name:req.body.name},{sumScore:req.body.sumScore,sumBattle:req.body.sumBattle,sumWin:req.body.sumWin,sumLose:req.body.sumLose,sumDraw:req.body.sumDraw},function(err) {
    if (err) throw err;
  });
  console.log('アップデートサーバー');
  res.send(true);
});

//ユーザーランキング取得(合計スコア上位5位までのユーザー情報を取得)
app.get('/getRankings',function(req,res){
  var User = mongoose.model('User');
  User.find({}).sort('-sumScore').exec(function(err,resUser){
    res.send({resUser:resUser});
  });
});



//未完成
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
