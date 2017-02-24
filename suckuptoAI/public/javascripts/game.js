function game(){

  //通信用
  var socket = io();

  //ターン数カウント
  var count = 1;
  //最終好感度
  var sumScore = 0;

  //スタートフラグ
  var startFlag;

  var myendFlag = false;

  //エンドフラグ
  var endFlag;

  //対戦相手のスコア
  var enemy_score;

  //アクセス時に取得するパラメータ
  var id;
  var entry_Date;

  //チャンネルがFかどうか
  var isCheck_f;


  function init(){

    //ゲーム開始時 、ディーラーの処理


    //テキストを入力して送信ボタンを押すとAIの返信を表示
    $('#req_button').click(function(){

      //テキストが空なら無効
      if($('#req_text').val() == ''){
        return false;
      }

      $('#req_button').fadeOut();

      var b = negapoji($('#req_text').val());

      //ユーザーのメッセージ表示
      $('#messages').append('<h3 id='+count+' class="userMessage"><p>ユーザー:</p>'+$('#req_text').val()+' '+'ネガポジ値'+b+'</h3>');

      sumScore += b;


        getAItext()
        $("html,body").animate({scrollTop:($('#'+count).offset().top)-100});
        $('#req_text').val('');
        $('#req_button').fadeIn();


      return false;
    });

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

  }

  //NobyAPIを叩いて返信を受ける
  function getAItext(){
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
    .done(function(responce){
        var a = '<p>'+responce.text+'</p>';
        sumScore += negapoji(a);
        $('#messages').append('<h3 class="AImessage"><p>AI</p><span id='+count+'>'+responce.text+' '+negapoji(a)+'</span></h3>');

        $('#content').css({'background-color':'rgb(180,'+(231-sumScore*2)+','+(255-sumScore*2)+')','transition':'4s'});

        count++;

        $('#turnCount').text(count);
        //ターン数が5になればゲームは終了、
        if(count == 6){

          myendFlag = true;

          //endFlagを見て処理分岐
          if(endFlag){
            $.when(
              $('#controls').fadeOut(),
              $('#messages').append('<h3 class="dealerMessage">ディーラー:ゲーム終了です<h3><p>最終好感度は'+sumScore+'でした。</p>'),
              socket.emit('endFlag_score', sumScore),
              socket.emit('message', sumScore),
              $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'1s'})
            ).done(function(){
              alert('ゲーム終了です。最終好感度は'+sumScore+'でした。\n 対戦相手の最終好感度は'+enemy_score+'でした。\n'
                     +'結果は'+judge(sumScore,enemy_score)+'です!\nトップに戻ります');
              window.location.href = "/";
            });
          }else{
              $('#controls').fadeOut();
              $('#messages').append('<h3 class="dealerMessage">ディーラー:ゲーム終了です<h3><p>あなたの最終好感度は'+sumScore+'でした。 </br> 対戦相手を待っています...</p>');
              socket.emit('endFlag_score', sumScore);
              socket.emit('message', sumScore);
              $('#content').css({'background-color':'rgb(180,'+(231)+','+(255)+')','transition':'1s'});
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


  //WebScocket系の関数

  <!-- サーバーサイドから来たメッセージを挿入 -->
    socket.on('message', function(msj, id) {
      $('#message').append($('<li>').text(id + " : " + msj));
    });

    //チャンネルがFであることを受信
    socket.on('isCheck_f',function(f){
        if(f){
          $('#messages').append('<h3 id="dealer_first" class="dealerMessage"><p>ディーラー:</p>アクセス制限を行っております。しばらくお待ちください。</h3>');
          console.log(f);
          setTimeout("location.reload()",5000);
        }
    });

    //ゲーム終了時に相手にスコアをもらう
    socket.on('endFlag_score', function(score){
      endFlag = true;
      enemy_score = score;
      //終了処理
      console.log(score);
      if(myendFlag){
        console.log('終わったよ');
        alert('ゲーム終了です。最終好感度は'+sumScore+'でした。\n 対戦相手の最終好感度は'+enemy_score+'でした。結果は'+judge(sumScore,enemy_score)+'です!\nトップに戻ります');
        window.location.href = "/";
      }

    });

    <!-- チャンネルが変わった時の処理 -->
    socket.on('change channel', function(channel) {
    <!-- チャンネルが変わったことをメッセージで表示 -->
      $('#message').append($('<li>').text('チャンネルが ' + channel + 'に変更されました!'));
    });

    //ユーザー数カウント
    socket.on('user cnt', function(cnt) {
      <!-- 取得したユーザー数を反映 -->
      $('#user_cnt p').html('').text("(1 :" + cnt.a +"人)"+"(2 :" + cnt.b +"人)"+"(3 :" + cnt.c +"人)"+
                                    "(4 :" + cnt.d +"人)"+"(5 :" + cnt.e +"人)"+"(6 :" + cnt.f +"人)");
    });

    socket.on('access',function(id,entry_Date){
      entry_Date = entry_Date;
      id = id;
      console.log(entry_Date+id);
    });

    //startFlagの更新
    socket.on('startFlag',function(flag){
      startFlag = flag;
      if(flag){
        //alert('対戦相手はユーザー名さんです。会話を始めてください!');
        $('#messages').append('<h3 class="dealerMessage"><p>ディーラー:</p>対戦相手はユーザー名さんです。AIとの会話を始めてください!</h3>');
        $('#controls').css(({'display':'block'})).fadeIn();
        $('#dealer_first').fadeOut();
      }else{
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
