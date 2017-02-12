
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

//テキストを入力して送信ボタンを押すとAIの返信を表示
$('#req_button').click(function(){
  $('#req_button').fadeOut();
  console.log(negapoji($('#req_text').val()));
  getAItext();
  $('#req_button').fadeIn();
  return false;
});


//対話APIを叩いて返信を受ける
function getAItext(){
  sendData = {
    app_key:'',
    text:$('#req_text').val(),
    study:1,
    persona:2
  };

  //apiを叩く
  $.ajax({
    //リクエスト内容
    url:'https://www.cotogoto.ai/webapi/noby.json',
    dataType:'json',
    data: sendData,
    //jsonpに変えてみる
  })
  .done(function(responce){
    if(responce.result === 'OK'){
      console.log(true);

    }
  });
}

//文字列を入力するとネガポジ度を算出する
function negapoji(text){
  var score = 0;
    negapojiArray = [['好き',10],['すき',10],['嫌い',-10],['きらい',-10],['良い',5],['ありがと',10],
                     ['いい',5],['悪い',-5],['わるい',-5],['ごめん',-5]];
  for(i = 0;i < negapojiArray.length;i++){
    re = new RegExp(negapojiArray[i][0],'g');
    if(re.test(text)){
      score += negapojiArray[i][1];
    }
  }

  $('#resMessages').append('<h3>'+$('#req_text').val()+' '+score+'</h3>');

  return score;
}
