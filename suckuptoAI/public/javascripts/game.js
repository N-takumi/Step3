
/*
var socket = io();

//chatというイベントを受信したらHTML要素に追加する
socket.on('chat',function(chat){
  var messages = document.getElementById('messages');
  //新しいメッセージは既にある要素より上に表示させる
  var newMessage = document.createElement('li');
  newMessage.textContent = chat.name + '「' + chat.message + '」';
  messages.insertBefore(newMessage,messages.firstChild);
});

//送信ボタンにイベントを定義
var sendButton = document.getElementById('send');
sendButton.addEventListener('click',sendMessage);

//メッセージを送信する
function sendMessage(){
  //名前と内容を取得する
  var nameElement = document.getElementById('name');
  var messageElement = document.getElementById('text');
  var name = nameElement.value;
  var message = messageElement.value;

  //chatイベントを送信する
  socket.emit('chat',{
    name:name,
    message:message
  });

  //内容をリセットする
  messageElement.value = '';
}

*/

var count = 0;

if(count == 0){
  $('#messages').append('<h3>ディーラー:ゲーム開始です<h3>');
}



//テキストを入力して送信ボタンを押すとAIの返信を表示
$('#req_button').click(function(){

  if($('#req_text').val() == ''){
    return false;
  }

  $('#req_button').fadeOut();
  console.log(negapoji($('#req_text').val()));
  $('#messages').append('<h3 class="userMessage">ユーザー:'+$('#req_text').val()+' '+negapoji($('#req_text').val())+'</h3>');
  getAItext();
  count++;
  $('#req_text').val('');
  $('#req_button').fadeIn();

  if(count == 5){
    $('#controls').fadeOut();
    $('#messages').append('<h3>ディーラー:ゲーム終了です<h3>');
  }

  return false;
});


//対話APIを叩いて返信を受ける
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
    //jsonpに変えてみる
  })
  .done(function(responce){
      var a = '<p>'+responce.text+'</p>';
      $('#messages').append('<h3>'+'AI:<span id='+count+'>'+responce.text+' '+negapoji(a)+'</span></h3>');
      console.log(negapoji(a));
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
