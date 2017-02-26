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
  //チャンネルがFかどうか
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

  var Win=0;
  var Lose = 0;
  var Draw = 0;
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
//--------------------------------------------------


  function init(){

    //ユーザーがゲストかログイン状態かを更新
    if(userName == 'ゲスト'){
      isCheck_gest = true;
    }else{
      isCheck_gest = false;
    }

    //ユーザー情報取得
    if(!isCheck_gest){
      $.get('/userInfo/'+userName,function(data){
        resUser = data.resUser[0];
        nowsumScore = resUser.sumScore;
        nowsumBattle = resUser.sumBattle;
        nowsumWin = resUser.sumWin;
        nowsumLose = resUser.sumLose;
        nowsumDraw = resUser.sumDraw;
      });
    }


    console.log(isCheck_gest);
    //console.log(userName);


    //テキストを入力して送信ボタンを押すとAIの返信を表示
    $('#req_button').click(function(){

      //テキストが空なら無効
      if($('#req_text').val() == ''){
        return false;
      }

      //クリックでフェードアウトさせる
      $('#req_button').fadeOut();

      //一時的にネガポジの値を入れる
      var point = negapoji($('#req_text').val());

      //ユーザーのメッセージ表示
      $('#messages').append('<h3 id='+count+' class="userMessage"><p>ユーザー:</p>'+$('#req_text').val()+' '+'ネガポジ値'+point+'</h3>');

      //合計好感度を更新(自分)
      sumScore += point;

        getAItext();
        //一番近いユーザーのメッセージ要素までスクロール
        $("html,body").animate({scrollTop:($('#'+count).offset().top)-100});
        //テキストボックスを空にする
        $('#req_text').val('');
        //ボタンをフェードインさせる
        $('#req_button').fadeIn();

      return false;
    });

    //最後には消す-------------------------
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

  }

  //ゲーム関数群---------------------------------------------------------------

  //NobyAPIを叩いて返信を受ける
  function getAItext(){

    //APIに送るデータ
    sendData = {
      app_key:'8d4a4d6fdc39c71c5d7f1c76a905ae40',
      text:$('#req_text').val(),
      study:1,
      persona:0
    };

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
        //帰ってきたテキストを一時的に格納する
        var res_text = '<p>'+responce.text+'</p>';
        //合計好感度更新(AI)
        sumScore += negapoji(res_text);
        //AIのメッセージを表示
        $('#messages').append('<h3 class="AImessage"><p>AI</p><span id='+count+'>'+responce.text+' '+negapoji(res_text)+'</span></h3>');
        //合計好感度似合わせて画面の色の寒暖差をつける
        $('#content').css({'background-color':'rgb(180,'+(231-sumScore*2)+','+(255-sumScore*2)+')','transition':'4s'});

        //ターン数更新
        count++;
        //ターン数の表示更新
        $('#turnCount').text(count);

        //ターン数が5になればゲームは終了
        if(count == 2){
          //自分のエンドフラグ上げる
          myendFlag = true;
          //endFlagを見て処理分岐(相手の終了状態)
          if(endFlag){//相手も終わっていたら
            $.when(//まずこっち
              $('#controls').fadeOut(),//コントローラーをフェードアウト
              $('#messages').append('<h3 class="dealerMessage">ディーラー:ゲーム終了です<h3><p>最終好感度は'+sumScore+'でした。</p>'),
              socket.emit('endFlag_score', sumScore),//終わったことと合計スコアを送信
              socket.emit('message', sumScore),//最後には消す
              $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'1s'})//画面色戻す
            ).done(function(){//終わったら
              if(judge(sumScore,enemy_score) == '勝利'){
                Win = 1;
              }else if(judge(sumScore,enemy_score) == '敗北'){
                Lose = 1;
              }else if(judge(sumScore,enemy_score) == '引き分け'){
                Draw = 1;
              }
              alert('ゲーム終了です。最終好感度は'+sumScore+'でした。\n '+enemyName+'の最終好感度は'+enemy_score+'でした。\n'
                     +'結果は'+judge(sumScore,enemy_score)+'です!\nトップに戻ります');
              //トップページへ
              if(!isCheck_gest){
                $.ajax({
                url:'/userUpdate',
                type:'POST',
                contentType:'application/json',
                data: JSON.stringify({name:userName,sumScore:(nowsumScore+sumScore),sumBattle:(nowsumBattle+1),sumWin:(nowsumWin+Win),sumLose:(nowsumLose+Lose),sumDraw:(nowsumDraw+Draw)})
                })
                .done(function(){
                  window.location.href = "/";
                });
              }else{
                window.location.href = "/";
              }
            });
          }else{//自分だけが終わっていたら
              $('#controls').fadeOut();//コントローラーをフェードアウト
              $('#messages').append('<h3 class="dealerMessage">ディーラー:ゲーム終了です<h3><p>あなたの最終好感度は'+sumScore+'でした。 </br> 対戦相手を待っています...</p>');
              socket.emit('endFlag_score', sumScore);//終わったことと合計スコアを送信
              socket.emit('message', sumScore);//最後には消す
              $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'1s'});//画面色戻す
          }
        }
        console.log(sumScore);
    });
    console.log(count);
  }


  //文字列を入力するとネガポジ度を算出する (仕組みは完成)
  function negapoji(text){
    var score = 0;
      negapojiArray = [['好き',10],['すき',10],['嫌い',-10],['きらい',-10],['良い',5],['ありがとう',10],
                       ['いい',5],['はい',1],['わかります',5],['悪い',-5],['良くない',-5],['できない',-5],
                       ['わるい',-5],['ごめん',-5],['うん',2.5]];
    for(i = 0;i < negapojiArray.length;i++){
      re = new RegExp(negapojiArray[i][0],'g');

      var count = 0;
      //特定の文字列からある文字列の個数を数える
      count = text.split(re).length-1;

        score += negapojiArray[i][1]*count;

    }
    return score;
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
  <!-- サーバーサイドから来たメッセージを挿入 (クライアント <-> クライアント)-->
    socket.on('message', function(msj, id) {
      $('#message').append($('<li>').text(id + " : " + msj));
    });
  //////////////////////////////////////////////////////////////

    //チャンネルがFであることを受信(サーバー -> クライアント)
    socket.on('isCheck_f',function(f){
        if(f){
          //アクセス制限であることを表示
          $('#messages').append('<h3 id="dealer_first" class="dealerMessage"><p>ディーラー:</p>アクセス制限を行っております。しばらくお待ちください。</h3>');
          console.log(f);
          //5秒おきに自動リロード
          setTimeout("location.reload()",5000);
        }
    });

    //ゲーム終了時に相手に終わったこととスコアをもらう(クライアント <-> クライアント)
    socket.on('endFlag_score', function(score){
      endFlag = true;
      enemy_score = score;
      //終了処理
      console.log(score);
      if(myendFlag){
        console.log('終わったよ');
        alert('ゲーム終了です。最終好感度は'+sumScore+'でした。\n対戦相手:'+enemyName+'さんの最終好感度は'+enemy_score+'でした。結果は'+judge(sumScore,enemy_score)+'です!\nトップに戻ります');
        if(judge(sumScore,enemy_score) == '勝利'){
          Win = 1;
        }else if(judge(sumScore,enemy_score) == '敗北'){
          Lose = 1;
        }else if(judge(sumScore,enemy_score) == '引き分け'){
          Draw = 1;
        }
        if(!isCheck_gest){
          $.ajax({
          url:'/userUpdate',
          type:'POST',
          contentType:'application/json',
          data: JSON.stringify({name:userName,sumScore:(nowsumScore+sumScore),sumBattle:(nowsumBattle+1),sumWin:(nowsumWin+Win),sumLose:(nowsumLose+Lose),sumDraw:(nowsumDraw+Draw)})
          })
          .done(function(){
            window.location.href = "/";
          });
        }else{
          window.location.href = "/";
        }
      }
    });

    //ユーザー名を相手からもらう(クライアント <-> クライアント)
    socket.on('userName',function(name){
      enemyName = name;
      $('#enemyName').text(enemyName);
      console.log(enemyName);
      //ユーザー名をもらったらゲームスタート
      $('#messages').append('<h3 class="dealerMessage"><p>ディーラー:</p>対戦相手は'+enemyName+'さんです。AIとの会話を始めてください!</h3>');
      //ゲームコントローラーをフェードイン
      $('#controls').css(({'display':'block'})).fadeIn();
      //ディーラーの最初のメッセージをフェードアウト
      $('#dealer_first').fadeOut();
    });

    //最後には消す-------------------------------------------------------------------------
    <!-- チャンネルが変わった時の処理 -->
    socket.on('change channel', function(channel) {
    <!-- チャンネルが変わったことをメッセージで表示 -->
      $('#message').append($('<li>').text('チャンネルが ' + channel + 'に変更されました!'));
    });
    //////////////////////////////////////////////////////////////////////////////////////

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
      console.log(entry_Date+id);
    });

    //startFlagの更新が受信された時の処理(サーバー <-> クライアント)
    socket.on('startFlag',function(flag){
      startFlag = flag;

      if(flag){//2人に達していたら
        //ユーザーネームを送る
        socket.emit('userName',userName);//
      }else{//まだ１人だったら
        alert('対戦ユーザーの参加を待っています。しばらくお待ちください');
        $('#messages').append('<h3 id="dealer_first" class="dealerMessage"><p>ディーラー:</p>ユーザの参加を待っています。しばらくお待ちください。</h3>');
      }
    });

  init();

}

//ロード時に読み込む
$(function(){
  game();
});
