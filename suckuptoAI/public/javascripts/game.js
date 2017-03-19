function game(){

  //通信用
  var socket = io();

//ユーザー(自分)用の変数-------------------------------
  //ユーザーがゲストかログインユーザーかを格納(デフォルトでtrue(ゲスト))
  var isCheck_gest;
  //ターン数カウント
  var count = 1;
  //最終好感度(自分の言葉のネガポジとAIの言葉のネガポジの合計)
  var sumScore = 0;
  //自分のターンがすべて終了したときに上がる
  var myendFlag = false;

  //アクセス時に取得するパラメータ----------
  var id;
  var entry_Date;
  //-------------------------------------

  //チャンネルがFかどうか(サイト内に10人以上がいる場合はFチャンネルに入る)
  var isCheck_f;
  //自分のユーザーネームを格納
  var userName = $('#userName').text();

  //更新に関わる
  //現在の総合スコア
  var nowsumScore;
  //現在の総合バトル数
  var nowsumBattle;
  var nowsumWin;
  var nowsumLose;
  var nowsumDraw;
  var nowhighScore;
  var nowRate;

  var Win=0;
  var Lose = 0;
  var Draw = 0;
  var Rate = 0;
//--------------------------------------------------

//対戦ユーザーに関わる変数------------------------------
  //スタートフラグ(チャンネルが2人に達した時に上がる(サーバーからの処理))
  var startFlag;
  //エンドフラグ(相手のターンがすべて終了してゲームを終了する時に上がる)
  var endFlag;
  //対戦相手のスコア
  var enemy_score;
  //対戦相手の名前
  var enemyName;
  var enemyRate = 100;//デフォルトで100にしておく(ゲストとの戦闘を考慮)
//--------------------------------------------------


  function init(){
    moment.locale('ja');

    //ユーザーがゲストかログイン状態かを更新
    if(userName == 'ゲスト'){
      isCheck_gest = true;
    }else{
      isCheck_gest = false;
    }

    //ユーザー情報取得
    if(!isCheck_gest){
      $.get('/userInfo/'+encodeURIComponent(userName),function(data){
        resUser = data.resUser[0];
        resRank = data.resRank[0];

        nowsumScore = resUser.sumScore;
        nowsumBattle = resUser.sumBattle;
        nowsumWin = resUser.sumWin;
        nowsumLose = resUser.sumLose;
        nowsumDraw = resUser.sumDraw;
        nowhighScore = resUser.highScore;
        nowhighScore_createDate = resUser.highScore_createDate;
        nowRate = resRank.rate;
      });
    }


    //テキストを入力して送信ボタンを押すとAIの返信を表示
    $('#req_button').click(function(){//1ターンの始まりから終わりまでの処理

      //テキストが空なら無効
      if($('#req_text').val() == ''){
        return false;
      }else if($('#req_text').val().length > 15){
        alert('メッセージは15文字以下でおねがいします');
        return false;
      }

      //クリックでフェードアウトさせる
      $('#req_button').fadeOut();
      $('#req_text').fadeOut();


      //ユーザーのメッセージ表示
      $('#messages').append('<h3 id='+count+' class="userMessage"><p>'+userName+'</p>'+$('#req_text').val()+'</h3>');


        getAIres().done(function(res_text){

          //合計好感度更新(AIと自分)
          negapoji(res_text).done(function(AIscore){
            negapoji($('#req_text').val()).done(function(myScore){
              sumScore += AIscore + myScore;
              $.when(
                game_loop(res_text)
              ).done(function(){

                //一番近いユーザー側のメッセージ要素までスクロール
                $("html,body").animate({scrollTop:($('#'+(count-1)).offset().top)});

                //テキストボックスを空にする
                $('#req_text').val('');
                //ボタンをフェードインさせる
                $('#req_button').fadeIn();
                $('#req_text').fadeIn();
            //    console.log("2");
              });
            });
          });

                }).fail(function(res_text){
                  console.log("AIの調子が悪いっぽいです");
        });


      return false;
    });

    //最後には消す-------------------------
  /*
    //サブミットボタンを押した時の処理
    $('#form2').submit(function(){

      <!-- 入力フォームには入っている値を取得 -->
        var mensaje = $('#msj').val();

      <!-- 値がなかったら終了 -->
        if (mensaje === '') return false;

      <!-- 全体にmessage処理（サーバーサイドにメッセージを渡す） -->
        socket.emit('message', mensaje);
        <!-- 入力フォームを空にしてフォーカスする -->
        $('#msj').val('');
　　　　　　　　　　　　　　　　<!-- 処理終了 -->
        return false;
    });
    <!-- チャンネルを変えた時の処理 -->
    $('#channel').on('change', function() {
    <!-- チャンネル変更する -->
      socket.emit('change channel', $('#channel').val());
    });
    /////////////////////////////////////
    */

  }

  //ゲーム関数群---------------------------------------------------------------

  //NobyAPIを叩いて返信を受ける
  function getAIres(){//  ajaxを使用

    //APIに送るデータ
    sendData = {
      app_key:'',
      text:$('#req_text').val(),
      study:1,
      persona:0
    };

    var deferred = new $.Deferred;

    //apiを叩く
    $.ajax({
      //リクエスト内容
      type:'GET',
      url:'https://www.cotogoto.ai/webapi/noby.json',
      dataType:'jsonp',
      data: sendData,
      jsonpCallback: 'testCallback'
    })
    .done(function(responce){//レスポンスが帰ってきてからの処理

      //p要素にして格納
      var res_text = '<p>'+responce.text+'</p>';

      deferred.resolve(res_text);

    }).fail(function(responce){
      deferred.reject(responce);
    });
    return deferred.promise();
  }


  //game_loop1ターンの処理をする(getAIresを渡す)
  function game_loop(res_text){


    //AIのメッセージを表示
    $('#messages').append('<h3 class="AImessage"><p>AI</p><span id='+count+'>'+res_text+'</span></h3>');
    //合計好感度似合わせて画面の色の寒暖差をつける
    $('#content').css({'background-color':'rgb(180,'+(231-sumScore*2)+','+(255-sumScore*2)+')','transition':'4s'});

    //ターン数更新
    count++;

    //ターン数の表示更新
    $('#turnCount').text(count);
    console.log(sumScore);

    //ターン数が5以下ならここでターン終了 次のターンへ

    //ターン数が6ならゲーム終了
    if(count == 6){

      //自分のエンドフラグ上げる
      myendFlag = true;

      //endFlagを見て処理分岐(相手の終了状態)
      if(endFlag){//相手も終わっていたら
        $.when(//まずこっち
          $('#controls').fadeOut(),//コントローラーをフェードアウト
          socket.emit('endFlag_score', sumScore),//終わったことと合計スコアを送信(socketによる遅延を考慮)
          $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'1s'})//画面色戻す
        ).done(function(){//終わったら

          switch(judge(sumScore,enemy_score)){
            case '勝利':
              Win = 1;
              //レートの更新(勝利の場合)
              if(!isCheck_gest){
                Rate = nowRate + (16 + (enemyRate - nowRate) * 0.04);
              }
            break;
            case '敗北':
              Lose = 1;
              if(!isCheck_gest){
              //レートの更新(敗北の場合)
              if((nowRate - (16 + (nowRate - enemyRate) * 0.04)) < 0){
                Rate = nowRate - 1;
              }else{
                Rate = nowRate - (16 + (nowRate - enemyRate) * 0.04);
              }
              }
            break;
            case '引き分け':
              Draw = 1;
            if(!isCheck_gest){
              Rate = nowRate + 0;
            }
          }

          //ハイスコアの更新
          if(!isCheck_gest){
            if(sumScore > nowhighScore){
              var highScore = sumScore;
              var createDate =  moment().format('LLLL');
            //  console.log(createDate);
            }else{
              var highScore = nowhighScore;
              var createDate = nowhighScore_createDate;
            }
          }

          $('#messages').append('<h3 class="dealerMessage">ディーラー</br>ゲーム終了です<p>'+userName+'さんの最終好感度は'+sumScore+'でした。対戦相手、'+enemyName+'さんの最終好感度は'+enemy_score+'でした。</br>結果は'+judge(sumScore,enemy_score)+'です!</p></h3><h4>6秒後にトップページに戻ります...</h4>');

          //ユーザー情報をアップデートしてトップページへ
          if(!isCheck_gest){
            $.ajax({
            url:'/userUpdate',
            type:'POST',
            contentType:'application/json',
            data: JSON.stringify({name:userName,sumScore:(nowsumScore+sumScore),sumBattle:(nowsumBattle+1),sumWin:(nowsumWin+Win),sumLose:(nowsumLose+Lose),sumDraw:(nowsumDraw+Draw),highScore:highScore,highScore_createDate:createDate,Rate:Rate})
            })
            .done(function(){
              setTimeout("window.location.href = '/'",6000);
            });
          }else{
              setTimeout("window.location.href = '/'",6000);
          }

        });
      }else{//相手がまだ終わっていなかったら
        $('#controls').fadeOut();//コントローラーをフェードアウト
        $('#messages').append('<h3 class="dealerMessage">ディーラー</br>ゲーム終了です<p>あなたの最終好感度は'+sumScore+'でした。 </br> 対戦相手を待っています...</p></h3>');
        socket.emit('endFlag_score', sumScore);//終わったことと合計スコアを送信
      //  socket.emit('message', sumScore);//最後には消す
        $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'2s'});//画面色戻す
      }
    }

  }



  //文字列を入力するとネガポジ度を算出する
  function negapoji(text){

  var deferred = new $.Deferred;

  //APIを使う場合(配列を隠せるが処理が遅い、実装まで考察が必要)
    var score = 0;
    $.get('/negapoji/'+encodeURIComponent(text),function(data){
      if(data){
      //  console.log(data.score);
        score = data.score;
      }
    }).done(function(){
      deferred.resolve(score);
    }).fail(function(){
      deferred.reject(score);
    });

    return deferred.promise();

  }

  //ゲームの勝敗を判定する
  function judge(sumScore,enemy_score){
    if(sumScore > enemy_score){
      return '勝利';
    }else if(sumScore < enemy_score){
      return '敗北';
    }else if(sumScore === enemy_score){
      return '引き分け';
    }
  }



  /////////////////////-----------------------------------------------



  //WebScocket系の関数--------------------------------------------------

  //最後には消す--------------------------------------------------
  /*
  <!-- サーバーサイドから来たメッセージを挿入 (クライアント <-> クライアント)-->
    socket.on('message', function(msj, id) {
      $('#message').append($('<li>').text(id + " : " + msj));
    });
  //////////////////////////////////////////////////////////////
  */

    //チャンネルがFであることを受信(サーバー -> クライアント)
    socket.on('isCheck_f',function(f){
        if(f){
          //アクセス制限であることを表示
          $('#messages').append('<h3 id="dealer_first" class="dealerMessage"><p>ディーラー</br></p>アクセス制限を行っております。しばらくお待ちください。</h3>');
        //  console.log(f);
          //5秒おきに自動リロード
          setTimeout("location.reload()",6000);
        }
    });

    //ゲーム終了時に相手に終わったこととスコアをもらう(クライアント <-> クライアント)
    socket.on('endFlag_score', function(score){
      endFlag = true;
      enemy_score = score;
      //終了処理
    //  console.log(score);
      if(myendFlag){
    //    console.log('終わったよ');
        $('#messages').append('<h3 class="dealerMessage">対戦相手、'+enemyName+'さんの最終好感度は'+enemy_score+'でした。</br>結果は'+judge(sumScore,enemy_score)+'です!</p></h3><h4>6秒後にトップページに戻ります...</h4>');
        if(judge(sumScore,enemy_score) == '勝利'){
          Win = 1;
          //レートの更新(勝利の場合)
          if(!isCheck_gest){
            Rate = nowRate + (16 + (enemyRate - nowRate) * 0.04);
          }
        }else if(judge(sumScore,enemy_score) == '敗北'){
          if(!isCheck_gest){
            //レートの更新(敗北の場合)
            if((nowRate - (16 + (nowRate - enemyRate) * 0.04)) < 0){
              Rate = nowRate - 1;
            }else{
              Rate = nowRate - (16 + (nowRate - enemyRate) * 0.04)
            }
          }
          Lose = 1;
        }else if(judge(sumScore,enemy_score) == '引き分け'){
          if(!isCheck_gest){
            Rate = nowRate + 0;
          }
            Draw = 1;
        }

        //ハイスコアの更新
        if(!isCheck_gest){
          if(sumScore > nowhighScore){
            var highScore = sumScore;
            var createDate =  moment().format('LLLL');
      //      console.log(createDate);
          }else{
            var highScore = nowhighScore;
            var createDate = nowhighScore_createDate;
          }
        }

        //トップページへ
        if(!isCheck_gest){
          $.ajax({
          url:'/userUpdate',
          type:'POST',
          contentType:'application/json',
          data: JSON.stringify({name:userName,sumScore:(nowsumScore+sumScore),sumBattle:(nowsumBattle+1),sumWin:(nowsumWin+Win),sumLose:(nowsumLose+Lose),sumDraw:(nowsumDraw+Draw),highScore:highScore,highScore_createDate:createDate,Rate:Rate})
          })
          .done(function(){
        setTimeout("window.location.href = '/'",6000);
          });
        }else{
        setTimeout("window.location.href = '/'",6000);
        }
      }
    });

    //ユーザー名を相手からもらう(クライアント <-> クライアント)
    socket.on('userName',function(name,rate){
      enemyRate = rate;
      enemyName = name;
      $('#enemyName').text(enemyName);
    //  console.log(enemyName);
      //ユーザー名をもらったらゲームスタート
      $('#messages').append('<h3 class="dealerMessage"><p>ディーラー</br></p>対戦相手は'+enemyName+'さんです。AIとの会話を始めてください!</h3>');
      //ゲームコントローラーをフェードイン
      $('#controls').css(({'display':'block'})).fadeIn();
      //ディーラーの最初のメッセージをフェードアウト
      $('#dealer_first').fadeOut();
    });

    /*
    //最後には消す-------------------------------------------------------------------------
    <!-- チャンネルが変わった時の処理 -->
    socket.on('change channel', function(channel) {
    <!-- チャンネルが変わったことをメッセージで表示 -->
      $('#message').append($('<li>').text('チャンネルが ' + channel + 'に変更されました!'));
    });
    //////////////////////////////////////////////////////////////////////////////////////
    */

    //ユーザー数カウント(サーバー -> クライアント)
    socket.on('user cnt', function(cnt) {
      <!-- 取得したユーザー数を反映 -->
      $('#user_cnt p').html('').text("(1 :" + cnt.a +"人)"+"(2 :" + cnt.b +"人)"+"(3 :" + cnt.c +"人)"+
                                    "(4 :" + cnt.d +"人)"+"(5 :" + cnt.e +"人)"+"(6 :" + cnt.f +"人)");
    });

    //アクセスじに日時とIDをもらう(サーバー -> クライアント)
    socket.on('access',function(id,entry_Date){
      entry_Date = entry_Date;
      id = id;
  //    console.log(entry_Date+id);
    });

    //startFlagの更新が受信された時の処理(サーバー <-> クライアント)
    socket.on('startFlag',function(flag){
      startFlag = flag;

      if(flag){//2人に達していたら
        //ユーザーネームを送る
        socket.emit('userName',userName,nowRate);//
      }else{//まだ１人だったら
        //alert('対戦ユーザーの参加を待っています。しばらくお待ちください');
        $('#messages').append('<h3 id="dealer_first" class="dealerMessage">ディーラー</br>ユーザの参加を待っています。しばらくお待ちください。</h3>');
      }
    });

  init();

}

//ロード時に読み込む
$(function(){
  game();
});
