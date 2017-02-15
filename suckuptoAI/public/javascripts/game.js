function game(){

  //通信用
  var socket = io();

  //ターン数カウント
  var count = 1;
  //最終好感度
  var sumScore = 0;

  //スタートフラグ
  var startFlag = false;
  //エンドフラグ
  var endFlag = false;


  function init(){

    //ゲーム開始時 、ディーラーの処理
    if(count == 1){
      $('#messages').append('<h3 class="dealerMessage"><p>ディーラー:</p>対戦相手はユーザー名さんです。会話を始めてください!</h3>');
    }

    //テキストを入力して送信ボタンを押すとAIの返信を表示
    $('#req_button').click(function(){

      //テキストが空なら無効
      if($('#req_text').val() == ''){
        return false;
      }

      $('#req_button').fadeOut();
      console.log(negapoji($('#req_text').val()));

      //ユーザーのメッセージ表示
      $('#messages').append('<h3 class="userMessage"><p>ユーザー:</p>'+$('#req_text').val()+' '+negapoji($('#req_text').val())+'</h3>');

      $.when(
        getAItext()
      ).done(function(){

        //テキスト空にする
        $('#req_text').val('');
        $('#req_button').fadeIn();


      });

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
      app_key:nobyApiKey,
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

        count++;
        $('#turnCount').text(count);
        //ターン数が5になればゲームは終了、
        if(count == 6){
          $('#controls').fadeOut();
          $('#messages').append('<h3 class="dealerMessage">ディーラー:ゲーム終了です<h3><p>最終好感度は'+sumScore+'でした。</p>');
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


  <!-- サーバーサイドから来たメッセージを挿入 -->
    socket.on('message', function(msj, id) {
      $('#message').append($('<li>').text(id + " : " + msj));
    });

    <!-- チャンネルが変わった時の処理 -->
    socket.on('change channel', function(channel) {
    <!-- チャンネルが変わったことをメッセージで表示 -->
      $('#message').append($('<li>').text('チャンネルが ' + channel + 'に変更されました!'));
    });


  init();

}

//ロード時に読み込む
$(function(){
  game();
});
