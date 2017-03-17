var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config.js');

//日付処理
var moment = require('moment');
moment.locale('ja');

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
    highScore_createDate:{type:Date,default:moment()},//ハイスコア更新日時
    sumBattle:{type:Number,default:0},//総対戦数
    sumWin:{type:Number,default:0},//勝利数
    sumLose:{type:Number,default:0},//敗北数
    sumDraw:{type:Number,default:0},//引き分け数
    sumScore:{type:Number,default:0}//総合スコア
},{collection:'info'});
mongoose.model('User',UserSchema);
var User = mongoose.model('User');

//ランキング用スキーマ()
var RankingsSchema = new Schema({
  name :String,//名前
  rate:{type:Number,default:100},//レート
  ranking:{type:Number,default:null}
},{collection:'rankings'});
mongoose.model('Rank',RankingsSchema);


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
  var Rank = mongoose.model('Rank');

  user = new User();
  rank = new Rank();

  var name = req.body.name;
  var password = req.body.password;

  var query = {'name':name};
  User.find(query,function(err,data){

    if(err){
      console.log(err);
    }

    if(data == ''){
      user.name = req.body.name;
      rank.name = req.body.name;//ランキング用にも同じ名前を入れる
      user.password = req.body.password;
      user.save(function(err){
        if(err){
          console.log(err);
          res.redirect('back');
        }else{
          rank.save(function(err){
            if(err){
              console.log(err);
              res.redirect('back');
            }else{
              res.send(true);
            }
          });
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

//ユーザーの情報取得及びレート取得API(データベース)//各名前で取得
app.get('/userInfo/:name',function (req,res){
  var name = req.params.name;
  var User = mongoose.model('User');
  var Rank = mongoose.model('Rank');
  User.find({name:name},function(err,resUser){
    Rank.find({name:name},function(err,resRank){
      res.send({resUser:resUser,resRank:resRank});
    });
  });
});

//ユーザーの情報及びレートをアップデート
app.post('/userUpdate',function(req,res){
  var User = mongoose.model('User');
  var Rank = mongoose.model('Rank');
  User.update({name:req.body.name},{sumScore:req.body.sumScore,sumBattle:req.body.sumBattle,sumWin:req.body.sumWin,sumLose:req.body.sumLose,sumDraw:req.body.sumDraw,highScore:req.body.highScore,highScore_createDate:req.body.highScore_createDate},function(err) {
    Rank.update({name:req.body.name},{rate:req.body.Rate},function(err){
      if (err) throw err;
    });
  });
  console.log('アップデートサーバー');
  res.send(true);
});

//ユーザーランキング取得(合計スコア上位5位までのユーザー情報を取得)
app.get('/getRankings',function(req,res){
  var Rank = mongoose.model('Rank');
  Rank.find({}).sort('-rate').exec(function(err,resRank){
    res.send({resRank:resRank});
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

app.get('/negapoji/:text',function(req,res){
  //ネガポジ判定用の配列を読み込む
  var negapojiArray = config.negapojiArray;
  //リクエストテキストを読み込む
  var text = req.params.text;
  console.log(req.params.text);
  var score = 0;
  for(i = 0;i < negapojiArray.length;i++){
    var re = new RegExp(negapojiArray[i][0],'g');

    var count = 0;
    //特定の文字列からある文字列の個数を数える

    count = text.split(re).length-1;

      score += negapojiArray[i][1]*count;
      console.log(score);

  }
  res.send({score:score});
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
